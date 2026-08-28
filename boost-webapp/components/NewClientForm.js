"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewClientForm() {
  const [open, setOpen] = useState(false);
  const [emoji, setEmoji] = useState("⭐");
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [plan, setPlan] = useState("");
  const [color, setColor] = useState("#C42B2B");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSave(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("clients").insert({ emoji, name, owner, plan, color });
    setSaving(false);
    if (error) {
      alert("No se pudo guardar: " + error.message);
      return;
    }
    setOpen(false);
    setName(""); setOwner(""); setPlan(""); setEmoji("⭐"); setColor("#C42B2B");
    router.refresh();
  }

  if (!open) {
    return <button className="btn primary" onClick={() => setOpen(true)}>+ Cuenta</button>;
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000055", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={handleSave} className="card" style={{ width: 380 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 17.5, marginTop: 0 }}>Nueva cuenta</h2>
        <div className="field"><label>Emoji</label><input value={emoji} onChange={(e) => setEmoji(e.target.value)} /></div>
        <div className="field"><label>Nombre</label><input value={name} onChange={(e) => setName(e.target.value)} required /></div>
        <div className="field"><label>Dueño / contacto</label><input value={owner} onChange={(e) => setOwner(e.target.value)} /></div>
        <div className="field"><label>Plan</label><input value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="Ej: 10 piezas/mes" /></div>
        <div className="field"><label>Color de la cuenta</label><input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ height: 42, padding: 4 }} /></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="btn ghost" style={{ flex: 1 }} onClick={() => setOpen(false)}>Cancelar</button>
          <button type="submit" className="btn primary" style={{ flex: 1 }} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
        </div>
      </form>
    </div>
  );
}
