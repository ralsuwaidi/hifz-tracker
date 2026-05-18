import { useEffect, useState } from "react";
import { loadDailyDoneCounts } from "../lib/repo";
import { buildLastNDays, computeStreak, sumCounts } from "../lib/stats";

const RANGE_DAYS = 14;

export function StatsTab({ refreshKey }: { refreshKey: number }) {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setCounts(null);
    setError(null);
    loadDailyDoneCounts(RANGE_DAYS)
      .then(c => { if (!cancelled) setCounts(c); })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : String(e)); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  if (error) {
    return (
      <div style={{ padding: "20px", color: "#E5484D", fontSize: 13 }}>{error}</div>
    );
  }

  if (!counts) {
    return (
      <div style={{ padding: "52px 20px", textAlign: "center", color: "var(--t3)", fontSize: 13 }}>
        Loading…
      </div>
    );
  }

  const days = buildLastNDays(counts, RANGE_DAYS);
  const max = Math.max(1, ...days.map(d => d.count));
  const streak = computeStreak(counts);
  const total = sumCounts(counts);
  const activeDays = days.filter(d => d.count > 0).length;

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 22 }}>
        <Stat label="Streak" value={streak} unit={streak === 1 ? "day" : "days"} />
        <Stat label="Pages (14d)" value={total} unit={total === 1 ? "page" : "pages"} />
        <Stat label="Active days" value={activeDays} unit={`/ ${RANGE_DAYS}`} />
      </div>

      <div style={{
        fontSize: 11, color: "var(--t3)", letterSpacing: "0.05em",
        textTransform: "uppercase", marginBottom: 10,
      }}>
        Last 14 days
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${RANGE_DAYS}, 1fr)`,
        gap: 4,
        alignItems: "end",
        height: 120,
        padding: "8px 0",
        borderBottom: "1px solid var(--bs)",
      }}>
        {days.map(d => {
          const pct = (d.count / max) * 100;
          const isToday = d.date === days[days.length - 1].date;
          return (
            <div key={d.date} title={`${d.date}: ${d.count}`}
              style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
              <div style={{
                background: d.count === 0 ? "var(--bs)" : isToday ? "var(--ac)" : "var(--t2)",
                height: d.count === 0 ? 2 : `${Math.max(pct, 4)}%`,
                borderRadius: 3,
                transition: "height 0.25s",
              }} />
            </div>
          );
        })}
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${RANGE_DAYS}, 1fr)`,
        gap: 4,
        marginTop: 6,
      }}>
        {days.map(d => (
          <div key={d.date} style={{
            fontSize: 10, color: "var(--t3)", fontFamily: "var(--m)", textAlign: "center",
          }}>
            {d.label}
          </div>
        ))}
      </div>

      <div style={{ height: 32 }} />
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div style={{
      background: "var(--s1)", border: "1px solid var(--bs)",
      borderRadius: 8, padding: "12px 12px 10px",
    }}>
      <div style={{
        fontSize: 10, color: "var(--t3)", letterSpacing: "0.05em",
        textTransform: "uppercase", marginBottom: 4,
      }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontFamily: "var(--m)", fontSize: 20, fontWeight: 600, color: "var(--t)" }}>
          {value}
        </span>
        <span style={{ fontSize: 11, color: "var(--t3)" }}>{unit}</span>
      </div>
    </div>
  );
}
