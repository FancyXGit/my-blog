# AGENTS.md

## Commands

| Task | Command |
|------|---------|
| Dev server | `pnpm dev` (port **45873**, local preview only) |
| Build | `pnpm build` |
| Build + search index | `pnpm build` then `pnpm postbuild` |
| Preview build | `pnpm preview` |
| Typecheck | `pnpm check` (`astro check`) |
| Lint | `pnpm lint` (`biome lint .`) |
| Format | `pnpm format` (biome for JS/TS, prettier for .astro) |

## Architecture

- **Astro v5** static blog, **pnpm** package manager
- Content collections (`post`, `note`, `series`) in `src/content/<collection>/` as `.md`/`.mdx`
- Content config at `src/content.config.ts` (Astro v5 loader-based API — not `src/content/config.ts`)
- Path alias `@/*` → `src/*`, site config at `src/site.config.ts`

## Styling

- **Biome** for JS/TS (tab width 2, 100 char, semicolons, trailing commas); ignores `.astro`
- **Prettier** handles `.astro` files
- **TailwindCSS v3** with typography plugin, dark mode via `[data-theme="dark"]`

## Deploy

- `git push` → GitHub Actions SSH to cloud server → pull → `pnpm build` → nginx → `fancyflow.top`
- `netlify.toml` is unused
- `pnpm postbuild` is **required** after `pnpm build` for Pagefind search to work

## R2 Images

- Upload assets to Cloudflare R2: `pnpm r2:upload` / `r2:upload-png` / `r2:upload-file`
- Credentials in `.env.r2` (gitignored, copy from `scripts/.env.r2.example`)

## Gotchas

- No `pnpm sync` — doesn't exist in Astro v5
- After deleting `.md` content files, deploy workflow cleans `.astro`, `node_modules/.astro`, `dist` to prevent stale routes
- `@resvg/resvg-js` excluded from Vite optimizeDeps
