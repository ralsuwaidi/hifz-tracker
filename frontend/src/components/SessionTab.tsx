import { Dot } from "./Dot";
import { PAGE_SECS, STATUSES, STATUS_ORDER } from "../constants";
import { fmt, type SessionItem } from "../lib/session";

type Props = {
  session: SessionItem[];
  done: Record<number, true>;
  onMarkDone: (page: number) => void;
};

export function SessionTab({ session, done, onMarkDone }: Props) {
  const totalSecs = session.reduce((a, i) => a + i.reps * PAGE_SECS, 0);
  const doneSecs = session.filter(i => done[i.page]).reduce((a, i) => a + i.reps * PAGE_SECS, 0);
  const pct = totalSecs ? doneSecs / totalSecs : 0;
  const doneCount = session.filter(i => done[i.page]).length;

  return (
    <div>
      <div style={{ padding: "14px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
          <span style={{ fontSize: 12, color: "var(--t3)" }}>
            {doneCount}/{session.length} pages
          </span>
          <span style={{ fontSize: 11, color: "var(--t3)", fontFamily: "var(--m)" }}>
            {fmt(doneSecs)} / {fmt(totalSecs)}
          </span>
        </div>
        <div style={{ height: 2, background: "var(--bs)", borderRadius: 2, overflow: "hidden", marginBottom: 16 }}>
          <div style={{
            height: "100%", borderRadius: 2,
            background: pct === 1 ? "#46A758" : "var(--ac)",
            width: `${pct * 100}%`,
            transition: "width 0.45s cubic-bezier(0.4,0,0.2,1)",
          }} />
        </div>
      </div>

      {session.length === 0 && (
        <div style={{ padding: "52px 20px", textAlign: "center", color: "var(--t3)", fontSize: 13 }}>
          No active pages yet.<br />Add pages in the All Pages tab.
        </div>
      )}

      {STATUS_ORDER.filter(s => s !== "new").map(status => {
        const items = session.filter(i => i.status === status);
        if (!items.length) return null;
        const st = STATUSES[status];
        return (
          <div key={status}>
            <div className="slabel">
              <Dot color={st.color} size={6} />
              {st.label}
              <span style={{
                color: "var(--t3)", fontWeight: 400, textTransform: "none",
                letterSpacing: 0, fontSize: 11,
              }}>
                · {items[0].reps}× · {fmt(items[0].reps * PAGE_SECS)} each
              </span>
            </div>
            {items.map(item => {
              const isDone = !!done[item.page];
              return (
                <div key={item.page} className={`row${isDone ? " done" : ""}`}>
                  <button
                    className={`cb${isDone ? " ticked" : ""}`}
                    style={{ borderColor: isDone ? "var(--b)" : st.color + "55" }}
                    onClick={() => !isDone && onMarkDone(item.page)}
                  >✓</button>

                  <span style={{
                    fontFamily: "var(--m)", fontSize: 13, fontWeight: 500,
                    color: isDone ? "var(--t3)" : "var(--t)", minWidth: 26,
                    textDecoration: isDone ? "line-through" : "none",
                  }}>
                    {item.page}
                  </span>

                  <span style={{ fontSize: 13, color: "var(--t2)", flex: 1 }}>
                    Page {item.page}
                  </span>

                  <span style={{
                    fontSize: 11, color: "var(--t3)", fontFamily: "var(--m)", whiteSpace: "nowrap",
                  }}>
                    {item.reps}× · {fmt(item.reps * PAGE_SECS)}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
      <div style={{ height: 48 }} />
    </div>
  );
}
