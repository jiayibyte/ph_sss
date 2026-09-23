#!/usr/bin/env bash
# AyTool nightly rebuild — runs on the web server (installed by infra/server/setup.sh
# as /opt/aytool/bin/aytool-rebuild, driven by aytool-rebuild.timer at 00:05 Manila).
#
# Why: pages show "next round", "filing is open until …", "results due" and carry
# EducationEvent markup, all computed at build time. The site is static, so between
# deploys those go stale. Every night this rebuilds EXACTLY the commit that is live
# (never a newer one — unreleased commits are never published) and publishes only
# if the output actually changed. It never pings IndexNow: a date rolling over is
# not new content.
#
#   aytool-rebuild build                        user aytool, sandboxed: check out the live commit, npm ci (when
#                                               package-lock changes), test, build, audit
#   aytool-rebuild publish                      root: compare with live, copy to a new release, switch, prune
#   aytool-rebuild activate TS SHA DIRTY KIND   root: make release TS live and record where it came from
#                                               (called by infra/deploy.sh after each `make deploy`)
#   aytool-rebuild rollback                     root: go back to the newest older release of a different commit
#   aytool-rebuild prune                        root: keep the live release + newest release of the last 6 commits
#   aytool-rebuild status                       print releases, their commits and the timer
set -euo pipefail
umask 022

BASE=${AYTOOL_BASE:-/opt/aytool}
RELEASES=${AYTOOL_RELEASES:-/var/www/aytool-releases}
LIVE=${AYTOOL_LINK:-/var/www/aytool}
REPO=$BASE/repo.git          # bare repo; infra/deploy.sh pushes each deployed commit here
WORK=$BASE/work              # build checkout, owned by aytool
CACHE=$BASE/cache            # npm cache, build logs, the "pending" marker (aytool-writable)
PROV=$BASE/state/releases    # one root-owned file per release: "<sha> <uncommitted-files> <manual|nightly>"
LOCK=$BASE/state/deploy.lock # serialises publish / activate / rollback / prune
KEEP_COMMITS=${AYTOOL_KEEP_COMMITS:-6}

export PATH="$BASE/node/bin:$PATH"
export npm_config_cache="$CACHE/npm" npm_config_update_notifier=false npm_config_fund=false npm_config_audit=false
export CI=1 ASTRO_TELEMETRY_DISABLED=1
export XDG_CONFIG_HOME=${XDG_CONFIG_HOME:-$CACHE/xdg-config} XDG_CACHE_HOME=${XDG_CACHE_HOME:-$CACHE/xdg-cache}

log() { printf '[aytool-rebuild] %s\n' "$*"; }
die() { log "ERROR: $*"; exit 1; }
is_ts() { [[ ${1:-} =~ ^[0-9]{14}$ ]]; }
is_sha() { [[ ${1:-} =~ ^[0-9a-f]{40}$ ]]; }
releases_desc() { local d; for d in "$RELEASES"/*; do d=${d##*/}; is_ts "$d" && echo "$d"; done | sort -r; }
live_release() { local t; t=$(readlink "$LIVE") || die "$LIVE is not a symlink"; basename "$t"; }
prov_of() { [ -f "$PROV/$1" ] && cat "$PROV/$1"; }
take_lock() { exec 9>"$LOCK"; flock -w 600 9 || die "could not take $LOCK"; }

# Run a step with its output in $CACHE/<name>.log; show the tail, or more on failure.
run_logged() {
  local name=$1; shift
  if ! "$@" >"$CACHE/$name.log" 2>&1; then
    tail -n 80 "$CACHE/$name.log"
    die "$name failed (full log: $CACHE/$name.log)"
  fi
  tail -n 2 "$CACHE/$name.log" | sed 's/^/    /'
}

cmd_build() {
  local rel prov sha dirty lockhash
  rm -f "$CACHE/pending"
  rel=$(live_release)
  if ! prov=$(prov_of "$rel"); then
    log "live release $rel has no recorded commit (deployed before nightly rebuilds were set up) — nothing to rebuild; the next 'make deploy' records one"
    return 0
  fi
  read -r sha dirty _ <<<"$prov"
  is_sha "$sha" || die "unreadable provenance for $rel: $prov"
  if [ "$dirty" != "0" ]; then
    log "live release $rel was built with $dirty uncommitted file(s) — it cannot be rebuilt from git; deploy a clean commit to resume nightly rebuilds"
    return 0
  fi
  [ -d "$WORK/.git" ] || die "$WORK is not a git checkout — run infra/server/setup.sh"
  git -C "$WORK" fetch --quiet --force origin '+refs/heads/*:refs/remotes/origin/*'
  if ! git -C "$WORK" cat-file -e "$sha^{commit}" 2>/dev/null; then
    log "commit ${sha:0:12} is not in $REPO (never pushed there) — skipping"
    return 0
  fi
  log "rebuilding live release $rel (commit ${sha:0:12}) for $(TZ=Asia/Manila date +%F) Manila time"
  git -C "$WORK" checkout --quiet --force --detach "$sha"
  git -C "$WORK" clean -fdxq -e node_modules
  cd "$WORK"
  lockhash=$(sha256sum package-lock.json | cut -d' ' -f1)
  if [ ! -d node_modules ] || [ "$(cat "$CACHE/lock.sha256" 2>/dev/null || true)" != "$lockhash" ]; then
    log "installing dependencies (npm ci)"
    run_logged install npm ci --no-audit --no-fund --loglevel=error
    echo "$lockhash" >"$CACHE/lock.sha256"
  fi
  log "tests";  run_logged tests npm test
  log "build";  run_logged build npm run build
  log "audit";  run_logged audit npm run audit
  [ -z "$(find dist -type l -print -quit)" ] || die "dist contains symlinks — refusing"
  echo "$sha $rel" >"$CACHE/pending"
  log "build ok"
}

# Make release $1 live. Caller holds the lock.
activate() {
  local ts=$1 sha=$2 dirty=$3 kind=$4
  is_ts "$ts" && [ -d "$RELEASES/$ts" ] || die "no release $ts"
  echo "$sha $dirty $kind" >"$PROV/$ts"
  ln -sfn "$RELEASES/$ts" "$LIVE.new"
  mv -Tf "$LIVE.new" "$LIVE"   # rename(2): the switch is atomic for nginx
  log "live → $ts ($kind, commit ${sha:0:12}$([ "$dirty" = 0 ] || echo ", $dirty uncommitted files — not rebuildable nightly"))"
  prune
}

prune() {
  local live rel p key seen=' ' kept=0
  live=$(live_release)
  for rel in $(releases_desc); do
    p=$(prov_of "$rel" || true)
    key=${p%% *}
    [ -n "$key" ] || key="legacy-$rel"
    if [ "$rel" = "$live" ]; then
      case $seen in *" $key "*) ;; *) seen="$seen$key "; kept=$((kept + 1)) ;; esac
      continue
    fi
    case $seen in
      *" $key "*) ;;                                    # an older release of a commit we already keep
      *) if [ "$kept" -lt "$KEEP_COMMITS" ]; then seen="$seen$key "; kept=$((kept + 1)); continue; fi ;;
    esac
    rm -rf -- "${RELEASES:?}/$rel"
    rm -f -- "$PROV/$rel"
    log "pruned $rel"
  done
}

cmd_publish() {
  local sha built_for rel changes n ts
  take_lock
  if [ ! -f "$CACHE/pending" ]; then log "no fresh build — nothing to publish"; return 0; fi
  read -r sha built_for <"$CACHE/pending"
  rm -f "$CACHE/pending"
  is_sha "$sha" && is_ts "$built_for" || die "bad pending marker"
  rel=$(live_release)
  if [ "$rel" != "$built_for" ]; then log "live release changed during the build ($built_for → $rel) — discarding this build"; return 0; fi
  [ -f "$WORK/dist/index.html" ] && [ -f "$WORK/dist/sitemap-index.xml" ] || die "dist looks incomplete"
  [ -z "$(find "$WORK/dist" -type l -print -quit)" ] || die "dist contains symlinks — refusing"
  changes=$(diff -rq "$RELEASES/$rel" "$WORK/dist" 2>&1 || true)
  if [ -z "$changes" ]; then log "output identical to live release $rel — nothing to publish"; return 0; fi
  n=$(printf '%s\n' "$changes" | wc -l | tr -d ' ')
  log "$n file(s) differ from $rel:"
  printf '%s\n' "$changes" | head -n 20 | sed "s#$RELEASES/$rel/##; s#$WORK/dist/##; s/^/    /"
  ts=$(date +%Y%m%d%H%M%S)
  while [ -e "$RELEASES/$ts" ]; do sleep 1; ts=$(date +%Y%m%d%H%M%S); done
  mkdir "$RELEASES/$ts"
  rsync -a --no-links --no-owner --no-group --delete "$WORK/dist/" "$RELEASES/$ts/"
  activate "$ts" "$sha" 0 nightly
}

cmd_activate() {
  [ $# -eq 4 ] || die "usage: activate TS SHA DIRTY KIND"
  is_sha "$2" || die "bad sha"
  [[ $3 =~ ^[0-9]+$ ]] || die "bad dirty count"
  [[ $4 =~ ^(manual|nightly)$ ]] || die "bad kind"
  take_lock
  activate "$@"
}

cmd_rollback() {
  local live livesha rel p
  take_lock
  live=$(live_release)
  p=$(prov_of "$live" || true)
  livesha=${p%% *}
  for rel in $(releases_desc); do
    [[ $rel < $live ]] || continue            # only go back in time
    p=$(prov_of "$rel" || true)
    if [ -z "$livesha" ] || [ "${p%% *}" != "$livesha" ]; then
      ln -sfn "$RELEASES/$rel" "$LIVE.new"
      mv -Tf "$LIVE.new" "$LIVE"
      log "rolled back $live → $rel (${p:-no commit recorded})"
      return 0
    fi
  done
  die "no older release with a different commit to roll back to"
}

cmd_status() {
  local live rel
  live=$(live_release)
  echo "live: $live  ($(prov_of "$live" || echo 'no commit recorded'))"
  echo "releases (newest first):"
  for rel in $(releases_desc); do echo "  $rel  $(prov_of "$rel" || echo legacy)$([ "$rel" = "$live" ] && echo '  ← live')"; done
  systemctl list-timers aytool-rebuild.timer --no-pager --no-legend 2>/dev/null || true
  systemctl show aytool-rebuild.service -p Result -p ExecMainExitTimestamp --no-pager 2>/dev/null || true
}

case ${1:-} in
  build) cmd_build ;;
  publish) cmd_publish ;;
  activate) shift; cmd_activate "$@" ;;
  rollback) cmd_rollback ;;
  prune) take_lock; prune ;;
  status) cmd_status ;;
  *) sed -n '2,24p' "$0"; exit 2 ;;
esac
