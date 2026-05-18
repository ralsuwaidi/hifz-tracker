import type { Status } from "../constants";

export type PageState = { status: Status; lastReviewed: string | null };
export type PagesMap = Record<number, PageState>;

export type SessionItem = {
  page: number;
  status: Exclude<Status, "new">;
  reps: number;
};

export function daysSince(iso: string | null): number {
  if (!iso) return 999;
  return (Date.now() - new Date(iso).getTime()) / 86400000;
}

export function fmt(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

export function buildSession(pages: PagesMap): SessionItem[] {
  const by: Record<Exclude<Status, "new">, { n: number; lastReviewed: string | null }[]> = {
    red: [], ram: [], trigger: [], cold: [],
  };
  for (const [n, d] of Object.entries(pages)) {
    if (d.status !== "new") by[d.status].push({ n: +n, lastReviewed: d.lastReviewed });
  }

  const sess: SessionItem[] = [];
  by.red.sort((a, b) => a.n - b.n)
    .forEach(p => sess.push({ page: p.n, status: "red", reps: 10 }));
  by.ram.sort((a, b) => a.n - b.n)
    .forEach(p => sess.push({ page: p.n, status: "ram", reps: 4 }));
  by.trigger
    .sort((a, b) => daysSince(a.lastReviewed) > daysSince(b.lastReviewed) ? -1 : 1)
    .slice(0, 4)
    .forEach(p => sess.push({ page: p.n, status: "trigger", reps: 1 }));
  by.cold
    .sort((a, b) => daysSince(a.lastReviewed) > daysSince(b.lastReviewed) ? -1 : 1)
    .slice(0, 3)
    .forEach(p => sess.push({ page: p.n, status: "cold", reps: 1 }));
  return sess;
}
