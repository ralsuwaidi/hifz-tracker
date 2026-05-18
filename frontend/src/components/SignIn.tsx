import { useState } from "react";
import { supabase } from "../lib/supabase";

export function SignIn() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + import.meta.env.BASE_URL },
    });
    setSending(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <form
        onSubmit={submit}
        style={{
          width: "100%", maxWidth: 360,
          background: "var(--s1)", border: "1px solid var(--bs)",
          borderRadius: 10, padding: "26px 22px",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>
          Baqarah Hifz Tracker
        </div>
        <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 18 }}>
          Enter your email and we'll send a one-time sign-in link.
        </div>

        {sent ? (
          <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.5 }}>
            Check <span style={{ color: "var(--t)", fontFamily: "var(--m)" }}>{email}</span> for a sign-in link.
            You can close this tab.
          </div>
        ) : (
          <>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              style={{
                width: "100%", padding: "10px 12px",
                background: "var(--bg)", border: "1px solid var(--b)", borderRadius: 7,
                color: "var(--t)", fontSize: 13, fontFamily: "var(--m)", marginBottom: 10,
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={sending}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 7,
                background: "var(--ac)", color: "#fff", border: "none",
                fontSize: 13, fontWeight: 500,
                opacity: sending ? 0.6 : 1,
              }}
            >
              {sending ? "Sending…" : "Send sign-in link"}
            </button>
            {error && (
              <div style={{ fontSize: 12, color: "#E5484D", marginTop: 10 }}>{error}</div>
            )}
          </>
        )}
      </form>
    </div>
  );
}
