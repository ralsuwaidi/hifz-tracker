import { Dot } from "./Dot";
import { STATUSES, STATUS_ORDER, type Status } from "../constants";
import type { PagesMap } from "../lib/session";

type Props = {
  page: number;
  pages: PagesMap;
  onPick: (status: Status) => void;
  onDismiss: () => void;
};

export function RatingSheet({ page, pages, onPick, onDismiss }: Props) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "#00000090",
        display: "flex", alignItems: "flex-end", zIndex: 300,
      }}
      onClick={onDismiss}
    >
      <div
        className="sheet"
        style={{
          background: "var(--s1)", border: "1px solid var(--b)",
          borderRadius: "12px 12px 0 0", padding: "20px 16px 44px", width: "100%",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
          <span style={{ fontFamily: "var(--m)", fontSize: 15, fontWeight: 600 }}>Page {page}</span>
          <span style={{ fontSize: 12, color: "var(--t3)" }}>· marked done ✓</span>
        </div>
        <div style={{ fontSize: 13, color: "var(--t3)", marginBottom: 14 }}>
          How did it feel? Update the rating:
        </div>
        {STATUS_ORDER.filter(s => s !== "new").map(s => {
          const isCur = pages[page]?.status === s;
          return (
            <button key={s} className={`sopt${isCur ? " on" : ""}`} onClick={() => onPick(s)}>
              <Dot color={STATUSES[s].color} />
              <span style={{ flex: 1 }}>{STATUSES[s].label}</span>
              {isCur && <span style={{ fontSize: 11, color: "var(--t3)" }}>current</span>}
            </button>
          );
        })}
        <button className="sopt" style={{ marginTop: 4 }} onClick={onDismiss}>
          <span style={{ width: 7 }} />
          Keep current rating
        </button>
      </div>
    </div>
  );
}
