import { useEffect } from "react";
import { Dot } from "./Dot";
import { STATUSES, type Status } from "../constants";

type Props = {
  page: number;
  status: Status;
  onChange: () => void;
  onDismiss: () => void;
};

export function Toast({ page, status, onChange, onDismiss }: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const st = status !== "new" ? STATUSES[status] : null;

  return (
    <div className="toast" role="status">
      <Dot color={st?.color ?? "var(--t3)"} size={6} />
      <span style={{ fontSize: 13, color: "var(--t)", fontWeight: 500 }}>
        Page {page}
      </span>
      <span style={{ fontSize: 12, color: "var(--t3)" }}>
        {st ? `· ${st.label}` : ""}
      </span>
      <button className="toast-action" onClick={onChange}>Change</button>
      <button className="toast-x" onClick={onDismiss} aria-label="Dismiss">×</button>
    </div>
  );
}
