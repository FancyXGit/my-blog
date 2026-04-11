#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

const INPUT_EXT_RE = /\.(png|jpe?g)$/i;

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
    quality: Number.NaN,
    effort: Number.NaN,
    recursive: true,
  };

  while (args.length) {
    const token = args.shift();
    if (!token) continue;

    if (token === "--quality" || token === "-q") {
      options.quality = Number(args.shift());
      continue;
    }
    if (token === "--effort" || token === "-e") {
      options.effort = Number(args.shift());
      continue;
    }
    if (token === "--no-recursive") {
      options.recursive = false;
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
  console.log(`\nImage (PNG/JPG/JPEG) -> WebP -> R2 uploader\n\nUsage:\n  node scripts/upload-png-to-r2.cjs <file-or-dir> [more files/dirs...] [--quality 82] [--effort 5] [--no-recursive]\n\nExamples:\n  node scripts/upload-png-to-r2.cjs public/images\n  node scripts/upload-png-to-r2.cjs public/images/a.png public/images/b.jpg --quality 80\n\nConfig (via env vars or .env.r2):\n  R2_ACCOUNT_ID\n  R2_ACCESS_KEY_ID\n  R2_SECRET_ACCESS_KEY\n  R2_BUCKET\n  R2_PUBLIC_BASE_URL   (example: https://img.example.com)\n  R2_REGION            (optional, default: auto)\n  R2_PREFIX            (optional, object key prefix)\n  WEBP_QUALITY         (optional, default: 82)\n  WEBP_EFFORT          (optional, default: 5)\n`);
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
    if (entry.isFile() && INPUT_EXT_RE.test(full)) {
      out.push(full);
    }
  }

  return out;
}

function collectImageFiles(rawInputs, recursive) {
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

    if (stat.isFile() && INPUT_EXT_RE.test(full)) {
      found.add(full);
      continue;
    }

    console.warn(`[skip] Not a supported image file (.png/.jpg/.jpeg): ${input}`);
  }

  return [...found];
}

function keyForFile(absPath, prefix) {
  const rel = path.relative(process.cwd(), absPath).split(path.sep).join("/");
  const webpRel = rel.replace(INPUT_EXT_RE, ".webp");
  const raw = [prefix || "", webpRel].filter(Boolean).join("/");
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

  const files = collectImageFiles(inputs, options.recursive);
  if (!files.length) {
    console.error("No supported image files (.png/.jpg/.jpeg) found to process.");
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

  console.log(`Found ${files.length} image file(s).`);
  console.log(`WebP settings: quality=${quality}, effort=${effort}`);

  const urls = [];

  for (let i = 0; i < files.length; i += 1) {
    const absFile = files[i];
    const key = keyForFile(absFile, prefix);
    const relative = path.relative(root, absFile).split(path.sep).join("/");

    console.log(`\n[${i + 1}/${files.length}] ${relative}`);

    const webpBuffer = await sharp(absFile).webp({ quality, effort }).toBuffer();
    const totalBytes = webpBuffer.length;
    console.log(`Compressed: ${(totalBytes / 1024).toFixed(1)} KB`);

    let lastPercent = -1;
    const uploader = new Upload({
      client: s3,
      params: {
        Bucket: process.env.R2_BUCKET,
        Key: key,
        Body: webpBuffer,
        ContentType: "image/webp",
      },
    });

    uploader.on("httpUploadProgress", (progress) => {
      const loaded = Number(progress.loaded || 0);
      const total = Number(progress.total || totalBytes || 1);
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
