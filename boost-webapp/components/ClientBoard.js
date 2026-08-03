"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import PostModal from "@/components/PostModal";
import EjesCard from "@/components/EjesCard";
import EditClientModal from "@/components/EditClientModal";
import AccountInfoCard from "@/components/AccountInfoCard";
import ExportPlanningButton from "@/components/ExportPlanningButton";

const TYPE_COLOR = { Carrusel: "#C42B2B", Reel: "#8B1414", Historia: "#E38A8A", Estatico: "#D96666" };
const TYPE_SHORT = { Carrusel: "Carrusel", Reel: "Reel", Historia: "Historia", Estatico: "Estático" };
const PLATFORM_COLOR = { ig: "var(--ig, #D6266E)", fb: "var(--fb, #1877F2)", tk: "var(--tk, #111111)" };
const PLATFORM_LABEL = { ig: "IG", fb: "FB", tk: "TT" };

function shade(hex, percent) {
  // aclara (percent>0) u oscurece (percent<0) un color hex simple
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (n >> 16) + Math.round(255 * percent)));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + Math.round(255 * percent)));
  const b = Math.min(255, Math.max(0, (n & 0xff) + Math.round(255 * percent)));
  return `rgb(${r},${g},${b})`;
}

export default function ClientBoard({ client, initialPosts, initialEjes }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [monthCursor, setMonthCursor] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalPost, setModalPost] = useState(null); // null = closed, {} = new, {...} = editing
  const [editingClient, setEditingClient] = useState(false);

  useEffect(() => {
    const postId = searchParams.get("post");
    if (postId) {
      const found = initialPosts.find((p) => p.id === postId);
      if (found) setModalPost(found);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const supabase = createClient();
  const accent = client.color || "#C42B2B";

  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const monthLabel = monthCursor.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const byDay = {};
  initialPosts.forEach((p) => {
    const d = new Date(p.post_date + "T00:00:00");
    if (d.getFullYear() === year && d.getMonth() === month) {
      (byDay[d.getDate()] ??= []).push(p);
    }
  });

  const today = new Date();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const shown = selectedDay
    ? byDay[selectedDay] || []
    : initialPosts.slice().sort((a, b) => new Date(a.post_date) - new Date(b.post_date));

  const postsThisMonth = initialPosts
    .filter((p) => {
      const d = new Date(p.post_date + "T00:00:00");
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .sort((a, b) => new Date(a.post_date) - new Date(b.post_date));
  const ejesThisMonth = initialEjes.find((e) => e.month === monthKey)?.content || "";

  async function handleDeletePost(id) {
    if (!confirm("¿Eliminar esta publicación?")) return;
    await supabase.from("posts").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 0 50px" }}>
      <div style={{
        background: `linear-gradient(135deg, ${shade(accent, -0.15)}, ${shade(accent, 0.25)})`,
        padding: "18px 20px 28px", color: "#fff", position: "relative",
      }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/" className="btn ghost" style={{ marginBottom: 14, display: "inline-flex", color: "#fff", borderColor: "#ffffff55" }}>← Cuentas</Link>
          <Link href={`/metrics/${client.id}`} className="btn ghost" style={{ marginBottom: 14, display: "inline-flex", color: "#fff", borderColor: "#ffffff55" }}>📊 Ver métricas</Link>
          <ExportPlanningButton client={client} posts={postsThisMonth} ejesText={ejesThisMonth} monthLabel={monthLabel} monthKey={monthKey} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10 }}>
          <div style={{ fontSize: 40, width: 62, height: 62, borderRadius: 16, background: "#ffffff2A", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {client.logo_url ? <img src={client.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : client.emoji}
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 23 }}>{client.name}</div>
            <div style={{ fontSize: 14.5, opacity: 0.9 }}>{client.owner} · {client.plan}</div>
          </div>
          <span style={{
            marginLeft: "auto", fontSize: 12.5, fontWeight: 700, padding: "4px 10px", borderRadius: 20, textTransform: "uppercase",
            color: "#fff", background: client.status === "Activo" ? "#00000030" : "#00000045",
          }}>{client.status}</span>
          <button onClick={() => setEditingClient(true)} className="btn ghost" style={{ color: "#fff", borderColor: "#ffffff55", marginLeft: 8 }}>✎</button>
        </div>
      </div>

      {editingClient && <EditClientModal client={client} onClose={() => setEditingClient(false)} />}

      <div style={{ padding: "18px 32px 0", display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ width: 440, maxWidth: "100%", flexShrink: 0 }}>
          <EjesCard clientId={client.id} monthKey={monthKey} monthLabel={monthLabel} initialEjes={initialEjes} onSaved={() => router.refresh()} />
          <AccountInfoCard client={client} />

          <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <button className="btn ghost" onClick={() => { setMonthCursor(new Date(year, month - 1, 1)); setSelectedDay(null); }}>‹</button>
              <div style={{ fontWeight: 600, textTransform: "capitalize" }}>{monthLabel}</div>
              <button className="btn ghost" onClick={() => { setMonthCursor(new Date(year, month + 1, 1)); setSelectedDay(null); }}>›</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 4 }}>
              {["D", "L", "M", "M", "J", "V", "S"].map((d, i) => (
                <div key={i} style={{ textAlign: "center", fontSize: 12.5, color: "var(--text-dim)" }}>{d}</div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
              {cells.map((d, i) => {
                const dayPosts = d ? byDay[d] || [] : [];
                const isSelected = d === selectedDay;
                const isToday = d && year === today.getFullYear() && month === today.getMonth() && d === today.getDate();
                const firstPost = dayPosts[0];
                const extra = dayPosts.length - 1;
                return (
                  <button
                    key={i}
                    disabled={!d}
                    onClick={() => setSelectedDay(isSelected ? null : d)}
                    style={{
                      minHeight: 92, border: "none", borderRadius: 9, cursor: d ? "pointer" : "default",
                      background: isSelected ? accent : "transparent",
                      outline: isToday && !isSelected ? `1px solid ${accent}` : "none",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: 3, padding: "4px 3px",
                    }}
                  >
                    {d && <span style={{ fontSize: 13.5, color: isSelected ? "#fff" : "#5A3232" }}>{d}</span>}
                    {firstPost && (
                      <span style={{
                        fontSize: 9.5, fontWeight: 700, padding: "3px 4px", borderRadius: 4, width: "100%",
                        display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
                        textAlign: "center", lineHeight: 1.25, wordBreak: "break-word",
                        color: isSelected ? (TYPE_COLOR[firstPost.type] || accent) : "#fff",
                        background: isSelected ? "#fff" : (TYPE_COLOR[firstPost.type] || "#B07A7A"),
                      }}>{firstPost.title}</span>
                    )}
                    {extra > 0 && (
                      <span style={{ fontSize: 9.5, color: isSelected ? "#fff" : "var(--text-dim)" }}>+{extra}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 320 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 12px" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16.5 }}>
              {selectedDay ? `Día ${selectedDay}` : "Todas las publicaciones"}
            </div>
            <button className="btn primary" onClick={() => setModalPost({ client_id: client.id, post_date: selectedDay ? new Date(year, month, selectedDay).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10) })}>
              + Pieza
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {shown.length === 0 && <div style={{ color: "var(--text-dim)", fontSize: 15, padding: "20px 4px" }}>No hay publicaciones acá todavía.</div>}
            {shown.map((p) => (
              <div key={p.id} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", margin: 0, borderLeft: `4px solid ${TYPE_COLOR[p.type] || accent}` }} onClick={() => setModalPost(p)}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{p.title}</div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, padding: "3px 8px", borderRadius: 6, color: "#fff", background: TYPE_COLOR[p.type] }}>{p.type.toUpperCase()}</span>
                    {(p.platforms || []).map((pl) => (
                      <span key={pl} style={{ fontSize: 12, fontWeight: 700, padding: "3px 7px", borderRadius: 6, color: "#fff", background: PLATFORM_COLOR[pl] }}>{PLATFORM_LABEL[pl]}</span>
                    ))}
                    <span style={{ fontSize: 13, color: "var(--text-dim)" }}>{new Date(p.post_date + "T00:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}</span>
                    {p.links && p.links.split("\n").map((l) => l.trim()).filter(Boolean).map((l, i) => (
                      <a key={i} href={l} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ fontSize: 13, color: "var(--red-dark)", textDecoration: "underline" }}>
                        🔗 {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
                <span style={{ fontSize: 13, color: "var(--text-dim)", flexShrink: 0, marginLeft: 8 }}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modalPost && (
        <PostModal
          post={modalPost}
          onClose={() => { setModalPost(null); router.refresh(); }}
          onDelete={modalPost.id ? () => { handleDeletePost(modalPost.id); setModalPost(null); } : null}
          onSaved={() => { setModalPost(null); router.refresh(); }}
        />
      )}
    </div>
  );
}
