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
    reach: item.reach ?? 0, views: item.views ?? 0, likes: item.likes ?? 0,
    comments: item.comments ?? 0, reposts: item.reposts ?? 0, saved: item.saved ?? 0,
    shared_between_users: item.shared_between_users ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    let error;
    const NUMERIC_FIELDS = ["reach", "views", "likes", "comments", "reposts", "saved", "shared_between_users"];
    const payload = { ...form };
    NUMERIC_FIELDS.forEach((k) => { payload[k] = payload[k] === "" || payload[k] == null ? 0 : Number(payload[k]) || 0; });
    if (item.id) {
      ({ error } = await supabase.from("creative_content").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", item.id));
    } else {
      ({ error } = await supabase.from("creative_content").insert({ ...payload, client_id: item.client_id || null, created_by: userId, created_by_name: userName || "" }));
    }
    setSaving(false);
    if (error) { alert("No se pudo guardar: " + error.message); return; }
    onSaved();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000055", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 20 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: "100%", maxWidth: 1000, maxHeight: "92vh", overflowY: "auto" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, marginTop: 0, marginBottom: 18 }}>
          {item.id ? "Editar idea" : "Nueva idea"}
        </h2>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 1, minWidth: 220 }}><label>Nombre de contenido</label><input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Nombre interno para identificarla" /></div>
          <div className="field" style={{ flex: 1, minWidth: 220 }}><label>Título</label><input value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 1, minWidth: 260 }}>
            <label>Tipo</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {TYPES.map((t) => (
                <button key={t} type="button" onClick={() => set("type", t)} style={{
                  padding: "9px 16px", borderRadius: 8, fontSize: 15, cursor: "pointer",
                  border: `1px solid ${form.type === t ? "var(--red)" : "var(--border)"}`,
                  background: form.type === t ? "#C42B2B22" : "transparent",
                  color: form.type === t ? "var(--red-dark)" : "var(--text-dim)",
                }}>{t}</button>
              ))}
            </div>
          </div>
          <div className="field" style={{ flex: 1, minWidth: 260 }}>
            <label>Territorio</label>
            <select value={form.territory} onChange={(e) => set("territory", e.target.value)}>
              {TERRITORIES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
        </div>

        <div className="field">
          <label>Guion o indicaciones</label>
          <textarea rows={18} value={form.script} onChange={(e) => set("script", e.target.value)} placeholder="Indicaciones de carrusel, historia o reel — escribilo como prefieras organizarlo." style={{ fontSize: 15, lineHeight: 1.5 }} />
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 1, minWidth: 220 }}><label>Fecha estimativa de publicación</label><input type="date" value={form.estimated_date || ""} onChange={(e) => set("estimated_date", e.target.value)} /></div>
          <div className="field" style={{ flex: 1, minWidth: 220 }}>
            <label>Publicado</label>
            <button type="button" onClick={() => set("published", !form.published)} style={{
              width: "100%", padding: "10px", borderRadius: 8, cursor: "pointer",
              border: `1px solid ${form.published ? "var(--accent-mint)" : "var(--border)"}`,
              background: form.published ? "var(--accent-mint-bg)" : "transparent",
              color: form.published ? "#2F7A5C" : "var(--text-dim)", fontWeight: 600,
            }}>{form.published ? "✓ Publicado" : "Sin publicar"}</button>
          </div>
        </div>

        {item.id && form.published && (
          <div className="field">
            <label>📊 Métricas de esta pieza</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
              <div className="field"><label>Alcance</label><input type="number" value={form.reach} onChange={(e) => set("reach", e.target.value)} /></div>
              <div className="field"><label>Visualizaciones</label><input type="number" value={form.views} onChange={(e) => set("views", e.target.value)} /></div>
              <div className="field"><label>Me gusta</label><input type="number" value={form.likes} onChange={(e) => set("likes", e.target.value)} /></div>
              <div className="field"><label>Comentarios</label><input type="number" value={form.comments} onChange={(e) => set("comments", e.target.value)} /></div>
              <div className="field"><label>Reposts</label><input type="number" value={form.reposts} onChange={(e) => set("reposts", e.target.value)} /></div>
              <div className="field"><label>Guardado</label><input type="number" value={form.saved} onChange={(e) => set("saved", e.target.value)} /></div>
              <div className="field"><label>Compartido entre usuarios</label><input type="number" value={form.shared_between_users} onChange={(e) => set("shared_between_users", e.target.value)} /></div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button type="button" className="btn ghost" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
          <button type="button" className="btn primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
        </div>
      </div>
    </div>
  );
}
