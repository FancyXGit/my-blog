#!/usr/bin/env node

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const sharp = require("sharp");
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

const IMAGE_EXT_RE = /\.(png|jpe?g|webp)$/i;

const MIME_BY_EXT = {
  ".txt": "text/plain; charset=utf-8",
  ".lrc": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".ttml": "application/ttml+xml; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

function readEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const text = fs.readFileSync(envPath, "utf8");
  const out = {};

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const idx = line.indexOf("=");
    if (idx <= 0) continue;

    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    out[key] = value;
  }

  return out;
}

function parseArgs(argv) {
  const args = [...argv];
  const inputs = [];
  const options = {
    recursive: true,
    contentType: "",
    cacheControl: "",
    quality: Number.NaN,
    effort: Number.NaN,
    r2: true,
    cn: true,
    cnExplicit: false,
    dryRun: false,
  };

  while (args.length) {
    const token = args.shift();
    if (!token) continue;
    if (token === "--") continue;

    if (token === "--no-recursive") {
      options.recursive = false;
      continue;
    }
    if (token === "--content-type") {
      options.contentType = String(args.shift() || "").trim();
      continue;
    }
    if (token === "--cache-control") {
      options.cacheControl = String(args.shift() || "").trim();
      continue;
    }
    if (token === "--quality" || token === "-q") {
      options.quality = Number(args.shift());
      continue;
    }
    if (token === "--effort" || token === "-e") {
      options.effort = Number(args.shift());
      continue;
    }
    if (token === "--no-r2") {
      options.r2 = false;
      continue;
    }
    if (token === "--no-cn") {
      options.cn = false;
      continue;
    }
    if (token === "--cn") {
      options.cn = true;
      options.cnExplicit = true;
      continue;
    }
    if (token === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (token === "--help" || token === "-h") {
      options.help = true;
      continue;
    }

    inputs.push(token);
  }

  return { inputs, options };
}

function printHelp() {
  console.log(`\nMixed file uploader -> R2 and/or CN server\n\nBehavior:\n  - Images (.png/.jpg/.jpeg/.webp) are converted to .webp once, then uploaded\n  - Other files are uploaded as-is\n  - Targets: Cloudflare R2 (cdn.fancyflow.top) and/or the CN server via SFTP (cdn.fancyflow.cn)\n\nUsage:\n  node scripts/upload-to-r2.cjs <file-or-dir> [more files/dirs...] [options]\n\nOptions:\n  --no-r2                 Skip the R2 upload (CN only)\n  --no-cn                 Skip the CN upload (R2 only)\n  --cn                    Require the CN upload (fail if CN config is missing)\n  --dry-run               Connect and compare, but do not write anything\n  --quality, -q <1-100>   WebP quality (default: 82)\n  --effort, -e <0-6>      WebP effort (default: 5)\n  --no-recursive          Do not walk subdirectories\n  --content-type <type>   Override Content-Type for non-image files\n  --cache-control <value> Cache-Control for R2 objects (default: public, max-age=604800)\n\nExamples:\n  node scripts/upload-to-r2.cjs image musics              # R2 + CN
  node scripts/upload-to-r2.cjs image/post/xxx --no-r2    # CN only
  node scripts/upload-to-r2.cjs public --no-cn            # R2 only
  node scripts/upload-to-r2.cjs image --dry-run           # preview

R2 config (via env vars or .env.r2):
  R2_ACCOUNT_ID
  R2_ACCESS_KEY_ID
  R2_SECRET_ACCESS_KEY
  R2_BUCKET
  R2_PUBLIC_BASE_URL
  R2_REGION            (optional, default: auto)
  R2_PREFIX            (optional, object key prefix)
  R2_CACHE_CONTROL     (optional, default: public, max-age=604800)

CN config (via env vars or .env.r2):
  CN_ASSET_SSH_ALIAS   (optional, e.g. "new" -> read ~/.ssh/config Host block)
  CN_ASSET_HOST
  CN_ASSET_PORT        (optional, default: 22)
  CN_ASSET_USER
  CN_ASSET_KEY_PATH
  CN_ASSET_ROOT        (remote dir, e.g. /var/www/cdn-fancyflow.cn)
  CN_PUBLIC_BASE_URL   (optional, e.g. https://cdn.fancyflow.cn)

WebP config (optional):
  WEBP_QUALITY         (default: 82)
  WEBP_EFFORT          (default: 5)
`);
}

function walkDir(dirPath, recursive) {
  const out = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (recursive) out.push(...walkDir(full, recursive));
      continue;
    }
    if (entry.isFile()) out.push(full);
  }

  return out;
}

function collectFiles(rawInputs, recursive) {
  const found = new Set();

  for (const input of rawInputs) {
    const full = path.resolve(process.cwd(), input);
    if (!fs.existsSync(full)) {
      console.warn(`[skip] Not found: ${input}`);
      continue;
    }

    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      for (const file of walkDir(full, recursive)) found.add(path.resolve(file));
      continue;
    }

    if (stat.isFile()) {
      found.add(full);
      continue;
    }

    console.warn(`[skip] Not a file: ${input}`);
  }

  return [...found];
}

function keyForFile(absPath, prefix, convertToWebp) {
  const rel = path.relative(process.cwd(), absPath).split(path.sep).join("/");
  const finalRel = convertToWebp ? rel.replace(IMAGE_EXT_RE, ".webp") : rel;
  const raw = [prefix || "", finalRel].filter(Boolean).join("/");
  return raw.replace(/^\/+/, "").replace(/\/+/g, "/");
}

function urlForKey(baseUrl, key) {
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const encodedKey = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${cleanBase}/${encodedKey}`;
}

function inferContentType(absPath) {
  const ext = path.extname(absPath).toLowerCase();
  return MIME_BY_EXT[ext] || "application/octet-stream";
}

// Minimal ~/.ssh/config reader: resolves `ssh <alias>` into connect options so the
// script reuses the same host/user/key as your terminal.
function readSshConfigAlias(alias) {
  if (!alias) return null;
  const configPath = path.join(os.homedir(), ".ssh", "config");
  if (!fs.existsSync(configPath)) return null;

  const lines = fs.readFileSync(configPath, "utf8").split(/\r?\n/);
  const result = {};
  let inMatchBlock = false;

  for (const rawLine of lines) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;

    const match = line.match(/^([A-Za-z]+)\s+(.+)$/);
    if (!match) continue;

    const key = match[1].toLowerCase();
    const value = match[2].trim();

    if (key === "host") {
      inMatchBlock = value.split(/\s+/).includes(alias);
      continue;
    }
    if (!inMatchBlock) continue;

    if (key === "hostname") result.host = value;
    else if (key === "user") result.user = value;
    else if (key === "port") result.port = Number(value);
    else if (key === "identityfile") {
      result.keyPath = value.replace(/^~(?=$|[\\/])/, os.homedir());
    }
  }

  return result.host ? result : null;
}

function resolveCnConfig() {
  const alias = process.env.CN_ASSET_SSH_ALIAS || "";
  const aliasConfig = readSshConfigAlias(alias) || {};

  const root = (process.env.CN_ASSET_ROOT || "")
    .replace(/\\/g, "/")
    .replace(/\/+$/, "");
  const baseUrl = (process.env.CN_PUBLIC_BASE_URL || "").replace(/\/+$/, "");

  return {
    host: process.env.CN_ASSET_HOST || aliasConfig.host || "",
    port: Number(process.env.CN_ASSET_PORT || aliasConfig.port || 22),
    user: process.env.CN_ASSET_USER || aliasConfig.user || "",
    keyPath: process.env.CN_ASSET_KEY_PATH || aliasConfig.keyPath || "",
    root,
    baseUrl,
    configured: Boolean(
      (process.env.CN_ASSET_HOST || aliasConfig.host) &&
        (process.env.CN_ASSET_USER || aliasConfig.user) &&
        root,
    ),
  };
}

async function ensureRemoteDir(sftp, remoteDir) {
  try {
    await sftp.mkdir(remoteDir, true);
  } catch (err) {
    // mkdir -p errors when the path already exists on some servers; stat decides.
    const stat = await sftp.stat(remoteDir).catch(() => null);
    if (!stat) throw err;
  }
}

async function remoteSize(sftp, remotePath) {
  const stat = await sftp.stat(remotePath).catch(() => null);
  return stat ? Number(stat.size) : -1;
}

async function main() {
  const root = process.cwd();
  const localEnv = readEnvFile(path.join(root, ".env.r2"));

  for (const [k, v] of Object.entries(localEnv)) {
    if (!process.env[k]) process.env[k] = v;
  }

  const { inputs, options } = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  if (!inputs.length) {
    printHelp();
    process.exitCode = 1;
    return;
  }

  const cn = resolveCnConfig();
  const useCn = options.cn && cn.configured;
  const useR2 = options.r2;

  if (options.cn && options.cnExplicit && !cn.configured) {
    console.error("CN upload requested but CN config is incomplete.");
    console.error("Set CN_ASSET_SSH_ALIAS (or CN_ASSET_HOST/USER/KEY_PATH) and CN_ASSET_ROOT.");
    process.exitCode = 1;
    return;
  }
  if (!useR2 && !useCn) {
    console.error("No upload target enabled. Remove --no-r2/--no-cn or configure the CN server.");
    process.exitCode = 1;
    return;
  }

  const requiredR2 = [
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET",
    "R2_PUBLIC_BASE_URL",
  ];

  if (useR2) {
    const missing = requiredR2.filter((name) => !process.env[name]);
    if (missing.length) {
      console.error(`Missing required R2 config: ${missing.join(", ")}`);
      console.error("Set them in environment variables or .env.r2 at project root.");
      process.exitCode = 1;
      return;
    }
  }

  const quality = Number.isFinite(options.quality)
    ? options.quality
    : Number(process.env.WEBP_QUALITY || 82);
  const effort = Number.isFinite(options.effort)
    ? options.effort
    : Number(process.env.WEBP_EFFORT || 5);

  if (quality < 1 || quality > 100) {
    console.error("Invalid quality. Use 1-100.");
    process.exitCode = 1;
    return;
  }
  if (effort < 0 || effort > 6) {
    console.error("Invalid effort. Use 0-6.");
    process.exitCode = 1;
    return;
  }

  const files = collectFiles(inputs, options.recursive);
  if (!files.length) {
    console.error("No files found to upload.");
    process.exitCode = 1;
    return;
  }

  const prefix = (process.env.R2_PREFIX || "").trim().replace(/^\/+|\/+$/g, "");
  let s3 = null;

  if (useR2) {
    const region = process.env.R2_REGION || "auto";
    const endpoint = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
    s3 = new S3Client({
      region,
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  let sftp = null;
  if (useCn) {
    const SftpClient = require("ssh2-sftp-client");
    sftp = new SftpClient("cn-assets");
    const connectOptions = {
      host: cn.host,
      port: cn.port,
      username: cn.user,
      readyTimeout: 20000,
      keepaliveInterval: 15000,
    };

    if (cn.keyPath) {
      if (!fs.existsSync(cn.keyPath)) {
        console.error(`CN SSH key not found: ${cn.keyPath}`);
        process.exitCode = 1;
        return;
      }
      connectOptions.privateKey = fs.readFileSync(cn.keyPath);
    } else {
      connectOptions.agent =
        process.env.SSH_AUTH_SOCK ||
        (process.platform === "win32" ? "\\\\.\\pipe\\openssh-ssh-agent" : undefined);
    }

    console.log(`Connecting to CN server ${cn.user}@${cn.host}:${cn.port} ...`);
    await sftp.connect(connectOptions);
    await ensureRemoteDir(sftp, cn.root);
  }

  console.log(`Found ${files.length} file(s).`);
  console.log(`WebP settings: quality=${quality}, effort=${effort}`);
  console.log(`Targets: ${[useR2 ? "R2" : null, useCn ? "CN" : null].filter(Boolean).join(" + ")}`);
  if (options.dryRun) console.log("Dry run: nothing will be written.");

  const urls = [];
  let uploaded = 0;
  let skipped = 0;

  try {
    for (let i = 0; i < files.length; i += 1) {
      const absFile = files[i];
      const isImage = IMAGE_EXT_RE.test(absFile);
      const key = keyForFile(absFile, prefix, isImage);
      const relative = path.relative(root, absFile).split(path.sep).join("/");

      console.log(`\n[${i + 1}/${files.length}] ${relative}`);

      let body;
      let totalBytes;
      let contentType;
      let webpBuffer = null;

      if (isImage) {
        webpBuffer = await sharp(absFile).webp({ quality, effort }).toBuffer();
        body = webpBuffer;
        totalBytes = webpBuffer.length;
        contentType = "image/webp";
        console.log("Mode: image -> webp");
        console.log(`Compressed: ${(totalBytes / 1024).toFixed(1)} KB`);
      } else {
        body = fs.createReadStream(absFile);
        totalBytes = fs.statSync(absFile).size;
        contentType = options.contentType || inferContentType(absFile);
        console.log("Mode: raw");
        console.log(`Content-Type: ${contentType}`);
      }

      if (useR2) {
        let lastPercent = -1;
        // Default long-ish cache: assets are referenced by stable paths, so keep
        // this at a week and override with R2_CACHE_CONTROL when needed.
        const cacheControl =
          options.cacheControl || process.env.R2_CACHE_CONTROL || "public, max-age=604800";
        const uploader = new Upload({
          client: s3,
          params: {
            Bucket: process.env.R2_BUCKET,
            Key: key,
            Body: body,
            ContentType: contentType,
            CacheControl: cacheControl,
          },
        });

        uploader.on("httpUploadProgress", (progress) => {
          const loaded = Number(progress.loaded || 0);
          const total = Number(progress.total || totalBytes || 1);
          const percent = Math.floor((loaded / total) * 100);
          if (percent !== lastPercent) {
            lastPercent = percent;
            process.stdout.write(`\rR2: ${percent}%`);
          }
        });

        if (options.dryRun) {
          console.log("[dry-run] R2 upload skipped");
        } else {
          await uploader.done();
          process.stdout.write("\rR2: 100%\n");
          uploaded += 1;
        }

        const url = urlForKey(process.env.R2_PUBLIC_BASE_URL, key);
        urls.push(url);
        console.log(`URL: ${url}`);
      }

      if (useCn) {
        const remotePath = `${cn.root}/${key}`;
        const remoteDir = path.posix.dirname(remotePath);
        const existingSize = await remoteSize(sftp, remotePath);

        if (existingSize === totalBytes) {
          skipped += 1;
          console.log(`CN: skipped (already ${totalBytes} bytes)`);
        } else if (options.dryRun) {
          console.log(`[dry-run] CN would upload -> ${remotePath}`);
        } else {
          await ensureRemoteDir(sftp, remoteDir);
          if (webpBuffer) {
            await sftp.put(webpBuffer, remotePath, { mode: 0o644 });
          } else {
            await sftp.fastPut(absFile, remotePath, {
              mode: 0o644,
              step: (transferred) => {
                const percent = Math.floor((transferred / totalBytes) * 100);
                process.stdout.write(`\rCN: ${percent}%`);
              },
            });
          }
          await sftp.chmod(remotePath, 0o644).catch(() => {});
          process.stdout.write("\rCN: 100%\n");
          uploaded += 1;
          console.log(`CN: ${remotePath}`);
        }

        if (cn.baseUrl) {
          const cnUrl = urlForKey(cn.baseUrl, key);
          urls.push(cnUrl);
          console.log(`CN URL: ${cnUrl}`);
        }
      }
    }
  } finally {
    if (sftp) await sftp.end().catch(() => {});
  }

  console.log("\nAll uploads complete. URL list:");
  for (const url of urls) {
    console.log(url);
  }
  console.log(`\nFiles: ${files.length}, uploaded: ${uploaded}, skipped: ${skipped}`);
}

main().catch((err) => {
  console.error("\nFailed:", err?.message ? err.message : err);
  process.exitCode = 1;
});
