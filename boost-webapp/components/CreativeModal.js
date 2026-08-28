"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const TYPES = ["Carrusel", "Historia", "Reel"];
const TERRITORIES = [
  { id: "A", label: "Territorio A — \"Somos santiagueños\"" },
  { id: "B", label: "Territorio B — \"Las cosas como son\"" },
  { id: "C", label: "Territorio C — \"Esto pasó de verdad\"" },
  { id: "D", label: "Territorio D — \"360 sabe\"" },
];

export default function CreativeModal({ item, userId, userName, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: item.name || "",
    title: item.title || "",
    type: item.type || "Carrusel",
    territory: item.territory || "A",
    script: item.script || "",
    published: item.published || false,
    estimated_date: item.estimated_date || "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    let error;
    if (item.id) {
      ({ error } = await supabase.from("creative_content").update({ ...form, updated_at: new Date().toISOString() }).eq("id", item.id));
    } else {
      ({ error } = await supabase.from("creative_content").insert({ ...form, created_by: userId, created_by_name: userName || "" }));
    }
    setSaving(false);
    if (error) { alert("No se pudo guardar: " + error.message); return; }
    onSaved();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000040", display: "flex", alignItems: "stretch", justifyContent: "flex-end", zIndex: 60 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 640, height: "100%", overflowY: "auto", background: "var(--bg2)", borderLeft: "1px solid var(--border)", boxShadow: "-8px 0 24px #00000022", padding: 32 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, marginTop: 0, marginBottom: 18 }}>
          {item.id ? "Editar idea" : "Nueva idea"}
        </h2>

        <div className="field"><label>Nombre de contenido</label><input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Nombre interno para identificarla" /></div>
        <div className="field"><label>Título</label><input value={form.title} onChange={(e) => set("title", e.target.value)} /></div>

        <div className="field">
          <label>Tipo</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {TYPES.map((t) => (
              <button key={t} type="button" onClick={() => set("type", t)} style={{
                padding: "7px 12px", borderRadius: 8, fontSize: 14.5, cursor: "pointer",
                border: `1px solid ${form.type === t ? "var(--red)" : "var(--border)"}`,
                background: form.type === t ? "#C42B2B22" : "transparent",
                color: form.type === t ? "var(--red-dark)" : "var(--text-dim)",
              }}>{t}</button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Territorio</label>
          <select value={form.territory} onChange={(e) => set("territory", e.target.value)}>
            {TERRITORIES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>

        <div className="field">
          <label>Guion o indicaciones</label>
          <textarea rows={9} value={form.script} onChange={(e) => set("script", e.target.value)} placeholder="Indicaciones de carrusel, historia o reel — escribilo como prefieras organizarlo." />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div className="field" style={{ flex: 1 }}><label>Fecha estimativa de publicación</label><input type="date" value={form.estimated_date || ""} onChange={(e) => set("estimated_date", e.target.value)} /></div>
          <div className="field" style={{ flex: 1 }}>
            <label>Publicado</label>
            <button type="button" onClick={() => set("published", !form.published)} style={{
              width: "100%", padding: "10px", borderRadius: 8, cursor: "pointer",
              border: `1px solid ${form.published ? "var(--accent-mint)" : "var(--border)"}`,
              background: form.published ? "var(--accent-mint-bg)" : "transparent",
              color: form.published ? "#2F7A5C" : "var(--text-dim)", fontWeight: 600,
            }}>{form.published ? "✓ Publicado" : "Sin publicar"}</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button type="button" className="btn ghost" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
          <button type="button" className="btn primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
        </div>
      </div>
    </div>
  );
}
