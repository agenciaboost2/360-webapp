"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const FIELDS = [
  ["month", "Mes", "month"], ["followers_total", "Seguidores (total)", "number"],
  ["new_followers", "Seguidores nuevos", "number"], ["unfollowed", "Dejaron de seguir", "number"],
  ["reach", "Alcance", "number"], ["likes", "Likes de contenido", "number"],
  ["comments", "Comentarios", "number"], ["reposts", "Reposts", "number"],
  ["saved", "Contenido guardado", "number"], ["shared_between_users", "Contenido compartido entre usuarios", "number"],
];

function n(v) { const x = parseFloat(v); return isNaN(x) ? 0 : x; }
function fmt(v, dec = 0) { return Number(v).toLocaleString("es-AR", { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
function currentMonthKey() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }

export default function OrganicModal({ record, onClose, onSaved }) {
  const [form, setForm] = useState({
    month: record.month || currentMonthKey(),
    followers_total: record.followers_total ?? 0, new_followers: record.new_followers ?? 0,
    unfollowed: record.unfollowed ?? 0, reach: record.reach ?? 0, likes: record.likes ?? 0,
    comments: record.comments ?? 0, reposts: record.reposts ?? 0, saved: record.saved ?? 0,
    shared_between_users: record.shared_between_users ?? 0, notes: record.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const netGrowth = n(form.new_followers) - n(form.unfollowed);
  const totalInteractions = n(form.likes) + n(form.comments) + n(form.reposts) + n(form.saved) + n(form.shared_between_users);
  const engagementRate = n(form.reach) > 0 ? (totalInteractions / n(form.reach)) * 100 : 0;

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const payload = { ...form, client_id: record.client_id };
    let error;
    if (record.id) {
      ({ error } = await supabase.from("organic_records").update(payload).eq("id", record.id));
    } else {
      ({ error } = await supabase.from("organic_records").upsert(payload, { onConflict: "client_id,month" }));
    }
    setSaving(false);
    if (error) { alert("No se pudo guardar: " + error.message); return; }
    onSaved();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000040", display: "flex", alignItems: "stretch", justifyContent: "flex-end", zIndex: 60 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 560, height: "100%", overflowY: "auto", background: "var(--bg2)", borderLeft: "1px solid var(--border)", boxShadow: "-8px 0 24px #00000022", padding: 28 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, marginTop: 0 }}>Registro orgánico mensual</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          {FIELDS.map(([key, label, type]) => (
            <div className="field" key={key}>
              <label>{label}</label>
              <input type={type} value={form[key]} onChange={(e) => set(key, e.target.value)} />
            </div>
          ))}
        </div>
        <div className="field"><label>Notas</label><textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>

        <div style={{ display: "flex", gap: 20, padding: "14px 16px", background: "var(--bg3)", borderRadius: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <div><div style={{ fontSize: 12, color: "var(--text-dim)" }}>Crecimiento neto</div><b style={{ fontSize: 18, color: netGrowth >= 0 ? "var(--accent-mint)" : "var(--red-dark)" }}>{netGrowth >= 0 ? "+" : ""}{fmt(netGrowth)}</b></div>
          <div><div style={{ fontSize: 12, color: "var(--text-dim)" }}>Interacciones totales</div><b style={{ fontSize: 18 }}>{fmt(totalInteractions)}</b></div>
          <div><div style={{ fontSize: 12, color: "var(--text-dim)" }}>Engagement rate</div><b style={{ fontSize: 18 }}>{fmt(engagementRate, 1)}%</b></div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn ghost" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
          <button className="btn primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
        </div>
      </div>
    </div>
  );
}
