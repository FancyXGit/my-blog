interface StatsResponse {
	views?: number;
	likes: number;
}

function safeGet(storage: Storage, key: string): string | null {
	try {
		return storage.getItem(key);
	} catch {
		return null;
	}
}

function safeSet(storage: Storage, key: string, value: string): void {
	try {
		storage.setItem(key, value);
	} catch {
		// Storage unavailable (e.g. private mode); ignore.
	}
}

/**
 * Wires up a "like" control (any button carrying data-api/data-path).
 * Handles optimistic state, the POST to the stats Worker, a transient
 * bubble, localStorage dedup and syncing with the rest of the page via
 * the `post:liked` window event. If the button contains a `[data-like-count]`
 * element, its value is loaded once and kept in sync.
 */
export function initLikeControl(button: HTMLButtonElement): void {
	const apiBase = button.dataset.api ?? "";
	const path = button.dataset.path ?? window.location.pathname;
	const likedKey = `like:${path}`;

	const heartOn = button.querySelector<HTMLElement>("[data-heart-on]");
	const heartOff = button.querySelector<HTMLElement>("[data-heart-off]");
	const countEl = button.querySelector<HTMLElement>("[data-like-count]");

	const api = (action: "stats" | "like") => {
		return `${apiBase}/api/${action}?p=${encodeURIComponent(path)}`;
	};

	async function request<T>(url: string, method: "GET" | "POST"): Promise<T> {
		const response = await fetch(url, { method });
		if (!response.ok) {
			throw new Error(`stats request failed: ${response.status}`);
		}
		return (await response.json()) as T;
	}

	function format(n: number): string {
		return n.toLocaleString("zh-CN");
	}

	function setLiked(liked: boolean): void {
		button.dataset.liked = String(liked);
		button.setAttribute("aria-pressed", String(liked));
		button.title = liked ? "已喜欢过这篇" : "喜欢这篇文章？";
		heartOn?.classList.toggle("hidden", !liked);
		heartOff?.classList.toggle("hidden", liked);
	}

	function renderCount(likes: number): void {
		if (countEl) {
			countEl.textContent = format(likes);
		}
	}

	function showBubble(likes: number): void {
		const bubble = document.createElement("span");
		bubble.className = "like-bubble";
		bubble.textContent = `${format(likes)} Likes!`;
		button.appendChild(bubble);
		window.setTimeout(() => bubble.remove(), 1000);
	}

	// Keep every control in sync when any of them is liked on this page.
	window.addEventListener("post:liked", () => {
		setLiked(true);
	});

	if (countEl) {
		window.addEventListener("post:liked", (event) => {
			const detail = (event as CustomEvent<{ likes: number }>).detail;
			if (detail && typeof detail.likes === "number") {
				renderCount(detail.likes);
			}
		});
	}

	button.addEventListener("click", () => {
		if (safeGet(localStorage, likedKey) === "1") {
			return;
		}

		setLiked(true);

		void (async () => {
			try {
				const data = await request<StatsResponse>(api("like"), "POST");
				renderCount(data.likes);
				showBubble(data.likes);
				safeSet(localStorage, likedKey, "1");
				window.dispatchEvent(
					new CustomEvent<{ likes: number }>("post:liked", { detail: { likes: data.likes } }),
				);
			} catch {
				setLiked(false);
			}
		})();
	});

	setLiked(safeGet(localStorage, likedKey) === "1");

	if (countEl) {
		void (async () => {
			try {
				const data = await request<StatsResponse>(api("stats"), "GET");
				renderCount(data.likes);
			} catch {
				// Counts unavailable; keep the placeholder.
			}
		})();
	}
}
