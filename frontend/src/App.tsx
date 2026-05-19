import { useMemo, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useHifzData } from "./hooks/useHifzData";
import { supabase } from "./lib/supabase";
import { buildSession } from "./lib/session";
import type { Status } from "./constants";
import { Header } from "./components/Header";
import { StatPills } from "./components/StatPills";
import { SessionTab } from "./components/SessionTab";
import { AllPagesTab } from "./components/AllPagesTab";
import { RatingSheet } from "./components/RatingSheet";
import { GridPageSheet } from "./components/GridPageSheet";
import { SignIn } from "./components/SignIn";
import { StatsTab } from "./components/StatsTab";
import { SetPasswordSheet } from "./components/SetPasswordSheet";
import { Toast } from "./components/Toast";

type Tab = "today" | "pages" | "stats";

function Loading({ label }: { label: string }) {
  return (
    <div style={{
      background: "var(--bg)", height: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{ color: "var(--t3)", fontSize: 13 }}>{label}</span>
    </div>
  );
}

export default function App() {
  const { session, ready } = useAuth();
  const userId = session?.user.id ?? null;
  const { pages, done, loading, error, markDone, setStatus } = useHifzData(userId);

  const [tab, setTab] = useState<Tab>("today");
  const [ratingPage, setRatingPage] = useState<number | null>(null);
  const [gridPage, setGridPage] = useState<number | null>(null);
  const [toastPage, setToastPage] = useState<number | null>(null);
  const [statsRefresh, setStatsRefresh] = useState(0);
  const [setPasswordOpen, setSetPasswordOpen] = useState(false);

  const today = useMemo(
    () => new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    [],
  );

  const onMarkDone = async (pg: number) => {
    await markDone(pg);
    setStatsRefresh(n => n + 1);
    setToastPage(pg);
  };

  const onUpdateStatus = async (pg: number, status: Status) => {
    await setStatus(pg, status);
    setRatingPage(null);
    setGridPage(null);
  };

  if (!ready) return <Loading label="…" />;
  if (!session) return <SignIn />;
  if (loading || !pages) return <Loading label="Loading…" />;

  const session_items = buildSession(pages, done);
  const counts = Object.values(pages).reduce<Partial<Record<Status, number>>>((a, p) => {
    a[p.status] = (a[p.status] ?? 0) + 1;
    return a;
  }, {});

  return (
    <div className="app-shell">
      <Header
        today={today}
        email={session.user.email ?? null}
        onSignOut={() => supabase.auth.signOut()}
        onSetPassword={() => setSetPasswordOpen(true)}
      />

      <div style={{ display: "flex", gap: 18, padding: "0 20px", borderBottom: "1px solid var(--bs)" }}>
        {([["today", "Session"], ["pages", "All Pages"], ["stats", "Stats"]] as const).map(([t, l]) => (
          <button key={t} className={`tab${tab === t ? " on" : ""}`} onClick={() => setTab(t)}>
            {l}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ padding: "10px 20px", color: "#E5484D", fontSize: 12 }}>
          {error}
        </div>
      )}

      {tab === "today" && (
        <SessionTab session={session_items} done={done} onMarkDone={onMarkDone} />
      )}
      {tab === "pages" && (
        <>
          <StatPills counts={counts} />
          <AllPagesTab pages={pages} onPickPage={setGridPage} />
        </>
      )}
      {tab === "stats" && (
        <StatsTab refreshKey={statsRefresh} />
      )}

      {ratingPage !== null && (
        <RatingSheet
          page={ratingPage}
          pages={pages}
          onPick={s => onUpdateStatus(ratingPage, s)}
          onDismiss={() => setRatingPage(null)}
        />
      )}
      {toastPage !== null && ratingPage === null && (
        <Toast
          key={toastPage}
          page={toastPage}
          status={pages[toastPage]?.status ?? "new"}
          onChange={() => {
            setRatingPage(toastPage);
            setToastPage(null);
          }}
          onDismiss={() => setToastPage(null)}
        />
      )}
      {gridPage !== null && (
        <GridPageSheet
          page={gridPage}
          pages={pages}
          onPick={s => onUpdateStatus(gridPage, s)}
          onDismiss={() => setGridPage(null)}
        />
      )}
      {setPasswordOpen && (
        <SetPasswordSheet onDismiss={() => setSetPasswordOpen(false)} />
      )}
    </div>
  );
}
