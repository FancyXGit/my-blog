interface KVStore {
	get(key: string): Promise<string | null>;
	put(key: string, value: string): Promise<void>;
}

interface Env {
	COUNTERS: KVStore;
}

const CORS_HEADERS: Record<string, string> = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
};

function json(data: Record<string, unknown>, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { "Content-Type": "application/json; charset=utf-8", ...CORS_HEADERS },
	});
}

function isValidPath(p: string): boolean {
	return p.startsWith("/") && p !== "/" && p.length <= 500 && !p.includes("..");
}

async function readNumber(store: KVStore, key: string): Promise<number> {
	const raw = await store.get(key);
	const n = Number.parseInt(raw ?? "0", 10);
	return Number.isFinite(n) && n > 0 ? n : 0;
}

async function increment(store: KVStore, key: string): Promise<number> {
	const current = await readNumber(store, key);
	const next = current + 1;
	await store.put(key, String(next));
	return next;
}

async function readStats(store: KVStore, path: string) {
	const [views, likes] = await Promise.all([
		readNumber(store, `views:${path}`),
		readNumber(store, `likes:${path}`),
	]);
	return { path, views, likes };
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		if (request.method === "OPTIONS") {
			return new Response(null, { status: 204, headers: CORS_HEADERS });
		}

		const url = new URL(request.url);
		const path = (url.searchParams.get("p") ?? "").trim();

		if (!isValidPath(path)) {
			return json({ error: "invalid path" }, 400);
		}

		if (request.method === "GET" && url.pathname.endsWith("/stats")) {
			return json(await readStats(env.COUNTERS, path));
		}

		if (request.method === "POST" && url.pathname.endsWith("/view")) {
			const views = await increment(env.COUNTERS, `views:${path}`);
			const stats = await readStats(env.COUNTERS, path);
			return json({ path, views, likes: stats.likes });
		}

		if (request.method === "POST" && url.pathname.endsWith("/like")) {
			const likes = await increment(env.COUNTERS, `likes:${path}`);
			const stats = await readStats(env.COUNTERS, path);
			return json({ path, views: stats.views, likes });
		}

		return json({ error: "not found" }, 404);
	},
};
