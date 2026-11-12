import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem("ssm_sid");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("ssm_sid", id);
    }
    return id;
  } catch {
    return "anon";
  }
}

export function usePageViewTracker() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Skip admin/portal/login from public analytics
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/portal") ||
      pathname.startsWith("/login")
    ) {
      return;
    }

    // Skip bots/crawlers and repeat views of the same page in the same visit (pure statistics, keep DB writes low)
    if (/bot|crawl|spider|slurp|lighthouse|headless|preview/i.test(navigator.userAgent)) return;
    const key = `ssm_pv:${pathname}`;
    try {
      const last = Number(sessionStorage.getItem(key) || 0);
      if (Date.now() - last < 30 * 60 * 1000) return;
      sessionStorage.setItem(key, String(Date.now()));
    } catch { /* ignore */ }

    const payload = {
      path: pathname + (search || ""),
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      session_id: getSessionId(),
    };

    // Send when the browser is idle so it never competes with loading the page content
    const send = () => { supabase.from("page_views").insert(payload).then(() => {}); };
    const w = window as any;
    const h = w.requestIdleCallback ? w.requestIdleCallback(send, { timeout: 5000 }) : setTimeout(send, 2000);
    return () => { w.cancelIdleCallback ? w.cancelIdleCallback(h) : clearTimeout(h); };
  }, [pathname, search]);
}