import { useEffect, useState } from "react";
import { Dot } from "./Dot";
import { PAGE_SECS, STATUSES, type Status } from "../constants";
import { fmt, type SessionItem } from "../lib/session";

type Props = {
  session: SessionItem[];
  done: Record<number, true>;
  onMarkDone: (page: number) => void;
};

const MUST_DO: Status[] = ["red", "ram"];
const REVIEW: Status[] = ["trigger", "cold"];

function stats(items: SessionItem[], done: Record<number, true>) {
  const totalSecs = items.reduce((a, i) => a + i.reps * PAGE_SECS, 0);
  const doneSecs = items.filter(i => done[i.page]).reduce((a, i) => a + i.reps * PAGE_SECS, 0);
  const doneCount = items.filter(i => done[i.page]).length;
  return {
    totalSecs, doneSecs, doneCount,
    remaining: items.length - doneCount,
    pages: items.length,
  };
}

export function SessionTab({ session, done, onMarkDone }: Props) {
  const mustDo = session.filter(i => i.status === "red" || i.status === "ram");
  const review = session.filter(i => i.status === "trigger" || i.status === "cold");
  const mustDoStats = stats(mustDo, done);
  const reviewStats = stats(review, done);

  const focus = mustDo.length > 0 ? mustDoStats : reviewStats;
  const pct = focus.totalSecs ? focus.doneSecs / focus.totalSecs : 0;
  const minsLeft = Math.ceil((focus.totalSecs - focus.doneSecs) / 60);
  const allDone = focus.pages > 0 && focus.remaining === 0;
  const mustDoComplete = mustDo.length > 0 && mustDoStats.remaining === 0;

  const [showReview, setShowReview] = useState(mustDo.length === 0);
  useEffect(() => {
    if (mustDo.length === 0 && review.length > 0) setShowReview(true);
  }, [mustDo.length, review.length]);

  const reviewSecsLeft = reviewStats.totalSecs - reviewStats.doneSecs;
  const reviewVisible = showReview || mustDo.length === 0;

  return (
    <div>
      <div style={{ padding: "18px 20px 4px" }}>
        <div style={{
          fontSize: 10, fontWeight: 500, letterSpacing: "0.08em",
          color: "var(--t3)", textTransform: "uppercase", marginBottom: 6,
        }}>
          {mustDo.length > 0 ? "Today" : "Review"}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
          <span style={{
            fontFamily: "var(--m)", fontSize: 32, fontWeight: 600,
            color: allDone ? "#46A758" : "var(--t)", lineHeight: 1,
          }}>
            {minsLeft}m
          </span>
          <span style={{ fontSize: 13, color: "var(--t2)" }}>
            {allDone ? "all done · nice" : `left · ${focus.remaining} pages`}
          </span>
        </div>
        <div style={{ height: 3, background: "var(--bs)", borderRadius: 2, overflow: "hidden", marginBottom: 6 }}>
          <div style={{
            height: "100%", borderRadius: 2,
            background: pct === 1 ? "#46A758" : "var(--ac)",
            width: `${pct * 100}%`,
            transition: "width 0.45s cubic-bezier(0.4,0,0.2,1)",
          }} />
        </div>
        <div style={{ fontSize: 11, color: "var(--t3)", fontFamily: "var(--m)", marginBottom: 14 }}>
          {focus.doneCount}/{focus.pages} pages · {fmt(focus.doneSecs)} done
        </div>
      </div>

      {session.length === 0 && (
        <div style={{ padding: "52px 20px", textAlign: "center", color: "var(--t3)", fontSize: 13 }}>
          No active pages yet.<br />Add pages in the All Pages tab.
        </div>
      )}

      {MUST_DO.map(status => renderGroup(status, mustDo, done, onMarkDone))}

      {review.length > 0 && mustDo.length > 0 && (
        <button
          type="button"
          className={`review-toggle${showReview ? " open" : ""}${mustDoComplete && !showReview ? " ready" : ""}`}
          onClick={() => setShowReview(s => !s)}
        >
          {showReview ? (
            <>
              <span style={{ flex: 1 }}>Hide review</span>
              <span className="review-meta">
                {reviewStats.doneCount}/{reviewStats.pages} done
              </span>
            </>
          ) : (
            <>
              <span style={{ flex: 1 }}>
                {mustDoComplete ? "Continue to review" : "Show review"}
              </span>
              <span className="review-meta">
                {reviewStats.pages - reviewStats.doneCount} pages · {fmt(reviewSecsLeft)}
              </span>
            </>
          )}
        </button>
      )}
      {reviewVisible && REVIEW.map(status => renderGroup(status, review, done, onMarkDone))}

      <div style={{ height: 48 }} />
    </div>
  );
}

function renderGroup(
  status: Status,
  items: SessionItem[],
  done: Record<number, true>,
  onMarkDone: (page: number) => void,
) {
  const groupItems = items.filter(i => i.status === status);
  if (!groupItems.length) return null;
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
          · {groupItems[0].reps}× · {fmt(groupItems[0].reps * PAGE_SECS)} each
        </span>
      </div>
      {groupItems.map(item => {
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
}
