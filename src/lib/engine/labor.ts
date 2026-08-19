import type { DayType, LaborRules } from '../rules/types';
import { round2 } from '../format';

/* ------------------------------- Holiday pay ------------------------------ */

export interface HolidayPayResult {
  dayType: DayType;
  worked: boolean;
  hourlyRate: number;
  hours: number;
  baseHours: number;
  otHours: number;
  multiplier: number;
  otMultiplier: number;
  basePay: number;
  otPay: number;
  total: number;
}

/**
 * Holiday / rest-day pay for a single day.
 * First 8 hours at the day-type multiplier; hours beyond 8 get the OT factor
 * applied on top of the day-type hourly rate (DOLE formula).
 */
export function computeHolidayPay(
  dayType: DayType,
  worked: boolean,
  hourlyRate: number,
  hours: number,
  rules: LaborRules,
): HolidayPayResult {
  const mult = worked
    ? rules.worked_multiplier[dayType]
    : rules.unworked_multiplier[dayType];
  const otFactor = rules.ot_factor[dayType];
  if (!worked) {
    // Unworked: regular holidays pay 100% of the daily wage (8 hours).
    const basePay = round2(hourlyRate * 8 * mult);
    return {
      dayType,
      worked,
      hourlyRate,
      hours: 0,
      baseHours: mult > 0 ? 8 : 0,
      otHours: 0,
      multiplier: mult,
      otMultiplier: 0,
      basePay,
      otPay: 0,
      total: basePay,
    };
  }
  const baseHours = Math.min(hours, 8);
  const otHours = Math.max(hours - 8, 0);
  const basePay = round2(hourlyRate * baseHours * mult);
  const otHourly = hourlyRate * mult * otFactor;
  const otPay = round2(otHourly * otHours);
  return {
    dayType,
    worked,
    hourlyRate,
    hours,
    baseHours,
    otHours,
    multiplier: mult,
    otMultiplier: round2(mult * otFactor),
    basePay,
    otPay,
    total: round2(basePay + otPay),
  };
}

/* ---------------------------- Night differential --------------------------- */

export interface NightDiffResult {
  hourlyRate: number;
  dayType: DayType;
  isOvertime: boolean;
  shiftHours: number;
  nightHours: number;
  dayMultiplier: number;
  /** Effective hourly rate for the shift (day-type × OT factor when OT). */
  premiumHourly: number;
  basePay: number;
  nightDiff: number;
  total: number;
}

/** Hours of a shift that fall inside the ND window (10:00 PM – 6:00 AM). */
export function nightHoursBetween(start: number, end: number, rules: LaborRules): number {
  // Normalize to a same-day/overnight span in hours (0–24 clock values).
  let s = start;
  let e = end;
  if (e <= s) e += 24; // overnight shift
  // ND windows on an absolute 48h axis: [22,30) covers 10PM–6AM next day;
  // [0,6) covers the early-morning window when the shift starts after midnight.
  const windows: Array<[number, number]> = [
    [0, rules.night_diff.end_hour],
    [rules.night_diff.start_hour, 24 + rules.night_diff.end_hour],
    [24 + rules.night_diff.start_hour, 48 + rules.night_diff.end_hour],
  ];
  let total = 0;
  for (const [ws, we] of windows) {
    total += Math.max(0, Math.min(e, we) - Math.max(s, ws));
  }
  return round2(total);
}

/**
 * Night shift differential: at least 10% of the applicable hourly rate for
 * each hour worked between 10PM and 6AM. When the shift is on a premium day
 * (or is OT), the 10% applies on the premium hourly rate.
 */
export function computeNightDiff(
  hourlyRate: number,
  shiftStart: number,
  shiftEnd: number,
  dayType: DayType,
  isOvertime: boolean,
  rules: LaborRules,
): NightDiffResult {
  let s = shiftStart;
  let e = shiftEnd;
  if (e <= s) e += 24;
  const shiftHours = round2(e - s);
  const nightHours = nightHoursBetween(shiftStart, shiftEnd, rules);
  const dayMult = rules.worked_multiplier[dayType];
  const premiumHourly = round2(
    hourlyRate * dayMult * (isOvertime ? rules.ot_factor[dayType] : 1),
  );
  const basePay = round2(premiumHourly * shiftHours);
  const nightDiff = round2(premiumHourly * rules.night_diff.rate * nightHours);
  return {
    hourlyRate,
    dayType,
    isOvertime,
    shiftHours,
    nightHours,
    dayMultiplier: dayMult,
    premiumHourly,
    basePay,
    nightDiff,
    total: round2(basePay + nightDiff),
  };
}

/* --------------------------------- Overtime -------------------------------- */

export interface OvertimeResult {
  hourlyRate: number;
  dayType: DayType;
  otHours: number;
  nightOtHours: number;
  dayMultiplier: number;
  otFactor: number;
  /** OT pay per hour = hourly × day-type multiplier × OT factor. */
  otHourly: number;
  otPay: number;
  nightDiffOnOt: number;
  total: number;
}

/**
 * Overtime premium for hours beyond 8 on a given day type. `nightOtHours`
 * (subset of otHours falling 10PM–6AM) earns an extra 10% ND on the OT rate.
 */
export function computeOvertime(
  hourlyRate: number,
  otHours: number,
  dayType: DayType,
  nightOtHours: number,
  rules: LaborRules,
): OvertimeResult {
  const dayMult = rules.worked_multiplier[dayType];
  const otFactor = rules.ot_factor[dayType];
  const otHourly = round2(hourlyRate * dayMult * otFactor);
  const otPay = round2(otHourly * otHours);
  const ndHours = Math.min(Math.max(nightOtHours, 0), otHours);
  const nightDiffOnOt = round2(otHourly * rules.night_diff.rate * ndHours);
  return {
    hourlyRate,
    dayType,
    otHours,
    nightOtHours: ndHours,
    dayMultiplier: dayMult,
    otFactor,
    otHourly,
    otPay,
    nightDiffOnOt,
    total: round2(otPay + nightDiffOnOt),
  };
}
