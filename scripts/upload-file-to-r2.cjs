#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

const MIME_BY_EXT = {
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
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
  };

  while (args.length) {
    const token = args.shift();
    if (!token) continue;

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
    if (token === "--help" || token === "-h") {
      options.help = true;
      continue;
    }

    inputs.push(token);
  }

  return { inputs, options };
}

function printHelp() {
  console.log(`\nRaw file -> R2 uploader\n\nUsage:\n  node scripts/upload-file-to-r2.cjs <file-or-dir> [more files/dirs...] [--no-recursive] [--content-type <type>] [--cache-control <value>]\n\nExamples:\n  node scripts/upload-file-to-r2.cjs music\n  node scripts/upload-file-to-r2.cjs music/track.mp3 public/files/guide.pdf\n  node scripts/upload-file-to-r2.cjs public/files --cache-control "public, max-age=31536000, immutable"\n\nConfig (via env vars or .env.r2):\n  R2_ACCOUNT_ID\n  R2_ACCESS_KEY_ID\n  R2_SECRET_ACCESS_KEY\n  R2_BUCKET\n  R2_PUBLIC_BASE_URL\n  R2_REGION            (optional, default: auto)\n  R2_PREFIX            (optional, object key prefix)\n`);
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
      for (const file of walkDir(full, recursive)) {
        found.add(path.resolve(file));
      }
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

function keyForFile(absPath, prefix) {
  const rel = path.relative(process.cwd(), absPath).split(path.sep).join("/");
  const raw = [prefix || "", rel].filter(Boolean).join("/");
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

  const required = [
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET",
    "R2_PUBLIC_BASE_URL",
  ];

  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) {
    console.error(`Missing required config: ${missing.join(", ")}`);
    console.error("Set them in environment variables or .env.r2 at project root.");
    process.exitCode = 1;
    return;
  }

  const files = collectFiles(inputs, options.recursive);
  if (!files.length) {
    console.error("No files found to upload.");
    process.exitCode = 1;
    return;
  }

  const region = process.env.R2_REGION || "auto";
  const endpoint = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const prefix = (process.env.R2_PREFIX || "").trim().replace(/^\/+|\/+$/g, "");

  const s3 = new S3Client({
    region,
    endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });

  console.log(`Found ${files.length} file(s).`);

  const urls = [];

  for (let i = 0; i < files.length; i += 1) {
    const absFile = files[i];
    const key = keyForFile(absFile, prefix);
    const relative = path.relative(root, absFile).split(path.sep).join("/");
    const body = fs.createReadStream(absFile);

    const contentType = options.contentType || inferContentType(absFile);

    console.log(`\n[${i + 1}/${files.length}] ${relative}`);
    console.log(`Content-Type: ${contentType}`);

    let lastPercent = -1;
    const uploader = new Upload({
      client: s3,
      params: {
        Bucket: process.env.R2_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
        ...(options.cacheControl ? { CacheControl: options.cacheControl } : {}),
      },
    });

    uploader.on("httpUploadProgress", (progress) => {
      const loaded = Number(progress.loaded || 0);
      const total = Number(progress.total || 1);
      const percent = Math.floor((loaded / total) * 100);
      if (percent !== lastPercent) {
        lastPercent = percent;
        process.stdout.write(`\rUpload: ${percent}%`);
      }
    });

    await uploader.done();
    process.stdout.write("\rUpload: 100%\n");

    const url = urlForKey(process.env.R2_PUBLIC_BASE_URL, key);
    urls.push(url);
    console.log(`URL: ${url}`);
  }

  console.log("\nAll uploads complete. URL list:");
  for (const url of urls) {
    console.log(url);
  }
}

main().catch((err) => {
  console.error("\nFailed:", err && err.message ? err.message : err);
  process.exitCode = 1;
});
