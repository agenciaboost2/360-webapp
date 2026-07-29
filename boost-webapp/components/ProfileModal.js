"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cropAndResizeImage } from "@/lib/imageUtils";

export default function ProfileModal({ profile, userId, onClose }) {
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { alert("La imagen no puede pesar más de 8MB."); return; }
    setSaving(true);
    const supabase = createClient();
    try {
      const processed = await cropAndResizeImage(file, 400);
      const path = `${userId}-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from("logos").upload(path, processed, { upsert: true, contentType: "image/jpeg" });
      if (upErr) { alert("No se pudo subir la imagen: " + upErr.message); setSaving(false); return; }
      const { data } = supabase.storage.from("logos").getPublicUrl(path);
      setAvatarUrl(data.publicUrl + "?t=" + Date.now());
    } catch (err) {
      alert("No se pudo procesar la imagen.");
    }
    setSaving(false);
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").upsert({ id: userId, full_name: fullName, avatar_url: avatarUrl });
    setSaving(false);
    if (error) { alert("No se pudo guardar: " + error.message); return; }
    onClose();
    router.refresh();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000055", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 70 }}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: 340 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 17, marginTop: 0 }}>Mi perfil</h2>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ width: 76, height: 76, borderRadius: "50%", overflow: "hidden", background: "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, color: "var(--red-dark)" }}>
            {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (fullName?.[0]?.toUpperCase() || "?")}
          </div>
        </div>
        <div className="field"><label>Foto de perfil</label><input type="file" accept="image/*" onChange={handleFileChange} /></div>
        <div className="field"><label>Tu nombre</label><input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ej: Gabi" /></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn ghost" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
          <button className="btn primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
        </div>
      </div>
    </div>
  );
}
