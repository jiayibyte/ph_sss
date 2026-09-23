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

DEPLOY_HOST="${AYTOOL_HOST:-139}"                        # SSH config alias for 43.160.196.139
RELEASES_DIR="${AYTOOL_RELEASES:-/var/www/aytool-releases}"
LIVE_LINK="${AYTOOL_LINK:-/var/www/aytool}"
KEEP_RELEASES=5
SITE_URL="https://aytool.com"
INDEXNOW_KEY_FILE="$(dirname "$0")/.indexnow-key"
CDN_PURGE_CMD="${AYTOOL_CDN_PURGE:-}"                    # e.g. a curl to your CDN's purge API
# Nightly rebuilds on the server (infra/server/, `make server-setup`): the server keeps
# a bare repo of every deployed commit and rebuilds the live one at 00:05 Manila time.
SERVER_BIN=/opt/aytool/bin/aytool-rebuild
SERVER_REPO=/opt/aytool/repo.git

cd "$(dirname "$0")/.."

have_server_rebuild() { ssh "$DEPLOY_HOST" "test -x $SERVER_BIN"; }

if [[ "${1:-}" == "rollback" ]]; then
  if have_server_rebuild; then
    ssh "$DEPLOY_HOST" "$SERVER_BIN rollback"   # newest OLDER release of a different commit
  else
    ssh "$DEPLOY_HOST" "
      set -e
      prev=\$(ls -1t $RELEASES_DIR | sed -n 2p)
      [[ -n \"\$prev\" ]] || { echo 'No previous release to roll back to'; exit 1; }
      ln -sfn $RELEASES_DIR/\$prev $LIVE_LINK
      echo \"Rolled back to \$prev\"
    "
  fi
  [[ -n "$CDN_PURGE_CMD" ]] && eval "$CDN_PURGE_CMD"
  exit 0
fi

# What is being deployed: the nightly rebuild can only reproduce a clean commit.
SHA=$(git rev-parse HEAD)
DIRTY=$(git status --porcelain | wc -l | tr -d ' ')
if [[ "$DIRTY" != "0" ]]; then
  echo "!! $DIRTY uncommitted file(s): this release goes live as built, but the server's nightly"
  echo "!! rebuild will skip it (it only rebuilds commits) until you deploy a clean commit."
fi

echo "==> Test"
npm test

echo "==> Build"
npm run build

# Crawl-facing invariants (canonical URLs, sitemap == indexable set, no dead or
# redirecting internal links). Blocks the upload rather than the Search Console
# report finding it three weeks later.
echo "==> Audit dist"
npm run audit

TS=$(date +%Y%m%d%H%M%S)
echo "==> Upload to $RELEASES_DIR/$TS"
ssh "$DEPLOY_HOST" "mkdir -p $RELEASES_DIR/$TS"
rsync -az --delete dist/ "$DEPLOY_HOST:$RELEASES_DIR/$TS/"

if have_server_rebuild; then
  echo "==> Hand commit ${SHA:0:12} to the server's nightly rebuild"
  git push --quiet --force "$DEPLOY_HOST:$SERVER_REPO" "$SHA:refs/heads/live" \
    || echo "!! could not push to $DEPLOY_HOST:$SERVER_REPO — nightly rebuilds will skip this release"
  echo "==> Switch symlink (atomic publish) + prune"
  ssh "$DEPLOY_HOST" "$SERVER_BIN activate $TS $SHA $DIRTY manual"
else
  echo "==> Switch symlink (atomic publish)"
  ssh "$DEPLOY_HOST" "
    set -e
    ln -sfn $RELEASES_DIR/$TS $LIVE_LINK
    cd $RELEASES_DIR && ls -1t | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf
  "
fi

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
