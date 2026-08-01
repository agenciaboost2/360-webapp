"use client";
import { useState } from "react";
import Script from "next/script";

const CONTENT_LABEL = {
  Carrusel: "Contenido del carrusel",
  Reel: "Guion",
  Historia: "Indicaciones de contenido",
  Estatico: "Indicaciones de contenido",
};

function textParagraphs(docxLib, text) {
  const { Paragraph, TextRun } = docxLib;
  return String(text || "")
    .split("\n")
    .map((line) => new Paragraph({ children: [new TextRun(line.trim() === "" ? " " : line)], spacing: { after: 80 } }));
}

function labeledParagraph(docxLib, label, value) {
  const { Paragraph, TextRun } = docxLib;
  return new Paragraph({
    children: [new TextRun({ text: `${label}: `, bold: true }), new TextRun(value)],
    spacing: { after: 80 },
  });
}

export default function ExportPlanningButton({ client, posts, ejesText, monthLabel, monthKey }) {
  const [ready, setReady] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function handleExport() {
    if (!window.docx) {
      alert("Todavía se está cargando el generador de Word, esperá un segundo y probá de nuevo.");
      return;
    }
    setGenerating(true);
    const docxLib = window.docx;
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = docxLib;
    const monthLabelCap = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

    const children = [];

    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ text: client.name, bold: true, size: 32 })],
    }));
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC", space: 8 } },
      children: [new TextRun({ text: `Planificación de contenido — ${monthLabelCap}`, size: 22 })],
    }));

    if (ejesText && ejesText.trim()) {
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 }, children: [new TextRun({ text: "Ejes de comunicación del mes", color: "8B1414" })] }));
      children.push(...textParagraphs(docxLib, ejesText));
    }

    if (posts.length === 0) {
      children.push(new Paragraph({ children: [new TextRun({ text: "No hay publicaciones cargadas para este mes todavía.", italics: true })] }));
    }

    posts.forEach((p, idx) => {
      const num = String(idx + 1).padStart(2, "0");
      children.push(new Paragraph({
        heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 },
        children: [new TextRun({ text: `Post ${num} — ${p.type}`, color: "8B1414" })],
      }));
      children.push(new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: `"${p.title}"`, bold: true })] }));
      if (p.objective) children.push(labeledParagraph(docxLib, "Objetivo", p.objective));
      if (p.script) {
        children.push(new Paragraph({ spacing: { before: 100, after: 60 }, children: [new TextRun({ text: CONTENT_LABEL[p.type] || "Contenido", bold: true })] }));
        children.push(...textParagraphs(docxLib, p.script));
      }
      if (p.links) {
        children.push(new Paragraph({ spacing: { before: 100, after: 60 }, children: [new TextRun({ text: "Material / referencias", bold: true })] }));
        children.push(...textParagraphs(docxLib, p.links));
      }
      if (p.caption) {
        children.push(new Paragraph({ spacing: { before: 100, after: 60 }, children: [new TextRun({ text: "Caption", bold: true })] }));
        children.push(...textParagraphs(docxLib, p.caption));
      }
      if (p.notes) children.push(labeledParagraph(docxLib, "Notas", p.notes));
      children.push(new Paragraph({
        spacing: { before: 150, after: 150 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD", space: 4 } },
        children: [new TextRun("")],
      }));
    });

    const doc = new Document({
      sections: [{ properties: {}, children }],
      styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
    });

    try {
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Planificacion_${client.name.replace(/\s+/g, "")}_${monthLabelCap.replace(/\s+/g, "")}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (err) {
      alert("No se pudo generar el Word: " + err.message);
    }
    setGenerating(false);
  }

  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.js" strategy="afterInteractive" onLoad={() => setReady(true)} />
      <button className="btn ghost" style={{ color: "#fff", borderColor: "#ffffff55" }} onClick={handleExport} disabled={generating}>
        {generating ? "Generando..." : "⬇ Descargar planificación (Word)"}
      </button>
    </>
  );
}
