# Nightly rebuild on the server

Pages such as the PRC schedule, the 18 exam pages and the results hub compute
"next round", "filing is open until …", "results due" and their `EducationEvent`
markup **at build time**. The site is static, so between deploys that text goes
stale. The server therefore rebuilds the site every night at **00:05 Philippine
time** and publishes it only if the output changed.

## What it does — and what it never does

- Rebuilds **the commit that is live**, never a newer one. Commits you have not
  deployed are never published by the nightly job.
- Runs the same gates as `make deploy`: `npm test`, `npm run build`, `npm run audit`.
  If any fails, the live site stays as it is and the run is marked failed.
- Publishes a new release **only when the built files differ** from the live release.
- Never pings IndexNow and never changes `lastmod` / "Updated" dates — those still
  come from git and the rule data, so a date rolling over is not presented as new content.
- Skips (and says so in the log) when the live release was deployed with uncommitted
  changes, because git cannot reproduce it. Deploy a clean commit to resume.

## Layout on the server

| Path | Owner | Purpose |
|---|---|---|
| `/opt/aytool/node` | root | Node.js (official binary, checksum-verified; nothing installed system-wide) |
| `/opt/aytool/repo.git` | root | bare repo; `make deploy` pushes each deployed commit to `refs/heads/live` |
| `/opt/aytool/work` | aytool | build checkout (`node_modules` kept between runs; `npm ci` only when `package-lock.json` changes) |
| `/opt/aytool/cache` | aytool | npm cache, per-step logs (`install/tests/build/audit.log`) |
| `/opt/aytool/state/releases/<ts>` | root | provenance of each release: `<sha> <uncommitted files> <manual\|nightly>` |
| `/etc/systemd/system/aytool-rebuild.{service,timer}` | root | the job and its 00:05 Asia/Manila schedule |

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
