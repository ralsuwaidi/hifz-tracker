import { useState } from "react";
import { supabase } from "../lib/supabase";

type Props = { onDismiss: () => void };

export function SetPasswordSheet({ onDismiss }: Props) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Pick at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setError(error.message);
    else {
      setSaved(true);
      setTimeout(onDismiss, 1100);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px",
    background: "var(--bg)", border: "1px solid var(--b)", borderRadius: 7,
    color: "var(--t)", fontSize: 13, fontFamily: "var(--m)",
    outline: "none", marginBottom: 10,
  };

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
          borderRadius: "12px 12px 0 0", padding: "20px 16px 32px", width: "100%",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontFamily: "var(--m)", fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
          Set a password
        </div>
        <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 14 }}>
          After this, you can sign in with email + password instead of magic-link.
        </div>

        {saved ? (
          <div style={{ fontSize: 13, color: "#46A758", padding: "8px 0 4px" }}>
            ✓ Password saved.
          </div>
        ) : (
          <form onSubmit={submit}>
            <input
              type="password" required autoComplete="new-password"
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="new password (8+ chars)" style={inputStyle}
            />
            <input
              type="password" required autoComplete="new-password"
              value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="confirm" style={inputStyle}
            />
            <button
              type="submit" disabled={busy}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 7,
                background: "var(--ac)", color: "#fff", border: "none",
                fontSize: 13, fontWeight: 500, opacity: busy ? 0.6 : 1,
              }}
            >
              {busy ? "Saving…" : "Save"}
            </button>
            {error && (
              <div style={{ fontSize: 12, color: "#E5484D", marginTop: 10 }}>{error}</div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
