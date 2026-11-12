#!/usr/bin/env bash
# CN server cutover: move assets out of the webroot, serve them same-origin via
# nginx `alias`, enable HTTP/2 and explicit cache headers.
#
# Run on the CN server (needs root):
#   sudo bash apply-cn-nginx.sh
#
# Idempotent: assets that are already outside the webroot are left alone, and
# the nginx configs are rewritten from scratch each run.
set -euo pipefail

SITE_ROOT="/var/www/fancyflow.cn"
ASSET_ROOT="/var/www/cdn-fancyflow.cn"
SITE_CONF="/etc/nginx/sites-available/fancyflow.cn"
CDN_CONF="/etc/nginx/sites-available/cdn.fancyflow.cn"
STAMP="$(date -u +%Y%m%d-%H%M%S)"

if [ "$(id -u)" -ne 0 ]; then
  echo "Run with sudo: sudo bash $0" >&2
  exit 1
fi

echo "==> 1/6 Backing up nginx configs"
cp -a "$SITE_CONF" "${SITE_CONF}.bak-${STAMP}"
cp -a "$CDN_CONF" "${CDN_CONF}.bak-${STAMP}"

if [ -d "$SITE_ROOT/image" ] || [ -d "$SITE_ROOT/musics" ]; then
  echo "==> 2/6 Backing up assets"
  mkdir -p /var/www/.releases
  dirs=()
  [ -d "$SITE_ROOT/image" ] && dirs+=(image)
  [ -d "$SITE_ROOT/musics" ] && dirs+=(musics)
  tar -C "$SITE_ROOT" -czf "/var/www/.releases/assets-${STAMP}.tar.gz" "${dirs[@]}"

  echo "==> 3/6 Moving assets to $ASSET_ROOT"
  install -d -m 755 -o fancy -g fancy "$ASSET_ROOT"
  for dir in "${dirs[@]}"; do
    mv "$SITE_ROOT/$dir" "$ASSET_ROOT/"
  done
else
  echo "==> 2-3/6 Assets already outside the webroot; skipping move"
fi
chmod -R a+rX "$ASSET_ROOT"

echo "==> 4/6 Writing nginx configs"
cat > "$SITE_CONF" <<'NGINX'
# https: apex domain
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name fancyflow.cn;

    ssl_certificate /etc/letsencrypt/live/fancyflow.cn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fancyflow.cn/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /var/www/fancyflow.cn;
    index index.html;
    charset utf-8;

    # HTML revalidates on every visit so a deploy is visible immediately.
    add_header Cache-Control "no-cache" always;

    location / {
        try_files $uri $uri/ =404;
    }

    location /_astro/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files $uri =404;
    }

    location /pagefind/ {
        add_header Cache-Control "public, max-age=604800";
        try_files $uri =404;
    }

    # Assets live outside the webroot and are served same-origin so pages avoid
    # a second DNS + TLS handshake.
    location ^~ /image/ {
        alias /var/www/cdn-fancyflow.cn/image/;
        add_header Cache-Control "public, max-age=604800" always;
        add_header X-Content-Type-Options "nosniff" always;
    }

    location ^~ /musics/ {
        alias /var/www/cdn-fancyflow.cn/musics/;
        add_header Cache-Control "public, max-age=604800" always;
        add_header X-Content-Type-Options "nosniff" always;
    }

    error_page 404 /404.html;
}

# https: www -> apex
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.fancyflow.cn;

    ssl_certificate /etc/letsencrypt/live/fancyflow.cn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fancyflow.cn/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    return 301 https://fancyflow.cn$request_uri;
}

# http: everything -> https apex
server {
    listen 80;
    listen [::]:80;
    server_name fancyflow.cn www.fancyflow.cn;

    return 301 https://fancyflow.cn$request_uri;
}
NGINX

cat > "$CDN_CONF" <<'NGINX'
# cdn.fancyflow.cn — dedicated asset host for the mainland deployment.
#
# Kept for direct links and a future real CDN. The site itself serves the same
# files same-origin through `alias` (see docs/nginx/README.md).
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name cdn.fancyflow.cn;

    ssl_certificate /etc/letsencrypt/live/cdn.fancyflow.cn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cdn.fancyflow.cn/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /var/www/cdn-fancyflow.cn;
    autoindex off;
    charset utf-8;

    location = / {
        return 404;
    }

    location ~* \.(html|xml)$ {
        return 404;
    }

    location / {
        try_files $uri $uri/ =404;
        add_header Cache-Control "public, max-age=604800" always;
        add_header Access-Control-Allow-Origin "*" always;
        add_header X-Content-Type-Options "nosniff" always;
    }
}

server {
    listen 80;
    listen [::]:80;
    server_name cdn.fancyflow.cn;

    # ACME challenges stay in the site webroot (excluded from rsync --delete).
    location /.well-known/acme-challenge/ {
        root /var/www/fancyflow.cn;
    }

    location / {
        return 301 https://cdn.fancyflow.cn$request_uri;
    }
}
NGINX

echo "==> 5/6 Validating and reloading nginx"
nginx -t
systemctl reload nginx

echo "==> 6/6 Verifying"
img="$(find "$ASSET_ROOT/image" -type f \( -name '*.webp' -o -name '*.png' -o -name '*.jpg' \) | head -n 1 | sed "s#^$ASSET_ROOT##")"
astro="$(find "$SITE_ROOT/_astro" -maxdepth 1 -type f | head -n 1 | xargs -r basename)"

check() {
  local url="$1"
  printf '%-70s ' "$url"
  curl -sSI --max-time 10 "$url" | tr -d '\r' | awk 'BEGIN{IGNORECASE=1} /^HTTP\//{printf "%s ", $2} /^cache-control:/{printf "%s ", $0} END{print ""}'
}

check "https://fancyflow.cn/"
check "https://fancyflow.cn/_astro/${astro}"
[ -n "$img" ] && check "https://fancyflow.cn${img}"
[ -n "$img" ] && check "https://cdn.fancyflow.cn${img}"

echo
echo "Done."
echo "  Config backups: ${SITE_CONF}.bak-${STAMP}, ${CDN_CONF}.bak-${STAMP}"
echo "  Asset backup:   /var/www/.releases/assets-${STAMP}.tar.gz"
echo "  Rollback:       restore the .bak configs, move image/ + musics/ back,"
echo "                  then 'sudo nginx -t && sudo systemctl reload nginx'."
