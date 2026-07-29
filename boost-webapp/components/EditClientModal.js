"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cropAndResizeImage } from "@/lib/imageUtils";

export default function EditClientModal({ client, onClose }) {
  const [emoji, setEmoji] = useState(client.emoji || "⭐");
  const [name, setName] = useState(client.name || "");
  const [owner, setOwner] = useState(client.owner || "");
  const [plan, setPlan] = useState(client.plan || "");
  const [status, setStatus] = useState(client.status || "Activo");
  const [color, setColor] = useState(client.color || "#C42B2B");
  const [logoUrl, setLogoUrl] = useState(client.logo_url || "");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleLogoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { alert("El logo no puede pesar más de 8MB."); return; }
    setSaving(true);
    const supabase = createClient();
    try {
      const processed = await cropAndResizeImage(file, 400);
      const path = `client-${client.id}-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from("logos").upload(path, processed, { upsert: true, contentType: "image/jpeg" });
      if (upErr) { alert("No se pudo subir el logo: " + upErr.message); setSaving(false); return; }
      const { data } = supabase.storage.from("logos").getPublicUrl(path);
      setLogoUrl(data.publicUrl + "?t=" + Date.now());
    } catch (err) {
      alert("No se pudo procesar la imagen.");
    }
    setSaving(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("clients").update({ emoji, name, owner, plan, status, color, logo_url: logoUrl }).eq("id", client.id);
    setSaving(false);
    if (error) { alert("No se pudo guardar: " + error.message); return; }
    onClose();
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${client.name}" y todas sus publicaciones? Esta acción no se puede deshacer.`)) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("clients").delete().eq("id", client.id);
    setSaving(false);
    if (error) { alert("No se pudo eliminar: " + error.message); return; }
    router.push("/");
    router.refresh();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000055", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 70 }}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={handleSave} className="card" style={{ width: 380, maxHeight: "88vh", overflowY: "auto" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 17.5, marginTop: 0 }}>Editar cuenta</h2>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ width: 70, height: 70, borderRadius: 16, overflow: "hidden", background: "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>
            {logoUrl ? <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : emoji}
          </div>
        </div>
        <div className="field"><label>Logo de la marca</label><input type="file" accept="image/*" onChange={handleLogoChange} /></div>
        <div className="field"><label>Emoji (si no tenés logo)</label><input value={emoji} onChange={(e) => setEmoji(e.target.value)} /></div>
        <div className="field"><label>Nombre</label><input value={name} onChange={(e) => setName(e.target.value)} required /></div>
        <div className="field"><label>Dueño / contacto</label><input value={owner} onChange={(e) => setOwner(e.target.value)} /></div>
        <div className="field"><label>Plan</label><input value={plan} onChange={(e) => setPlan(e.target.value)} /></div>
        <div className="field">
          <label>Estado</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>Activo</option>
            <option>Pausa</option>
          </select>
        </div>
        <div className="field"><label>Color de la cuenta</label><input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ height: 42, padding: 4 }} /></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="btn ghost" style={{ color: "var(--red-dark)", borderColor: "var(--red-dark)" }} onClick={handleDelete} disabled={saving}>Eliminar</button>
          <button type="button" className="btn ghost" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn primary" style={{ flex: 1 }} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
        </div>
      </form>
    </div>
  );
}
