import { createClient } from "@/lib/supabase/server";
import { getUserAndProfile } from "@/lib/getProfile";
import Link from "next/link";
import AppNav from "@/components/AppNav";

export const dynamic = "force-dynamic";

function n(v) { const x = parseFloat(v); return isNaN(x) ? 0 : x; }
function fmt(v, dec = 0) { return Number(v).toLocaleString("es-AR", { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
function fmtMoney(v) { return "$" + fmt(v, 2); }

export default async function MetricsSummaryPage() {
  const { user, profile } = await getUserAndProfile();
  const supabase = await createClient();
  const { data: clients } = await supabase.from("clients").select("*").order("name");
  const { data: organic } = await supabase.from("organic_records").select("*");
  const { data: campaigns } = await supabase.from("ad_campaigns").select("*");

  const rows = (clients || []).map((c) => {
    const orgList = (organic || []).filter((o) => o.client_id === c.id).sort((a, b) => a.month.localeCompare(b.month));
    const org = orgList[orgList.length - 1];
    const camps = org ? (campaigns || []).filter((cp) => cp.client_id === c.id && cp.month === org.month) : [];
    const spend = camps.reduce((s, cp) => s + n(cp.spend), 0);
    const results = camps.reduce((s, cp) => s + n(cp.results), 0);
    const costPerResult = results > 0 ? spend / results : 0;
    const netGrowth = org ? n(org.new_followers) - n(org.unfollowed) : 0;
    const totalInteractions = org ? n(org.likes) + n(org.comments) + n(org.reposts) + n(org.saved) + n(org.shared_between_users) : 0;
    const engagement = org && n(org.reach) > 0 ? (totalInteractions / n(org.reach)) * 100 : 0;
    return { client: c, month: org?.month, followers: org ? n(org.followers_total) : 0, netGrowth, engagement, reach: org ? n(org.reach) : 0, spend, results, costPerResult };
  });

  const totalSpend = rows.reduce((s, r) => s + r.spend, 0);
  const totalReach = rows.reduce((s, r) => s + r.reach, 0);
  const avgEng = rows.length ? rows.reduce((s, r) => s + r.engagement, 0) / rows.length : 0;

  function monthLabel(key) {
    if (!key) return "-";
    const [y, m] = key.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString("es-AR", { month: "short", year: "numeric" });
  }

  return (
    <>
      <AppNav current="metricas" profile={profile} userId={user?.id} />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "30px 40px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 23, margin: "0 0 4px" }}>Métricas — Resumen</h1>
        <div style={{ fontSize: 14.5, color: "var(--text-dim)", marginBottom: 20 }}>{clients?.length || 0} cuentas · último mes cargado por cuenta</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 20 }}>
          <div className="card"><div style={{ fontSize: 12.5, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 6 }}>Inversión total</div><div style={{ fontSize: 22, fontWeight: 700, color: "var(--red-dark)" }}>{fmtMoney(totalSpend)}</div></div>
          <div className="card"><div style={{ fontSize: 12.5, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 6 }}>Alcance orgánico total</div><div style={{ fontSize: 22, fontWeight: 700, color: "var(--accent-blue)" }}>{fmt(totalReach)}</div></div>
          <div className="card"><div style={{ fontSize: 12.5, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 6 }}>Engagement promedio</div><div style={{ fontSize: 22, fontWeight: 700, color: "var(--accent-mint)" }}>{fmt(avgEng, 1)}%</div></div>
        </div>

        <div className="card" style={{ overflowX: "auto" }}>
          {rows.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--text-dim)", padding: 30 }}>Todavía no hay cuentas cargadas.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--text-dim)", fontSize: 12, textTransform: "uppercase" }}>
                  <th style={{ padding: "8px 10px" }}>Cuenta</th>
                  <th style={{ padding: "8px 10px" }}>Mes</th>
                  <th style={{ padding: "8px 10px" }}>Seguidores</th>
                  <th style={{ padding: "8px 10px" }}>Crec. neto</th>
                  <th style={{ padding: "8px 10px" }}>Engagement</th>
                  <th style={{ padding: "8px 10px" }}>Alcance</th>
                  <th style={{ padding: "8px 10px" }}>Inversión</th>
                  <th style={{ padding: "8px 10px" }}>Resultados</th>
                  <th style={{ padding: "8px 10px" }}>Costo/resultado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.client.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px" }}>
                      <Link href={`/metrics/${r.client.id}`} style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "var(--text)", fontWeight: 600 }}>
                        <span>{r.client.emoji}</span>{r.client.name}
                      </Link>
                    </td>
                    <td style={{ padding: "10px" }}>{monthLabel(r.month)}</td>
                    <td style={{ padding: "10px" }}>{fmt(r.followers)}</td>
                    <td style={{ padding: "10px", color: r.netGrowth >= 0 ? "var(--accent-mint)" : "var(--red-dark)" }}>{r.netGrowth >= 0 ? "+" : ""}{fmt(r.netGrowth)}</td>
                    <td style={{ padding: "10px" }}>{fmt(r.engagement, 1)}%</td>
                    <td style={{ padding: "10px" }}>{fmt(r.reach)}</td>
                    <td style={{ padding: "10px" }}>{fmtMoney(r.spend)}</td>
                    <td style={{ padding: "10px" }}>{fmt(r.results)}</td>
                    <td style={{ padding: "10px" }}>{r.costPerResult ? fmtMoney(r.costPerResult) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
