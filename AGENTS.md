# AGENTS.md

## Commands

| Task | Command |
|------|---------|
| Dev server | `pnpm dev` (port **45873**) |
| Production build (+ search) | `pnpm build` — auto-runs `postbuild` (Pagefind) via pnpm lifecycle |
| Local quick build (no og-image) | `pnpm build:fast` — ~5s, **skips Pagefind** + skips satori og cards |
| Search index only | `pnpm postbuild` |
| Preview build | `pnpm preview` |
| Typecheck | `pnpm check` (`astro check`) |
| Lint | `pnpm lint` (`biome lint .`) |
| Format | `pnpm format` (biome for JS/TS, prettier for .astro) |

## Project Overview

- **Astro v5** static blog, **pnpm** package manager, deploy via GitHub Actions → cloud server → nginx (`fancyflow.top`)
- Content collections (`post`, `note`, `series`) in `src/content/<collection>/` as `.md`/`.mdx`; content config at `src/content.config.ts` (Astro v5 loader API, `image()` schema); alias `@/*` → `src/*`; site config at `src/site.config.ts`
- Layouts: `Base.astro` (shared shell, exposes `sidebar` named slot), `BlogPost.astro` + `Series.astro` (reading pages), pages under `src/pages`
- **Theme**: light/dark via `<html data-theme>`; all colors derive from HSL variables (`--hue`, `--saturation`, `--bg-brightness`, …) in `src/styles/global.css`
- **Syntax highlighting**: separate from page theme — `rehype-pretty-code` in `astro.config.ts` (rose-pine dark / rose-pine-dawn light)
- **Search**: Pagefind (`dist/pagefind`), only pages with `data-pagefind-body` are indexed

### Fonts

- Latin UI font = self-hosted **SF Pro Rounded** (`src/assets/fonts/*.latin.base/extend.ttf`, latin-only subsets, registered in `global.css`)
- CJK is **not** in those files → falls back to OS fonts (e.g. MiYaHei/PingFang); no explicit CJK stack configured yet (see plan)
- Code font = self-hosted **Fira Code** variable font `src/assets/fonts/FiraCode-VF.woff2` (300–700), wired as `fontFamily.mono` (first entry) in `tailwind.config.ts`; ligatures enabled
- Global `html` has `letter-spacing: 0.025em` (hurts CJK; candidate change in plan)

### Code styling knobs (all in `src/styles/global.css`)

| Variable | Purpose |
|----------|---------|
| `--code-font-weight` | uniform weight for inline + block code (default 500 per user preference) |
| `--code-inline-color` | inline code text color; `:not(pre) > code` has **no background/padding**, only accent color + mono font |
| `--code-bg`, `--code-title-bg`, `--code-inline-bg` | block code chrome (palette tweak still pending in plan) |

### Images

- Cover images + body images are remote on `cdn.fancyflow.top` (Cloudflare R2), **not** stored locally
- Masthead cover = plain `<img>` (bypasses `astro:assets`, so build does **not** download remote covers) inside an `aspect-[16/9]` wrapper — removes CLS and build-time CDN pulls
- Body markdown images render as raw `<img>` → fetched at page-view time by the browser

### og-image (social share card)

- `/og-image/{id}.png/.svg` generated at **build time** per post by `src/pages/og-image/[...slug].[ext].ts` (satori + @resvg/resvg-js, uses SF Pro fonts)
- Referenced via `og:image` meta; only visible when links are shared on social/IM
- `NO_OG=1` env → `getStaticPaths` returns `[]` (used by `scripts/build-fast.mjs`)

## Styling

- **Biome** for JS/TS (tab width 2, 100 char, semicolons, trailing commas); ignores `.astro`
- **Prettier** handles `.astro` files
- **TailwindCSS v3** with typography plugin, dark mode via `[data-theme="dark"]`

## Deploy

- `git push` → GitHub Actions SSH to cloud server → pull → `pnpm build` → nginx → `fancyflow.top`
- `netlify.toml` is unused
- `pnpm postbuild` auto-runs after `pnpm build` (pnpm lifecycle), **not** after `build:fast`

## R2 Images

- Upload assets to Cloudflare R2: `pnpm r2:upload` / `r2:upload-png` / `r2:upload-file`
- Credentials in `.env.r2` (gitignored, copy from `scripts/.env.r2.example`)

## Gotchas

- No `pnpm sync` — doesn't exist in Astro v5
- `global.css` edits hot-reload under `pnpm dev`; `tailwind.config.ts` edits usually need a dev server restart
- Repo CSS/TS files are CRLF; Biome wants LF → `biome check/format` reports whole-file diffs. Don't casually `--write` the whole repo
- `astro check` currently has 1 **pre-existing** error: satori `VNode` → `ReactNode` in `og-image/[...slug].[ext].ts` (baseline, not caused by recent work)
- Do **not** delete `node_modules/.astro` casually — it caches Astro content/types and downloaded remote assets
- `@resvg/resvg-js` excluded from Vite optimizeDeps
- Local iteration: `pnpm dev` → `pnpm build:fast` (quick preview) → `pnpm build` only for release sanity / og cards
