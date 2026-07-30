"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const TYPES = ["Carrusel", "Reel", "Historia", "Estatico"];
const TYPE_COLOR = { Carrusel: "#C42B2B", Reel: "#8B1414", Historia: "#E38A8A", Estatico: "#D96666" };

export default function ExtraRequestsCard({ requests, userId, userName }) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const [type, setType] = useState("Carrusel");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleAdd() {
    if (!text.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("extra_requests").insert({ text, type, created_by: userId, created_by_name: userName || "" });
    setSaving(false);
    if (error) { alert("No se pudo guardar: " + error.message); return; }
    setText(""); setType("Carrusel"); setAdding(false);
    router.refresh();
  }

  async function handleDelete(id) {
    const supabase = createClient();
    await supabase.from("extra_requests").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="card" style={{ background: "var(--accent-mint-bg)", borderColor: "#BFE0D2" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <label style={{ fontSize: 12.5, color: "#2F7A5C", textTransform: "uppercase", letterSpacing: .4, fontWeight: 700 }}>
          ✏️ Pedido extra
        </label>
        {!adding && <button className="btn ghost" style={{ padding: "5px 10px", fontSize: 13 }} onClick={() => setAdding(true)}>+ Agregar</button>}
      </div>

      {adding && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {TYPES.map((t) => (
              <button key={t} type="button" onClick={() => setType(t)} style={{
                padding: "6px 10px", borderRadius: 8, fontSize: 13, cursor: "pointer",
                border: `1px solid ${type === t ? "#2F7A5C" : "#BFE0D2"}`,
                background: type === t ? "#2F7A5C22" : "#fff",
                color: type === t ? "#2F7A5C" : "var(--text-dim)",
              }}>{t}</button>
            ))}
          </div>
          <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Ej: Historia con la nueva promo del finde" style={{ width: "100%", background: "#fff", border: "1px solid #BFE0D2", borderRadius: 8, padding: 10, fontSize: 14 }} />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="btn ghost" style={{ flex: 1 }} onClick={() => { setAdding(false); setText(""); }}>Cancelar</button>
            <button className="btn primary" style={{ flex: 1 }} onClick={handleAdd} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
          </div>
        </div>
      )}

      {(!requests || requests.length === 0) ? (
        <div style={{ fontSize: 14, color: "#2F7A5C" }}>Sin pedidos por ahora.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {requests.map((r) => (
            <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, background: "#fff", borderRadius: 8, padding: "8px 10px", border: "1px solid #BFE0D2" }}>
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 6, color: "#fff", background: TYPE_COLOR[r.type] || "#999", marginRight: 6 }}>{(r.type || "").toUpperCase()}</span>
                {r.text}
                <div style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 3 }}>{r.created_by_name || "Alguien del equipo"}</div>
              </div>
              <button onClick={() => handleDelete(r.id)} style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", flexShrink: 0 }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
