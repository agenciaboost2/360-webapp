"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NotesCard({ userId, initialNotes }) {
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(initialNotes || "");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").upsert({ id: userId, notes });
    setSaving(false);
    if (error) { alert("No se pudo guardar: " + error.message); return; }
    setEditing(false);
    router.refresh();
  }

  return (
    <div className="card" style={{ background: "var(--accent-gold-bg)", borderColor: "#EAD9A8" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: notes || editing ? 10 : 0 }}>
        <label style={{ fontSize: 12.5, color: "#9A7B2E", textTransform: "uppercase", letterSpacing: .4, fontWeight: 700 }}>
          📌 Notas y pendientes
        </label>
        {!editing && (
          <button className="btn ghost" style={{ padding: "5px 10px", fontSize: 13 }} onClick={() => setEditing(true)}>
            {notes ? "✎ Editar" : "+ Agregar"}
          </button>
        )}
      </div>
      {editing ? (
        <>
          <textarea rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej: Enviar propuesta a Cardio Yunes, revisar factura de Jef Travel..." style={{ width: "100%", background: "#fff", border: "1px solid #EAD9A8", borderRadius: 8, padding: 10, fontSize: 14 }} />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="btn ghost" style={{ flex: 1 }} onClick={() => setEditing(false)}>Cancelar</button>
            <button className="btn primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
          </div>
        </>
      ) : (
        <div style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap", color: notes ? "var(--text)" : "#9A7B2E" }}>
          {notes || "Sin notas por ahora."}
        </div>
      )}
    </div>
  );
}
