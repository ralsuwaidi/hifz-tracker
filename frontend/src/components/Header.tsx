type Props = {
  today: string;
  email: string | null;
  onSignOut: () => void;
  onSetPassword: () => void;
};

export function Header({ today, email, onSignOut, onSetPassword }: Props) {
  return (
    <div style={{ padding: "24px 20px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
        <span style={{ color: "var(--t3)", fontSize: 12 }}>Al-Baqarah</span>
        <span style={{ color: "var(--t3)", fontSize: 12 }}>/</span>
        <span style={{ color: "var(--t2)", fontSize: 12, fontWeight: 500 }}>Hifz Tracker</span>
        <span style={{ marginLeft: "auto", color: "var(--t3)", fontSize: 11, fontFamily: "var(--m)" }}>
          {today}
        </span>
      </div>

      <div style={{
        fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em",
        marginBottom: 14, marginTop: 2, display: "flex", alignItems: "baseline", gap: 10,
      }}>
        <span>Today's Review</span>
        {email && (
          <span style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
            <button
              onClick={onSetPassword}
              style={{
                background: "none", border: "none",
                color: "var(--t3)", fontSize: 11, padding: 0,
              }}
            >
              set password
            </button>
            <button
              onClick={onSignOut}
              style={{
                background: "none", border: "none",
                color: "var(--t3)", fontSize: 11, padding: 0,
              }}
              title={email}
            >
              sign out
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
