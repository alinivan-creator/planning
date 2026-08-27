export const DAY_SHORT = ["lu", "ma", "mi", "jo", "vi", "sâ", "du"] as const;
export const DAY_LONG = [
  "Luni",
  "Marți",
  "Miercuri",
  "Joi",
  "Vineri",
  "Sâmbătă",
  "Duminică",
] as const;
export const MONTH_LONG = [
  "ianuarie",
  "februarie",
  "martie",
  "aprilie",
  "mai",
  "iunie",
  "iulie",
  "august",
  "septembrie",
  "octombrie",
  "noiembrie",
  "decembrie",
] as const;

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function todayISO(now = new Date()): string {
  return formatISO(now);
}

export function addDaysISO(iso: string, days: number): string {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  return formatISO(date);
}

export function diffDays(fromISO: string, toISO: string): number {
  const from = startOfDay(parseISODate(fromISO));
  const to = startOfDay(parseISODate(toISO));
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

export function startOfWeekMonday(date: Date): Date {
  const result = startOfDay(date);
  const day = result.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + offset);
  return result;
}

export function isoWeekNumber(date: Date): number {
  const utc = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  return Math.ceil(((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

export function weekdayIndexMonday(iso: string): number {
  const day = parseISODate(iso).getDay();
  return day === 0 ? 6 : day - 1;
}

export function weekDates(mondayISO: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDaysISO(mondayISO, i));
}

export function threeWeekMondays(anchorMondayISO: string): string[] {
  return [
    anchorMondayISO,
    addDaysISO(anchorMondayISO, 7),
    addDaysISO(anchorMondayISO, 14),
  ];
}

export function timeToHours(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h + (m || 0) / 60;
}

export function formatDayLabel(iso: string): string {
  const date = parseISODate(iso);
  return `${DAY_SHORT[weekdayIndexMonday(iso)]} ${date.getDate()}`;
}

export function formatLongDate(iso: string): string {
  const date = parseISODate(iso);
  return `${date.getDate()} ${MONTH_LONG[date.getMonth()]} ${date.getFullYear()}`;
}

export function isSameISO(a: string, b: string): boolean {
  return a === b;
}
