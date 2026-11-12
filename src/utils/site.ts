// Build-time deploy target injected by astro.config.ts (`vite.define`).
// "cn" = primary mainland site, "top" = overseas mirror.
export const deployTarget = __DEPLOY_TARGET__;
export const isCN = deployTarget === "cn";
