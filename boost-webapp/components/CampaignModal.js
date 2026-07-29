"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function n(v) { const x = parseFloat(v); return isNaN(x) ? 0 : x; }
function fmt(v, dec = 0) { return Number(v).toLocaleString("es-AR", { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
function fmtMoney(v) { return "$" + fmt(v, 2); }
function currentMonthKey() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }

export default function CampaignModal({ campaign, onClose, onSaved }) {
  const [form, setForm] = useState({
    month: campaign.month || currentMonthKey(),
    name: campaign.name || "", objective: campaign.objective || "",
    spend: campaign.spend ?? 0, reach: campaign.reach ?? 0, impressions: campaign.impressions ?? 0,
    clicks: campaign.clicks ?? 0, results: campaign.results ?? 0, result_type: campaign.result_type || "",
    notes: campaign.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const ctr = n(form.impressions) > 0 ? (n(form.clicks) / n(form.impressions)) * 100 : 0;
  const cpc = n(form.clicks) > 0 ? n(form.spend) / n(form.clicks) : 0;
  const cpm = n(form.impressions) > 0 ? (n(form.spend) / n(form.impressions)) * 1000 : 0;
  const costPerResult = n(form.results) > 0 ? n(form.spend) / n(form.results) : 0;

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    let error;
    if (campaign.id) {
      ({ error } = await supabase.from("ad_campaigns").update(form).eq("id", campaign.id));
    } else {
      ({ error } = await supabase.from("ad_campaigns").insert({ ...form, client_id: campaign.client_id }));
    }
    setSaving(false);
    if (error) { alert("No se pudo guardar: " + error.message); return; }
    onSaved();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000040", display: "flex", alignItems: "stretch", justifyContent: "flex-end", zIndex: 60 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 560, height: "100%", overflowY: "auto", background: "var(--bg2)", borderLeft: "1px solid var(--border)", boxShadow: "-8px 0 24px #00000022", padding: 28 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, marginTop: 0 }}>Campaña de pauta</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <div className="field"><label>Mes</label><input type="month" value={form.month} onChange={(e) => set("month", e.target.value)} /></div>
          <div className="field"><label>Nombre de campaña</label><input value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div className="field"><label>Objetivo</label><input value={form.objective} onChange={(e) => set("objective", e.target.value)} placeholder="Interacción, Tráfico..." /></div>
          <div className="field"><label>Inversión ($)</label><input type="number" step="0.01" value={form.spend} onChange={(e) => set("spend", e.target.value)} /></div>
          <div className="field"><label>Alcance</label><input type="number" value={form.reach} onChange={(e) => set("reach", e.target.value)} /></div>
          <div className="field"><label>Impresiones</label><input type="number" value={form.impressions} onChange={(e) => set("impressions", e.target.value)} /></div>
          <div className="field"><label>Clics</label><input type="number" value={form.clicks} onChange={(e) => set("clicks", e.target.value)} /></div>
          <div className="field"><label>Resultados</label><input type="number" value={form.results} onChange={(e) => set("results", e.target.value)} /></div>
          <div className="field"><label>Tipo de resultado</label><input value={form.result_type} onChange={(e) => set("result_type", e.target.value)} placeholder="ThruPlays, visitas..." /></div>
        </div>
        <div className="field"><label>Notas</label><textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>

        <div style={{ display: "flex", gap: 20, padding: "14px 16px", background: "var(--bg3)", borderRadius: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <div><div style={{ fontSize: 12, color: "var(--text-dim)" }}>CTR</div><b style={{ fontSize: 18 }}>{fmt(ctr, 2)}%</b></div>
          <div><div style={{ fontSize: 12, color: "var(--text-dim)" }}>CPC</div><b style={{ fontSize: 18 }}>{fmtMoney(cpc)}</b></div>
          <div><div style={{ fontSize: 12, color: "var(--text-dim)" }}>CPM</div><b style={{ fontSize: 18 }}>{fmtMoney(cpm)}</b></div>
          <div><div style={{ fontSize: 12, color: "var(--text-dim)" }}>Costo/resultado</div><b style={{ fontSize: 18 }}>{fmtMoney(costPerResult)}</b></div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn ghost" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
          <button className="btn primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
        </div>
      </div>
    </div>
  );
}
