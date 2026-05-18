import { formatLocalDate } from "./repo";

export type DayCount = { date: string; label: string; count: number };

// Returns last `days` entries oldest → newest (so newer days appear on the right).
export function buildLastNDays(counts: Record<string, number>, days: number): DayCount[] {
  const out: DayCount[] = [];
  const cursor = new Date();
  cursor.setDate(cursor.getDate() - (days - 1));
  for (let i = 0; i < days; i++) {
    const date = formatLocalDate(cursor);
    out.push({
      date,
      label: cursor.toLocaleDateString("en-US", { weekday: "narrow" }),
      count: counts[date] ?? 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

// Streak: consecutive days with ≥1 done ending at the most recent active day.
// If today is empty but yesterday was active, we keep yesterday's streak alive
// (the user still has the rest of today to add to it).
export function computeStreak(counts: Record<string, number>): number {
  const cursor = new Date();
  if (!counts[formatLocalDate(cursor)]) {
    cursor.setDate(cursor.getDate() - 1);
    if (!counts[formatLocalDate(cursor)]) return 0;
  }
  let streak = 0;
  while (counts[formatLocalDate(cursor)]) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function sumCounts(counts: Record<string, number>): number {
  let s = 0;
  for (const k in counts) s += counts[k];
  return s;
}
