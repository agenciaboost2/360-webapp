"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NotesCard({ userId, todos }) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleAdd() {
    if (!text.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("personal_todos").insert({ user_id: userId, text });
    setSaving(false);
    if (error) { alert("No se pudo guardar: " + error.message); return; }
    setText(""); setAdding(false);
    router.refresh();
  }

  async function toggleDone(item) {
    const supabase = createClient();
    await supabase.from("personal_todos").update({ done: !item.done }).eq("id", item.id);
    router.refresh();
  }

  async function handleDelete(id) {
    const supabase = createClient();
    await supabase.from("personal_todos").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="card" style={{ background: "var(--accent-gold-bg)", borderColor: "#EAD9A8" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <label style={{ fontSize: 12.5, color: "#9A7B2E", textTransform: "uppercase", letterSpacing: .4, fontWeight: 700 }}>
          📌 Notas y pendientes
        </label>
        {!adding && <button className="btn ghost" style={{ padding: "5px 10px", fontSize: 13 }} onClick={() => setAdding(true)}>+ Agregar</button>}
      </div>

      {adding && (
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} placeholder="Ej: Revisar factura de Jef Travel" style={{ flex: 1, background: "#fff", border: "1px solid #EAD9A8", borderRadius: 8, padding: "9px 10px", fontSize: 14 }} autoFocus />
          <button className="btn ghost" onClick={() => { setAdding(false); setText(""); }}>Cancelar</button>
          <button className="btn primary" onClick={handleAdd} disabled={saving}>{saving ? "..." : "Agregar"}</button>
        </div>
      )}

      {(!todos || todos.length === 0) ? (
        <div style={{ fontSize: 14, color: "#9A7B2E" }}>Sin pendientes por ahora.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {todos.map((item) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 8, padding: "8px 10px", border: "1px solid #EAD9A8" }}>
              <button onClick={() => toggleDone(item)} style={{
                width: 20, height: 20, borderRadius: 5, flexShrink: 0, cursor: "pointer",
                border: `2px solid ${item.done ? "var(--accent-mint)" : "#EAD9A8"}`,
                background: item.done ? "var(--accent-mint)" : "transparent", color: "#fff", fontSize: 12, fontWeight: 700,
              }}>{item.done ? "✓" : ""}</button>
              <span style={{ flex: 1, fontSize: 14, textDecoration: item.done ? "line-through" : "none", color: item.done ? "var(--text-dim)" : "var(--text)" }}>{item.text}</span>
              <button onClick={() => handleDelete(item.id)} style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer" }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
