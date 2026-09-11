const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseISODate(iso: string): Date {
  const match = ISO_DATE.exec(iso);
  if (!match) {
    throw new Error(`Invalid ISO date: ${iso}`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(year, month - 1, day);
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISO(now = new Date()): string {
  return toISODate(now);
}

export function addDays(iso: string, days: number): string {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function startOfWeek(iso: string, weekStartsOn: 0 | 1 = 1): string {
  const date = parseISODate(iso);
  const day = date.getDay();
  const offset = weekStartsOn === 1 ? (day + 6) % 7 : day;
  date.setDate(date.getDate() - offset);
  return toISODate(date);
}

export function weekDates(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}

export function shiftWeek(weekStart: string, weeks: number): string {
  return addDays(weekStart, weeks * 7);
}

export function isSameWeek(
  iso: string,
  weekStart: string,
  weekStartsOn: 0 | 1 = 1,
): boolean {
  return startOfWeek(iso, weekStartsOn) === weekStart;
}

export function formatDayHeading(iso: string): string {
  return parseISODate(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatWeekRange(weekStart: string): string {
  const start = parseISODate(weekStart);
  const end = parseISODate(addDays(weekStart, 6));
  const startLabel = start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const endLabel = end.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startLabel} – ${endLabel}`;
}

export function weekdayShort(iso: string): string {
  return parseISODate(iso).toLocaleDateString(undefined, { weekday: "short" });
}

export function monthDay(iso: string): string {
  return parseISODate(iso).toLocaleDateString(undefined, { day: "numeric" });
}
