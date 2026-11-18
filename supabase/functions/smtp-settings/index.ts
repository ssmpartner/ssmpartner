import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendSmtp, type SmtpConfig } from "../_shared/smtp.ts";

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
    const { data: u } = await sb.auth.getUser(token);
    if (!u?.user) return json({ error: "Nicht angemeldet" }, 401);
    const { data: roles } = await sb.from("user_roles").select("role").eq("user_id", u.user.id);
    if (!roles?.some((r: { role: string }) => ["superadmin", "admin"].includes(r.role))) return json({ error: "Keine Berechtigung" }, 403);

    const body = await req.json().catch(() => ({}));
    const { data: cur } = await sb.from("smtp_settings").select("*").eq("id", 1).maybeSingle();

    if (body.action === "get") {
      if (!cur) return json({ settings: null });
      const { password, ...rest } = cur;
      return json({ settings: { ...rest, has_password: !!password } });
    }
    if (body.action === "save") {
      const s = body.settings || {};
      const row = {
        id: 1, host: String(s.host || "").trim(), port: Number(s.port) || 465, secure: !!s.secure,
        username: String(s.username || "").trim(), from_email: String(s.from_email || "").trim(),
        from_name: String(s.from_name || "SSM Partner AG").trim(), notify_email: String(s.notify_email || "").trim(),
        enabled: !!s.enabled, updated_at: new Date().toISOString(),
        password: s.password ? String(s.password) : (cur?.password || ""),
      };
      const { error } = await sb.from("smtp_settings").upsert(row);
      if (error) throw error;
      return json({ ok: true });
    }
    if (body.action === "test") {
      if (!cur?.host) return json({ error: "Bitte zuerst speichern" }, 400);
      const to = String(body.to || cur.notify_email || u.user.email);
      await sendSmtp(cur as SmtpConfig, { to, subject: "SMTP-Test – SSM Partner CMS", html: "<p>Die SMTP-Verbindung funktioniert. ✅</p>" });
      return json({ ok: true, to });
    }
    return json({ error: "Unbekannte Aktion" }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
