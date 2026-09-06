import { spawnSync } from "node:child_process";

const result = spawnSync(process.execPath, ["./node_modules/astro/astro.js", "build"], {
  stdio: "inherit",
});

process.exit(result.status ?? 1);
