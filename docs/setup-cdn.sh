#!/usr/bin/env bash
# One-shot setup for cdn.fancyflow.cn (run on the CN server).
#
# Usage:
#   scp docs/cdn-nginx.conf docs/setup-cdn.sh new:~/
#   ssh new 'bash ~/setup-cdn.sh'
#
# You will be asked for the sudo password once.
set -euo pipefail

DOMAIN="cdn.fancyflow.cn"
# ACME challenges live in the site webroot; the asset root is separate and is
# configured inside cdn-nginx.conf (see docs/nginx/README.md for migration).
WEBROOT="/var/www/fancyflow.cn"
CONF_DIR="/etc/nginx/sites-available"
CONF="${CONF_DIR}/${DOMAIN}"
FINAL_CONF="$(cd "$(dirname "$0")" && pwd)/cdn-nginx.conf"

if [ ! -f "$FINAL_CONF" ]; then
  echo "Missing $FINAL_CONF (upload docs/cdn-nginx.conf next to this script)." >&2
  exit 1
fi

echo "==> 1/4 Installing a temporary HTTP vhost for the ACME challenge"
sudo tee "$CONF" >/dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};
    root ${WEBROOT};
    location /.well-known/acme-challenge/ { try_files \$uri =404; }
    location / { return 404; }
}
EOF
sudo ln -sf "$CONF" "/etc/nginx/sites-enabled/${DOMAIN}"
sudo nginx -t
sudo systemctl reload nginx

echo "==> 2/4 Issuing the certificate"
if sudo test -d "/etc/letsencrypt/live/${DOMAIN}"; then
  echo "Certificate already exists, skipping."
else
  sudo certbot certonly --webroot -w "$WEBROOT" -d "$DOMAIN" --non-interactive --agree-tos
fi

echo "==> 3/4 Installing the final HTTPS vhost"
sudo install -m 644 "$FINAL_CONF" "$CONF"

echo "==> 4/4 Validating and reloading nginx"
sudo nginx -t
sudo systemctl reload nginx

echo
echo "Done. Verify:"
echo "  curl -sI https://${DOMAIN}/image/post/study/csapp/lec05/cover.webp | head -5"
