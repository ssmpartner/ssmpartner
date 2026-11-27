// Single source of truth for the SSM business card (Flyeralarm 85×55 mm + 1 mm bleed).
import fontkit from "@pdf-lib/fontkit";

export const PAGE_W_MM = 87;
export const PAGE_H_MM = 57;
export const BLEED_MM = 1;
export const MM_TO_PT = 72 / 25.4;
export const mm = (v: number) => v * MM_TO_PT;
export const PT_TO_MM = 25.4 / 72;

export const CMYK = {
  green: [0.75, 0.49, 0.58, 0.54] as const,
  black: [0, 0, 0, 1] as const,
  white: [0, 0, 0, 0] as const,
};
export const SCREEN = { green: "#2A3C39", black: "#000000", white: "#FFFFFF" };

export const QR = { x: 10.34, y: 19.73, size: 19.6 };
export const NAME = { x: 40.1, y: 17.55, size: 11, min: 8.5 };
export const ROLE = { x: 40.19, y: 20.42, size: 6 };
export const ROW = { circleX: 42.28, circleD: 3.9, iconSize: 2.2, textX: 46.5, baselineOffset: 0.6, size: 5.03, min: 4.2, ys: [26.9, 32.5, 38.1, 43.7] };
export const MAX_TEXT_X = 83;

// Icon geometry (lucide, 24×24 grid, stroke 2). Swap for original paths later.
export const ICONS = {
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
  email: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  website: "M2 12a10 10 0 1 0 20 0a10 10 0 1 0 -20 0z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1 -4 10 15.3 15.3 0 0 1 -4 -10 15.3 15.3 0 0 1 4 -10z",
  address: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z M9 10a3 3 0 1 0 6 0a3 3 0 1 0 -6 0z",
} as const;
export const ICON_GRID = 24;
export const ICON_STROKE = 2;

// SSM logo, pt coordinates, origin top-left of the 87×57 mm page.
export const LOGO_PATHS = [
  "M 97.710938 94.644531 C 92.289062 94.644531 88.117188 92.972656 86.144531 88.125 L 90.316406 85.960938 C 91.492188 88.882812 94.5625 90.171875 97.789062 90.171875 C 101.011719 90.171875 103.894531 89.070312 103.894531 86.1875 C 103.894531 83.683594 101.273438 82.660156 97.75 82.285156 C 92.328125 81.636719 87.320312 80.199219 87.320312 74.242188 C 87.320312 68.78125 92.707031 66.542969 97.597656 66.503906 C 101.734375 66.503906 106.015625 67.679688 108.027344 71.773438 L 104.046875 73.824219 C 103.132812 72.308594 100.632812 70.867188 97.75 70.867188 C 94.03125 70.867188 92.253906 72.425781 92.253906 74.394531 C 92.253906 76.707031 94.984375 77.351562 98.167969 77.730469 C 103.703125 78.414062 108.863281 79.855469 108.863281 86.1875 C 108.863281 92.101562 103.628906 94.644531 97.714844 94.644531 Z",
  "M 128.972656 86.1875 C 128.972656 83.683594 126.359375 82.660156 122.828125 82.285156 C 117.40625 81.636719 112.398438 80.199219 112.398438 74.242188 C 112.402344 68.78125 117.785156 66.542969 122.679688 66.503906 C 126.8125 66.503906 131.101562 67.679688 133.109375 71.777344 L 129.125 73.824219 C 128.214844 72.308594 125.714844 70.867188 122.828125 70.867188 C 119.117188 70.867188 117.332031 72.425781 117.332031 74.394531 C 117.332031 76.707031 120.0625 77.351562 123.246094 77.730469 C 128.789062 78.414062 133.941406 79.855469 133.941406 86.1875 C 133.941406 92.101562 128.707031 94.644531 122.792969 94.644531 C 117.367188 94.644531 113.195312 92.976562 111.226562 88.125 L 115.398438 85.960938 C 116.574219 88.882812 119.644531 90.171875 122.871094 90.171875 C 126.09375 90.171875 128.976562 89.070312 128.976562 86.1875 Z",
  "M 160.082031 75.898438 L 152.3125 86.261719 L 151.328125 86.261719 L 142.867188 74.695312 L 142.867188 94 L 137.859375 94 L 137.859375 67.453125 L 143.628906 67.453125 L 151.929688 78.867188 L 160.082031 67.664062 Z",
];

export type FontRole = "bold" | "regular" | "medium";
export const FONT_FAMILY: Record<FontRole, string> = { bold: "BC-Bold", regular: "BC-Regular", medium: "BC-Medium" };

export interface CardFonts {
  bytes: Record<FontRole, ArrayBuffer>;
  measure: (role: FontRole, text: string, sizePt: number) => number; // width in mm
  fallback: boolean;
}

export function isFontBytes(buf: ArrayBuffer) {
  const b = new Uint8Array(buf.slice(0, 4));
  const sig = String.fromCharCode(...b);
  return (b[0] === 0 && b[1] === 1 && b[2] === 0 && b[3] === 0) || sig === "true" || sig === "OTTO";
}

async function fetchFont(url: string): Promise<ArrayBuffer | null> {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const buf = await r.arrayBuffer();
    return isFontBytes(buf) ? buf : null;
  } catch { return null; }
}

async function fetchFirst(...urls: string[]) {
  for (const u of urls) { const b = await fetchFont(u); if (b) return b; }
  return null;
}

let fontsPromise: Promise<CardFonts> | null = null;
export function loadCardFonts(): Promise<CardFonts> {
  if (fontsPromise) return fontsPromise;
  fontsPromise = (async () => {
    const [bold, semi, medium, regular] = await Promise.all([
      fetchFirst("/NeueAlteGrotesk-Bold.ttf", "/NeueAlteGrotesk-Bold.otf"), fetchFont("/NeueAlteGrotesk-SemiBold.ttf"),
      fetchFirst("/NeueAlteGrotesk-Medium.ttf", "/NeueAlteGrotesk-Medium.otf"), fetchFont("/NeueAlteGrotesk-Regular.ttf"),
    ]);
    if (!regular || !(bold || semi)) throw new Error("Schriftdateien konnten nicht geladen werden");
    const bytes: Record<FontRole, ArrayBuffer> = { bold: (bold || semi)!, medium: medium || regular, regular };
    const fk: Record<FontRole, any> = {
      bold: fontkit.create(new Uint8Array(bytes.bold)),
      medium: fontkit.create(new Uint8Array(bytes.medium)),
      regular: fontkit.create(new Uint8Array(bytes.regular)),
    };
    for (const role of Object.keys(bytes) as FontRole[]) {
      const ff = new FontFace(FONT_FAMILY[role], bytes[role].slice(0));
      await ff.load();
      document.fonts.add(ff);
    }
    return {
      bytes,
      fallback: !bold || !medium,
      measure: (role, text, size) => {
        const f = fk[role];
        return (f.layout(text, { liga: false }).advanceWidth / f.unitsPerEm) * size * PT_TO_MM;
      },
    };
  })();
  fontsPromise.catch(() => { fontsPromise = null; });
  return fontsPromise;
}

export interface CardData { name: string; role: string; phone: string; email: string; website: string; address: string }
export type RowKey = "phone" | "email" | "website" | "address";

export interface TextEl { text: string; x: number; y: number; size: number; font: FontRole; overflow: boolean }
export interface RowEl extends TextEl { key: RowKey; cx: number; cy: number }
export interface CardLayout { name: TextEl; role: TextEl; rows: RowEl[]; warnings: string[] }

function fit(measure: CardFonts["measure"], font: FontRole, text: string, x: number, size: number, min: number) {
  let s = size;
  while (s > min && x + measure(font, text, s) > MAX_TEXT_X) s = Math.max(min, +(s - 0.1).toFixed(2));
  return { size: s, overflow: x + measure(font, text, s) > MAX_TEXT_X };
}

const ROW_LABEL: Record<RowKey, string> = { phone: "Telefon", email: "E-Mail", website: "Website", address: "Adresse" };

export function computeLayout(d: CardData, measure: CardFonts["measure"]): CardLayout {
  const warnings: string[] = [];
  const n = fit(measure, "bold", d.name, NAME.x, NAME.size, NAME.min);
  if (n.overflow) warnings.push("Name ist zu lang für die Karte.");
  const r = fit(measure, "regular", d.role, ROLE.x, ROLE.size, ROLE.size);
  if (r.overflow) warnings.push("Funktion ist zu lang für die Karte.");
  const keys: RowKey[] = ["phone", "email", "website", "address"];
  const rows = keys.filter((k) => d[k].trim()).map((k, i) => {
    const cy = ROW.ys[i];
    const f = fit(measure, "medium", d[k].trim(), ROW.textX, ROW.size, ROW.min);
    if (f.overflow) warnings.push(`${ROW_LABEL[k]} ist auch bei ${ROW.min} pt zu lang.`);
    return { key: k, text: d[k].trim(), cx: ROW.circleX, cy, x: ROW.textX, y: cy + ROW.baselineOffset, size: f.size, font: "medium" as const, overflow: f.overflow };
  });
  return {
    name: { text: d.name, x: NAME.x, y: NAME.y, size: n.size, font: "bold", overflow: n.overflow },
    role: { text: d.role, x: ROLE.x, y: ROLE.y, size: r.size, font: "regular", overflow: r.overflow },
    rows, warnings,
  };
}

export function formatSwissPhone(raw: string | null | undefined): string {
  if (!raw) return "";
  const t = raw.trim();
  let digits = t.replace(/[^\d+]/g, "");
  if (digits.startsWith("00")) digits = "+" + digits.slice(2);
  let nat: string | null = null;
  if (digits.startsWith("+41")) nat = digits.slice(3);
  else if (/^0\d{9}$/.test(digits)) nat = digits.slice(1);
  if (nat?.startsWith("0")) nat = nat.slice(1);
  if (!nat || !/^\d{9}$/.test(nat)) return t;
  return `+41 ${nat.slice(0, 2)} ${nat.slice(2, 5)} ${nat.slice(5, 7)} ${nat.slice(7, 9)}`;
}

export function businessCardFileName(name: string) {
  const base = name.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9 -]/g, "").trim().replace(/\s+/g, "_");
  return `${base || "Visitenkarte"}_SSM_85x55mm.pdf`;
}
