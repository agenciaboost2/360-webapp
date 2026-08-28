"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function TeamRemindersCard({ reminders, userId, userName, lastSeen }) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const notifiedRef = useRef(false);

  const newIds = new Set(
    (reminders || [])
      .filter((r) => r.created_by !== userId && lastSeen && new Date(r.created_at) > new Date(lastSeen))
      .map((r) => r.id)
  );
  const hasNew = newIds.size > 0;

  useEffect(() => {
    if (!hasNew || notifiedRef.current) return;
    notifiedRef.current = true;
    const supabase = createClient();
    supabase.from("profiles").update({ reminders_last_seen: new Date().toISOString() }).eq("id", userId).then(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasNew]);

  async function handleAdd() {
    if (!text.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("team_reminders").insert({ text, created_by: userId, created_by_name: userName || "" });
    setSaving(false);
    if (error) { alert("No se pudo guardar: " + error.message); return; }
    setText(""); setAdding(false);
    router.refresh();
  }

  async function toggleDone(item) {
    const supabase = createClient();
    await supabase.from("team_reminders").update({ done: !item.done }).eq("id", item.id);
    router.refresh();
  }

  async function handleDelete(id) {
    const supabase = createClient();
    await supabase.from("team_reminders").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="card" style={{ background: "var(--accent-blue-bg)", borderColor: hasNew ? "#5B8DEF" : "#C7D6F5", boxShadow: hasNew ? "0 0 0 3px #5B8DEF33" : "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <label style={{ fontSize: 12.5, color: "#3A5FB0", textTransform: "uppercase", letterSpacing: .4, fontWeight: 700 }}>
          👥 Recordatorios del equipo {hasNew && <span style={{ color: "#1877F2" }}>· nuevo</span>}
        </label>
        {!adding && <button className="btn ghost" style={{ padding: "5px 10px", fontSize: 13 }} onClick={() => setAdding(true)}>+ Agregar</button>}
      </div>

      {adding && (
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} placeholder="Ej: Armar calendarios hasta el 6 del mes" style={{ flex: 1, background: "#fff", border: "1px solid #C7D6F5", borderRadius: 8, padding: "9px 10px", fontSize: 14 }} autoFocus />
          <button className="btn ghost" onClick={() => { setAdding(false); setText(""); }}>Cancelar</button>
          <button className="btn primary" onClick={handleAdd} disabled={saving}>{saving ? "..." : "Agregar"}</button>
        </div>
      )}

      {(!reminders || reminders.length === 0) ? (
        <div style={{ fontSize: 14, color: "#3A5FB0" }}>Sin recordatorios por ahora.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {reminders.map((r) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 8, padding: "8px 10px", border: `1px solid ${newIds.has(r.id) ? "#5B8DEF" : "#C7D6F5"}` }}>
              <button onClick={() => toggleDone(r)} style={{
                width: 20, height: 20, borderRadius: 5, flexShrink: 0, cursor: "pointer",
                border: `2px solid ${r.done ? "var(--accent-mint)" : "#C7D6F5"}`,
                background: r.done ? "var(--accent-mint)" : "transparent", color: "#fff", fontSize: 12, fontWeight: 700,
              }}>{r.done ? "✓" : ""}</button>
              <div style={{ flex: 1 }}>
                {newIds.has(r.id) && <span style={{ fontSize: 10.5, fontWeight: 700, color: "#1877F2", marginRight: 5 }}>● NUEVO</span>}
                <span style={{ fontSize: 14, textDecoration: r.done ? "line-through" : "none", color: r.done ? "var(--text-dim)" : "var(--text)" }}>{r.text}</span>
                <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{r.created_by_name || "Alguien del equipo"}</div>
              </div>
              <button onClick={() => handleDelete(r.id)} style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", flexShrink: 0 }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
