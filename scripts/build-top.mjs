import { spawnSync } from "node:child_process";

// Build the overseas mirror into `dist-top`. Keeping this in Node (instead of
// `SITE_URL=... pnpm build`) makes the command work on Windows as well.
const env = {
	...process.env,
	DEPLOY_TARGET: "top",
	SITE_URL: "https://fancyflow.top/",
	OUT_DIR: process.env.OUT_DIR ?? "dist-top",
};

function run(args) {
	const result = spawnSync(process.execPath, args, { stdio: "inherit", env });
	if (result.status !== 0) process.exit(result.status ?? 1);
}

run(["./node_modules/astro/astro.js", "build"]);
run(["./scripts/pagefind.mjs"]);
