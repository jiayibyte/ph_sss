/**
 * Copy for the per-profession schedule pages rendered by
 * src/pages/[slug]-board-exam-schedule.astro.
 *
 * Dates are NOT here — the template pulls every date from src/data/prc/<year>.json
 * through PRC_PROFESSIONS. This file carries only what the law says (passing
 * rule, eligibility, retakes) plus naming. Every legal statement cites the
 * section and URL it was read from; keep the citations when editing.
 *
 * Adding a profession = one entry here + a TOOL_PAGES entry (src/lib/pages.ts)
 * + a PAGE_DATA/PAGE_SOURCE entry (src/lib/lastmod.mjs) + `npm run og`.
 */
import type { TOOL_PAGES } from './pages';

export interface Citation {
  /** e.g. "RA 7836, Sec. 16" */
  label: string;
  url: string;
}

export interface ProfessionPage {
  /** URL slug: /<slug>-board-exam-schedule/ */
  slug: string;
  /** PRC_PROFESSIONS group id that supplies the exam rows (and the aka list). */
  groupId: string;
  /** Use only these exam rows instead of the whole group — for groups that bundle two different exams. */
  exams?: string[];
  /** TOOL_PAGES keys for the Related section; defaults to the PRC page + other exam pages. */
  related?: string[];
  /** TOOL_PAGES key for the OG card and related links. */
  toolKey: keyof typeof TOOL_PAGES;
  title: string;
  h1: string;
  /** Meta description; when omitted the template builds one from the exam dates (≤158 chars enforced). */
  description?: string;
  /** Official long name, e.g. "Licensure Examination for Teachers". */
  examName: string;
  /** How people say it mid-sentence, e.g. "LET", "CPALE", "criminology board exam". */
  shortName: string;
  /** Title-case form for H2s, e.g. "Criminology Board Exam". */
  headingName: string;
  /** Tagalog/Taglish phrasing for the FAQ question, e.g. "board exam ng teachers". */
  taglishName: string;
  /** The PRC Professional Regulatory Board that gives the exam. */
  board: string;
  law: Citation & { title: string };
  passing: { text: string; cite: Citation };
  parts: { text: string; cite: Citation };
  requirements: { items: string[]; cite: Citation };
  retake?: { text: string; cite: Citation };
  extraFaqs?: { q: string; a: string }[];
}

export const PROFESSION_PAGES: ProfessionPage[] = [
  {
    slug: 'let',
    groupId: 'teachers-let',
    toolKey: 'letSchedule',
    title: 'LET Schedule 2026 – Teachers Board Exam Dates & Results',
    h1: 'LET / BLEPT Schedule 2026 (Teachers Board Exam)',
    examName: 'Licensure Examination for Professional Teachers (LET / BLEPT)',
    shortName: 'LET',
    headingName: 'LET',
    taglishName: 'LET o board exam ng teachers',
    board: 'Board for Professional Teachers',
    law: {
      label: 'RA 7836',
      title: 'Philippine Teachers Professionalization Act of 1994, as amended by RA 9293',
      url: 'https://lawphil.net/statutes/repacts/ra1994/ra_7836_1994.html',
    },
    passing: {
      text: 'RA 7836 itself sets no passing grade. The rule comes from Board for Professional Teachers Resolution No. 228, s. 1996: a general average of at least 75%, with no rating below 50% in any subject. Under RA 9293 an examinee who fails but lands within five points of the passing average (70% to 74.99%) may be issued a two-year para-teacher permit.',
      cite: {
        label: 'BPT Resolution No. 228, s. 1996 (Supreme Court E-Library, National Administrative Register)',
        url: 'https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/10/40411',
      },
    },
    parts: {
      text: 'RA 7836, Sec. 14 separates the levels. Elementary has two parts — General Education (40%) and Professional Education (60%); Secondary has three — General Education (20%), Professional Education (40%) and Field of Specialization (40%). Since September 2025 an Elementary examinee may also take a specialization in Early Childhood Education or Special Needs Education (BPT Resolution No. 20, s. 2025), weighted like the Secondary exam. PRC now labels the exam LEPT; LET, BLEPT and LEPT are the same examination.',
      cite: {
        label: 'PRC — September 2026 LEPT Program of Examination',
        url: 'https://www.prc.gov.ph/sites/default/files/SEptember%202026%20LEPT%20Program%20final.pdf',
      },
    },
    requirements: {
      items: [
        'be a Filipino citizen, or a foreign citizen whose country grants Filipino teachers the same right (reciprocity)',
        'be at least 18 years old',
        'be in good health and of good reputation with high moral values',
        'have no conviction by final judgment for an offense involving moral turpitude',
        'hold the degree for the level: BECED for preschool, BSEED for elementary, and for secondary a bachelor’s degree in education with a major and minor — or a bachelor’s degree in arts and sciences with at least 18 units of professional education (RA 9293)',
      ],
      cite: {
        label: 'RA 7836, Sec. 15, as amended by RA 9293, Sec. 1',
        url: 'https://lawphil.net/statutes/repacts/ra2004/ra_9293_2004.html',
      },
    },
    retake: {
      text: 'The law sets no limit on retaking the LET. The refresher-course rule in RA 7836, Sec. 20 applies to the periodic merit examination for already-licensed teachers, not to the licensure exam. An examinee who fails within five points of the passing average may teach as a para-teacher under a two-year special permit, renewable once (RA 9293, Sec. 2).',
      cite: { label: 'RA 9293, Sec. 2 (amending RA 7836, Sec. 26)', url: 'https://lawphil.net/statutes/repacts/ra2004/ra_9293_2004.html' },
    },
    extraFaqs: [
      {
        q: 'What was the passing rate in the March 2026 LET?',
        a: 'Elementary: 18,376 of 32,796 passed (56.03%). Secondary: 45,001 of 61,561 passed (73.10%). PRC released the results on May 12, 2026, 39 working days after the March 15 exam, from 41 testing centers. Source: <a href="https://www.prc.gov.ph/article/march-2026-licensure-examination-professional-teachers-results-released-thirty-nine-39" target="_blank" rel="noopener">prc.gov.ph</a>.',
      },
      {
        q: 'Is the LET the same as BLEPT and LEPT?',
        a: 'Yes. LET (Licensure Examination for Teachers) is the name in RA 7836; PRC later used BLEPT (Board Licensure Examination for Professional Teachers) and now prints LEPT on its programs of examination. Same exam, same Board for Professional Teachers.',
      },
      {
        q: 'Are calculators allowed in the LET?',
        a: 'Not for Elementary examinees. For Secondary, only Mathematics majors may bring one, and only a non-programmable model on PRC’s allowable list under Commission Resolution No. 1809, s. 2024 (September 2026 LEPT program).',
      },
    ],
  },
  {
    slug: 'criminology',
    groupId: 'criminology',
    toolKey: 'criminologySchedule',
    title: 'Criminology Board Exam Schedule 2026 – Dates & Results',
    h1: 'Criminology Board Exam Schedule 2026 (CLE)',
    examName: 'Criminologist Licensure Examination (CLE)',
    shortName: 'criminology board exam',
    headingName: 'Criminology Board Exam',
    taglishName: 'board exam ng criminology',
    board: 'Professional Regulatory Board of Criminology',
    law: {
      label: 'RA 11131',
      title: 'The Philippine Criminology Profession Act of 2018',
      url: 'https://lawphil.net/statutes/repacts/ra2018/ra_11131_2018.html',
    },
    passing: {
      text: 'A weighted average of 75% with no grade below 60% in any subject. An examinee who reaches the 75% average but falls below 60% in a subject gets a deferred result and may retake that subject once within two years, needing at least 80% in it; failing three or more subjects means failing the whole exam. This scheme has applied since the second exam of 2022.',
      cite: { label: 'RA 11131, Sec. 17', url: 'https://lawphil.net/statutes/repacts/ra2018/ra_11131_2018.html' },
    },
    parts: {
      text: 'Six subjects, weighted under Board Resolution No. 01, s. 2021 (effective April 16, 2021): Criminal Law, Jurisprudence and Procedure 20%; Law Enforcement Administration 15%; Crime Detection and Investigation 20%; Forensic Science 15%; Correctional Administration 10%; Criminology 20%. Older guides still quote the weights printed in RA 11131, Sec. 15 (Criminalistics, Criminal Sociology), which the Board has since revised.',
      cite: {
        label: 'Board of Criminology Resolution No. 01, s. 2021',
        url: 'https://www.prc.gov.ph/sites/default/files/2021-01%20published%20%281%29.pdf',
      },
    },
    requirements: {
      items: [
        'be a Filipino citizen, or a foreign citizen whose country has reciprocity with the Philippines in the practice of criminology',
        'be of good moral character, good reputation and of sound mind and body, certified by the school you graduated from and the barangay where you live',
        'hold a CHED-accredited bachelor’s degree in criminology, or an equivalent degree from a foreign institution recognised by CHED',
        'have no conviction for an offense involving moral turpitude',
      ],
      cite: { label: 'RA 11131, Sec. 14', url: 'https://lawphil.net/statutes/repacts/ra2018/ra_11131_2018.html' },
    },
    retake: {
      text: 'An applicant who has failed five times, consecutive or cumulative, must present a certificate from a CHED-recognised institution that they have completed a refresher course in criminology before filing again.',
      cite: { label: 'RA 11131, Sec. 14(e)', url: 'https://lawphil.net/statutes/repacts/ra2018/ra_11131_2018.html' },
    },
    extraFaqs: [
      {
        q: 'What was the passing rate in the August 2026 criminology board exam?',
        a: '16,952 of 29,452 passed (57.56%). PRC released the results on September 1, 2026, 21 working days after the August 1–3 exam, from 32 testing centers; online registration for the new criminologists starts October 12, 2026. The February 2026 round: 30,320 of 45,936 passed (66.00%), released March 13, 2026. Source: <a href="https://www.prc.gov.ph/article/august-2026-licensure-examination-criminologists-results-released-twenty-one-21-working" target="_blank" rel="noopener">prc.gov.ph</a>.',
      },
    ],
  },
  {
    slug: 'cpa',
    groupId: 'accountancy',
    toolKey: 'cpaSchedule',
    title: 'CPALE Schedule 2026 – CPA Board Exam Dates & Results',
    h1: 'CPA Board Exam (CPALE) Schedule 2026',
    examName: 'Certified Public Accountant Licensure Examination (CPALE)',
    shortName: 'CPALE',
    headingName: 'CPALE',
    taglishName: 'CPA board exam',
    board: 'Professional Regulatory Board of Accountancy',
    law: {
      label: 'RA 9298',
      title: 'Philippine Accountancy Act of 2004',
      url: 'https://lawphil.net/statutes/repacts/ra2004/ra_9298_2004.html',
    },
    passing: {
      text: 'A general average of 75% with no grade below 65% in any subject. A candidate who scores 75% or higher in a majority of the subjects receives conditional credit and must take the remaining subjects within two years — again with at least 65% in each and a 75% average — or the whole examination counts as failed.',
      cite: { label: 'RA 9298, Sec. 16', url: 'https://lawphil.net/statutes/repacts/ra2004/ra_9298_2004.html' },
    },
    parts: {
      text: 'Six subjects over three days, 70 multiple-choice items each: Financial Accounting and Reporting; Advanced Financial Accounting and Reporting; Management Services; Auditing; Taxation; Regulatory Framework for Business Transactions (Board of Accountancy Resolution No. 30, s. 2022, in force since the October 2022 exam). A revised set of subjects under Resolution No. 20, s. 2026 applies only from the October 2029 exam onward.',
      cite: {
        label: 'Board of Accountancy Resolution No. 30, s. 2022',
        url: 'https://www.prc.gov.ph/sites/default/files/acc_2022-30%20published.pdf',
      },
    },
    requirements: {
      items: [
        'be a Filipino citizen',
        'be of good moral character',
        'hold a Bachelor of Science in Accountancy from a school recognised or accredited by CHED',
        'have no conviction for a criminal offense involving moral turpitude',
      ],
      cite: { label: 'RA 9298, Sec. 14', url: 'https://lawphil.net/statutes/repacts/ra2004/ra_9298_2004.html' },
    },
    retake: {
      text: 'A candidate who fails two complete CPALE sittings may not take another without proof of having enrolled in and completed at least 24 units of the subjects covered by the exam. A conditioned exam together with its removal exam counts as one complete examination.',
      cite: { label: 'RA 9298, Sec. 18', url: 'https://lawphil.net/statutes/repacts/ra2004/ra_9298_2004.html' },
    },
    extraFaqs: [
      {
        q: 'What was the passing rate in the May 2026 CPALE?',
        a: '3,004 of 9,745 passed (30.83%). PRC released the results on June 2, 2026, four working days after the May 24–26 exam; eight results were withheld and online registration for the new CPAs opened July 9, 2026. Source: <a href="https://www.prc.gov.ph/article/may-2026-certified-public-accountants-licensure-examination-results-released-four-4-working" target="_blank" rel="noopener">prc.gov.ph</a>.',
      },
    ],
  },
  {
    slug: 'civil-engineering',
    groupId: 'civil-engineering',
    toolKey: 'civilEngSchedule',
    title: 'Civil Engineering Board Exam Schedule 2026 – Dates & Results',
    h1: 'Civil Engineering Board Exam Schedule 2026 (CELE)',
    examName: 'Civil Engineer Licensure Examination (CELE)',
    shortName: 'civil engineering board exam',
    headingName: 'Civil Engineering Board Exam',
    taglishName: 'board exam ng civil engineering',
    board: 'Professional Regulatory Board of Civil Engineering',
    law: {
      label: 'RA 544',
      title: 'Civil Engineering Law of 1950, as amended by RA 1582',
      url: 'https://lawphil.net/statutes/repacts/ra1950/ra_544_1950.html',
    },
    passing: {
      text: 'RA 544 sets no passing grade; under RA 8981, Sec. 9(h) the Board of Civil Engineering fixes the passing general average because the profession’s law is silent. Review centers and past examinees consistently report a general average of 70% with no subject below 50%, but PRC has not published that figure in a board resolution we could locate — treat it as unconfirmed and rely on the rating rule printed with your Report of Rating.',
      cite: { label: 'RA 8981, Sec. 9(h) (PRC Modernization Act of 2000)', url: 'https://lawphil.net/statutes/repacts/ra2000/ra_8981_2000.html' },
    },
    parts: {
      text: 'Three parts over two days, in the order set by Board Resolution No. 01, s. 2026 (from the March 2026 exam): Day 1 — Principles of Structural Analysis and Design (35%); Day 2 morning — Applied Mathematics, Surveying, Principles of Transportation and Highway Engineering, Construction Management and Methods (35%); Day 2 afternoon — Hydraulics and Principles of Geotechnical Engineering (30%). Only non-programmable calculators on PRC’s allowable list may be used, one per examinee.',
      cite: {
        label: 'PRC — September 2026 CELE Program of Examination',
        url: 'https://www.prc.gov.ph/sites/default/files/exam%20program%20Sept%202026%20(CE).pdf',
      },
    },
    requirements: {
      items: [
        'be at least 21 years old',
        'be a Filipino citizen — foreign citizens only under the strict reciprocity rule in Sec. 25',
        'be of good reputation and moral character',
        'be a graduate of a four-year civil engineering course from a school recognised by the government',
      ],
      cite: { label: 'RA 544, Sec. 12', url: 'https://lawphil.net/statutes/repacts/ra1950/ra_544_1950.html' },
    },
    retake: {
      text: 'RA 544 sets no limit on retakes. PRC’s general power under RA 8981, Sec. 7(d) lets it require a refresher course after three failures, but no civil-engineering-specific PRC issuance applying that rule has been published.',
      cite: { label: 'RA 8981, Sec. 7(d)', url: 'https://lawphil.net/statutes/repacts/ra2000/ra_8981_2000.html' },
    },
    extraFaqs: [
      {
        q: 'What was the passing rate in the March 2026 civil engineering board exam?',
        a: '6,438 of 18,370 passed (35.05%). PRC released the results on April 7, 2026, five working days after the March 26–27 exam, from 19 testing centers; online registration opened May 8, 2026. Source: <a href="https://www.prc.gov.ph/article/march-2026-civil-engineers-licensure-examination-results-released-five-5-working-days" target="_blank" rel="noopener">prc.gov.ph</a>.',
      },
    ],
  },
  {
    slug: 'physician',
    groupId: 'physicians',
    toolKey: 'physicianSchedule',
    title: 'PLE Schedule 2026 – Physician Board Exam Dates & Results',
    h1: 'Physician Licensure Exam (PLE) Schedule 2026',
    examName: 'Physician Licensure Examination (PLE)',
    shortName: 'PLE',
    headingName: 'PLE',
    taglishName: 'medical board exam',
    board: 'Professional Regulatory Board of Medicine',
    law: {
      label: 'RA 2382',
      title: 'The Medical Act of 1959, as amended by RA 4224 and RA 5946',
      url: 'https://lawphil.net/statutes/repacts/ra1959/ra_2382_1959.html',
    },
    passing: {
      text: 'A general average of 75% with no grade below 50% in any subject. The original 1959 rule, which demanded at least 65% in Medicine, Pediatrics, Obstetrics and Gynecology and Preventive Medicine, was replaced by RA 4224 in 1965.',
      cite: { label: 'RA 2382, Sec. 21, as amended by RA 4224, Sec. 1', url: 'https://lawphil.net/statutes/repacts/ra1965/ra_4224_1965.html' },
    },
    parts: {
      text: 'Twelve subjects over four days: Anatomy and Histology; Physiology; Biochemistry; Microbiology and Parasitology; Pharmacology and Therapeutics; Pathology; Medicine; Obstetrics and Gynecology; Pediatrics and Nutrition; Surgery; Preventive Medicine and Public Health; Legal Medicine, Medical Jurisprudence and Medical Ethics (RA 2382, Sec. 21). The current table of specifications is Board of Medicine Resolution No. 19, s. 2025, applied since the October 2025 exam; calculators are not allowed.',
      cite: {
        label: 'Board of Medicine Resolution No. 19, s. 2025',
        url: 'https://www.prc.gov.ph/sites/default/files/2025-19%20published%20physicians.pdf',
      },
    },
    requirements: {
      items: [
        'be a Filipino citizen, or a foreign citizen whose country grants reciprocity as confirmed by the Department of Foreign Affairs',
        'be of good moral character and of sound mind',
        'have no conviction for an offense involving moral turpitude',
        'hold a Doctor of Medicine degree, or its equivalent, from a government-recognised college of medicine',
        'have completed a calendar year of internship in hospitals and health centers approved by the Board (added by RA 5946)',
      ],
      cite: { label: 'RA 2382, Sec. 9, as amended by RA 5946', url: 'https://lawphil.net/statutes/repacts/ra1969/ra_5946_1969.html' },
    },
    retake: {
      text: 'A candidate who fails the complete or final examination for the third time must take a refresher course of at least one year in a recognised medical school before being allowed to take the exam again.',
      cite: { label: 'RA 2382, Sec. 21, as amended by RA 4224', url: 'https://lawphil.net/statutes/repacts/ra1965/ra_4224_1965.html' },
    },
    extraFaqs: [
      {
        q: 'What was the passing rate in the March 2026 PLE?',
        a: '1,954 of 2,781 passed (70.26%). PRC released the results on April 8, 2026, four working days after the last exam day, from 13 testing centers; online registration for the new physicians opened April 22, 2026. Source: <a href="https://www.prc.gov.ph/article/march-2026-physicians-licensure-examination-results-released-four-4-working-days" target="_blank" rel="noopener">prc.gov.ph</a>.',
      },
      {
        q: 'How often is the PLE given?',
        a: 'Twice a year, six months apart (RA 2382, Sec. 18, as amended by RA 4224). The law originally fixed May and November; PRC now runs the two rounds in March and October, each spread over two weekends.',
      },
    ],
  },
  {
    slug: 'pharmacy',
    groupId: 'pharmacy',
    toolKey: 'pharmacySchedule',
    title: 'Pharmacy Board Exam Schedule 2026 – Dates & Results',
    h1: 'Pharmacy Board Exam Schedule 2026 (Pharmacist Licensure Exam)',
    examName: 'Pharmacist Licensure Examination',
    shortName: 'pharmacy board exam',
    headingName: 'Pharmacy Board Exam',
    taglishName: 'board exam ng pharmacy',
    board: 'Professional Regulatory Board of Pharmacy',
    law: {
      label: 'RA 10918',
      title: 'Philippine Pharmacy Act (2016)',
      url: 'https://lawphil.net/statutes/repacts/ra2016/ra_10918_2016.html',
    },
    passing: {
      text: 'A general weighted average of 75% with no rating below 50% in any subject. There is no conditional or deferred pass in the law.',
      cite: { label: 'RA 10918, Sec. 17', url: 'https://lawphil.net/statutes/repacts/ra2016/ra_10918_2016.html' },
    },
    parts: {
      text: 'Six weighted subjects over two days on PRC’s current program: Pharmaceutical Chemistry 20%; Pharmacognosy and Biochemistry 15%; Practice of Pharmacy 17.5%; Pharmacology and Pharmacokinetics 15%; Pharmaceutics, including Jurisprudence and Ethics, 17.5%; Quality Control and Quality Assurance 15%. RA 10918, Sec. 15 lists the underlying subject areas without weights.',
      cite: {
        label: 'PRC — April 2026 Pharmacists Program of Examination',
        url: 'https://www.prc.gov.ph/sites/default/files/April%2018%20and%2019%202026%20Exam%20Program%20(Pharmacy)%20revised.pdf',
      },
    },
    requirements: {
      items: [
        'be a Filipino citizen, or a citizen of a country that grants Filipino pharmacists the same right (reciprocity)',
        'be of good moral character and reputation',
        'hold a Bachelor of Science in Pharmacy, or its equivalent, from a CHED-recognised institution in the Philippines or abroad',
        'have completed the internship program approved by the Board',
      ],
      cite: { label: 'RA 10918, Sec. 14', url: 'https://lawphil.net/statutes/repacts/ra2016/ra_10918_2016.html' },
    },
    retake: {
      text: 'An applicant who fails for the third time may not take the next examinations without first completing a refresher program in an accredited institution; the Board issues the guidelines.',
      cite: { label: 'RA 10918, Sec. 17, second paragraph', url: 'https://lawphil.net/statutes/repacts/ra2016/ra_10918_2016.html' },
    },
    extraFaqs: [
      {
        q: 'What was the passing rate in the April 2026 pharmacy board exam?',
        a: '1,085 of 1,895 passed (57.26%). PRC released the results on April 22, 2026, three working days after the April 18–19 exam, from 13 testing centers; online registration for the new pharmacists opened May 25, 2026. Source: <a href="https://www.prc.gov.ph/article/april-2026-pharmacists-licensure-examination-results-released-three-3-working-days" target="_blank" rel="noopener">prc.gov.ph</a>.',
      },
    ],
  },
  {
    slug: 'midwifery',
    groupId: 'midwifery',
    toolKey: 'midwiferySchedule',
    title: 'Midwifery Board Exam Schedule 2026 – Dates & Results',
    h1: 'Midwifery Board Exam Schedule 2026 (Midwife Licensure Exam)',
    examName: 'Midwife Licensure Examination',
    shortName: 'midwifery board exam',
    headingName: 'Midwifery Board Exam',
    taglishName: 'board exam ng midwifery',
    board: 'Professional Regulatory Board of Midwifery',
    law: {
      label: 'RA 7392',
      title: 'Philippine Midwifery Act of 1992',
      url: 'https://lawphil.net/statutes/repacts/ra1992/ra_7392_1992.html',
    },
    passing: {
      text: 'A general rating of 75% in the written test with no grade below 50% in any subject. There is no conditional pass in the law.',
      cite: { label: 'RA 7392, Sec. 16', url: 'https://lawphil.net/statutes/repacts/ra1992/ra_7392_1992.html' },
    },
    parts: {
      text: 'Five subjects over two days on PRC’s current program: Obstetrics; Fundamentals of Health Care; Infant Care and Feeding; Primary Health Care; Professional Growth and Development — with bacteriology, anatomy and physiology, psychology, nutrition, parasitology, microbiology and pharmacology integrated into them. Neither RA 7392, Sec. 12 nor the program publishes per-subject weights.',
      cite: {
        label: 'PRC — Revised Program of Examination for Midwives (April 2026)',
        url: 'https://www.prc.gov.ph/sites/default/files/Revised%20Exam%20Program%20for%20Midwives.pdf',
      },
    },
    requirements: {
      items: [
        'be in good health and of good moral character',
        'be a graduate of midwifery from a government-recognised, duly accredited institution',
        'be a Filipino citizen and at least 18 years old when the certificate of registration is issued',
        'registered nurses may also take the exam on proof of 20 handled deliveries (Sec. 19)',
      ],
      cite: { label: 'RA 7392, Sec. 13', url: 'https://lawphil.net/statutes/repacts/ra1992/ra_7392_1992.html' },
    },
    retake: {
      text: 'RA 7392 sets no limit on retakes and no refresher-course requirement.',
      cite: { label: 'RA 7392 (full text)', url: 'https://lawphil.net/statutes/repacts/ra1992/ra_7392_1992.html' },
    },
    extraFaqs: [
      {
        q: 'What was the passing rate in the April 2026 midwifery board exam?',
        a: '901 of 2,124 passed (42.42%). PRC released the results on April 20, 2026, three working days after the April 14–15 exam, from 16 testing centers; online registration for the new midwives opened May 18, 2026. Source: <a href="https://www.prc.gov.ph/article/april-2026-midwives-licensure-examination-results-released-three-3-working-days" target="_blank" rel="noopener">prc.gov.ph</a>.',
      },
    ],
  },
  {
    slug: 'psychometrician',
    groupId: 'psychology',
    exams: ['Psychometricians'],
    toolKey: 'psychometricianSchedule',
    title: 'Psychometrician Board Exam Schedule 2026 – Dates & Results',
    h1: 'Psychometrician Board Exam Schedule 2026 (PMLE)',
    examName: 'Psychometrician Licensure Examination (PMLE)',
    shortName: 'psychometrician board exam',
    headingName: 'Psychometrician Board Exam',
    taglishName: 'board exam ng psychometrician',
    board: 'Professional Regulatory Board of Psychology',
    law: {
      label: 'RA 10029',
      title: 'Philippine Psychology Act of 2009',
      url: 'https://lawphil.net/statutes/repacts/ra2010/ra_10029_2010.html',
    },
    passing: {
      text: 'A weighted general average of at least 75% with no grade below 60% in any subject. An examinee with a 75% average but a subject below 60% may retake that subject within the next two years and passes on scoring at least 75% in it.',
      cite: { label: 'RA 10029, Sec. 18', url: 'https://lawphil.net/statutes/repacts/ra2010/ra_10029_2010.html' },
    },
    parts: {
      text: 'Four subjects over two days on PRC’s current program: Developmental Psychology 20%; Abnormal Psychology 20%; Industrial-Organizational Psychology 20%; Psychological Assessment 40%. RA 10029, Sec. 15 names Theories of Personality, Abnormal Psychology, Industrial Psychology and Psychological Assessment and lets the Board recluster them.',
      cite: {
        label: 'PRC — Revised September 2026 Psychometricians Program of Examination',
        url: 'https://www.prc.gov.ph/sites/default/files/Revised%20program%20psych%20Sept%202026.pdf',
      },
    },
    requirements: {
      items: [
        'be a Filipino citizen, a permanent resident, or a citizen of a country that grants reciprocity',
        'hold at least a bachelor’s degree in psychology from a CHED-recognised institution, with sufficient credits in the examination subjects',
        'be of good moral character',
        'have no conviction for an offense involving moral turpitude',
      ],
      cite: { label: 'RA 10029, Sec. 13', url: 'https://lawphil.net/statutes/repacts/ra2010/ra_10029_2010.html' },
    },
    retake: {
      text: 'Beyond the Sec. 18 subject retake for conditional results, RA 10029 sets no limit on retakes and no refresher-course rule.',
      cite: { label: 'RA 10029, Sec. 18', url: 'https://lawphil.net/statutes/repacts/ra2010/ra_10029_2010.html' },
    },
    extraFaqs: [
      {
        q: 'Was the August 2026 psychometrician board exam rescheduled?',
        a: 'Yes. PRC moved both the Psychometricians and the Psychologists exams from August 19–20 to September 1–2, 2026 because of PAGASA heavy-rainfall warnings (advisory posted August 17, 2026); the Pampanga testing center sat later, on September 17–18. As of September 23, 2026 PRC has not released the September 2026 psychometrician results — the original target was August 27; the Psychologists exam on the same dates was released on September 21. Source: <a href="https://www.prc.gov.ph/article/rescheduling-august-2026-psychologists-and-psychometricians-licensure-examination" target="_blank" rel="noopener">prc.gov.ph</a>.',
      },
      {
        q: 'What was the passing rate in the last psychometrician board exam?',
        a: 'September 2025 (the last round with results out): 12,416 of 14,275 passed (86.98%). PRC released them on October 2, 2025, four working days after the September 24–25 exam, from 15 testing centers; two results were withheld. Source: <a href="https://www.prc.gov.ph/article/september-2025-psychometricians-licensure-examination-results-released-four-4-working-days" target="_blank" rel="noopener">prc.gov.ph</a>.',
      },
    ],
  },
  {
    slug: 'radtech',
    groupId: 'radiologic-technology',
    exams: ['Radiologic Technologists'],
    toolKey: 'radtechSchedule',
    title: 'RadTech Board Exam Schedule 2026 – Dates & Results',
    h1: 'RadTech Board Exam Schedule 2026 (Radiologic Technologist Licensure Exam)',
    examName: 'Radiologic Technologist Licensure Examination (RTLE)',
    shortName: 'RadTech board exam',
    headingName: 'RadTech Board Exam',
    taglishName: 'board exam ng RadTech',
    board: 'Professional Regulatory Board of Radiologic Technology',
    law: {
      label: 'RA 7431',
      title: 'Radiologic Technology Act of 1992',
      url: 'https://lawphil.net/statutes/repacts/ra1992/ra_7431_1992.html',
    },
    passing: {
      text: 'A weighted average of at least 75% with no rating below 60% in any subject. An examinee with a 75% average but a subject below 60% retakes only that subject at the next scheduled exam and must score 75% in it; after failing the third attempt the entire examination must be retaken.',
      cite: { label: 'RA 7431, Sec. 22', url: 'https://lawphil.net/statutes/repacts/ra1992/ra_7431_1992.html' },
    },
    parts: {
      text: 'Five subjects at 20% each on PRC’s current program: Radiologic Physics, Equipment, Biology and Protection; Image Production and Evaluation; Radiographic Positioning and Radiologic Procedures; Patient Care and Management; Radiological Sciences (ultrasound, CT, MRI, interventional radiology, pharmacology and venipuncture, nuclear medicine, radiation therapy). RA 7431, Sec. 21 prints an older fourteen-subject table that the Board is allowed to modify.',
      cite: {
        label: 'PRC — December 2025 RTLE Program of Examination',
        url: 'https://www.prc.gov.ph/sites/default/files/101425%20Exam%20Program%20Dec%202025%20RTLE%20(Rad%20Tech).pdf',
      },
    },
    requirements: {
      items: [
        'be a Filipino citizen',
        'be of good moral character, with no conviction for a crime involving moral turpitude',
        'hold a bachelor’s degree in radiologic technology from a government-recognised school — the separate X-ray technologist exam takes the associate diploma instead',
      ],
      cite: { label: 'RA 7431, Sec. 19', url: 'https://lawphil.net/statutes/repacts/ra1992/ra_7431_1992.html' },
    },
    retake: {
      text: 'Sec. 22 governs retakes: a conditional result is cleared by re-examination in the failed subject; after a third failure the whole examination is retaken. The law has no refresher-course requirement.',
      cite: { label: 'RA 7431, Sec. 22', url: 'https://lawphil.net/statutes/repacts/ra1992/ra_7431_1992.html' },
    },
    extraFaqs: [
      {
        q: 'Is there a RadTech board exam in the middle of 2026?',
        a: 'No. RA 7431, Sec. 18 provides for one examination a year, and the 2026 domestic sitting is December 10–11, 2026 (filing September 11 to November 10). PRC also gave a Special Professional Licensure Examination for RadTechs abroad on May 29–30, 2026 in Singapore and Taiwan.',
      },
      {
        q: 'What was the passing rate in the last RadTech board exam?',
        a: 'December 2025: 2,629 of 4,419 passed (59.49%). PRC released the results on December 17, 2025, three working days after the December 11–12 exam, from 15 testing centers; online registration opened February 3, 2026. Source: <a href="https://www.prc.gov.ph/article/december-2025-radiologic-and-x-ray-technologists-licensure-examinations-results-released" target="_blank" rel="noopener">prc.gov.ph</a>.',
      },
    ],
  },
  {
    slug: 'medtech',
    groupId: 'medical-technology',
    toolKey: 'medtechSchedule',
    title: 'MTLE Schedule 2026 – MedTech Board Exam Dates & Results',
    h1: 'MedTech Board Exam (MTLE) Schedule 2026',
    examName: 'Medical Technologist Licensure Examination (MTLE)',
    shortName: 'MTLE',
    headingName: 'MTLE',
    taglishName: 'MedTech board exam',
    board: 'Professional Regulatory Board of Medical Technology',
    law: {
      label: 'RA 5527',
      title: 'Philippine Medical Technology Act of 1969, as amended by RA 6138, PD 498 and PD 1534',
      url: 'https://lawphil.net/statutes/repacts/ra1969/ra_5527_1969.html',
    },
    passing: {
      text: 'A general average of at least 75% in the written test, with no rating below 50% in any major subject, and without having failed subjects that together carry 60% or more of the weights. A failed examinee whose general rating is at least 70% may register as a medical laboratory technician without examination (PD 498, Sec. 10).',
      cite: { label: 'RA 5527, Sec. 19', url: 'https://lawphil.net/statutes/repacts/ra1969/ra_5527_1969.html' },
    },
    parts: {
      text: 'Six weighted subjects over two days: Clinical Chemistry 20%; Microbiology and Parasitology 20%; Hematology 20%; Blood Banking and Serology 20%; Clinical Microscopy 10%; Histopathologic Techniques, Medical Technology Laws and Ethics 10% (RA 5527, Sec. 17 as amended by PD 498, matching PRC’s August 2026 program).',
      cite: {
        label: 'PRC — August 2026 MTLE Program of Examination',
        url: 'https://www.prc.gov.ph/sites/default/files/August%202026%20MLTE%20Program.pdf',
      },
    },
    requirements: {
      items: [
        'be in good health and of good moral character',
        'have completed a course of at least four years leading to a Bachelor of Science in Medical Technology or in Public Health from a recognised school, including the 12-month internship in accredited laboratories (Sec. 6)',
        'be at least 21 years old when the certificate of registration is issued (Sec. 21); foreign applicants are covered by the reciprocity rule in Sec. 27',
      ],
      cite: { label: 'RA 5527, Sec. 16, as amended by RA 6138 and PD 498', url: 'https://lawphil.net/statutes/presdecs/pd1974/pd_498_1974.html' },
    },
    retake: {
      text: 'After three failures no further examination is given until the applicant completes a 12-month refresher course in an accredited medical technology school or 12 months of postgraduate training in an accredited laboratory.',
      cite: { label: 'RA 5527, Sec. 19', url: 'https://lawphil.net/statutes/repacts/ra1969/ra_5527_1969.html' },
    },
    extraFaqs: [
      {
        q: 'What was the passing rate in the August 2026 MTLE?',
        a: '4,204 of 5,634 passed (74.62%). PRC released the results on August 25, 2026, five working days after the August 15–16 exam, from 16 testing centers; one result was withheld and online registration for the new medical technologists opened September 15, 2026. Examinees who failed with a general rating of at least 70% may register as medical laboratory technicians (PD 498). Source: <a href="https://www.prc.gov.ph/article/august-2026-medical-technologists-licensure-examination-results-released-five-5-working" target="_blank" rel="noopener">prc.gov.ph</a>.',
      },
    ],
  },
  {
    slug: 'electrical-engineering',
    groupId: 'electrical-engineering',
    exams: ['Registered Electrical Engineers', 'Registered Electrical Engineers (2nd exam)'],
    toolKey: 'electricalSchedule',
    title: 'Electrical Engineering Board Exam Schedule 2026 – REE Dates',
    h1: 'Electrical Engineering Board Exam Schedule 2026 (REE)',
    examName: 'Registered Electrical Engineer Licensure Examination (REE)',
    shortName: 'REE board exam',
    headingName: 'REE Board Exam',
    taglishName: 'board exam ng electrical engineering',
    board: 'Board of Electrical Engineering',
    law: {
      label: 'RA 7920',
      title: 'New Electrical Engineering Law (1995)',
      url: 'https://lawphil.net/statutes/repacts/ra1995/ra_7920_1995.html',
    },
    passing: {
      text: 'A general weighted average of 70% with no grade below 50% in any group of subjects. An examinee may retake, any number of times, only the subject groups scored below 50%, and passes on reaching a 70% average in the repeated subjects (Sec. 21). The Registered Master Electrician exam uses the same 70%/50% rule (Sec. 19(c)).',
      cite: { label: 'RA 7920, Sec. 19(b) and Sec. 21', url: 'https://lawphil.net/statutes/repacts/ra1995/ra_7920_1995.html' },
    },
    parts: {
      text: 'Three subject groups weighted by the law: Mathematics 25%; Engineering Sciences and Allied Subjects 30%; Electrical Engineering Professional Subjects 45% (RA 7920, Sec. 19(b)). From the September 2026 exam PRC gives them over two days in the order Engineering Sciences, then Professional Subjects, then Mathematics. The one-day RME exam that follows covers Technical Subjects 50% and the Philippine Electrical Code Parts 1 and 2 50%.',
      cite: {
        label: 'PRC — September 2026 REE/RME Program of Examination',
        url: 'https://www.prc.gov.ph/sites/default/files/exam%20program%20september%202026%20(electrical).pdf',
      },
    },
    requirements: {
      items: [
        'be a Filipino citizen',
        'be at least 21 years old',
        'be of good reputation with high moral values',
        'have no final conviction for an offense involving moral turpitude',
        'hold a Bachelor of Science in Electrical Engineering from a government-recognised and accredited school',
      ],
      cite: { label: 'RA 7920, Sec. 17', url: 'https://lawphil.net/statutes/repacts/ra1995/ra_7920_1995.html' },
    },
    retake: {
      text: 'There is no limit and no refresher course: an applicant retakes only the subject groups scored below 50%, as many times as needed, and passes on averaging 70% in them.',
      cite: { label: 'RA 7920, Sec. 21', url: 'https://lawphil.net/statutes/repacts/ra1995/ra_7920_1995.html' },
    },
    extraFaqs: [
      {
        q: 'What was the passing rate in the September 2026 REE board exam?',
        a: 'REE: 1,676 of 3,399 passed (49.31%). RME: 715 of 961 passed (74.40%). PRC released both on September 14, 2026 from 17 testing centers; four results were withheld and online registration for the new engineers starts October 12, 2026. Source: <a href="https://www.prc.gov.ph/article/september-2026-registered-electrical-engineers-and-registered-master-electricians-licensure" target="_blank" rel="noopener">prc.gov.ph</a>.',
      },
      {
        q: 'Is the Registered Master Electrician (RME) exam on the same dates?',
        a: 'The RME exam is a separate one-day exam under the same law, normally given the day after the two REE days (September 7, 2026 for the second round). It is listed as its own row on the PRC Board Exam Schedule page.',
      },
    ],
  },
  {
    slug: 'mechanical-engineering',
    groupId: 'mechanical-engineering',
    exams: ['Mechanical Engineers', 'Mechanical Engineers (2nd exam)'],
    toolKey: 'mechanicalSchedule',
    title: 'Mechanical Engineering Board Exam Schedule 2026 – ME Dates',
    h1: 'Mechanical Engineering Board Exam Schedule 2026',
    examName: 'Mechanical Engineer Licensure Examination',
    shortName: 'ME board exam',
    headingName: 'Mechanical Engineering Board Exam',
    taglishName: 'board exam ng mechanical engineering',
    board: 'Board of Mechanical Engineering',
    law: {
      label: 'RA 8495',
      title: 'Philippine Mechanical Engineering Act of 1998',
      url: 'https://lawphil.net/statutes/repacts/ra1998/ra_8495_1998.html',
    },
    passing: {
      text: 'An average of 70% on all subjects with no rating below 50% in any subject, for Professional Mechanical Engineer, Mechanical Engineer and Certified Plant Mechanic candidates alike. There is no conditional pass in the law.',
      cite: { label: 'RA 8495, Sec. 18', url: 'https://lawphil.net/statutes/repacts/ra1998/ra_8495_1998.html' },
    },
    parts: {
      text: 'Three subjects over three days on PRC’s program: Power Plant Engineering 35%; Mathematics with Engineering Economics and Basic Engineering Sciences 35%; Machine Design, Materials and Shop Practice 30%. RA 8495, Sec. 17 names the subjects without weights; the weights come from Board Resolution No. 57, s. 2013.',
      cite: {
        label: 'PRC — February 2026 Mechanical Engineers Program of Examination',
        url: 'https://www.prc.gov.ph/sites/default/files/RA%20-%20MECHANICAL%20ENGINEER%20FEB%202026_merged.pdf',
      },
    },
    requirements: {
      items: [
        'be a Filipino citizen',
        'have no conviction for a crime involving moral turpitude',
        'hold a Bachelor of Science in Mechanical Engineering from a government-recognised school — no age or experience requirement for the ME exam (experience applies to the PME and CPM exams)',
      ],
      cite: { label: 'RA 8495, Sec. 15', url: 'https://lawphil.net/statutes/repacts/ra1998/ra_8495_1998.html' },
    },
    retake: {
      text: 'An applicant who fails for the third time may take the examination again only after one year has passed. No refresher course is required by the law.',
      cite: { label: 'RA 8495, Sec. 20', url: 'https://lawphil.net/statutes/repacts/ra1998/ra_8495_1998.html' },
    },
    extraFaqs: [
      {
        q: 'What was the passing rate in the August 2026 mechanical engineering board exam?',
        a: 'ME: 1,362 of 3,686 passed (36.95%). CPM (computer-based): 109 of 142 passed (76.76%). PRC released the results on August 13, 2026 from 15 testing centers; online registration opens October 15, 2026. Source: <a href="https://www.prc.gov.ph/article/august-2026-mechanical-engineers-and-certified-plant-mechanics-licensure-exams-results" target="_blank" rel="noopener">prc.gov.ph</a>.',
      },
    ],
  },
  {
    slug: 'architecture',
    groupId: 'architecture',
    toolKey: 'architectureSchedule',
    title: 'Architecture Board Exam Schedule 2026 – Dates & Results',
    h1: 'Architecture Board Exam Schedule 2026 (LEA)',
    examName: 'Licensure Examination for Architects (LEA)',
    shortName: 'architecture board exam',
    headingName: 'Architecture Board Exam',
    taglishName: 'board exam ng architecture',
    board: 'Professional Regulatory Board of Architecture',
    law: {
      label: 'RA 9266',
      title: 'Architecture Act of 2004',
      url: 'https://lawphil.net/statutes/repacts/ra2004/ra_9266_2004.html',
    },
    passing: {
      text: 'A weighted general average of 70% with no grade lower than 50% in any subject. There is no conditional pass in the law.',
      cite: { label: 'RA 9266, Sec. 15', url: 'https://lawphil.net/statutes/repacts/ra2004/ra_9266_2004.html' },
    },
    parts: {
      text: 'Three subjects on PRC’s program, over two exam days: History and Theory of Architecture, Principles of Planning and Architectural Practice 30%; Utilities, Structural Conceptualization, Building Materials and Technology 30%; Architectural Design and Site Planning 40% (the all-day design exam on the second day). RA 9266, Sec. 14 lists four subject groups that the Board has reclustered into these three.',
      cite: {
        label: 'PRC — January 2026 Program of Examination for Architects',
        url: 'https://www.prc.gov.ph/sites/default/files/January%202026%20Examination%20Program%20for%20Architects_rev.pdf',
      },
    },
    requirements: {
      items: [
        'be a Filipino citizen, or a foreign citizen qualified under the reciprocity rule in Sec. 27',
        'be of good moral character',
        'hold a Bachelor of Science in Architecture from a CHED-recognised school and have at least two years of diversified architectural experience certified by a registered architect — a master’s degree in architecture counts as one year',
        'have no conviction for a criminal offense involving moral turpitude',
      ],
      cite: { label: 'RA 9266, Sec. 13', url: 'https://lawphil.net/statutes/repacts/ra2004/ra_9266_2004.html' },
    },
    retake: {
      text: 'RA 9266 sets no limit on retakes and no refresher-course requirement.',
      cite: { label: 'RA 9266 (full text)', url: 'https://lawphil.net/statutes/repacts/ra2004/ra_9266_2004.html' },
    },
    extraFaqs: [
      {
        q: 'What was the passing rate in the June 2026 architecture board exam?',
        a: '2,799 of 3,290 passed (85.08%). PRC released the results on June 26, 2026, two working days after the exam, from 14 testing centers; the Davao City sitting was moved to June 22 and 24 by Resolution No. 2199, s. 2026. Online registration opened August 3, 2026. Source: <a href="https://www.prc.gov.ph/article/june-2026-licensure-examination-architects-results-released-two-2-working-days" target="_blank" rel="noopener">prc.gov.ph</a>.',
      },
    ],
  },
  {
    slug: 'electronics-engineering',
    groupId: 'electronics-engineering',
    exams: ['Electronics Engineers', 'Electronics Engineers (2nd exam)'],
    toolKey: 'electronicsSchedule',
    title: 'ECE Board Exam Schedule 2026 – Electronics Engineer Dates',
    h1: 'ECE Board Exam Schedule 2026 (Electronics Engineer Licensure Exam)',
    examName: 'Electronics Engineer Licensure Examination (ECE)',
    shortName: 'ECE board exam',
    headingName: 'ECE Board Exam',
    taglishName: 'board exam ng ECE',
    board: 'Professional Regulatory Board of Electronics Engineering',
    law: {
      label: 'RA 9292',
      title: 'Electronics Engineering Law of 2004',
      url: 'https://lawphil.net/statutes/repacts/ra2004/ra_9292_2004.html',
    },
    passing: {
      text: 'A passing rating of 70% in each subject — not a general average. A candidate who passes the majority of the subjects but scores between 60% and 69% in the others may take one removal examination in those subjects; failing the removal exam means failing the whole examination. The Electronics Technician (ECT) exam uses the same rule.',
      cite: { label: 'RA 9292, Sec. 16', url: 'https://lawphil.net/statutes/repacts/ra2004/ra_9292_2004.html' },
    },
    parts: {
      text: 'Four subjects over two days, 100 items each, weighted by Board Resolution No. 10, s. 2022: Mathematics 20%; General Engineering and Applied Sciences 20%; Electronics Engineering 30%; Electronics Systems and Technologies 30%. RA 9292, Sec. 15 lists the areas the Board may recluster.',
      cite: {
        label: 'PRC — March 2026 ECE Program of Examination',
        url: 'https://www.prc.gov.ph/sites/default/files/exam%20program%20march%202026%20(ece).pdf',
      },
    },
    requirements: {
      items: [
        'be a Filipino citizen, or a foreign citizen qualified under the reciprocity rule in Sec. 33',
        'be of good moral character with no conviction for a criminal offense involving moral turpitude',
        'hold a Bachelor of Science in Electronics and Communications Engineering or in Electronics Engineering, or an equivalent engineering course the Board accepts, after a full baccalaureate resident course',
      ],
      cite: { label: 'RA 9292, Sec. 14', url: 'https://lawphil.net/statutes/repacts/ra2004/ra_9292_2004.html' },
    },
    retake: {
      text: 'Beyond the single removal examination in Sec. 16, RA 9292 sets no retake limit, waiting period or refresher-course requirement.',
      cite: { label: 'RA 9292, Sec. 16', url: 'https://lawphil.net/statutes/repacts/ra2004/ra_9292_2004.html' },
    },
    extraFaqs: [
      {
        q: 'What was the passing rate in the March 2026 ECE board exam?',
        a: 'ECE: 1,692 of 2,746 passed (61.62%). ECT: 1,907 of 2,440 passed (78.16%). PRC released the results on March 24, 2026 from 15 testing centers; online registration opened April 24, 2026. Source: <a href="https://www.prc.gov.ph/article/march-2026-electronics-engineers-and-electronics-technicians-licensure-examinations-results" target="_blank" rel="noopener">prc.gov.ph</a>.',
      },
    ],
  },
  {
    slug: 'dentistry',
    groupId: 'dentistry',
    exams: ['Dentists (Written)', 'Dentists (Written, 2nd exam)'],
    toolKey: 'dentistrySchedule',
    title: 'Dentistry Board Exam Schedule 2026 – Dates & Results',
    h1: 'Dentistry Board Exam Schedule 2026 (Dentist Licensure Exam)',
    examName: 'Dentist Licensure Examination',
    shortName: 'dentistry board exam',
    headingName: 'Dentistry Board Exam',
    taglishName: 'board exam ng dentistry',
    board: 'Professional Regulatory Board of Dentistry',
    law: {
      label: 'RA 9484',
      title: 'Philippine Dental Act of 2007',
      url: 'https://lawphil.net/statutes/repacts/ra2007/ra_9484_2007.html',
    },
    passing: {
      text: 'A general weighted average of at least 75% across the written and practical phases, weighted 60% and 40%, with no rating below 50% in the written phase or in any exercise of the practical phase (RA 9484, Sec. 16, as implemented by Board Resolution No. 02, s. 2021 from the December 2021 exam). Both phases are taken as one complete examination; a written result lapses if the practical is not taken within two consecutive practical schedules.',
      cite: {
        label: 'Board of Dentistry Resolution No. 02, s. 2021',
        url: 'https://www.prc.gov.ph/sites/default/files/dentists%20reso2021-02%20published%20(1).pdf',
      },
    },
    parts: {
      text: 'Written phase (60%), three days in NCR, Baguio, Cebu and Davao: nine subject clusters from General and Oral Anatomy and Physiology (15%) to Periodontics and Endodontics (10%), per PRC’s May 2026 program. Practical phase (40%), NCR only: Class I and Class II cavity preparations, fixed and removable partial denture work and a complete denture on typodonts and mechanical articulators — Board Resolution No. 05, s. 2021 replaced live patients and amalgam. The dates in the table are the written phase; the practical follows the week after.',
      cite: {
        label: 'PRC — May 2026 Dentist Licensure Examination Written Phase Program',
        url: 'https://www.prc.gov.ph/sites/default/files/Revised%20May%202026%20DLE%20Written%20Phase%20Program.pdf',
      },
    },
    requirements: {
      items: [
        'be a Filipino citizen, or a foreign citizen whose country lets Filipino dentists practise on the same terms',
        'have no conviction for an offense involving moral turpitude',
        'hold a Doctor of Dental Medicine degree, or its equivalent, from a legally constituted and recognised school',
        'have completed the refresher course required after failing three consecutive licensure examinations, where that applies',
      ],
      cite: { label: 'RA 9484, Sec. 14(a)', url: 'https://lawphil.net/statutes/repacts/ra2007/ra_9484_2007.html' },
    },
    retake: {
      text: 'After three consecutive failures the applicant must complete a refresher course before filing again; the law does not fix its length.',
      cite: { label: 'RA 9484, Sec. 14(a)(4)', url: 'https://lawphil.net/statutes/repacts/ra2007/ra_9484_2007.html' },
    },
    extraFaqs: [
      {
        q: 'When is the practical phase of the 2026 dentistry board exam?',
        a: 'The practical phase is held in NCR the week after the written phase: May 11–14, 2026 after the May 4–6 written exam, and November 28 to December 5, 2026 after the November 22–24 written exam, with the results targeted for December 14, 2026 (PRC 2026 schedule of examination).',
      },
      {
        q: 'What was the passing rate in the May 2026 dentistry board exam?',
        a: '796 of 896 passed (88.84%). PRC released the results on May 20, 2026, four working days after the practical phase; online registration opened July 8, 2026. Source: <a href="https://www.prc.gov.ph/article/may-2026-dentists-licensure-examination-results-released-four-4-working-days" target="_blank" rel="noopener">prc.gov.ph</a>.',
      },
    ],
  },
  {
    slug: 'social-work',
    groupId: 'social-work',
    toolKey: 'socialWorkSchedule',
    title: 'Social Work Board Exam Schedule 2026 – Dates & Results',
    h1: 'Social Work Board Exam Schedule 2026 (SWLE)',
    examName: 'Social Workers Licensure Examination (SWLE)',
    shortName: 'social work board exam',
    headingName: 'Social Work Board Exam',
    taglishName: 'board exam ng social work',
    board: 'Professional Regulatory Board for Social Workers',
    law: {
      label: 'RA 4373',
      title: 'Social Work Law of 1965, as amended by RA 5175 and RA 10847',
      url: 'https://lawphil.net/statutes/repacts/ra1965/ra_4373_1965.html',
    },
    passing: {
      text: 'A general rating of at least 70% in the written test with no rating below 50% in any subject. There is no conditional pass in the law.',
      cite: { label: 'RA 4373, Sec. 14', url: 'https://lawphil.net/statutes/repacts/ra1965/ra_4373_1965.html' },
    },
    parts: {
      text: 'Five subjects at 20% each over three days on PRC’s program: Human Behavior and Social Environment; Social Welfare Policies, Programs and Services; Social Work Practice I with Field Instruction I; Social Work Methods II (Working with Groups); Social Work Practice III with Field Instruction III (Communities). RA 4373, Sec. 13 leaves the scope of the written test to the Board.',
      cite: {
        label: 'PRC — September 2026 SWLE Program of Examination',
        url: 'https://www.prc.gov.ph/sites/default/files/SWLE%20Program%20Sept%202026%20with%20Memo%202020-57.pdf',
      },
    },
    requirements: {
      items: [
        'be a Filipino citizen',
        'be at least 18 years old — RA 10847 lowered the age from 21 in 2016',
        'be in good health and of good moral character',
        'hold a bachelor’s or master’s degree in social work from a duly accredited, legally constituted institution',
        'have completed at least 1,000 case hours of practical training in an established social work agency under a qualified social worker',
      ],
      cite: { label: 'RA 4373, Sec. 12, as amended by RA 10847, Sec. 2', url: 'https://lawphil.net/statutes/repacts/ra2016/ra_10847_2016.html' },
    },
    retake: {
      text: 'RA 4373 and its amendments set no retake limit, waiting period or refresher-course requirement.',
      cite: { label: 'RA 4373 (full text)', url: 'https://lawphil.net/statutes/repacts/ra1965/ra_4373_1965.html' },
    },
    extraFaqs: [
      {
        q: 'What was the passing rate in the September 2026 social work board exam?',
        a: '8,383 of 10,991 passed (76.27%). PRC released the results on September 17, 2026, three working days after the exam, from 18 testing centers; online registration for the new social workers starts November 13, 2026. Source: <a href="https://www.prc.gov.ph/article/september-2026-social-workers-licensure-examination-results-released-three-3-working-days" target="_blank" rel="noopener">prc.gov.ph</a>.',
      },
      {
        q: 'How often is the social work board exam given?',
        a: 'Once a year (RA 4373, Sec. 11 says the Board gives it annually). In 2026 the domestic sitting was September 9–11, plus a Special Professional Licensure Examination for Filipinos in Hong Kong on May 29–31.',
      },
    ],
  },
];
