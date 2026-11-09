import { PAGE_DATA } from './lastmod.mjs';
import sss from '../data/sss/2026.json';
import philhealth from '../data/philhealth/2026.json';
import pagibig from '../data/pagibig/2026.json';
import labor from '../data/labor/2026.json';
import tax from '../data/tax/2026.json';
import holidays from '../data/holidays/2026.json';
import holidays2027 from '../data/holidays/2027.json';
import prc from '../data/prc/2026.json';
import wages from '../data/wages/2026.json';
import ssl from '../data/ssl/2026.json';
import pnleHistory from '../data/prc/pnle-history.json';
import scheduleStatus from '../data/prc/next-schedule-status.json';
import type { RuleMeta } from './rules/types';
import { headingText } from './toc';

export interface EvidenceSource { label: string; url: string; claim: string; checkedOn: string | null }
const datasets: Record<string, { meta: RuleMeta }> = { sss, philhealth, pagibig, labor, tax, holidays, prc, wages, ssl };
const claims: Record<string, string> = {
  sss: 'SSS rules and contribution table', philhealth: 'PhilHealth contribution rules',
  pagibig: 'Pag-IBIG rules', labor: 'Pay formulas and labor rules', tax: 'Tax rules and tables',
  holidays: 'Declared holidays and their classification', prc: '2026 examination calendar and filing windows',
  wages: 'Wage orders and rate tables', ssl: 'Government salary grades and allowances',
};

/** Public links already used in the rendered guide; no new check date is inferred from their presence. */
export function linkedOfficialSources(html: string): EvidenceSource[] {
  const sources: EvidenceSource[] = [];
  for (const match of html.matchAll(/<a\b[^>]*\bhref="(https?:[^"<>]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const url = match[1].replaceAll('&amp;', '&');
    try {
      const host = new URL(url).hostname;
      if (!(host.endsWith('.gov.ph') || host === 'gov.ph' || host === 'lawphil.net' || host.endsWith('.lawphil.net'))) continue;
      sources.push({ label: headingText(match[2]) || host, url, claim: 'Reference linked in this guide', checkedOn: null });
    } catch { /* Ignore malformed references; the build audit handles internal URLs separately. */ }
  }
  return sources;
}

export function pageEvidence(pagePath: string, bodyHtml = ''): EvidenceSource[] {
  const keys = (PAGE_DATA as Record<string, string[]>)[pagePath] ?? [];
  const sources: EvidenceSource[] = keys.map((key) => {
    // The holiday guide renders the published 2027 proclamation; pay examples still use 2026.
    const data = key === 'holidays' && pagePath === '/philippine-holidays/' ? holidays2027 : datasets[key];
    return { label: data.meta.official_source_label, url: data.meta.official_source_url,
      claim: `${claims[key]} — ${data.meta.rule_version}`, checkedOn: data.meta.last_verified };
  });
  if (pagePath === '/nursing-board-exam-schedule/') {
    sources.push({ label: 'PRC nursing documentary requirements', url: scheduleStatus.requirements_url,
      claim: 'First-timer document checklist and listed repeater requirements', checkedOn: scheduleStatus.checked_on });
    sources.push({ label: 'RA 9173, Sections 13 and 15', url: scheduleStatus.nursing_law_url,
      claim: 'Eligibility, passing score and conditional retakes', checkedOn: scheduleStatus.checked_on });
    sources.push({ label: pnleHistory.meta.official_source_label, url: pnleHistory.meta.official_source_url,
      claim: 'Historical PNLE results; individual press releases are linked in the history table', checkedOn: pnleHistory.meta.last_verified });
  }
  const seen = new Set(sources.map((s) => s.url));
  for (const source of linkedOfficialSources(bodyHtml)) {
    if (!seen.has(source.url)) { sources.push(source); seen.add(source.url); }
  }
  return sources;
}
