import { toPng } from "html-to-image";
import { getNodesBounds, getViewportForBounds, type Node } from "@xyflow/react";
import jsPDF from "jspdf";

async function render(nodes: Node[]) {
  const bounds = getNodesBounds(nodes);
  const pad = 60;
  const w = Math.max(800, Math.ceil(bounds.width + pad * 2));
  const h = Math.max(500, Math.ceil(bounds.height + pad * 2));
  const vp = getViewportForBounds(bounds, w, h, 0.2, 2, 0.05);
  const el = document.querySelector(".react-flow__viewport") as HTMLElement;
  const bg = getComputedStyle(document.body).backgroundColor || "#ffffff";
  const dataUrl = await toPng(el, {
    backgroundColor: bg, width: w, height: h, pixelRatio: 2, cacheBust: true,
    style: { width: `${w}px`, height: `${h}px`, transform: `translate(${vp.x}px, ${vp.y}px) scale(${vp.zoom})` },
  });
  return { dataUrl, w, h };
}

const safe = (s: string) => s.replace(/[^\w\-äöüÄÖÜ ]+/g, "").trim().replace(/\s+/g, "_") || "Organigramm";

export async function exportPng(nodes: Node[], title: string) {
  const { dataUrl } = await render(nodes);
  const a = document.createElement("a");
  a.href = dataUrl; a.download = `${safe(title)}.png`; a.click();
}

export async function exportPdf(nodes: Node[], title: string) {
  const { dataUrl, w, h } = await render(nodes);
  const pdf = new jsPDF({ orientation: w >= h ? "landscape" : "portrait", unit: "mm", format: "a3" });
  const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
  pdf.setFontSize(14); pdf.text(title, 12, 14);
  pdf.setFontSize(9); pdf.text(`SSM Partner AG · Stand ${new Date().toLocaleDateString("de-CH")}`, 12, 20);
  const maxW = pw - 24, maxH = ph - 34;
  const r = Math.min(maxW / w, maxH / h);
  pdf.addImage(dataUrl, "PNG", (pw - w * r) / 2, 26, w * r, h * r);
  pdf.save(`${safe(title)}.pdf`);
}
