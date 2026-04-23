// Cockpit Data API — Stammdaten-Zugriff für externe SSM-Projekte (z.B. SSM Cockpit)
// Authentifizierung via api_secret aus sso_projects (Header: x-sso-api-key)
// Intern wird der SUPABASE_SERVICE_ROLE_KEY genutzt — bleibt vollständig serverseitig.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-sso-api-key",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // 1) Authenticate caller via api_secret
    const apiSecret = req.headers.get("x-sso-api-key");
    if (!apiSecret) return json({ error: "Missing x-sso-api-key header" }, 401);

    const { data: project, error: projErr } = await admin
      .from("sso_projects")
      .select("id, project_key, name, active")
      .eq("api_secret", apiSecret)
      .eq("active", true)
      .maybeSingle();

    if (projErr || !project) return json({ error: "Invalid or inactive api_secret" }, 401);

    // 2) Determine resource (POST body { resource } or GET ?resource=)
    let resource: string | null = null;
    let filters: Record<string, unknown> = {};

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      resource = body.resource ?? null;
      filters = body.filters ?? {};
    } else {
      const url = new URL(req.url);
      resource = url.searchParams.get("resource");
    }

    if (!resource) return json({ error: "Missing 'resource' (agencies | team_members)" }, 400);

    // 3) Dispatch
    if (resource === "agencies") {
      const { data, error } = await admin
        .from("agencies")
        .select("id, name, slug, active, address, phone, email, image_url, sort_order")
        .order("sort_order", { ascending: true });
      if (error) return json({ error: error.message }, 500);
      return json({ project: project.project_key, resource, data });
    }

    if (resource === "team_members") {
      let q = admin
        .from("team_members")
        .select(
          "id, user_id, name, email, phone, badge, is_agency_leader, is_recruiting_partner, active, agency_id, category, image_url, role_de, sort_order",
        )
        .order("sort_order", { ascending: true });

      if (typeof filters.active === "boolean") q = q.eq("active", filters.active);
      if (typeof filters.agency_id === "string") q = q.eq("agency_id", filters.agency_id);

      const { data, error } = await q;
      if (error) return json({ error: error.message }, 500);
      return json({ project: project.project_key, resource, data });
    }

    return json({ error: `Unknown resource: ${resource}` }, 400);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
