import { createClient } from "@/lib/supabase/server";
import { getUserAndProfile } from "@/lib/getProfile";
import Link from "next/link";
import AppNav from "@/components/AppNav";

export const dynamic = "force-dynamic";

function n(v) { const x = parseFloat(v); return isNaN(x) ? 0 : x; }
function fmt(v, dec = 0) { return Number(v).toLocaleString("es-AR", { minimumFractionDigits: dec, maximumFractionDigits: dec }); }

const TERRITORY_LABEL = { A: "Territorio A", B: "Territorio B", C: "Territorio C", D: "Territorio D" };

export default async function ContentPerformancePage() {
  const { profile } = await getUserAndProfile();
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("*, clients(name)")
    .eq("status", "Publicado");

  const { data: creative } = await supabase
    .from("creative_content")
    .select("*")
    .eq("published", true);

  const rows = [
    ...(posts || []).map((p) => ({
      id: "post-" + p.id, title: p.title, type: p.type, origin: p.clients?.name || "Cuenta",
      territory: null, date: p.post_date,
      reach: p.reach, views: p.views, likes: p.likes, comments: p.comments, reposts: p.reposts, saved: p.saved, shared: p.shared_between_users,
      link: `/clients/${p.client_id}?post=${p.id}`,
    })),
    ...(creative || []).map((c) => ({
      id: "creative-" + c.id, title: c.title, type: c.type, origin: "Contenido creativo",
      territory: TERRITORY_LABEL[c.territory] || c.territory, date: c.estimated_date,
      reach: c.reach, views: c.views, likes: c.likes, comments: c.comments, reposts: c.reposts, saved: c.saved, shared: c.shared_between_users,
      link: `/`,
    })),
  ].map((r) => {
    const interactions = n(r.likes) + n(r.comments) + n(r.reposts) + n(r.saved) + n(r.shared);
    const engagement = n(r.reach) > 0 ? (interactions / n(r.reach)) * 100 : 0;
    return { ...r, interactions, engagement };
  }).sort((a, b) => b.interactions - a.interactions);

  return (
    <>
      <AppNav current="metricas" profile={profile} />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "30px 40px" }}>
        <Link href="/metrics" className="btn ghost" style={{ marginBottom: 14, display: "inline-flex" }}>← Resumen</Link>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, margin: "10px 0 4px" }}>Rendimiento por pieza</h1>
        <div style={{ fontSize: 14.5, color: "var(--text-dim)", marginBottom: 20 }}>
          Comercial + Contenido creativo · {rows.length} piezas publicadas con métricas cargadas · ordenadas por interacciones
        </div>

        <div className="card" style={{ overflowX: "auto" }}>
          {rows.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--text-dim)", padding: 30 }}>
              Todavía no hay piezas publicadas con métricas cargadas. Entrá a una pieza publicada y completá el bloque "📊 Métricas de esta pieza".
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--text-dim)", fontSize: 12, textTransform: "uppercase" }}>
                  <th style={{ padding: "8px 10px" }}>Pieza</th>
                  <th style={{ padding: "8px 10px" }}>Origen</th>
                  <th style={{ padding: "8px 10px" }}>Tipo</th>
                  <th style={{ padding: "8px 10px" }}>Territorio</th>
                  <th style={{ padding: "8px 10px" }}>Alcance</th>
                  <th style={{ padding: "8px 10px" }}>Visualiz.</th>
                  <th style={{ padding: "8px 10px" }}>Interacciones</th>
                  <th style={{ padding: "8px 10px" }}>Engagement</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} style={{ borderTop: "1px solid var(--border)", background: i < 3 ? "var(--accent-gold-bg)" : "transparent" }}>
                    <td style={{ padding: "10px", fontWeight: 600 }}>
                      <Link href={r.link} style={{ color: "var(--text)", textDecoration: "none" }}>
                        {i < 3 && "🏆 "}{r.title}
                      </Link>
                    </td>
                    <td style={{ padding: "10px" }}>{r.origin}</td>
                    <td style={{ padding: "10px" }}>{r.type}</td>
                    <td style={{ padding: "10px", fontSize: 13 }}>{r.territory || "-"}</td>
                    <td style={{ padding: "10px" }}>{fmt(r.reach)}</td>
                    <td style={{ padding: "10px" }}>{fmt(r.views)}</td>
                    <td style={{ padding: "10px", fontWeight: 700 }}>{fmt(r.interactions)}</td>
                    <td style={{ padding: "10px" }}>{fmt(r.engagement, 1)}%</td>
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
