import { useState } from 'preact/hooks';
import sslJson from '../data/ssl/2026.json';
import taxJson from '../data/tax/2026.json';
import philhealthJson from '../data/philhealth/2026.json';
import pagibigJson from '../data/pagibig/2026.json';
import type { PagibigRules, PhilhealthRules, SslRules, TaxRules } from '../lib/rules/types';
import { governmentNetPay, monthlySalary, nextTranche, trancheAsOf, trancheForYear } from '../lib/engine/ssl';
import { todayInManila } from '../lib/today.mjs';
import { peso, round2 } from '../lib/format';
import { CalculatorShell, ResultCard, SelectField, Tabs } from './shared/ui';
import { trackCalculatorUse } from './shared/track';

const ssl = sslJson as unknown as SslRules;
const deps = { tax: taxJson as unknown as TaxRules, philhealth: philhealthJson as unknown as PhilhealthRules, pagibig: pagibigJson as unknown as PagibigRules };
const TODAY = todayInManila();
const CURRENT = trancheAsOf(ssl, TODAY);
const NEXT = nextTranche(ssl, TODAY);
const PERA = 2000;
const CASH_GIFT = 5000;
const GRADES = Array.from({ length: 33 }, (_, i) => ({ value: String(i + 1), label: `Salary Grade ${i + 1}` }));
const POSITIONS = [{ value: '', label: 'Pick a position (optional)' }, ...ssl.positions.map((p) => ({ value: String(p.sg) + '|' + p.title, label: `${p.title} — SG ${p.sg}` }))];

export default function SalaryGradeCalculator() {
  const [grade, setGrade] = useState('11');
  const [step, setStep] = useState('1');
  const [year, setYear] = useState(String(CURRENT.year));
  const [position, setPosition] = useState('');
  const tranche = trancheForYear(ssl, Number(year)) ?? CURRENT;
  const steps = ssl.tranches[0]!.grades[grade]!.length;
  const stepN = Math.min(Number(step), steps);
  const basic = monthlySalary(tranche, Number(grade), stepN)!;
  const pay = governmentNetPay(basic, ssl, deps);
  const touched = grade !== '11' || step !== '1' || year !== String(CURRENT.year) || position !== '';
  if (touched) trackCalculatorUse('salary-grade');
  const title = position ? position.split('|')[1]! : `SG ${grade}, Step ${stepN}`;

  const rows = [
    { label: `Monthly basic salary (${tranche.year}, SG ${grade} Step ${stepN})`, value: peso(basic), strong: true },
    { label: `GSIS personal share (${Math.round(ssl.contributions.gsis_personal * 100)}%)`, value: `− ${peso(pay.gsis)}`, indent: true },
    { label: 'PhilHealth employee share', value: `− ${peso(pay.philhealth)}`, indent: true },
    { label: 'Pag-IBIG employee share', value: `− ${peso(pay.pagibig)}`, indent: true },
    { label: 'Withholding tax on the basic salary', value: `− ${peso(pay.withholdingTax)}`, indent: true },
    { label: 'Net basic pay per month', value: peso(pay.netBasic), strong: true },
    { label: 'Plus PERA', value: peso(PERA) },
    { label: 'Basic salary for the year (× 12)', value: peso(round2(basic * 12)) },
    { label: 'Mid-year (May) and year-end (November) bonuses, one month each if eligible', value: peso(round2(basic * 2)) },
    { label: 'Cash gift (with the year-end bonus)', value: peso(CASH_GIFT) },
    { label: 'PERA for the year', value: peso(PERA * 12) },
  ];

  return (
    <CalculatorShell title="Government Salary Grade Calculator">
      {NEXT && (
        <Tabs
          label="Year"
          options={[
            { value: String(CURRENT.year), label: `${CURRENT.year} rates (in force)` },
            { value: String(NEXT.year), label: `${NEXT.year} rates (from January 1, ${NEXT.year})` },
          ]}
          value={year}
          onChange={setYear}
        />
      )}
      <SelectField
        id="sg-position"
        label="Position"
        options={POSITIONS}
        value={position}
        onChange={(v) => {
          setPosition(v);
          if (v) {
            setGrade(v.split('|')[0]!);
            setStep('1');
          }
        }}
      />
      <div class="sm:flex sm:gap-4">
        <div class="sm:flex-1">
          <SelectField
            id="sg-grade"
            label="Salary grade"
            options={GRADES}
            value={grade}
            onChange={(v) => {
              setGrade(v);
              setPosition('');
            }}
          />
        </div>
        <div class="sm:flex-1">
          <SelectField
            id="sg-step"
            label="Step"
            options={Array.from({ length: steps }, (_, i) => ({ value: String(i + 1), label: `Step ${i + 1}${i === 0 ? ' (new hires)' : ''}` }))}
            value={String(stepN)}
            onChange={setStep}
          />
        </div>
      </div>
      <ResultCard
        headline={`Monthly basic salary — ${title}`}
        amount={peso(basic)}
        amountNote={`${tranche.year} ${tranche.tranche} tranche of ${ssl.order}${tranche.issuance ? `, implemented by ${tranche.issuance}` : ' (implementing DBM circular expected in January)'}. GSIS at 9% of basic pay, the usual payroll practice; allowances such as PERA are shown separately.`}
        rows={rows}
        meta={{ ...ssl.meta, rule_version: `${ssl.order} — ${tranche.year} salary schedule` }}
        effectiveText={`January 1, ${tranche.year}`}
        copyText={rows.map((r) => `${r.label}: ${r.value}`).join('\n')}
        onReset={() => {
          setGrade('11');
          setStep('1');
          setYear(String(CURRENT.year));
          setPosition('');
        }}
      />
    </CalculatorShell>
  );
}
