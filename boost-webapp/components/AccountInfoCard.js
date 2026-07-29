"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AccountInfoCard({ client }) {
  const [editing, setEditing] = useState(false);
  const [address, setAddress] = useState(client.address || "");
  const [whatsapp, setWhatsapp] = useState(client.whatsapp || "");
  const [accessNotes, setAccessNotes] = useState(client.access_notes || "");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("clients").update({ address, whatsapp, access_notes: accessNotes }).eq("id", client.id);
    setSaving(false);
    if (error) { alert("No se pudo guardar: " + error.message); return; }
    setEditing(false);
    router.refresh();
  }

  const hasInfo = client.address || client.whatsapp || client.access_notes;

  return (
    <div className="card" style={{ background: "var(--accent-mint-bg)", borderColor: "#BFE0D2" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: hasInfo || editing ? 10 : 0 }}>
        <label style={{ fontSize: 12.5, color: "#2F7A5C", textTransform: "uppercase", letterSpacing: .4, fontWeight: 700 }}>
          🔑 Datos de la cuenta
        </label>
        {!editing && (
          <button className="btn ghost" style={{ padding: "5px 10px", fontSize: 13 }} onClick={() => setEditing(true)}>
            {hasInfo ? "✎ Editar" : "+ Agregar"}
          </button>
        )}
      </div>

      {editing ? (
        <>
          <div className="field"><label>Dirección</label><input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
          <div className="field"><label>WhatsApp</label><input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+54 9 ..." /></div>
          <div className="field">
            <label>Accesos (usuarios, contraseñas, redes)</label>
            <textarea rows={6} value={accessNotes} onChange={(e) => setAccessNotes(e.target.value)} placeholder={"Instagram\nUsuario: ...\nContraseña: ...\n\nFacebook\nUsuario: ...\nContraseña: ..."} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn ghost" style={{ flex: 1 }} onClick={() => setEditing(false)}>Cancelar</button>
            <button className="btn primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
          </div>
        </>
      ) : hasInfo ? (
        <div style={{ fontSize: 14, lineHeight: 1.6 }}>
          {client.address && <div><b>Dirección:</b> {client.address}</div>}
          {client.whatsapp && <div><b>WhatsApp:</b> {client.whatsapp}</div>}
          {client.access_notes && <div style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>{client.access_notes}</div>}
        </div>
      ) : (
        <div style={{ fontSize: 13, color: "#2F7A5C" }}>Sin datos cargados todavía.</div>
      )}
    </div>
  );
}
