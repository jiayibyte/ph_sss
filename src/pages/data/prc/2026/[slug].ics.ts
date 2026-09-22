/**
 * One .ics per PRC exam row: /data/prc/2026/<slug>.ics (filing deadline + exam
 * day). Built from the same rule JSON as the tables, so it cannot disagree.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import prcJson from '../../../../data/prc/2026.json';
import type { PrcExamEntry, PrcRules } from '../../../../lib/rules/types';
import { examIcs } from '../../../../lib/prcCalendar';
import { examSlug } from '../../../../lib/prcProfessions';
import { SITE } from '../../../../../site.config';

const prc = prcJson as unknown as PrcRules;

export const getStaticPaths: GetStaticPaths = () =>
  prc.exams.map((exam) => ({ params: { slug: examSlug(exam.exam) }, props: { exam } }));

export const GET: APIRoute = ({ props }) =>
  new Response(examIcs(prc, props.exam as PrcExamEntry, `${SITE.url}/prc-board-exam-schedule/`), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
