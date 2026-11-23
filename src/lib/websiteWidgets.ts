export const ONLINE_WIDGET_ORIGIN = "https://onlineberatung.ssmpartner.ch";
export const ONLINE_WIDGET_SETTING = "online_consultation_widget_enabled";

export function widgetSettingEnabled(body: string | null | undefined, defaultEnabled: boolean) {
  return body == null ? defaultEnabled : body === "true";
}

export function widgetVisibility(aiEnabled: boolean, consultationEnabled: boolean, aiOpen: boolean, consultationOpen: boolean) {
  return {
    ai: aiEnabled && !consultationOpen,
    consultation: consultationEnabled && !aiOpen,
    aiOnLeft: consultationEnabled,
  };
}

let loader: Promise<void> | undefined;

// The vendor loader has no destroy method. Load it once and reuse its isolated host.
export function loadConsultationWidget(lang: string): Promise<void> {
  if (loader) return loader;
  loader = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${ONLINE_WIDGET_ORIGIN}/widget/loader.js`;
    script.dataset.tenant = "ssm-partner";
    script.dataset.lang = lang;
    script.dataset.position = "bottom-right";
    script.dataset.color = "#324642";
    script.dataset.popup = "off";
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => { script.remove(); loader = undefined; reject(new Error("Widget konnte nicht geladen werden")); };
    document.body.appendChild(script);
  });
  return loader;
}

export function consultationElements() {
  const host = document.getElementById("advizy-widget-host");
  const iframe = host?.shadowRoot?.querySelector("iframe");
  return { host, iframe };
}