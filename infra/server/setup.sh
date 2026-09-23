#!/usr/bin/env bash
# One-time, idempotent server setup for nightly rebuilds. Run as root on the web server:
#   make server-setup        (copies infra/server/ to the server and runs this)
#
# Creates: service account `aytool` (no login), /opt/aytool/{bin,node,repo.git,work,cache,state},
# a checksum-verified Node.js under /opt/aytool/node (nothing installed system-wide),
# and the aytool-rebuild.service / .timer units. Does not touch nginx or the live site.
set -euo pipefail
cd "$(dirname "$0")"
[ "$(id -u)" = 0 ] || { echo "setup.sh must run as root" >&2; exit 1; }

NODE_VERSION=${NODE_VERSION:-22.22.2}
BASE=/opt/aytool

id aytool >/dev/null 2>&1 || useradd --system --home-dir "$BASE" --no-create-home --shell /usr/sbin/nologin aytool
install -d -m 755 -o root -g root "$BASE" "$BASE/bin" "$BASE/state" "$BASE/state/releases"
install -d -m 755 -o aytool -g aytool "$BASE/work" "$BASE/cache"
touch "$BASE/state/deploy.lock"

# Node.js — official linux binary, SHA-256 checked against nodejs.org's SHASUMS256.txt
case $(uname -m) in x86_64) arch=x64 ;; aarch64) arch=arm64 ;; *) echo "unsupported CPU $(uname -m)" >&2; exit 1 ;; esac
if [ "$("$BASE/node/bin/node" --version 2>/dev/null || true)" != "v$NODE_VERSION" ]; then
  tmp=$(mktemp -d)
  f="node-v$NODE_VERSION-linux-$arch.tar.xz"
  curl -fsSL --retry 3 -o "$tmp/$f" "https://nodejs.org/dist/v$NODE_VERSION/$f"
  curl -fsSL --retry 3 -o "$tmp/SHASUMS256.txt" "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt"
  (cd "$tmp" && grep " $f\$" SHASUMS256.txt | sha256sum -c --status) || { echo "Node.js checksum mismatch — aborting" >&2; rm -rf "$tmp"; exit 1; }
  tar -xJf "$tmp/$f" -C "$BASE"
  rm -rf "$tmp"
  ln -sfn "$BASE/node-v$NODE_VERSION-linux-$arch" "$BASE/node"
fi
echo "node $("$BASE/node/bin/node" --version), npm $("$BASE/node/bin/npm" --version 2>/dev/null)"

# git: the bare repo `make deploy` pushes to, and aytool's build checkout
[ -d "$BASE/repo.git" ] || git init --quiet --bare "$BASE/repo.git"
git config --file "$BASE/.gitconfig" --replace-all safe.directory "$BASE/repo.git"
git config --file "$BASE/.gitconfig" advice.detachedHead false
chmod 644 "$BASE/.gitconfig"
if [ ! -d "$BASE/work/.git" ]; then
  runuser -u aytool -- env HOME="$BASE" git -C "$BASE/work" init --quiet
  runuser -u aytool -- env HOME="$BASE" git -C "$BASE/work" remote add origin "$BASE/repo.git"
fi

# script + units
install -m 755 -o root -g root aytool-rebuild.sh "$BASE/bin/aytool-rebuild"
install -m 644 -o root -g root aytool-rebuild.service aytool-rebuild.timer /etc/systemd/system/
systemd-analyze verify /etc/systemd/system/aytool-rebuild.service /etc/systemd/system/aytool-rebuild.timer
systemctl daemon-reload
systemctl enable --now aytool-rebuild.timer
systemctl list-timers aytool-rebuild.timer --no-pager | head -n 2
echo "setup ok"
