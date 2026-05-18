import { supabase } from "./supabase";
import type { Status } from "../constants";
import type { PagesMap } from "./session";

type PageRow = {
  page_number: number;
  status: Status;
  last_reviewed: string | null;
};

// Local-date ISO (YYYY-MM-DD), not UTC — "today" should match the user's wall clock.
export function formatLocalDate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayDate(): string {
  return formatLocalDate();
}

export async function ensureSeeded(): Promise<void> {
  const { error } = await supabase.rpc("seed_pages_for_current_user");
  if (error) throw error;
}

export async function loadPages(): Promise<PagesMap> {
  const { data, error } = await supabase
    .from("pages")
    .select("page_number, status, last_reviewed");
  if (error) throw error;
  const map: PagesMap = {};
  for (const row of (data ?? []) as PageRow[]) {
    map[row.page_number] = { status: row.status, lastReviewed: row.last_reviewed };
  }
  return map;
}

export async function updatePageStatus(
  userId: string,
  pageNumber: number,
  status: Status,
): Promise<void> {
  const { error } = await supabase
    .from("pages")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("page_number", pageNumber);
  if (error) throw error;
}

export async function markPageDone(
  userId: string,
  pageNumber: number,
): Promise<void> {
  const now = new Date().toISOString();
  const { error: e1 } = await supabase
    .from("pages")
    .update({ last_reviewed: now, updated_at: now })
    .eq("user_id", userId)
    .eq("page_number", pageNumber);
  if (e1) throw e1;

  const { error: e2 } = await supabase
    .from("daily_done")
    .upsert(
      { user_id: userId, done_date: todayDate(), page_number: pageNumber },
      { onConflict: "user_id,done_date,page_number" },
    );
  if (e2) throw e2;
}

export async function loadDailyDoneCounts(days: number): Promise<Record<string, number>> {
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  const { data, error } = await supabase
    .from("daily_done")
    .select("done_date")
    .gte("done_date", formatLocalDate(start));
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const r of (data ?? []) as { done_date: string }[]) {
    counts[r.done_date] = (counts[r.done_date] ?? 0) + 1;
  }
  return counts;
}

export async function loadDoneToday(): Promise<Record<number, true>> {
  const { data, error } = await supabase
    .from("daily_done")
    .select("page_number")
    .eq("done_date", todayDate());
  if (error) throw error;
  const out: Record<number, true> = {};
  for (const r of (data ?? []) as { page_number: number }[]) out[r.page_number] = true;
  return out;
}
