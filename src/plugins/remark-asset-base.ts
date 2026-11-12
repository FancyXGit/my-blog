import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

interface RemarkAssetBaseOptions {
	/** Absolute asset origin for this build, e.g. "https://cdn.fancyflow.top". */
	base: string;
	/** Root-relative prefix that should be rewritten. Defaults to "/image/". */
	prefix?: string;
}

/**
 * Prefixes root-relative asset paths in markdown images with the asset origin of
 * the current build. Content stays domain-free (`![alt](/image/x.webp)`) while
 * `.top` and `.cn` builds emit their own host.
 */
export const remarkAssetBase: Plugin<[RemarkAssetBaseOptions], Root> = ({
	base,
	prefix = "/image/",
}) => (tree) => {
	if (!base) return;

	visit(tree, "image", (node) => {
		if (typeof node.url !== "string" || !node.url.startsWith(prefix)) return;
		node.url = `${base.replace(/\/+$/, "")}${node.url}`;
	});
};
