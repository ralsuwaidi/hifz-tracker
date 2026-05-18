import { Dot } from "./Dot";
import { STATUSES, STATUS_ORDER, TOTAL_PAGES } from "../constants";
import type { PagesMap } from "../lib/session";

type Props = {
  pages: PagesMap;
  onPickPage: (page: number) => void;
};

export function AllPagesTab({ pages, onPickPage }: Props) {
  return (
    <div style={{ padding: "18px 20px" }}>
      <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 14 }}>
        Tap a page to update its status
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
        {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map(n => {
          const st = STATUSES[pages[n]?.status ?? "new"];
          return (
            <button key={n} className="pcell" onClick={() => onPickPage(n)}>
              <span style={{ fontFamily: "var(--m)", fontSize: 13, fontWeight: 500, color: "var(--t2)" }}>
                {n}
              </span>
              <Dot color={st.color} size={5} />
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 28, borderTop: "1px solid var(--bs)", paddingTop: 20 }}>
        <div style={{
          fontSize: 11, color: "var(--t3)", letterSpacing: "0.05em",
          textTransform: "uppercase", marginBottom: 12,
        }}>
          Legend
        </div>
        {STATUS_ORDER.map(s => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Dot color={STATUSES[s].color} />
            <span style={{ fontSize: 13, color: "var(--t2)", flex: 1 }}>{STATUSES[s].label}</span>
            {STATUSES[s].reps > 0 && (
              <span style={{ fontSize: 11, color: "var(--t3)", fontFamily: "var(--m)" }}>
                {STATUSES[s].reps}× / session
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
