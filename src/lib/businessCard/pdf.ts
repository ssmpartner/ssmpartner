import { PDFDocument, cmyk, LineCapStyle } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { CMYK, PAGE_W_MM, PAGE_H_MM, BLEED_MM, mm, QR, ROW, ICONS, ICON_GRID, ICON_STROKE, LOGO_PATHS, type CardFonts, type CardLayout } from "./layout";
import { qrRuns } from "./qr";

const c = (v: readonly number[]) => cmyk(v[0], v[1], v[2], v[3]);

export async function buildBusinessCardPdf(layout: CardLayout, vcard: string, fonts: CardFonts): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(`Visitenkarte ${layout.name.text}`);
  const f = {
    bold: await doc.embedFont(fonts.bytes.bold, { subset: false, features: { liga: false } }),
    regular: await doc.embedFont(fonts.bytes.regular, { subset: false, features: { liga: false } }),
    medium: await doc.embedFont(fonts.bytes.medium, { subset: false, features: { liga: false } }),
  };
  const W = mm(PAGE_W_MM), H = mm(PAGE_H_MM);
  const boxes = (p: ReturnType<typeof doc.addPage>) => {
    p.setMediaBox(0, 0, W, H); p.setBleedBox(0, 0, W, H);
    p.setTrimBox(mm(BLEED_MM), mm(BLEED_MM), W - 2 * mm(BLEED_MM), H - 2 * mm(BLEED_MM));
  };
  const green = c(CMYK.green), black = c(CMYK.black), white = c(CMYK.white);

  // Front
  const front = doc.addPage([W, H]); boxes(front);
  const { n, runs } = qrRuns(vcard);
  const m = QR.size / n;
  for (const [r, s, len] of runs) {
    front.drawRectangle({ x: mm(QR.x + s * m), y: H - mm(QR.y + (r + 1) * m), width: mm(len * m), height: mm(m), color: green });
  }
  for (const t of [layout.name, layout.role]) {
    if (t.text) front.drawText(t.text, { x: mm(t.x), y: H - mm(t.y), size: t.size, font: f[t.font], color: black });
  }
  const iconScale = mm(ROW.iconSize) / ICON_GRID;
  for (const row of layout.rows) {
    front.drawCircle({ x: mm(row.cx), y: H - mm(row.cy), size: mm(ROW.circleD / 2), color: green });
    front.drawSvgPath(ICONS[row.key], {
      x: mm(row.cx - ROW.iconSize / 2), y: H - mm(row.cy - ROW.iconSize / 2), scale: iconScale,
      borderColor: white, borderWidth: ICON_STROKE, borderLineCap: LineCapStyle.Round,
    });
    front.drawText(row.text, { x: mm(row.x), y: H - mm(row.y), size: row.size, font: f.medium, color: black });
  }

  // Back
  const back = doc.addPage([W, H]); boxes(back);
  back.drawRectangle({ x: 0, y: 0, width: W, height: H, color: green });
  for (const p of LOGO_PATHS) back.drawSvgPath(p, { x: 0, y: H, color: white });

  return doc.save();
}
