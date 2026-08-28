"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CreativeModal from "@/components/CreativeModal";

const TYPE_COLOR = { Carrusel: "#C42B2B", Reel: "#8B1414", Historia: "#E38A8A" };
const TERRITORY_LABEL = {
  A: "Territorio A — Somos santiagueños",
  B: "Territorio B — Las cosas como son",
  C: "Territorio C — Esto pasó de verdad",
  D: "Territorio D — 360 sabe",
};

function fmtDate(d) {
  if (!d) return "-";
  return new Date(d + "T00:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function CreativeBoard({ items, userId, userName }) {
  const [modalItem, setModalItem] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete(id) {
    if (!confirm("¿Eliminar esta idea?")) return;
    await supabase.from("creative_content").delete().eq("id", id);
    router.refresh();
  }

  async function togglePublished(item) {
    await supabase.from("creative_content").update({ published: !item.published }).eq("id", item.id);
    router.refresh();
  }

  return (
    <div style={{ maxWidth: 1300, margin: "0 auto", padding: "30px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, margin: 0 }}>Contenido creativo</h1>
          <div style={{ fontSize: 14.5, color: "var(--text-dim)" }}>Espacio para armar ideas, sin calendario — {items.length} ideas</div>
        </div>
        <button className="btn primary" onClick={() => setModalItem({})}>+ Nueva idea</button>
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        {items.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-dim)", padding: 30 }}>Todavía no hay ideas cargadas.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-dim)", fontSize: 12, textTransform: "uppercase" }}>
                <th style={{ padding: "8px 10px" }}>Nombre</th>
                <th style={{ padding: "8px 10px" }}>Título</th>
                <th style={{ padding: "8px 10px" }}>Tipo</th>
                <th style={{ padding: "8px 10px" }}>Territorio</th>
                <th style={{ padding: "8px 10px" }}>Fecha estimativa</th>
                <th style={{ padding: "8px 10px", textAlign: "center" }}>Publicado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px", cursor: "pointer", fontWeight: 600 }} onClick={() => setModalItem(item)}>{item.name || "(sin nombre)"}</td>
                  <td style={{ padding: "10px", cursor: "pointer" }} onClick={() => setModalItem(item)}>{item.title}</td>
                  <td style={{ padding: "10px" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 8px", borderRadius: 6, color: "#fff", background: TYPE_COLOR[item.type] || "#999" }}>{item.type}</span>
                  </td>
                  <td style={{ padding: "10px", fontSize: 13 }}>{TERRITORY_LABEL[item.territory] || item.territory}</td>
                  <td style={{ padding: "10px" }}>{fmtDate(item.estimated_date)}</td>
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    <button onClick={() => togglePublished(item)} title="Marcar publicado" style={{
                      width: 26, height: 26, borderRadius: "50%", border: `2px solid ${item.published ? "var(--accent-mint)" : "var(--border)"}`,
                      background: item.published ? "var(--accent-mint)" : "transparent", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700,
                    }}>{item.published ? "✓" : ""}</button>
                  </td>
                  <td style={{ padding: "10px", textAlign: "right" }}>
                    <button className="btn ghost" style={{ padding: "5px 9px", marginRight: 6 }} onClick={() => setModalItem(item)}>✎</button>
                    <button className="btn ghost" style={{ padding: "5px 9px", color: "var(--red-dark)" }} onClick={() => handleDelete(item.id)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalItem && (
        <CreativeModal
          item={modalItem}
          userId={userId}
          userName={userName}
          onClose={() => setModalItem(null)}
          onSaved={() => { setModalItem(null); router.refresh(); }}
        />
      )}
    </div>
  );
}
