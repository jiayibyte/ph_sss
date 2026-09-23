# Nightly rebuild on the server

Pages such as the PRC schedule, the 18 exam pages and the results hub compute
"next round", "filing is open until …", "results due" and their `EducationEvent`
markup **at build time**, and the minimum-wage pages switch to a scheduled wage
order or tranche on its effectivity date (NCR-28 on Sept 26, 2026; Bicol and
BARMM on Dec 1, 2026), as does the Pag-IBIG housing-loan "rates may have changed"
notice after the published rates lapse. The site is static, so between deploys
that text goes stale. The server therefore rebuilds the site every night at
**00:05 Philippine time** (again at 06:05 as a retry) and publishes it only if the
output changed.

## What it does — and what it never does

- Rebuilds **the commit that is live**, never a newer one. Commits you have not
  deployed are never published by the nightly job.
- Runs the same gates as `make deploy`: `npm test`, `npm run build`, `npm run audit`.
  If any fails, the live site stays as it is and the run is marked failed.
- Publishes a new release **only when the built files differ** from the live release.
- `lastmod` / "Updated" dates still come from git and the rule data, plus the
  scheduled changes a page has reached (`SCHEDULED` in `src/lib/lastmod.mjs`), so a
  date merely rolling over is not presented as new content. After publishing it pings
  IndexNow **only for URLs whose sitemap `<lastmod>` moved** — on Sept 26, 2026 that is
  the minimum-wage and daily-rate pages. Test without pinging: `AYTOOL_INDEXNOW_DRYRUN=1`.
- `make deploy` from a working tree with uncommitted changes deploys them as a
  **snapshot commit** on top of HEAD (made with a throwaway index; your branch and
  staging area are untouched) and pushes it too, so every release stays rebuildable.
  Releases recorded with uncommitted files (from before this) are skipped, with a log line.

## Layout on the server

| Path | Owner | Purpose |
|---|---|---|
| `/opt/aytool/node` | root | Node.js (official binary, checksum-verified; nothing installed system-wide) |
| `/opt/aytool/repo.git` | root | bare repo; `make deploy` pushes each deployed commit to `refs/heads/live` and `refs/heads/deploy/<sha>` (dropped when no kept release uses it) |
| `/opt/aytool/work` | aytool | build checkout (`node_modules` kept between runs; `npm ci` only when `package-lock.json` changes) |
| `/opt/aytool/cache` | aytool | npm cache, per-step logs (`install/tests/build/audit.log`) |
| `/opt/aytool/state/releases/<ts>` | root | provenance of each release: `<sha> <uncommitted files> <manual\|nightly>` |
| `/etc/systemd/system/aytool-rebuild.{service,timer}` | root | the job and its 00:05 Asia/Manila schedule (06:05 retry) |

The build step runs as the `aytool` service account inside a systemd sandbox
(read-only system, private /tmp, writes only to `work/` and `cache/`). Only the
publish step runs as root; it refuses output that contains symlinks.

Release retention: the live release plus the newest release of each of the last
6 commits. `make rollback` goes back to the newest **older** release of a
different commit.

## Commands (from the repo, on your machine)

```bash
make server-setup     # install or update the job on the server (idempotent)
make nightly-status   # releases, their commits, next scheduled run
make nightly-run      # run it now and show the log
make nightly-log      # last 80 log lines
```

On the server: `systemctl list-timers aytool-rebuild.timer`,
`journalctl -u aytool-rebuild.service`, `/opt/aytool/bin/aytool-rebuild status`.
