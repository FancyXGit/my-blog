# nginx: CN primary site + asset host

The CN build serves assets **same-origin** (`/image/...`, `/musics/...`) to avoid a
second DNS + TLS handshake. The files still live outside the site webroot so site
deploys never touch them:

```
/var/www/fancyflow.cn/                 # site dist (rsync target)
/var/www/cdn-fancyflow.cn/
  ├── image/
  └── musics/
```

`cdn.fancyflow.cn` keeps its own vhost (see `docs/cdn-nginx.conf`) for direct links
and for a future real mainland CDN.

## Current state vs. target

While `image/` and `musics/` still sit inside `/var/www/fancyflow.cn/`, same-origin
`/image/...` already works — no nginx change is required for the first deploy of the
same-origin build.

The physical move below is a one-time maintenance step. **Do it in this order**;
adding the `alias` before the files are in place makes images 404.

## One-time cutover

```bash
# 1. Snapshot (safety)
sudo mkdir -p /var/www/.releases
sudo tar -C /var/www/fancyflow.cn -czf "/var/www/.releases/assets-$(date +%F).tar.gz" image musics

# 2. Move the assets out of the webroot
sudo mkdir -p /var/www/cdn-fancyflow.cn
sudo mv /var/www/fancyflow.cn/image /var/www/fancyflow.cn/musics /var/www/cdn-fancyflow.cn/

# 3. Add the locations from fancyflow.cn.locations.conf to the fancyflow.cn
#    server block, and change the root of cdn.fancyflow.cn to the new directory
#    (docs/cdn-nginx.conf). Both must be in the same reload, because the old
#    HTML still references cdn.fancyflow.cn directly.
sudo nginx -t && sudo systemctl reload nginx

# 4. Verify both origins before deploying anything
curl -sI https://fancyflow.cn/image/<known-image>.webp | head -n 5
curl -sI https://cdn.fancyflow.cn/image/<known-image>.webp | head -n 5

# 5. Update the local .env.r2 (not committed)
#    CN_ASSET_ROOT=/var/www/cdn-fancyflow.cn
```

## Cache headers

- Site server block: `expires -1;` for HTML, `/_astro/` → `expires 1y;`,
  `/pagefind/` → `expires 7d;`, assets → `expires 7d;`.
- Prefer `expires` over `add_header Cache-Control` inside locations: a child
  `add_header` discards all `add_header` directives inherited from the server
  block (HSTS, security headers, …).
- `docs/cdn-nginx.conf` uses `expires 7d` (paths can be overwritten by re-uploads)
  plus `X-Content-Type-Options: nosniff`.
- R2 uploads default to `Cache-Control: public, max-age=604800`; override with
  `R2_CACHE_CONTROL`.

## Rollback

- Assets: move `image/` and `musics/` back into `/var/www/fancyflow.cn/`, remove the
  two `alias` locations, restore the old `cdn.fancyflow.cn` root, reload nginx.
- Build: set `assetBases.cn = "https://cdn.fancyflow.cn"` (or build with
  `ASSET_BASE=https://cdn.fancyflow.cn`) and redeploy. The vhost still points at the
  same files after the cutover, so only the HTML URLs change.
