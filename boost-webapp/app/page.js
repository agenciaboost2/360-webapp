import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import NewClientForm from "@/components/NewClientForm";
import AppNav from "@/components/AppNav";
import NotesCard from "@/components/NotesCard";
import AlertsCard from "@/components/AlertsCard";
import TeamRemindersCard from "@/components/TeamRemindersCard";
import ExtraRequestsCard from "@/components/ExtraRequestsCard";

export const dynamic = "force-dynamic";

function computeAlerts(posts) {
  const alerts = [];
  const now = new Date();
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  posts.forEach((p) => {
    const client = p.clients;
    if (!client) return;
    const postDate = new Date(p.post_date + "T00:00:00");
    const daysUntil = Math.round((postDate - todayMid) / 86400000);

    if (p.status !== "Publicado" && daysUntil <= 2) {
      let severity = daysUntil < 0 ? "vencida" : "urgente";
      let when = daysUntil < 0 ? `venció hace ${Math.abs(daysUntil)} día(s)` : daysUntil === 0 ? "vence hoy" : `vence en ${daysUntil} día(s)`;
      alerts.push({
        clientId: client.id, severity,
        text: `"${p.title}" de ${client.name} ${when} y sigue en "${p.status}"`,
      });
    }

    if (p.status === "Diseñado" && p.updated_at) {
      const daysSince = Math.floor((now - new Date(p.updated_at)) / 86400000);
      if (daysSince >= 1) {
        alerts.push({
          clientId: client.id, severity: "estancada",
          text: `"${p.title}" de ${client.name} lleva ${daysSince} día(s) diseñada sin publicar`,
        });
      }
    }
  });

  const order = { vencida: 0, urgente: 1, estancada: 2 };
  return alerts.sort((a, b) => order[a.severity] - order[b.severity]);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  let { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile) {
    const defaultName = user.email ? user.email.split("@")[0] : "";
    await supabase.from("profiles").upsert({ id: user.id, full_name: defaultName });
    profile = { id: user.id, full_name: defaultName, avatar_url: "", notes: "" };
  }

  // Limpieza automática: borra publicaciones ya "Publicado" con más de 60 días
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  await supabase
    .from("posts")
    .delete()
    .eq("status", "Publicado")
    .lt("post_date", sixtyDaysAgo.toISOString().slice(0, 10));

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("name");

  const { data: posts } = await supabase
    .from("posts")
    .select("*, clients(id,name,emoji)")
    .neq("status", "Publicado");

  const { data: reminders } = await supabase
    .from("team_reminders")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: extraRequests } = await supabase
    .from("extra_requests")
    .select("*")
    .order("created_at", { ascending: false });

  const alerts = computeAlerts(posts || []);

  const pendingByClient = {};
  (posts || []).forEach((p) => {
    if (!p.clients || p.status !== "Idea") return;
    pendingByClient[p.clients.id] = (pendingByClient[p.clients.id] || 0) + 1;
  });

  return (
    <>
      <AppNav current="cuentas" profile={profile} userId={user.id} />
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "30px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, margin: 0 }}>
            ¡Hola, {profile?.full_name || "de nuevo"}! 👋
          </h1>
          <LogoutButton />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 28 }}>
          <AlertsCard alerts={alerts} />
          <NotesCard userId={user.id} initialNotes={profile?.notes} />
          <TeamRemindersCard reminders={reminders || []} userId={user.id} userName={profile?.full_name} lastSeen={profile?.reminders_last_seen} />
          <ExtraRequestsCard requests={extraRequests || []} userId={user.id} userName={profile?.full_name} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 21, margin: 0 }}>Cuentas</h2>
            <div style={{ fontSize: 14.5, color: "var(--text-dim)" }}>{clients?.length || 0} cuentas</div>
          </div>
          <NewClientForm />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 10 }}>
          {(clients || []).map((c) => (
            <Link key={c.id} href={`/clients/${c.id}`} className="card" style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: "var(--text)", padding: "14px 18px", margin: 0, borderLeft: `5px solid ${c.color || "var(--red)"}` }}>
              <div style={{
                width: 46, height: 46, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, background: `${c.color || "#C42B2B"}1A`, overflow: "hidden",
              }}>
                {c.logo_url ? <img src={c.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : c.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 17 }}>{c.name}</div>
                <div style={{ fontSize: 14, color: "var(--text-dim)" }}>{c.is_creative ? "Contenido creativo" : `${c.owner || ""} · ${c.plan || ""}`}</div>
              </div>
              {pendingByClient[c.id] > 0 && (
                <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 9px", borderRadius: 20, color: "#8B5C1E", background: "#F0C89A55", flexShrink: 0 }}>
                  {pendingByClient[c.id]} por diseñar
                </span>
              )}
              {c.is_creative ? (
                <span style={{ fontSize: 12.5, fontWeight: 600, padding: "4px 9px", borderRadius: 20, textTransform: "uppercase", color: "#5B8DEF", background: "#5B8DEF22", flexShrink: 0 }}>Creativo</span>
              ) : (
                <span style={{
                  fontSize: 12.5, fontWeight: 600, padding: "4px 9px", borderRadius: 20, textTransform: "uppercase", flexShrink: 0,
                  color: c.status === "Activo" ? "var(--red-dark)" : "#A65C1E",
                  background: c.status === "Activo" ? "#8B14141F" : "#F0C89A55",
                }}>{c.status}</span>
              )}
            </Link>
          ))}
          {(!clients || clients.length === 0) && (
            <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
              Todavía no hay cuentas cargadas. Agregá la primera arriba.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
