/**
 * Analytics event whitelist (tasks 0.6): page_view (automatic) + calculator
 * usage counts. HARD RULE: never send user-entered amounts — only the tool
 * name is reported, and only once per page view.
 */
const fired = new Set<string>();

export function trackCalculatorUse(tool: string): void {
  if (fired.has(tool)) return;
  fired.add(tool);
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer?.push({ event: 'calculator_use', tool });
}
