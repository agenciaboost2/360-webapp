"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import OrganicModal from "@/components/OrganicModal";
import CampaignModal from "@/components/CampaignModal";

function n(v) { const x = parseFloat(v); return isNaN(x) ? 0 : x; }
function fmt(v, dec = 0) { return Number(v).toLocaleString("es-AR", { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
function fmtMoney(v) { return "$" + fmt(v, 2); }
function monthLabel(key) {
  if (!key) return "-";
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("es-AR", { month: "short", year: "numeric" });
}
function organicCalc(o) {
  const netGrowth = n(o.new_followers) - n(o.unfollowed);
  const totalInteractions = n(o.likes) + n(o.comments) + n(o.reposts) + n(o.saved) + n(o.shared_between_users);
  const engagementRate = n(o.reach) > 0 ? (totalInteractions / n(o.reach)) * 100 : 0;
  return { netGrowth, totalInteractions, engagementRate };
}
function campaignCalc(c) {
  const ctr = n(c.impressions) > 0 ? (n(c.clicks) / n(c.impressions)) * 100 : 0;
  const cpc = n(c.clicks) > 0 ? n(c.spend) / n(c.clicks) : 0;
  const cpm = n(c.impressions) > 0 ? (n(c.spend) / n(c.impressions)) * 1000 : 0;
  const costPerResult = n(c.results) > 0 ? n(c.spend) / n(c.results) : 0;
  return { ctr, cpc, cpm, costPerResult };
}
function monthSubtotal(rows) {
  const t = { spend: 0, reach: 0, impressions: 0, clicks: 0, results: 0 };
  rows.forEach((c) => { t.spend += n(c.spend); t.reach += n(c.reach); t.impressions += n(c.impressions); t.clicks += n(c.clicks); t.results += n(c.results); });
  return { ...t, ...campaignCalc(t) };
}

export default function MetricsBoard({ client, initialOrganic, initialCampaigns }) {
  const router = useRouter();
  const [tab, setTab] = useState("organico");
  const [modalOrganic, setModalOrganic] = useState(null);
  const [modalCampaign, setModalCampaign] = useState(null);
  const supabase = createClient();

  async function deleteOrganic(id) {
    if (!confirm("¿Eliminar este registro mensual?")) return;
    await supabase.from("organic_records").delete().eq("id", id);
    router.refresh();
  }
  async function deleteCampaign(id) {
    if (!confirm("¿Eliminar esta campaña?")) return;
    await supabase.from("ad_campaigns").delete().eq("id", id);
    router.refresh();
  }

  const months = [...new Set(initialCampaigns.map((c) => c.month))].sort().reverse();

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "30px 40px" }}>
      <Link href="/metrics" className="btn ghost" style={{ marginBottom: 14, display: "inline-flex" }}>← Resumen</Link>

      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "10px 0 20px" }}>
        <div style={{ fontSize: 30 }}>{client.emoji}</div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21 }}>{client.name}</div>
          <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{client.owner} · {client.plan}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 18, borderBottom: "1px solid var(--border)" }}>
        <button onClick={() => setTab("organico")} style={{
          padding: "9px 4px", marginRight: 22, background: "none", border: "none", cursor: "pointer",
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
          color: tab === "organico" ? "var(--red-dark)" : "var(--text-dim)",
          borderBottom: tab === "organico" ? "2px solid var(--red-dark)" : "2px solid transparent",
        }}>Contenido orgánico</button>
        <button onClick={() => setTab("pauta")} style={{
          padding: "9px 4px", background: "none", border: "none", cursor: "pointer",
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
          color: tab === "pauta" ? "var(--red-dark)" : "var(--text-dim)",
          borderBottom: tab === "pauta" ? "2px solid var(--red-dark)" : "2px solid transparent",
        }}>Pauta publicitaria</button>
      </div>

      {tab === "organico" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button className="btn primary" onClick={() => setModalOrganic({ client_id: client.id })}>+ Agregar mes</button>
          </div>
          <div className="card" style={{ overflowX: "auto" }}>
            {initialOrganic.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--text-dim)", padding: 24 }}>Sin registros orgánicos todavía.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "var(--text-dim)", fontSize: 12, textTransform: "uppercase" }}>
                    <th style={{ padding: "8px 10px" }}>Mes</th>
                    <th style={{ padding: "8px 10px" }}>Seguidores</th>
                    <th style={{ padding: "8px 10px" }}>Crec. neto</th>
                    <th style={{ padding: "8px 10px" }}>Alcance</th>
                    <th style={{ padding: "8px 10px" }}>Interacciones</th>
                    <th style={{ padding: "8px 10px" }}>Engagement</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {initialOrganic.slice().reverse().map((o) => {
                    const c = organicCalc(o);
                    return (
                      <tr key={o.id} style={{ borderTop: "1px solid var(--border)" }}>
                        <td style={{ padding: "10px" }}>{monthLabel(o.month)}</td>
                        <td style={{ padding: "10px" }}>{fmt(o.followers_total)}</td>
                        <td style={{ padding: "10px", color: c.netGrowth >= 0 ? "var(--accent-mint)" : "var(--red-dark)" }}>{c.netGrowth >= 0 ? "+" : ""}{fmt(c.netGrowth)}</td>
                        <td style={{ padding: "10px" }}>{fmt(o.reach)}</td>
                        <td style={{ padding: "10px" }}>{fmt(c.totalInteractions)}</td>
                        <td style={{ padding: "10px" }}>{fmt(c.engagementRate, 1)}%</td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          <button className="btn ghost" style={{ padding: "5px 9px", marginRight: 6 }} onClick={() => setModalOrganic(o)}>✎</button>
                          <button className="btn ghost" style={{ padding: "5px 9px", color: "var(--red-dark)" }} onClick={() => deleteOrganic(o.id)}>✕</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === "pauta" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button className="btn primary" onClick={() => setModalCampaign({ client_id: client.id })}>+ Agregar campaña</button>
          </div>
          {months.length === 0 ? (
            <div className="card" style={{ textAlign: "center", color: "var(--text-dim)", padding: 24 }}>Sin campañas cargadas todavía.</div>
          ) : (
            months.map((m) => {
              const camps = initialCampaigns.filter((c) => c.month === m);
              const sub = monthSubtotal(camps);
              return (
                <div key={m} className="card" style={{ overflowX: "auto" }}>
                  <div style={{ fontWeight: 700, color: "var(--red-dark)", marginBottom: 10 }}>{monthLabel(m)}</div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                    <thead>
                      <tr style={{ textAlign: "left", color: "var(--text-dim)", fontSize: 11.5, textTransform: "uppercase" }}>
                        <th style={{ padding: "6px 8px" }}>Campaña</th>
                        <th style={{ padding: "6px 8px" }}>Objetivo</th>
                        <th style={{ padding: "6px 8px" }}>Inversión</th>
                        <th style={{ padding: "6px 8px" }}>Impresiones</th>
                        <th style={{ padding: "6px 8px" }}>Clics</th>
                        <th style={{ padding: "6px 8px" }}>CTR</th>
                        <th style={{ padding: "6px 8px" }}>CPC</th>
                        <th style={{ padding: "6px 8px" }}>CPM</th>
                        <th style={{ padding: "6px 8px" }}>Resultados</th>
                        <th style={{ padding: "6px 8px" }}>Costo/res.</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {camps.map((c) => {
                        const cc = campaignCalc(c);
                        return (
                          <tr key={c.id} style={{ borderTop: "1px solid var(--border)" }}>
                            <td style={{ padding: "8px" }}>{c.name || "(sin nombre)"}</td>
                            <td style={{ padding: "8px" }}>{c.objective || "-"}</td>
                            <td style={{ padding: "8px" }}>{fmtMoney(c.spend)}</td>
                            <td style={{ padding: "8px" }}>{fmt(c.impressions)}</td>
                            <td style={{ padding: "8px" }}>{fmt(c.clicks)}</td>
                            <td style={{ padding: "8px" }}>{fmt(cc.ctr, 2)}%</td>
                            <td style={{ padding: "8px" }}>{fmtMoney(cc.cpc)}</td>
                            <td style={{ padding: "8px" }}>{fmtMoney(cc.cpm)}</td>
                            <td style={{ padding: "8px" }}>{fmt(c.results)} {c.result_type && <span style={{ color: "var(--text-dim)" }}>· {c.result_type}</span>}</td>
                            <td style={{ padding: "8px" }}>{fmtMoney(cc.costPerResult)}</td>
                            <td style={{ padding: "8px", textAlign: "right" }}>
                              <button className="btn ghost" style={{ padding: "4px 8px", marginRight: 4 }} onClick={() => setModalCampaign(c)}>✎</button>
                              <button className="btn ghost" style={{ padding: "4px 8px", color: "var(--red-dark)" }} onClick={() => deleteCampaign(c.id)}>✕</button>
                            </td>
                          </tr>
                        );
                      })}
                      <tr style={{ borderTop: "2px solid var(--border)", fontWeight: 700, background: "var(--bg3)" }}>
                        <td style={{ padding: "8px" }} colSpan={2}>Subtotal del mes</td>
                        <td style={{ padding: "8px" }}>{fmtMoney(sub.spend)}</td>
                        <td style={{ padding: "8px" }}>{fmt(sub.impressions)}</td>
                        <td style={{ padding: "8px" }}>{fmt(sub.clicks)}</td>
                        <td style={{ padding: "8px" }}>{fmt(sub.ctr, 2)}%</td>
                        <td style={{ padding: "8px" }}>{fmtMoney(sub.cpc)}</td>
                        <td style={{ padding: "8px" }}>{fmtMoney(sub.cpm)}</td>
                        <td style={{ padding: "8px" }}>{fmt(sub.results)}</td>
                        <td style={{ padding: "8px" }}>{fmtMoney(sub.costPerResult)}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })
          )}
        </div>
      )}

      {modalOrganic && (
        <OrganicModal record={modalOrganic} onClose={() => setModalOrganic(null)} onSaved={() => { setModalOrganic(null); router.refresh(); }} />
      )}
      {modalCampaign && (
        <CampaignModal campaign={modalCampaign} onClose={() => setModalCampaign(null)} onSaved={() => { setModalCampaign(null); router.refresh(); }} />
      )}
    </div>
  );
}
