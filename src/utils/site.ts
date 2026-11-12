// Build-time site region, derived from the configured `site` in astro.config.ts.
// Build with SITE_URL=https://fancyflow.cn/ to produce the mainland (ICP) variant.
const siteURL = import.meta.env.SITE ?? "https://fancyflow.top/";

export const isCN = new URL(siteURL).hostname.endsWith("fancyflow.cn");
