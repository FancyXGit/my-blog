import { spawnSync } from "node:child_process";
import path from "node:path";

// Index the build that just finished. `OUT_DIR` keeps the two deployments apart
// (`dist` for the primary site, `dist-top` for the mirror).
const outDir = process.env.OUT_DIR ?? "dist";
const cli = path.join("node_modules", "pagefind", "lib", "runner", "bin.cjs");

const result = spawnSync(process.execPath, [cli, "--site", outDir], { stdio: "inherit" });

process.exit(result.status ?? 1);
