"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Email o contraseña incorrectos.");
      return;
    }
    const redirect = searchParams.get("redirect");
    window.location.href = redirect || "/";
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      backgroundImage: "url(/login-bg.jpg)", backgroundSize: "cover", backgroundPosition: "center",
    }}>
      <form onSubmit={handleSubmit} style={{
        width: 380, maxWidth: "90vw", background: "rgba(255,255,255,0.94)", backdropFilter: "blur(6px)",
        borderRadius: 16, padding: 28, boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--red)", margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 21, fontFamily: "var(--font-display)" }}>B</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: 0 }}>Boost</h1>
          <div style={{ fontSize: 14, color: "var(--text-dim)" }}>Ingresá con tu cuenta del equipo</div>
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vos@boost.com" />
        </div>
        <div className="field">
          <label>Contraseña</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <div style={{ color: "var(--red-dark)", fontSize: 14.5, marginBottom: 12 }}>{error}</div>}
        <button className="btn primary" type="submit" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
        <div style={{ fontSize: 13.5, color: "var(--text-dim)", marginTop: 14, textAlign: "center", lineHeight: 1.5 }}>
          ¿No tenés cuenta todavía? Pedile a quien administra Boost que te invite desde el panel de Supabase.
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
