import { useState } from "react";
import { supabase } from "../lib/supabase";

type Mode = "password" | "magic";

export function SignIn() {
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setError(error.message);
  }

  async function submitMagic(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + import.meta.env.BASE_URL },
    });
    setBusy(false);
    if (error) setError(error.message);
    else setMagicSent(true);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px",
    background: "var(--bg)", border: "1px solid var(--b)", borderRadius: 7,
    color: "var(--t)", fontSize: 13, fontFamily: "var(--m)",
    outline: "none", marginBottom: 10,
  };
  const buttonStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 7,
    background: "var(--ac)", color: "#fff", border: "none",
    fontSize: 13, fontWeight: 500,
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        width: "100%", maxWidth: 360,
        background: "var(--s1)", border: "1px solid var(--bs)",
        borderRadius: 10, padding: "26px 22px",
      }}>
        <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>
          Baqarah Hifz Tracker
        </div>
        <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 18 }}>
          {mode === "password" ? "Sign in with your email and password." : "We'll email you a one-time link."}
        </div>

        {mode === "password" ? (
          <form onSubmit={submitPassword}>
            <input
              type="email" required autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" style={inputStyle}
            />
            <input
              type="password" required autoComplete="current-password"
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="password" style={inputStyle}
            />
            <button type="submit" disabled={busy} style={{ ...buttonStyle, opacity: busy ? 0.6 : 1 }}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
            {error && (
              <div style={{ fontSize: 12, color: "#E5484D", marginTop: 10 }}>{error}</div>
            )}
            <button
              type="button"
              onClick={() => { setMode("magic"); setError(null); setMagicSent(false); }}
              style={{
                width: "100%", marginTop: 12, background: "none", border: "none",
                color: "var(--t3)", fontSize: 12, padding: 4,
              }}
            >
              Use a one-time email link instead
            </button>
          </form>
        ) : magicSent ? (
          <>
            <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.5 }}>
              Check <span style={{ color: "var(--t)", fontFamily: "var(--m)" }}>{email}</span> for a sign-in link.
              You can close this tab.
            </div>
            <button
              type="button"
              onClick={() => { setMode("password"); setMagicSent(false); }}
              style={{
                width: "100%", marginTop: 14, background: "none", border: "none",
                color: "var(--t3)", fontSize: 12, padding: 4,
              }}
            >
              Back to password sign-in
            </button>
          </>
        ) : (
          <form onSubmit={submitMagic}>
            <input
              type="email" required autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" style={inputStyle}
            />
            <button type="submit" disabled={busy} style={{ ...buttonStyle, opacity: busy ? 0.6 : 1 }}>
              {busy ? "Sending…" : "Send sign-in link"}
            </button>
            {error && (
              <div style={{ fontSize: 12, color: "#E5484D", marginTop: 10 }}>{error}</div>
            )}
            <button
              type="button"
              onClick={() => { setMode("password"); setError(null); }}
              style={{
                width: "100%", marginTop: 12, background: "none", border: "none",
                color: "var(--t3)", fontSize: 12, padding: 4,
              }}
            >
              Back to password sign-in
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
