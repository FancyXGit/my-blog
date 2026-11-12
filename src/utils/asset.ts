import { assetBases } from "@/site.config";
import { isCN } from "@/utils/site";

// Build-time asset origin: the mainland build serves assets from cdn.fancyflow.cn,
// the international build from Cloudflare R2 (cdn.fancyflow.top).
export const assetBase = isCN ? assetBases.cn : assetBases.top;

const ABSOLUTE_URL_RE = /^([a-z][a-z0-9+.-]*:)?\/\//i;

/** Resolves a root-relative asset path (`/image/...`, `/musics/...`) to this build's origin. */
export function assetUrl(value: string): string {
	if (!value) return value;
	if (ABSOLUTE_URL_RE.test(value) || value.startsWith("data:")) return value;
	return `${assetBase}${value.startsWith("/") ? "" : "/"}${value}`;
}
