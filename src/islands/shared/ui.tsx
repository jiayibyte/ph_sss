import { useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import type { RuleMeta } from '../../lib/rules/types';
import { formatWhileTyping, parseAmount } from '../../lib/format';

/* ------------------------------ CurrencyInput ------------------------------ */

export function CurrencyInput(props: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string | null;
  hint?: string;
}) {
  return (
    <div class="mb-3">
      <label htmlFor={props.id} class="mb-1 block text-sm font-medium text-ink">
        {props.label}
      </label>
      <div class="relative">
        <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft">
          ₱
        </span>
        <input
          id={props.id}
          type="text"
          inputMode="decimal"
          autocomplete="off"
          class={`w-full rounded-lg border px-3 py-2.5 pl-7 text-base text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent ${
            props.error ? 'border-red-500' : 'border-line'
          }`}
          placeholder={props.placeholder ?? '0.00'}
          value={props.value}
          aria-invalid={props.error ? 'true' : undefined}
          aria-describedby={props.error ? `${props.id}-error` : undefined}
          onInput={(e) =>
            props.onChange(formatWhileTyping((e.target as HTMLInputElement).value))
          }
        />
      </div>
      {props.error ? (
        <p id={`${props.id}-error`} class="mt-1 text-xs font-medium text-red-600" role="alert">
          {props.error}
        </p>
      ) : props.hint ? (
        <p class="mt-1 text-xs text-ink-soft">{props.hint}</p>
      ) : null}
    </div>
  );
}

/** Validate a currency field: returns [number|null, error|null]. */
export function useAmount(raw: string, label: string): [number | null, string | null] {
  if (raw.trim() === '') return [null, null];
  const n = parseAmount(raw);
  if (n === null) return [null, `${label} must be a number.`];
  return [n, null];
}

/* ---------------------------------- Tabs ---------------------------------- */

export function Tabs<T extends string>(props: {
  label: string;
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div role="tablist" aria-label={props.label} class="mb-3 flex flex-wrap gap-1.5">
      {props.options.map((o) => {
        const selected = o.value === props.value;
        return (
          <button
            key={o.value}
            role="tab"
            type="button"
            aria-selected={selected}
            class={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              selected
                ? 'border-accent bg-accent text-white'
                : 'border-line bg-surface text-ink-soft hover:border-accent hover:text-accent-strong'
            }`}
            onClick={() => props.onChange(o.value)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------------- Select --------------------------------- */

export function SelectField<T extends string>(props: {
  id: string;
  label: string;
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div class="mb-3">
      <label htmlFor={props.id} class="mb-1 block text-sm font-medium text-ink">
        {props.label}
      </label>
      <select
        id={props.id}
        class="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-base text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        value={props.value}
        onChange={(e) => props.onChange((e.target as HTMLSelectElement).value as T)}
      >
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* -------------------------------- ResultCard ------------------------------- */

export interface BreakdownRow {
  label: string;
  value: string;
  strong?: boolean;
  href?: string;
  indent?: boolean;
}

export function ResultCard(props: {
  headline: string;
  amount: string;
  amountNote?: string;
  rows: BreakdownRow[];
  meta: RuleMeta;
  copyText: string;
  onReset: () => void;
  children?: ComponentChildren;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(props.copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-PH', { year: 'numeric', month: 'long' });
  return (
    <div
      class="mt-4 rounded-xl border border-line bg-accent-soft p-4 sm:p-5"
      role="region"
      aria-label="Calculation result"
    >
      <p class="text-sm font-medium text-ink-soft">{props.headline}</p>
      <p class="mt-1 text-3xl font-bold tabular-nums text-accent-strong sm:text-4xl">
        {props.amount}
      </p>
      {props.amountNote && <p class="mt-1 text-xs text-ink-soft">{props.amountNote}</p>}
      <dl class="mt-4 space-y-1.5 border-t border-line pt-3 text-sm">
        {props.rows.map((r) => (
          <div key={r.label} class={`flex justify-between gap-3 ${r.indent ? 'pl-4' : ''}`}>
            <dt class={r.strong ? 'font-semibold text-ink' : 'text-ink-soft'}>
              {r.href ? (
                <a href={r.href} class="underline decoration-line hover:text-accent-strong">
                  {r.label}
                </a>
              ) : (
                r.label
              )}
            </dt>
            <dd class={`tabular-nums ${r.strong ? 'font-semibold text-ink' : 'text-ink'}`}>
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
      {props.children}
      <div class="mt-4 flex gap-2">
        <button
          type="button"
          onClick={copy}
          class="rounded-lg border border-accent px-3 py-1.5 text-sm font-medium text-accent-strong hover:bg-accent hover:text-white"
        >
          {copied ? 'Copied ✓' : 'Copy result'}
        </button>
        <button
          type="button"
          onClick={props.onReset}
          class="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-accent hover:text-accent-strong"
        >
          Reset
        </button>
      </div>
      <div class="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-ink-soft">
        <p>
          <strong>Schedule used:</strong> {props.meta.rule_version}
        </p>
        <p>
          <strong>Effective from:</strong> {fmt(props.meta.effective_from)} ·{' '}
          <strong>Last verified:</strong> {fmt(props.meta.last_verified)}
        </p>
        <p>
          <strong>Official source:</strong>{' '}
          <a
            href={props.meta.official_source_url}
            target="_blank"
            rel="noopener"
            class="underline hover:text-accent-strong"
          >
            {props.meta.official_source_label}
          </a>
        </p>
      </div>
    </div>
  );
}

/* ------------------------------ CalculatorShell ---------------------------- */

export function CalculatorShell(props: { title: string; children: ComponentChildren }) {
  return (
    <div class="rounded-xl border border-line bg-surface p-4 shadow-sm sm:p-5">
      <h2 class="mb-3 text-base font-bold text-ink">{props.title}</h2>
      {props.children}
    </div>
  );
}
