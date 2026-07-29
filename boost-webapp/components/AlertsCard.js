export default function AlertsCard({ alerts }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="card" style={{ background: "#FDEAEA", borderColor: "#F0B8B8" }}>
      <div style={{ fontSize: 12.5, color: "var(--red-dark)", textTransform: "uppercase", letterSpacing: .4, fontWeight: 700, marginBottom: 10 }}>
        ⚠️ Alertas ({alerts.length})
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {alerts.map((a, i) => (
          <a key={i} href={`/clients/${a.clientId}`} style={{
            display: "block", textDecoration: "none", color: "var(--text)", fontSize: 14, lineHeight: 1.5,
            padding: "8px 10px", background: "#fff", borderRadius: 8, border: "1px solid #F0B8B8",
          }}>
            {a.severity === "vencida" && <span style={{ color: "var(--red-dark)", fontWeight: 700 }}>🔴 </span>}
            {a.severity === "urgente" && <span style={{ color: "#C97A1E", fontWeight: 700 }}>🟠 </span>}
            {a.severity === "estancada" && <span style={{ color: "#8B5FBF", fontWeight: 700 }}>🟣 </span>}
            {a.text}
          </a>
        ))}
      </div>
    </div>
  );
}
