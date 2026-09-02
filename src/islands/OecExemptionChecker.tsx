import type * as preact from 'preact';
import { useState } from 'preact/hooks';
import { CalculatorShell, Tabs } from './shared/ui';
import { trackCalculatorUse } from './shared/track';

/**
 * "Am I exempt from the OEC?" — five yes/no questions mirroring the DMW
 * Balik-Manggagawa criteria on this page. Guide only: the DMW system makes
 * the final determination when it tries to match your record.
 */

type YesNo = '' | 'yes' | 'no';
type Record3 = '' | 'yes' | 'no' | 'unsure';

const YN = [
  { value: 'yes' as const, label: 'Yes' },
  { value: 'no' as const, label: 'No' },
];
const YNU = [...YN, { value: 'unsure' as const, label: 'Not sure' }];

type Verdict = {
  tone: 'good' | 'warn' | 'bad';
  title: string;
  body: string;
  steps: string[];
};

function decide(
  visa: YesNo,
  employer: YesNo,
  jobsite: YesNo,
  record: Record3,
  position: YesNo,
): Verdict {
  if (visa === 'no') {
    return {
      tone: 'bad',
      title: 'Not exempt — you need DMW documentation first',
      body: 'Without a valid work visa, work permit or residence ID for your jobsite you are treated as undocumented (for example, workers who left as tourists). The exemption cannot be issued online.',
      steps: [
        'Go to a DMW Regional Office (in the Philippines) or the Migrant Workers Office (MWO) at your jobsite.',
        'Have your employment verified and your record created before you can be processed as a Balik-Manggagawa.',
      ],
    };
  }
  if (employer === 'no' || jobsite === 'no') {
    return {
      tone: 'bad',
      title: 'Not exempt — new employer or jobsite means regular processing',
      body: 'The exemption is only for workers returning to the same employer at the same jobsite. A new employer or a new jobsite is treated as a new contract, so you need regular contract verification and a new OEC.',
      steps: [
        'Have the new contract verified at the MWO covering your jobsite (or through your licensed agency).',
        'Apply for a regular OEC through DMW Online Services — do not rely on the Balik-Manggagawa lane.',
      ],
    };
  }
  if (record === 'no') {
    return {
      tone: 'warn',
      title: 'Cannot be matched online — book an in-person appointment',
      body: 'The online system exempts you by matching your existing DMW/POEA record. With no previous OEC issued by DMW, POEA, POLO or MWO, it will redirect you to an appointment page instead.',
      steps: [
        'Book an appointment at a DMW Regional Office or the MWO at your jobsite.',
        'Bring your passport, work visa/permit, employment contract and proof of employment (company ID or recent pay slip).',
      ],
    };
  }
  if (position === 'no') {
    return {
      tone: 'warn',
      title: 'Likely exempt, but a changed position may need contract verification first',
      body: 'Same employer and jobsite with a different position is usually still Balik-Manggagawa, but the system may not match the new position to your record. Try online first; if it fails, verify the updated contract at the MWO.',
      steps: [
        'Open the eGovPH app → DMW → Balik-Manggagawa and try to generate the OFW Travel Pass.',
        'If you are redirected to an appointment page, have the updated contract verified at the MWO, then try again.',
      ],
    };
  }
  if (record === 'unsure') {
    return {
      tone: 'good',
      title: 'Likely exempt — try the OFW Travel Pass first',
      body: 'You meet the same-employer, same-jobsite criteria. Whether the exemption is issued online depends on the DMW database matching your previous OEC record; the app will tell you immediately.',
      steps: [
        'Open the eGovPH app → DMW → Balik-Manggagawa and generate your OFW Travel Pass (free, valid 90 days).',
        'If the app redirects you to an appointment page, your record is not matched — book at a DMW Regional Office or MWO.',
      ],
    };
  }
  return {
    tone: 'good',
    title: 'Likely exempt — generate your OFW Travel Pass',
    body: 'Valid work visa, same employer, same jobsite and an existing DMW record: that is the Balik-Manggagawa exemption profile. No fee applies.',
    steps: [
      'Open the eGovPH app → DMW → Balik-Manggagawa, confirm your employer and jobsite, and generate the OFW Travel Pass (QR code, valid 90 days).',
      'Alternative: log in to DMW Online Services (onlineservices.dmw.gov.ph), select Balik-Manggagawa, enter your flight date and print the exemption.',
      'Keep your passport, visa and the pass ready at immigration. Never pay a fixer — issuance is free.',
    ],
  };
}

function Question(props: { n: number; text: string; children: preact.ComponentChildren }) {
  return (
    <div class="mb-2">
      <p class="mb-1.5 text-sm font-medium text-ink">
        <span class="mr-1.5 inline-block rounded bg-accent-soft px-1.5 text-xs font-bold text-accent-strong">
          {props.n}
        </span>
        {props.text}
      </p>
      {props.children}
    </div>
  );
}

const TONE = {
  good: 'border-accent bg-accent-soft',
  warn: 'border-amber-400 bg-amber-50',
  bad: 'border-red-300 bg-red-50',
};

export default function OecExemptionChecker() {
  const [visa, setVisa] = useState<YesNo>('');
  const [employer, setEmployer] = useState<YesNo>('');
  const [jobsite, setJobsite] = useState<YesNo>('');
  const [record, setRecord] = useState<Record3>('');
  const [position, setPosition] = useState<YesNo>('');

  const answered = visa && employer && jobsite && record && position;
  const verdict = answered ? decide(visa, employer, jobsite, record, position) : null;
  if (verdict) trackCalculatorUse('oec-exemption-checker');

  const reset = () => {
    setVisa('');
    setEmployer('');
    setJobsite('');
    setRecord('');
    setPosition('');
  };

  return (
    <CalculatorShell title="Am I exempt from the OEC? (Balik-Manggagawa check)">
      <p class="mb-3 text-sm text-ink-soft">
        Answer five questions to see which DMW lane applies to you. Guide only — the DMW system
        makes the final determination when it matches your record.
      </p>
      <Question n={1} text="Do you hold a valid work visa, work permit or residence ID for your jobsite?">
        <Tabs label="Question 1" options={YN} value={visa} onChange={setVisa} />
      </Question>
      <Question n={2} text="Are you returning to the same employer?">
        <Tabs label="Question 2" options={YN} value={employer} onChange={setEmployer} />
      </Question>
      <Question n={3} text="Are you returning to the same jobsite (same country and worksite)?">
        <Tabs label="Question 3" options={YN} value={jobsite} onChange={setJobsite} />
      </Question>
      <Question n={4} text="Have you been issued an OEC before by DMW, POEA, POLO or MWO for this employer?">
        <Tabs label="Question 4" options={YNU} value={record} onChange={setRecord} />
      </Question>
      <Question n={5} text="Is your position the same as on your previous contract?">
        <Tabs label="Question 5" options={YN} value={position} onChange={setPosition} />
      </Question>

      {verdict && (
        <div
          class={`mt-4 rounded-xl border p-4 sm:p-5 ${TONE[verdict.tone]}`}
          role="region"
          aria-label="Eligibility result"
        >
          <p class="text-lg font-bold text-ink">{verdict.title}</p>
          <p class="mt-2 text-sm text-ink">{verdict.body}</p>
          <ol class="mt-3 ml-5 list-decimal space-y-1 text-sm text-ink">
            {verdict.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <div class="mt-4 flex gap-2">
            <button
              type="button"
              onClick={reset}
              class="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-accent hover:text-accent-strong"
            >
              Start over
            </button>
          </div>
          <p class="mt-3 text-xs leading-relaxed text-ink-soft">
            Based on DMW Advisory No. 38, s. 2025 and DMW's OEC exemption criteria. AyTool is
            independent and cannot check or process your documents; only official DMW channels can.
          </p>
        </div>
      )}
    </CalculatorShell>
  );
}
