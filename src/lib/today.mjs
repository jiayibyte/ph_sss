/**
 * "Today" as a Philippine calendar date (Asia/Manila, UTC+8, no DST).
 *
 * Exam days, filing deadlines, result targets and wage-order effectivity are
 * all Philippine dates, so every "is this still ahead?" comparison uses this
 * instead of the machine's UTC date — a build at 00:05 Manila time is still
 * the previous day in UTC. The nightly server rebuild (infra/server/) runs
 * at 00:05 Asia/Manila and relies on this.
 *
 * Build-time override for previews and tests: AYTOOL_TODAY=YYYY-MM-DD.
 * (Ignored in the browser, where `process` does not exist.)
 *
 * @param {Date} [now]
 * @returns {string} ISO date, e.g. "2026-09-23"
 */
export function todayInManila(now = new Date()) {
  const override = typeof process !== 'undefined' ? process.env?.AYTOOL_TODAY : undefined;
  if (override && /^\d{4}-\d{2}-\d{2}$/.test(override)) return override;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}
