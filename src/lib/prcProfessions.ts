/**
 * Featured profession groups for the PRC board exam schedule page.
 *
 * These drive the per-profession sections rendered under the searchable table.
 * They carry NO dates: every date is pulled from `src/data/prc/<year>.json` by
 * exact `exam` match, so a new PRC resolution updates the sections for free.
 *
 * `exams` values must match the JSON `exam` field exactly — the component
 * throws at build time on an unresolved matcher, so a rename in next year's
 * data fails the build instead of silently dropping a section.
 */

import type { PrcExamEntry } from './rules/types';

export interface ProfessionGroup {
  /** Anchor slug — stable, linkable, do not rename once published. */
  id: string;
  /** H3 text. Written in the form people search for, not PRC's table wording. */
  heading: string;
  /** Short label for the jump navigation. */
  navLabel: string;
  /** Exact `exam` values from the PRC data, in schedule order. */
  exams: string[];
  /** Other names this exam is searched under. */
  aka: string[];
}

export const PRC_PROFESSIONS: ProfessionGroup[] = [
  {
    id: 'nursing',
    heading: 'Nursing Board Exam (PNLE) 2026',
    navLabel: 'Nursing (PNLE)',
    exams: ['Nurses (PNLE)', 'Nurses (PNLE, 2nd exam)'],
    aka: ['NLE', 'PNLE', 'nurse licensure exam', 'nursing board exam'],
  },
  {
    id: 'teachers-let',
    heading: 'Teachers Board Exam (LET / BLEPT) 2026',
    navLabel: 'Teachers (LET)',
    exams: [
      'Professional Teachers (LET / BLEPT)',
      'Professional Teachers (LET / BLEPT, 2nd exam)',
    ],
    aka: ['LET', 'BLEPT', 'licensure exam for teachers', 'teachers board exam'],
  },
  {
    id: 'criminology',
    heading: 'Criminology Board Exam 2026',
    navLabel: 'Criminology',
    exams: ['Criminologists', 'Criminologists (2nd exam)'],
    aka: ['criminologist licensure examination', 'crim board exam'],
  },
  {
    id: 'accountancy',
    heading: 'CPA Board Exam (CPALE) 2026',
    navLabel: 'CPA (CPALE)',
    exams: [
      'Certified Public Accountants (CPALE)',
      'Certified Public Accountants (CPALE, 2nd exam)',
    ],
    aka: ['CPALE', 'CPA board exam', 'accountancy licensure exam'],
  },
  {
    id: 'civil-engineering',
    heading: 'Civil Engineering Board Exam 2026',
    navLabel: 'Civil Engineering',
    exams: ['Civil Engineers', 'Civil Engineers (2nd exam)'],
    aka: ['civil engineer licensure exam', 'CE board exam'],
  },
  {
    id: 'medical-technology',
    heading: 'Medical Technology Board Exam (MTLE) 2026',
    navLabel: 'Med Tech',
    exams: ['Medical Technologists', 'Medical Technologists (2nd exam)'],
    aka: ['MTLE', 'med tech board exam', 'medical technologist licensure exam'],
  },
  {
    id: 'electrical-engineering',
    heading: 'Electrical Engineering Board Exam (REE / RME) 2026',
    navLabel: 'Electrical Eng.',
    exams: [
      'Registered Electrical Engineers',
      'Registered Master Electricians',
      'Registered Electrical Engineers (2nd exam)',
      'Registered Master Electricians (2nd exam)',
    ],
    aka: ['REE', 'RME', 'electrical engineering board exam', 'master electrician exam'],
  },
  {
    id: 'electronics-engineering',
    heading: 'Electronics Engineering Board Exam (ECE / ECT) 2026',
    navLabel: 'Electronics Eng.',
    exams: [
      'Electronics Engineers',
      'Electronics Technicians',
      'Electronics Engineers (2nd exam)',
      'Electronics Technicians (2nd exam)',
    ],
    aka: ['ECE', 'ECT', 'electronics engineer licensure exam'],
  },
  {
    id: 'mechanical-engineering',
    heading: 'Mechanical Engineering Board Exam 2026',
    navLabel: 'Mechanical Eng.',
    exams: [
      'Mechanical Engineers',
      'Certified Plant Mechanics',
      'Mechanical Engineers (2nd exam)',
      'Certified Plant Mechanics (2nd exam)',
    ],
    aka: ['mechanical engineer licensure exam', 'ME board exam', 'certified plant mechanic exam'],
  },
  {
    id: 'physicians',
    heading: 'Physician Licensure Exam (PLE) 2026',
    navLabel: 'Physicians (PLE)',
    exams: ['Physicians (PLE)', 'Physicians (PLE, 2nd exam)'],
    aka: ['PLE', 'medical board exam', 'physician board exam'],
  },
  {
    id: 'midwifery',
    heading: 'Midwifery Board Exam 2026',
    navLabel: 'Midwifery',
    exams: ['Midwives', 'Midwives (2nd exam)'],
    aka: ['midwife licensure exam', 'midwifery board exam'],
  },
  {
    id: 'pharmacy',
    heading: 'Pharmacist Board Exam 2026',
    navLabel: 'Pharmacy',
    exams: ['Pharmacists', 'Pharmacists (2nd exam)'],
    aka: ['pharmacy licensure exam', 'pharmacist board exam'],
  },
  {
    id: 'psychology',
    heading: 'Psychometrician & Psychologist Board Exam 2026',
    navLabel: 'Psychology',
    exams: ['Psychometricians', 'Psychologists'],
    aka: ['psychometrician board exam', 'psychologist licensure exam'],
  },
  {
    id: 'social-work',
    heading: 'Social Work Board Exam 2026',
    navLabel: 'Social Work',
    exams: ['Social Workers'],
    aka: ['social worker licensure exam', 'social work board exam'],
  },
  {
    id: 'architecture',
    heading: 'Architecture Board Exam 2026',
    navLabel: 'Architecture',
    exams: ['Architects', 'Architects (2nd exam)'],
    aka: ['architect licensure exam', 'architecture board exam'],
  },
  {
    id: 'dentistry',
    heading: 'Dentistry Board Exam 2026',
    navLabel: 'Dentistry',
    exams: [
      'Dentists (Written)',
      'Dentists (Practical)',
      'Dentists (Written, 2nd exam)',
      'Dentists (Practical, 2nd exam)',
    ],
    aka: ['dentist licensure exam', 'dental board exam'],
  },
  {
    id: 'physical-occupational-therapy',
    heading: 'Physical & Occupational Therapy Board Exam 2026',
    navLabel: 'PT / OT',
    exams: [
      'Physical Therapists',
      'Occupational Therapists',
      'Physical Therapists (2nd exam)',
      'Occupational Therapists (2nd exam)',
    ],
    aka: ['PT board exam', 'OT board exam', 'physical therapist licensure exam'],
  },
  {
    id: 'radiologic-technology',
    heading: 'Radiologic Technology Board Exam 2026',
    navLabel: 'Rad Tech',
    exams: ['Radiologic Technologists', 'X-Ray Technologists'],
    aka: ['radtech board exam', 'radiologic technologist licensure exam', 'x-ray technologist exam'],
  },
  {
    id: 'agriculture',
    heading: 'Agriculturist Board Exam 2026',
    navLabel: 'Agriculture',
    exams: ['Agriculturists'],
    aka: ['agriculturist licensure exam', 'agriculture board exam'],
  },
];

/** Resolve a group's exam names against the rule data. Throws on a stale matcher. */
export function resolveGroup(
  group: ProfessionGroup,
  byName: Map<string, PrcExamEntry>,
  year: number,
): PrcExamEntry[] {
  return group.exams.map((name) => {
    const entry = byName.get(name);
    if (!entry) {
      throw new Error(
        `PRC profession "${group.id}" references exam "${name}", which is not in ` +
          `src/data/prc/${year}.json. Update src/lib/prcProfessions.ts to match ` +
          `the current PRC resolution.`,
      );
    }
    return entry;
  });
}

/** Short month, to match the `dates_display` wording authored in the rule data. */
function shortDate(iso: string | null | undefined): string {
  if (!iso) return 'to be announced';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Build a FAQ-ready schedule sentence straight from the rule data, so FAQ
 * answers never carry a hand-typed date that goes stale on the next update.
 */
export function scheduleSentence(entries: PrcExamEntry[]): string {
  const rounds = entries.map(
    (e) => `${e.dates_display} (application deadline ${shortDate(e.application_deadline)})`,
  );
  if (rounds.length === 1) return `${rounds[0]}.`;
  return `${rounds.slice(0, -1).join('; ')} and ${rounds[rounds.length - 1]}.`;
}
