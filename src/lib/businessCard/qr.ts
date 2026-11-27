import QRCode from "qrcode";
/** Returns runs of dark modules per row: [row, colStart, length], plus module count. */
export function qrRuns(text: string) {
  const qr = QRCode.create(text, { errorCorrectionLevel: "M" });
  const n = qr.modules.size;
  const runs: [number, number, number][] = [];
  for (let r = 0; r < n; r++) {
    let c = 0;
    while (c < n) {
      if (qr.modules.get(r, c)) { const s = c; while (c < n && qr.modules.get(r, c)) c++; runs.push([r, s, c - s]); }
      else c++;
    }
  }
  return { n, runs };
}
