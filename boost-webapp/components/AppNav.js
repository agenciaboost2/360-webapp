"use client";
import { useState } from "react";
import Link from "next/link";
import ProfileModal from "@/components/ProfileModal";

export default function AppNav({ current, profile, userId }) {
  const [editingProfile, setEditingProfile] = useState(false);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 32px", borderBottom: "1px solid var(--border)", background: "var(--bg2)" }}>
      <Link href="/" style={{
        padding: "10px 20px", borderRadius: 10, fontSize: 16, fontWeight: 700, textDecoration: "none",
        background: current === "cuentas" ? "var(--bg3)" : "transparent", color: "var(--text)",
      }}>Cuentas</Link>
      <Link href="/metrics" style={{
        padding: "10px 20px", borderRadius: 10, fontSize: 16, fontWeight: 700, textDecoration: "none",
        background: current === "metricas" ? "var(--bg3)" : "transparent", color: "var(--text)",
      }}>Métricas</Link>

      {userId ? (
        <button onClick={() => setEditingProfile(true)} style={{
          marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 20,
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{profile?.full_name || "Tu perfil"}</span>
          <div style={{ width: 48, height: 48, borderRadius: "50%", overflow: "hidden", background: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 18 }}>
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (profile?.full_name?.[0]?.toUpperCase() || "B")}
          </div>
        </button>
      ) : (
        <div style={{ marginLeft: "auto", width: 48, height: 48, borderRadius: "50%", background: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 18 }}>B</div>
      )}

      {editingProfile && userId && <ProfileModal profile={profile} userId={userId} onClose={() => setEditingProfile(false)} />}
    </div>
  );
}
