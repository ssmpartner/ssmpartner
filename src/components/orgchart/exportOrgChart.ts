import { toPng } from "html-to-image";
import { getNodesBounds, getViewportForBounds, type Node } from "@xyflow/react";
import jsPDF from "jspdf";

const PAGE_BG = "#e9ecea";
const A4_RATIO = 297 / 210;

async function render(nodes: Node[], landscape: boolean) {
  const bounds = getNodesBounds(nodes);
  const pad = 60;
  const ratio = landscape ? A4_RATIO : 1 / A4_RATIO;
  let w = Math.ceil(bounds.width + pad * 2), h = Math.ceil(bounds.height + pad * 2);
  if (w / h > ratio) h = Math.ceil(w / ratio); else w = Math.ceil(h * ratio);
  w = Math.max(w, 1100); h = Math.round(w / ratio);
  const vp = getViewportForBounds(bounds, w, h, 0.05, 4, 0.06);
  const el = document.querySelector(".react-flow__viewport") as HTMLElement;

  // Inline edge styles so html-to-image renders the SVG connection lines
  const paths = Array.from(el.querySelectorAll<SVGPathElement>(".react-flow__edge-path"));
  const prev = paths.map((p) => p.getAttribute("style"));
  paths.forEach((p) => {
    const cs = getComputedStyle(p);
    const stroke = cs.stroke && cs.stroke !== "none" ? cs.stroke : "#243e3a";
    p.style.stroke = stroke.includes("var(") ? "#243e3a" : stroke;
    p.style.strokeWidth = cs.strokeWidth || "1.5";
    p.style.fill = "none";
  });
  try {
    const dataUrl = await toPng(el, {
      backgroundColor: PAGE_BG, width: w, height: h, pixelRatio: 2, cacheBust: true,
      filter: (n) => !(n instanceof HTMLElement && n.classList?.contains("react-flow__handle")),
      style: { width: `${w}px`, height: `${h}px`, transform: `translate(${vp.x}px, ${vp.y}px) scale(${vp.zoom})` },
    });
    return { dataUrl, w, h };
  } finally {
    paths.forEach((p, i) => (prev[i] == null ? p.removeAttribute("style") : p.setAttribute("style", prev[i]!)));
  }
}

const safe = (s: string) => s.replace(/[^\w\-äöüÄÖÜ ]+/g, "").trim().replace(/\s+/g, "_") || "Organigramm";
const isLandscape = (nodes: Node[]) => { const b = getNodesBounds(nodes); return b.width >= b.height; };

export async function exportPng(nodes: Node[], title: string) {
  const { dataUrl } = await render(nodes, isLandscape(nodes));
  const a = document.createElement("a");
  a.href = dataUrl; a.download = `${safe(title)}.png`; a.click();
}

export async function exportPdf(nodes: Node[], title: string) {
  const landscape = isLandscape(nodes);
  const { dataUrl, w, h } = await render(nodes, landscape);
  const pdf = new jsPDF({ orientation: landscape ? "landscape" : "portrait", unit: "mm", format: "a4" });
  const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
  pdf.setFillColor(PAGE_BG); pdf.rect(0, 0, pw, ph, "F");
  pdf.setTextColor("#243e3a");
  pdf.setFontSize(12); pdf.text(title, 10, 11);
  pdf.setFontSize(8); pdf.text(`SSM Partner AG · Stand ${new Date().toLocaleDateString("de-CH")}`, 10, 16);
  const top = 20, maxW = pw - 16, maxH = ph - top - 8;
  const r = Math.min(maxW / w, maxH / h);
  pdf.addImage(dataUrl, "PNG", (pw - w * r) / 2, top + (maxH - h * r) / 2, w * r, h * r);
  pdf.save(`${safe(title)}.pdf`);
}
