"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function EjesCard({ clientId, monthKey, monthLabel, initialEjes, onSaved }) {
  const [editing, setEditing] = useState(false);
  const existing = initialEjes.find((e) => e.month === monthKey);
  const [text, setText] = useState(existing?.content || "");

  async function handleSave() {
    const supabase = createClient();
    if (existing) {
      await supabase.from("ejes").update({ content: text }).eq("id", existing.id);
    } else {
      await supabase.from("ejes").insert({ client_id: clientId, month: monthKey, content: text });
    }
    setEditing(false);
    onSaved();
  }

  return (
    <div className="card" style={{ background: "var(--accent-gold-bg)", borderColor: "#EAD9A8" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: existing || editing ? 10 : 0 }}>
        <label style={{ fontSize: 13, color: "#9A7B2E", textTransform: "uppercase", letterSpacing: .4, fontWeight: 700 }}>
          🎯 Ejes de comunicación — {monthLabel}
        </label>
        {!editing && (
          <button className="btn ghost" style={{ padding: "5px 10px", fontSize: 13.5 }} onClick={() => { setText(existing?.content || ""); setEditing(true); }}>
            {existing ? "✎ Editar" : "+ Agregar"}
          </button>
        )}
      </div>
      {editing ? (
        <>
          <textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} style={{ width: "100%", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 8, padding: 10, fontSize: 15, color: "var(--text)" }} />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="btn ghost" style={{ flex: 1 }} onClick={() => setEditing(false)}>Cancelar</button>
            <button className="btn primary" style={{ flex: 1 }} onClick={handleSave}>Guardar</button>
          </div>
        </>
      ) : (
        <div style={{ fontSize: 14.5, lineHeight: 1.6, whiteSpace: "pre-wrap", color: existing ? "var(--text)" : "var(--text-dim)" }}>
          {existing?.content || "Sin definir todavía para este mes."}
        </div>
      )}
    </div>
  );
}
