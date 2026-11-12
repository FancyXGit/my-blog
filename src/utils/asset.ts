import { assetBases } from "@/site.config";
import { deployTarget } from "@/utils/site";

// Build-time asset origin: the mainland build serves assets same-origin (nginx
// `alias`), the international mirror from Cloudflare R2 (cdn.fancyflow.top).
export const assetBase = assetBases[deployTarget];

const ABSOLUTE_URL_RE = /^([a-z][a-z0-9+.-]*:)?\/\//i;

/** Resolves a root-relative asset path (`/image/...`, `/musics/...`) to this build's origin. */
export function assetUrl(value: string): string {
	if (!value) return value;
	if (ABSOLUTE_URL_RE.test(value) || value.startsWith("data:")) return value;
	return `${assetBase}${value.startsWith("/") ? "" : "/"}${value}`;
}
