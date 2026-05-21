import { useEffect, useRef, useState } from "react";

type Props = {
  today: string;
  email: string | null;
  onSignOut: () => void;
  onSetPassword: () => void;
};

export function Header({ today, email, onSignOut, onSetPassword }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div style={{ padding: "24px 20px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
        <span style={{ color: "var(--t3)", fontSize: 12 }}>Al-Baqarah</span>
        <span style={{ color: "var(--t3)", fontSize: 12 }}>/</span>
        <span style={{ color: "var(--t2)", fontSize: 12, fontWeight: 500 }}>Hifz Tracker</span>
        <div style={{ marginLeft: "auto", position: "relative" }} ref={ref}>
          <button
            type="button"
            className="date-chip"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => email && setOpen(o => !o)}
          >
            {today}
          </button>
          {open && email && (
            <div className="acct-menu" role="menu">
              <div className="acct-email" title={email}>{email}</div>
              <button
                type="button"
                className="acct-item"
                role="menuitem"
                onClick={() => { setOpen(false); onSetPassword(); }}
              >
                Set password
              </button>
              <button
                type="button"
                className="acct-item"
                role="menuitem"
                onClick={() => { setOpen(false); onSignOut(); }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{
        fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em",
        marginBottom: 14, marginTop: 2,
      }}>
        Today's Review
      </div>
    </div>
  );
}
