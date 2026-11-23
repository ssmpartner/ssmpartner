import { useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { consultationElements, loadConsultationWidget, ONLINE_WIDGET_ORIGIN } from "@/lib/websiteWidgets";

interface Props {
  enabled: boolean;
  visible: boolean;
  onPanelChange: (open: boolean) => void;
}

export default function ConsultationWidget({ enabled, visible, onPanelChange }: Props) {
  const { lang } = useLanguage();

  useEffect(() => {
    let cancelled = false;
    const sync = () => {
      const { host, iframe } = consultationElements();
      if (!host) return;
      host.style.display = enabled && visible && !cancelled ? "" : "none";
      if (!iframe) return;
      if (!enabled || cancelled) {
        iframe.src = "about:blank";
        onPanelChange(false);
        return;
      }
      const src = `${ONLINE_WIDGET_ORIGIN}/widget-embed?tenant=ssm-partner&lang=${lang}&launcher=1&position=bottom-right`;
      if (iframe.src !== src) {
        onPanelChange(false);
        iframe.src = src;
      }
    };
    if (enabled) loadConsultationWidget(lang).then(() => { if (!cancelled) sync(); }).catch(() => onPanelChange(false));
    else { sync(); onPanelChange(false); }
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true });
    const receive = (event: MessageEvent) => {
      const { iframe } = consultationElements();
      if (!enabled || !visible || event.origin !== ONLINE_WIDGET_ORIGIN || !iframe || event.source !== iframe.contentWindow) return;
      if (event.data === "advizy:close") onPanelChange(false);
      if (event.data?.type === "advizy:state") {
        if (event.data.state === "panel") onPanelChange(true);
        if (event.data.state === "launcher") onPanelChange(false);
      }
    };
    window.addEventListener("message", receive);
    sync();
    return () => {
      cancelled = true;
      observer.disconnect();
      window.removeEventListener("message", receive);
      const { host } = consultationElements();
      if (host) host.style.display = "none";
    };
  }, [enabled, visible, lang, onPanelChange]);

  useEffect(() => () => {
    const { iframe } = consultationElements();
    if (iframe) iframe.src = "about:blank";
  }, []);
  return null;
}