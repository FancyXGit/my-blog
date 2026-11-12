# nginx: CN primary site + asset host

The CN build serves assets **same-origin** (`/image/...`, `/musics/...`) to avoid a
second DNS + TLS handshake. The files live outside the site webroot so site
deploys never touch them:

```
/var/www/fancyflow.cn/                 # site dist (rsync target)
/var/www/cdn-fancyflow.cn/
  ├── image/
  └── musics/
```

`cdn.fancyflow.cn` keeps its own vhost (`docs/cdn-nginx.conf`) for direct links and
a future real mainland CDN.

## State (CN server `new`, applied 2026-11-12)

- `image/` and `musics/` were moved to `/var/www/cdn-fancyflow.cn/`; an asset tar
  backup is in `/var/www/.releases/assets-20261112-035013.tar.gz`.
- `docs/nginx/fancyflow.cn.conf` is the live apex + www + HTTP vhost.
- `docs/cdn-nginx.conf` is the live asset vhost.
- Cache headers: HTML `no-cache`, `/_astro/` 1 year immutable, `/pagefind/` and
  assets 7 days.
- HTTP/2 is enabled on both vhosts (nginx 1.24 → `listen ... ssl http2;`).
- The local `.env.r2` uses `CN_ASSET_ROOT=/var/www/cdn-fancyflow.cn`.

`docs/server/apply-cn-nginx.sh` is the idempotent cutover script (run it with
`sudo` on the CN server). It backs up the configs and assets before changing
anything.

## Fresh server cutover

Do it in this order; adding the `alias` before the files are in place makes
images 404.

```bash
# 1. On the new server, install the configs and enable them
sudo cp docs/nginx/fancyflow.cn.conf /etc/nginx/sites-available/fancyflow.cn
sudo cp docs/cdn-nginx.conf        /etc/nginx/sites-available/cdn.fancyflow.cn
sudo ln -sf /etc/nginx/sites-available/fancyflow.cn /etc/nginx/sites-enabled/fancyflow.cn
sudo ln -sf /etc/nginx/sites-available/cdn.fancyflow.cn /etc/nginx/sites-enabled/cdn.fancyflow.cn

# 2. Move assets out of the webroot (see also docs/server/apply-cn-nginx.sh)
sudo mkdir -p /var/www/cdn-fancyflow.cn
sudo mv /var/www/fancyflow.cn/image /var/www/fancyflow.cn/musics /var/www/cdn-fancyflow.cn/

# 3. Validate and reload
sudo nginx -t && sudo systemctl reload nginx

# 4. Verify both origins
curl -sI https://fancyflow.cn/image/<known-image>.webp | head -n 5
curl -sI https://cdn.fancyflow.cn/image/<known-image>.webp | head -n 5
```

## Cache headers

- Prefer `add_header Cache-Control ... always` (or `expires`) consistently inside
  a location: a child `add_header` discards all `add_header` directives inherited
  from the server block (HSTS, security headers, …).
- HTML: `Cache-Control: no-cache` so a deploy is visible immediately.
- `/_astro/`: hashed filenames → `max-age=31536000, immutable`.
- `/pagefind/` and assets: 7 days (paths can be overwritten by re-uploads).
- `docs/cdn-nginx.conf` uses 7 days plus `X-Content-Type-Options: nosniff`.
- R2 uploads default to `Cache-Control: public, max-age=604800`; override with
  `R2_CACHE_CONTROL`.

## Rollback

- Assets: move `image/` and `musics/` back into `/var/www/fancyflow.cn/`, remove the
  two `alias` locations, restore the old `cdn.fancyflow.cn` root, reload nginx.
- Configs: restore the `.bak-<stamp>` files created by the cutover script.
- Build: set `assetBases.cn = "https://cdn.fancyflow.cn"` (or build with
  `ASSET_BASE=https://cdn.fancyflow.cn`) and redeploy.
