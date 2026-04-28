# AGENTS.md

## Commands

| Task | Command |
|------|---------|
| Dev server | `pnpm dev` (port **45873**, local preview only — not used in production) |
| Build | `pnpm build` |
| Build + search index | `pnpm build` then `pnpm postbuild` (Pagefind needs built HTML) |
| Preview build | `pnpm preview` |
| Typecheck | `pnpm check` (`astro check`) |
| Lint | `pnpm lint` (`biome lint .`) |
| Format | `pnpm format` (biome for JS/TS, prettier for .astro) |

## Architecture

- **Astro v5** static blog, forked from "Astro Citrus" starter
- **Package manager**: pnpm (lockfile is `pnpm-lock.yaml`)
- **Content collections** use Astro v5 loader-based API in `src/content.config.ts` (not the old `src/content/config.ts` schema approach)
- Three collections: `post`, `note`, `series` — content in `src/content/<collection>/` as `.md`/`.mdx`
- Path alias `@/*` → `src/*` (configured in `tsconfig.json`)
- Site config at `src/site.config.ts` (title, author, lang, date locale, nav links)

## Styling / Formatting

- **Biome** for JS/TS (`biome.json`): tab indent (2), 100 char width, semicolons always, trailing commas all
- **Biome formatter ignores `.astro` files** — Prettier (`prettier-plugin-astro`, `prettier-plugin-tailwindcss`) handles those
- **TailwindCSS v3** with typography plugin; custom `citrus-link`, `title`, admonition component classes
- Dark mode via `class` strategy: `[data-theme="dark"]`

## Build & Deploy

- **Pagefind search** requires running `pnpm postbuild` after `pnpm build`, or search won't work
- Deploy flow: `git commit && git push` → GitHub Actions (`.github/workflows/deploy-server.yml`) → SSH to cloud server → `git pull` → `pnpm install --frozen-lockfile` + `pnpm build` → copy `dist/` to nginx web root → served at `fancyflow.top`
- CI triggers on push to `main`/`master` when content, assets, public, or config files change
- `netlify.toml` exists but is unused (deploy is via SSH)
- The dev server (port 45873) is for local writing/preview only; production traffic never hits it

## Assets / R2

- Image upload to Cloudflare R2 via scripts in `scripts/`:
  - `pnpm r2:upload` — unified upload (images → WebP, others raw)
  - `pnpm r2:upload-png` — PNG/JPG → WebP → R2
  - `pnpm r2:upload-file` — any file → R2
- R2 credentials in `.env.r2` (gitignored, copy from `scripts/.env.r2.example`)

## Gotchas

- Dev server port is **45873** (`astro.config.ts server.port`), not the README's 3000
- Astro v5 content config: the file is `src/content.config.ts` (new loader API), not `src/content/config.ts`
- No `pnpm sync` command — README mentions one but it doesn't exist in Astro v5
- After deleting markdown content files, the server deploy workflow cleans `.astro`, `node_modules/.astro`, and `dist` to prevent stale routes
- `@resvg/resvg-js` must be excluded from Vite optimizeDeps
- `.vscode/` is gitignored (see `.gitignore`)
