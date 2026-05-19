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

type Bucket = { n: number; lastReviewed: string | null };

// Pages done today stay in the visible session; the remaining slots are
// filled with the stalest not-done pages. This keeps the cap honest for
// "what's left to review" while making completed work persist as ticked.
function pickWithDone(items: Bucket[], done: Record<number, true>, limit: number): Bucket[] {
  const doneItems = items.filter(i => done[i.n]);
  const fresh = items
    .filter(i => !done[i.n])
    .sort((a, b) => daysSince(b.lastReviewed) - daysSince(a.lastReviewed))
    .slice(0, Math.max(0, limit - doneItems.length));
  return [...doneItems, ...fresh].sort((a, b) => a.n - b.n);
}

export function buildSession(pages: PagesMap, done: Record<number, true> = {}): SessionItem[] {
  const by: Record<Exclude<Status, "new">, Bucket[]> = {
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
  pickWithDone(by.trigger, done, 4)
    .forEach(p => sess.push({ page: p.n, status: "trigger", reps: 1 }));
  pickWithDone(by.cold, done, 3)
    .forEach(p => sess.push({ page: p.n, status: "cold", reps: 1 }));
  return sess;
}
