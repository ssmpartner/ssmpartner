import { useEffect, useRef, useState, forwardRef } from "react";
import HTMLFlipBook from "react-pageflip";
import * as pdfjs from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Download, ZoomIn, ZoomOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

const Page = forwardRef<HTMLDivElement, { src: string; n: number }>(({ src, n }, ref) => (
  <div ref={ref} className="bg-card shadow-inner">
    <img src={src} alt={`Seite ${n}`} className="w-full h-full object-contain select-none" draggable={false} />
  </div>
));
Page.displayName = "Page";

export const PdfFlipbook = ({ url, title }: { url: string; title?: string }) => {
  const [pages, setPages] = useState<string[]>([]);
  const [ratio, setRatio] = useState(1.414);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [fs, setFs] = useState(false);
  const [width, setWidth] = useState(1000);
  const wrap = useRef<HTMLDivElement>(null);
  const book = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    setPages([]); setError(null); setProgress(0);
    (async () => {
      try {
        const doc = await pdfjs.getDocument(url).promise;
        const out: string[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const p = await doc.getPage(i);
          const vp = p.getViewport({ scale: 2 });
          if (i === 1) setRatio(vp.height / vp.width);
          const c = document.createElement("canvas");
          c.width = vp.width; c.height = vp.height;
          await p.render({ canvasContext: c.getContext("2d")!, viewport: vp }).promise;
          out.push(c.toDataURL("image/jpeg", 0.85));
          if (cancelled) return;
          setProgress(Math.round((i / doc.numPages) * 100));
        }
        if (!cancelled) setPages(out);
      } catch (e: any) { if (!cancelled) setError(e?.message || "PDF konnte nicht geladen werden"); }
    })();
    return () => { cancelled = true; };
  }, [url]);

  useEffect(() => {
    const el = wrap.current; if (!el) return;
    let t: any;
    const measure = () => { clearTimeout(t); t = setTimeout(() => setWidth(w => Math.abs(w - el.clientWidth) > 40 ? el.clientWidth : w), 200); };
    setWidth(el.clientWidth);
    window.addEventListener("resize", measure);
    document.addEventListener("fullscreenchange", measure);
    const onFs = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => { clearTimeout(t); window.removeEventListener("resize", measure); document.removeEventListener("fullscreenchange", measure); document.removeEventListener("fullscreenchange", onFs); };
  }, []);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") book.current?.pageFlip()?.flipNext();
      if (e.key === "ArrowLeft") book.current?.pageFlip()?.flipPrev();
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, []);

  const mobile = width < 768;
  const avail = (width - 32) * zoom;
  let pw = Math.floor(mobile ? avail : avail / 2);
  const [vh] = useState(() => window.innerHeight);
  const maxH = (fs ? screen.height - 120 : vh * 0.75) * zoom;
  if (pw * ratio > maxH) pw = Math.floor(maxH / ratio);
  const ph = Math.floor(pw * ratio);

  const toggleFs = () => fs ? document.exitFullscreen() : wrap.current?.requestFullscreen();

  return (
    <div ref={wrap} className={`relative w-full bg-muted rounded-2xl p-4 ${zoom > 1 ? "overflow-auto" : "overflow-hidden"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <span className="text-sm text-muted-foreground font-body">
          {pages.length ? `Seite ${current + 1} / ${pages.length}` : title}
        </span>
        <div className="flex gap-1">
          <Button size="icon" variant="outline" onClick={() => book.current?.pageFlip()?.flipPrev()} aria-label="Zurück"><ChevronLeft className="h-4 w-4" /></Button>
          <Button size="icon" variant="outline" onClick={() => book.current?.pageFlip()?.flipNext()} aria-label="Weiter"><ChevronRight className="h-4 w-4" /></Button>
          <Button size="icon" variant="outline" onClick={() => setZoom(z => Math.max(1, z - 0.25))} aria-label="Verkleinern"><ZoomOut className="h-4 w-4" /></Button>
          <Button size="icon" variant="outline" onClick={() => setZoom(z => Math.min(2.5, z + 0.25))} aria-label="Vergrössern"><ZoomIn className="h-4 w-4" /></Button>
          <Button size="icon" variant="outline" onClick={toggleFs} aria-label="Vollbild">{fs ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</Button>
          <Button size="icon" variant="outline" asChild aria-label="Herunterladen"><a href={url} download target="_blank" rel="noreferrer"><Download className="h-4 w-4" /></a></Button>
        </div>
      </div>
      {error ? <p className="text-center text-destructive py-20">{error}</p>
        : !pages.length ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" /> Magazin wird vorbereitet … {progress}%
          </div>
        ) : (
          <div className="flex justify-center">
            {/* @ts-ignore – lib typings require many optional props */}
            <HTMLFlipBook key={`${pw}-${mobile}`} startPage={current} flippingTime={700} useMouseEvents clickEventForward={false} swipeDistance={30} drawShadow ref={book} width={pw} height={ph} size="fixed"
              showCover={!mobile} usePortrait={mobile} mobileScrollSupport maxShadowOpacity={0.5}
              onFlip={(e: any) => setCurrent(e.data)} className="shadow-2xl">
              {pages.map((src, i) => <Page key={i} src={src} n={i + 1} />)}
            </HTMLFlipBook>
          </div>
        )}
    </div>
  );
};
