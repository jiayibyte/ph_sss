/**
 * Machine-readable copy of each year's official holiday list — the
 * `distribution` target of the Dataset schema on /philippine-holidays/ and
 * /holiday-pay-calculator/. One endpoint per src/data/holidays/<year>.json, so
 * dropping in next year's proclamation publishes its JSON with no route change.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import type { HolidayRules } from '../../lib/rules/types';
import { SITE } from '../../../site.config';

const YEARS = Object.values(
  import.meta.glob<{ default: HolidayRules }>('../../data/holidays/*.json', { eager: true }),
).map((m) => m.default);

export const getStaticPaths: GetStaticPaths = () =>
  YEARS.map((y) => ({ params: { year: String(y.year) }, props: { rules: y } }));

export const GET: APIRoute = ({ props }) => {
  const rules = props.rules as HolidayRules;
  return new Response(
    JSON.stringify(
      {
        about: {
          publisher: SITE.name,
          page: `${SITE.url}/philippine-holidays/`,
          official_source: rules.meta.official_source_url,
          note: 'Transcribed from the official proclamation; verify on pco.gov.ph or officialgazette.gov.ph before relying on a date.',
        },
        ...rules,
      },
      null,
      0,
    ),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  );
};
