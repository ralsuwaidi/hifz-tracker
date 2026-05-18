import { Dot } from "./Dot";
import { STATUSES, STATUS_ORDER } from "../constants";

type Props = { counts: Partial<Record<keyof typeof STATUSES, number>> };

export function StatPills({ counts }: Props) {
  return (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 18, padding: "0 20px" }}>
      {STATUS_ORDER.map(s => (
        <div key={s} className="pill">
          <Dot color={STATUSES[s].color} size={6} />
          <span style={{ fontFamily: "var(--m)", fontSize: 11, color: "var(--t)" }}>
            {counts[s] || 0}
          </span>
          <span>{STATUSES[s].label}</span>
        </div>
      ))}
    </div>
  );
}
