import { PagefindUI } from "@pagefind/default-ui";
import pagefindCss from "@pagefind/default-ui/css/ui.css?inline";

/**
 * Lazily loads the Pagefind search UI. This module is only ever imported after
 * the user opens the search dialog, so neither the engine (~68KB) nor the UI
 * stylesheet (~14KB) are fetched for users who never search.
 */
export async function initPagefind(
	baseUrl: string,
	bundlePath: string,
	element: string,
): Promise<void> {
	injectPagefindStyles();
	new PagefindUI({
		baseUrl,
		bundlePath,
		element,
		showImages: false,
		showSubResults: true,
	});
}

function injectPagefindStyles(): void {
	if (document.head.querySelector("style[data-pagefind]")) return;
	const style = document.createElement("style");
	style.setAttribute("data-pagefind", "");
	style.textContent = pagefindCss;
	document.head.appendChild(style);
}
