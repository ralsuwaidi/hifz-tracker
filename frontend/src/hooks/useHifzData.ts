import { useCallback, useEffect, useState } from "react";
import { ensureSeeded, loadDoneToday, loadPages, markPageDone, updatePageStatus } from "../lib/repo";
import type { PagesMap } from "../lib/session";
import type { Status } from "../constants";

export type HifzData = {
  pages: PagesMap | null;
  done: Record<number, true>;
  loading: boolean;
  error: string | null;
  markDone: (page: number) => Promise<void>;
  setStatus: (page: number, status: Status) => Promise<void>;
};

export function useHifzData(userId: string | null): HifzData {
  const [pages, setPages] = useState<PagesMap | null>(null);
  const [done, setDone] = useState<Record<number, true>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setPages(null);
      setDone({});
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        await ensureSeeded();
        const [p, d] = await Promise.all([loadPages(), loadDoneToday()]);
        if (cancelled) return;
        setPages(p);
        setDone(d);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const markDone = useCallback(async (page: number) => {
    if (!userId || !pages) return;
    const now = new Date().toISOString();
    setDone(prev => ({ ...prev, [page]: true }));
    setPages(prev => prev && { ...prev, [page]: { ...prev[page], lastReviewed: now } });
    try {
      await markPageDone(userId, page);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [userId, pages]);

  const setStatus = useCallback(async (page: number, status: Status) => {
    if (!userId || !pages) return;
    setPages(prev => prev && { ...prev, [page]: { ...prev[page], status } });
    try {
      await updatePageStatus(userId, page, status);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [userId, pages]);

  return { pages, done, loading, error, markDone, setStatus };
}
