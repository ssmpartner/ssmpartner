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

    const payload = {
      path: pathname + (search || ""),
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      session_id: getSessionId(),
    };

    supabase.from("page_views").insert(payload).then(() => {});
  }, [pathname, search]);
}