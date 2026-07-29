"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

const TYPES = ["Carrusel", "Reel", "Historia", "Estatico"];
const STATUSES = ["Idea", "Diseñado", "Publicado"];
const PLATFORMS = [
  { id: "ig", label: "Instagram", short: "IG", color: "#D6266E" },
  { id: "fb", label: "Facebook", short: "FB", color: "#1877F2" },
  { id: "tk", label: "TikTok", short: "TT", color: "#111111" },
];
const CONTENT_LABEL = {
  Carrusel: "Contenido del carrusel",
  Reel: "Guion e indicaciones de edición",
  Historia: "Indicaciones de contenido",
  Estatico: "Indicaciones de contenido",
};
const CONTENT_PLACEHOLDER = {
  Carrusel: "Escribí acá todo el contenido del carrusel como prefieras organizarlo: título y subtítulo de cada slide, palabras a remarcar, orden, lo que necesites.",
  Reel: "Escribí todo el guion junto: escenas, video, audio, texto en pantalla, edición...",
  Historia: "Texto, indicaciones de diseño, referencias, todo lo que necesite la diseñadora para armar esta pieza.",
  Estatico: "Texto, indicaciones de diseño, referencias, todo lo que necesite la diseñadora para armar esta pieza.",
};

export default function PostModal({ post, onClose, onDelete, onSaved }) {
  const [form, setForm] = useState({
    title: post.title || "Nueva publicación",
    objective: post.objective || "",
    type: post.type || "Carrusel",
    post_date: post.post_date || new Date().toISOString().slice(0, 10),
    status: post.status || "Idea",
    platforms: post.platforms || [],
    links: post.links || "",
    caption: post.caption || "",
    notes: post.notes || "",
    script: post.script || "",
  });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedId, setSavedId] = useState(post.id || null);
  const [saveStatus, setSaveStatus] = useState(""); // "", "guardando", "guardado"

  const initialSnapshot = useRef(JSON.stringify(form));
  const debounceRef = useRef(null);
  const savingRef = useRef(false);

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })); }
  function togglePlatform(id) {
    setForm((f) => ({ ...f, platforms: f.platforms.includes(id) ? f.platforms.filter((p) => p !== id) : [...f.platforms, id] }));
  }

  const linkRows = form.links.split("\n").length ? (form.links === "" ? [""] : form.links.split("\n")) : [""];
  function updateLink(idx, value) {
    const rows = [...linkRows];
    rows[idx] = value;
    set("links", rows.join("\n"));
  }
  function addLink() { set("links", [...linkRows, ""].join("\n")); }
  function removeLink(idx) {
    const rows = linkRows.filter((_, i) => i !== idx);
    set("links", rows.join("\n"));
  }

  // Autoguardado: cada vez que cambia el formulario, guarda solo a los 1.2s de inactividad
  useEffect(() => {
    const current = JSON.stringify(form);
    if (current === initialSnapshot.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { doSave(false); }, 1200);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  async function doSave(closeAfter) {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaveStatus("guardando");
    if (closeAfter) setSaving(true);
    const supabase = createClient();
    let error, newId = savedId;

    if (savedId) {
      ({ error } = await supabase.from("posts").update({ ...form, updated_at: new Date().toISOString() }).eq("id", savedId));
    } else {
      const { data, error: insErr } = await supabase.from("posts").insert({ ...form, client_id: post.client_id }).select().single();
      error = insErr;
      if (data) { newId = data.id; setSavedId(data.id); }
    }

    savingRef.current = false;
    if (closeAfter) setSaving(false);

    if (error) {
      setSaveStatus("");
      if (closeAfter) alert("No se pudo guardar: " + error.message);
      return false;
    }
    setSaveStatus("guardado");
    initialSnapshot.current = JSON.stringify(form);
    if (closeAfter) onSaved();
    return true;
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/clients/${post.client_id}?post=${savedId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000040", display: "flex", alignItems: "stretch", justifyContent: "flex-end", zIndex: 60 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 680, height: "100%", overflowY: "auto", background: "var(--bg2)", borderLeft: "1px solid var(--border)", boxShadow: "-8px 0 24px #00000022", padding: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <input value={form.title} onChange={(e) => set("title", e.target.value)} style={{ flex: 1, background: "transparent", border: "none", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, padding: 0, outline: "none", color: "var(--text)" }} />
          {saveStatus && (
            <span style={{ fontSize: 12, color: saveStatus === "guardando" ? "var(--text-dim)" : "var(--accent-mint)", flexShrink: 0, whiteSpace: "nowrap" }}>
              {saveStatus === "guardando" ? "Guardando..." : "✓ Guardado"}
            </span>
          )}
        </div>

        <div className="field"><label>Objetivo del posteo</label><input value={form.objective} onChange={(e) => set("objective", e.target.value)} /></div>

        <div className="field">
          <label>Tipo de contenido</label>
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

        <div style={{ display: "flex", gap: 12 }}>
          <div className="field" style={{ flex: 1 }}><label>Fecha</label><input type="date" value={form.post_date} onChange={(e) => set("post_date", e.target.value)} /></div>
          <div className="field" style={{ flex: 1 }}>
            <label>Estado</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="field">
          <label>Plataformas</label>
          <div style={{ display: "flex", gap: 8 }}>
            {PLATFORMS.map((p) => {
              const on = form.platforms.includes(p.id);
              return (
                <button key={p.id} type="button" onClick={() => togglePlatform(p.id)} style={{
                  width: 38, height: 38, borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 700,
                  border: `1px solid ${on ? p.color : "var(--border)"}`,
                  background: on ? p.color : "transparent",
                  color: on ? "#fff" : "var(--text-dim)",
                }}>{p.short}</button>
              );
            })}
          </div>
        </div>

        <div className="field">
          <label>{CONTENT_LABEL[form.type]}</label>
          <textarea rows={11} value={form.script} onChange={(e) => set("script", e.target.value)} placeholder={CONTENT_PLACEHOLDER[form.type]} />
        </div>

        <div className="field">
          <label>Enlace del contenido / referencia</label>
          {linkRows.map((l, idx) => (
            <div key={idx} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              <input value={l} onChange={(e) => updateLink(idx, e.target.value)} placeholder="https://drive.google.com/..." style={{ flex: 1 }} />
              {l.trim() && (
                <a href={l.trim()} target="_blank" rel="noopener noreferrer" title="Abrir" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 38, flexShrink: 0, border: "1px solid var(--border)", borderRadius: 8, color: "var(--red-dark)", textDecoration: "none" }}>↗</a>
              )}
              {linkRows.length > 1 && (
                <button type="button" onClick={() => removeLink(idx)} style={{ width: 30, flexShrink: 0, background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer" }}>✕</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addLink} style={{ background: "none", border: "none", color: "var(--red-dark)", fontSize: 13, cursor: "pointer", padding: 0 }}>+ Agregar otro enlace</button>
        </div>
        <div className="field"><label>Caption</label><textarea rows={3} value={form.caption} onChange={(e) => set("caption", e.target.value)} /></div>
        <div className="field"><label>Notas</label><textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>

        {savedId && (
          <div className="field">
            <label>Compartir esta publicación</label>
            <button type="button" className="btn ghost" style={{ width: "100%", justifyContent: "center" }} onClick={handleCopyLink}>
              {copied ? "✓ Enlace copiado" : "🔗 Copiar enlace para Gabi"}
            </button>
          </div>
        )}

        <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 14 }}>
          Se guarda solo mientras escribís, no hace falta que toques "Guardar" para no perder los cambios.
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {onDelete && <button type="button" className="btn ghost" style={{ color: "var(--red-dark)", borderColor: "var(--red-dark)" }} onClick={onDelete}>Eliminar</button>}
          <button type="button" className="btn ghost" style={{ flex: 1 }} onClick={onClose}>Cerrar</button>
          <button type="button" className="btn primary" style={{ flex: 1 }} onClick={() => doSave(true)} disabled={saving}>{saving ? "Guardando..." : "Guardar y cerrar"}</button>
        </div>
      </div>
    </div>
  );
}
