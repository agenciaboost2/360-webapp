"use client";
import { useState } from "react";
import Script from "next/script";

const CONTENT_LABEL = {
  Carrusel: "Contenido del carrusel",
  Reel: "Guion",
  Historia: "Indicaciones de contenido",
  Estatico: "Indicaciones de contenido",
};

function escapeHtml(str) {
  return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function paragraphsFromText(text) {
  return escapeHtml(text).split("\n").map((line) => (line.trim() === "" ? "<p>&nbsp;</p>" : `<p>${line}</p>`)).join("");
}

export default function ExportPlanningButton({ client, posts, ejesText, monthLabel, monthKey }) {
  const [ready, setReady] = useState(false);

  function handleExport() {
    if (!window.htmlDocx) {
      alert("Todavía se está cargando el generador de Word, esperá un segundo y probá de nuevo.");
      return;
    }
    const monthLabelCap = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

    let body = `
      <div style="text-align:center">
        <h1 style="font-size:16pt;margin-bottom:2px">${escapeHtml(client.name)}</h1>
        <p style="margin-top:0">Planificación de contenido — ${monthLabelCap}</p>
      </div>
      <hr/>
    `;

    if (ejesText && ejesText.trim()) {
      body += `<h2>Ejes de comunicación del mes</h2>${paragraphsFromText(ejesText)}`;
    }

    if (posts.length === 0) {
      body += `<p><i>No hay publicaciones cargadas para este mes todavía.</i></p>`;
    }

    posts.forEach((p, idx) => {
      const num = String(idx + 1).padStart(2, "0");
      body += `<h2>Post ${num} — ${escapeHtml(p.type)}</h2>`;
      body += `<p><b>"${escapeHtml(p.title)}"</b></p>`;
      if (p.objective) body += `<p><b>Objetivo:</b> ${escapeHtml(p.objective)}</p>`;
      if (p.script) {
        body += `<p><b>${CONTENT_LABEL[p.type] || "Contenido"}</b></p>`;
        body += paragraphsFromText(p.script);
      }
      if (p.links) body += `<p><b>Material / referencias:</b></p>${paragraphsFromText(p.links)}`;
      if (p.caption) body += `<p><b>Caption</b></p>${paragraphsFromText(p.caption)}`;
      if (p.notes) body += `<p><b>Notas:</b> ${escapeHtml(p.notes)}</p>`;
      body += `<hr/>`;
    });

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      body{font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#1a1a1a;}
      h1{font-family:Calibri,Arial,sans-serif;}
      h2{font-size:13pt;margin-top:22px;margin-bottom:6px;color:#8B1414;}
      p{margin:4px 0;line-height:1.4;}
      hr{border:none;border-top:1px solid #ccc;margin:18px 0;}
    </style></head><body>${body}</body></html>`;

    const converted = window.htmlDocx.asBlob(html);
    const url = URL.createObjectURL(converted);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Planificacion_${client.name.replace(/\s+/g, "")}_${monthLabelCap.replace(/\s+/g, "")}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/html-docx-js@0.3.1/dist/html-docx.js" strategy="afterInteractive" onLoad={() => setReady(true)} />
      <button className="btn ghost" style={{ color: "#fff", borderColor: "#ffffff55" }} onClick={handleExport}>
        ⬇ Descargar planificación (Word)
      </button>
    </>
  );
}
