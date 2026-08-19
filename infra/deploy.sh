#!/usr/bin/env bash
# AyTool atomic deploy (design.md §6): build → rsync to releases/<ts> → switch
# symlink → purge CDN → IndexNow ping. Rollback = point the symlink back.
#
# Usage:
#   ./infra/deploy.sh            # full deploy
#   ./infra/deploy.sh rollback   # switch to the previous release
#
# Configure via environment or edit the defaults below.
set -euo pipefail

DEPLOY_HOST="${AYTOOL_HOST:-user@your-server}"          # TODO: set your server
RELEASES_DIR="${AYTOOL_RELEASES:-/var/www/aytool-releases}"
LIVE_LINK="${AYTOOL_LINK:-/var/www/aytool}"
KEEP_RELEASES=5
SITE_URL="https://aytool.com"
INDEXNOW_KEY_FILE="$(dirname "$0")/.indexnow-key"
CDN_PURGE_CMD="${AYTOOL_CDN_PURGE:-}"                    # e.g. a curl to your CDN's purge API

cd "$(dirname "$0")/.."

if [[ "${1:-}" == "rollback" ]]; then
  ssh "$DEPLOY_HOST" "
    set -e
    prev=\$(ls -1t $RELEASES_DIR | sed -n 2p)
    [[ -n \"\$prev\" ]] || { echo 'No previous release to roll back to'; exit 1; }
    ln -sfn $RELEASES_DIR/\$prev $LIVE_LINK
    echo \"Rolled back to \$prev\"
  "
  [[ -n "$CDN_PURGE_CMD" ]] && eval "$CDN_PURGE_CMD"
  exit 0
fi

echo "==> Test"
npm test

echo "==> Build"
npm run build

TS=$(date +%Y%m%d%H%M%S)
echo "==> Upload to $RELEASES_DIR/$TS"
ssh "$DEPLOY_HOST" "mkdir -p $RELEASES_DIR/$TS"
rsync -az --delete dist/ "$DEPLOY_HOST:$RELEASES_DIR/$TS/"

echo "==> Switch symlink (atomic publish)"
ssh "$DEPLOY_HOST" "
  set -e
  ln -sfn $RELEASES_DIR/$TS $LIVE_LINK
  cd $RELEASES_DIR && ls -1t | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf
"

if [[ -n "$CDN_PURGE_CMD" ]]; then
  echo "==> Purge CDN"
  eval "$CDN_PURGE_CMD"
else
  echo "==> (No CDN purge command configured — set AYTOOL_CDN_PURGE)"
fi

echo "==> IndexNow ping"
if [[ -f "$INDEXNOW_KEY_FILE" ]]; then
  KEY=$(cat "$INDEXNOW_KEY_FILE")
  URLS=$(python3 - <<'EOF'
import json, re, sys, urllib.request
# All indexable URLs from the freshly built sitemap
import xml.etree.ElementTree as ET
ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls = []
tree = ET.parse('dist/sitemap-0.xml')
for loc in tree.findall('.//s:loc', ns):
    urls.append(loc.text)
print(json.dumps(urls))
EOF
)
  curl -s -X POST "https://api.indexnow.org/indexnow" \
    -H "Content-Type: application/json; charset=utf-8" \
    -d "{\"host\":\"aytool.com\",\"key\":\"$KEY\",\"keyLocation\":\"$SITE_URL/$KEY.txt\",\"urlList\":$URLS}" \
    && echo " — IndexNow pinged"
else
  echo "  (no .indexnow-key file — skipped)"
fi

echo "==> Deployed release $TS"
