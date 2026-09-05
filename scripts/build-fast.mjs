import { spawnSync } from "node:child_process";

const result = spawnSync(
  process.execPath,
  ["./node_modules/astro/astro.js", "build"],
  {
    stdio: "inherit",
    env: { ...process.env, NO_OG: "1" },
  },
);

process.exit(result.status ?? 1);
