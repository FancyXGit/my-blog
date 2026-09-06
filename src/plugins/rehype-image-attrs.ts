import type { Element, Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

/** Adds lazy loading and async decoding to markdown body images (covers are untouched). */
export const rehypeImageAttrs: Plugin<[], Root> = () => (tree) => {
	visit(tree, "element", (node: Element) => {
		if (node.tagName !== "img") return;
		const properties = node.properties;
		if (typeof properties.loading === "string") return;
		properties.loading = "lazy";
		properties.decoding = "async";
	});
};
