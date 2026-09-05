import type { Paragraph, Root } from "mdast";
import type { Plugin } from "unified";

type Phrasing = Paragraph["children"][number];

/** Splits paragraph children into groups at `break` nodes. Returns null when no meaningful split. */
function splitAtBreaks(children: Phrasing[]): Phrasing[][] | null {
	let found = false;
	const groups: Phrasing[][] = [];
	let current: Phrasing[] = [];
	for (const child of children) {
		if (child.type === "break") {
			found = true;
			if (current.length) groups.push(current);
			current = [];
		} else {
			current.push(child);
		}
	}
	if (current.length) groups.push(current);
	return found && groups.length > 1 ? groups : null;
}

function isParent(node: unknown): node is { children: unknown[] } {
	return typeof node === "object" && node !== null && "children" in node;
}

function transform(node: unknown) {
	if (!isParent(node)) return;
	const children: unknown[] = [];
	for (const child of node.children) {
		if (isParent(child) && child.children.some((c) => (c as { type?: string }).type === "break")) {
			const groups = splitAtBreaks(child.children as Phrasing[]);
			if (groups) {
				children.push(...groups.map((group) => ({ children: group, type: "paragraph" })));
				continue;
			}
		}
		children.push(child);
	}
	node.children = children;
	for (const child of children) transform(child);
}

export const remarkLinebreakParagraph: Plugin<[], Root> = () => (tree) => {
	transform(tree);
};
