import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-sso-api-key",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action, ...payload } = await req.json();

    // === Public SSO endpoints (called by other projects) ===

    if (action === "verify") {
      // Other projects send email + password to verify a user
      const { email, password, project_key } = payload;
      if (!email || !password || !project_key) {
        throw new Error("email, password und project_key sind erforderlich");
      }

      // Verify API key for project
      const apiKey = req.headers.get("x-sso-api-key");
      const { data: project } = await supabaseAdmin
        .from("sso_projects")
        .select("*")
        .eq("project_key", project_key)
        .eq("active", true)
        .single();

      if (!project) throw new Error("Unbekanntes oder inaktives Projekt");
      if (project.api_secret && project.api_secret !== apiKey) {
        throw new Error("Ungültiger API-Schlüssel");
      }

      // Try to sign in the user
      const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw new Error("Ungültige Zugangsdaten");

      const userId = authData.user.id;

      // Check project access
      const { data: access } = await supabaseAdmin
        .from("project_access")
        .select("active")
        .eq("user_id", userId)
        .eq("project_id", project.id)
        .single();

      if (!access?.active) {
        throw new Error("Kein Zugang zu diesem Projekt");
      }

      // Get role and profile
      const [roleRes, profileRes] = await Promise.all([
        supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).single(),
        supabaseAdmin.from("profiles").select("*").eq("id", userId).single(),
      ]);

      // Log the authentication
      await supabaseAdmin.from("auth_audit_log").insert({
        user_id: userId,
        user_email: email,
        project_key,
        action: "sso_login",
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown",
        metadata: { project_name: project.name },
      });

      return new Response(JSON.stringify({
        success: true,
        user: {
          id: userId,
          email: authData.user.email,
          display_name: profileRes.data?.display_name || email,
          avatar_url: profileRes.data?.avatar_url || null,
          role: roleRes.data?.role || null,
        },
        sso_token: authData.session?.access_token,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "check_access") {
      // Quick check if a user email has access to a project
      const { email, project_key } = payload;
      if (!email || !project_key) throw new Error("email und project_key sind erforderlich");

      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
      const user = users.find((u: any) => u.email === email);
      if (!user) {
        return new Response(JSON.stringify({ has_access: false, reason: "user_not_found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: project } = await supabaseAdmin
        .from("sso_projects")
        .select("id")
        .eq("project_key", project_key)
        .eq("active", true)
        .single();

      if (!project) {
        return new Response(JSON.stringify({ has_access: false, reason: "project_not_found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: access } = await supabaseAdmin
        .from("project_access")
        .select("active")
        .eq("user_id", user.id)
        .eq("project_id", project.id)
        .single();

      return new Response(JSON.stringify({
        has_access: !!access?.active,
        role: null, // Can be enriched
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_user_info") {
      // Get user info by email (for displaying in other projects)
      const { email } = payload;
      if (!email) throw new Error("email ist erforderlich");

      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
      const user = users.find((u: any) => u.email === email);
      if (!user) throw new Error("Benutzer nicht gefunden");

      const [roleRes, profileRes, accessRes] = await Promise.all([
        supabaseAdmin.from("user_roles").select("role").eq("user_id", user.id).single(),
        supabaseAdmin.from("profiles").select("*").eq("id", user.id).single(),
        supabaseAdmin.from("project_access").select("project_id, active, sso_projects(project_key, name)")
          .eq("user_id", user.id),
      ]);

      return new Response(JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          display_name: profileRes.data?.display_name || user.email,
          avatar_url: profileRes.data?.avatar_url || null,
          role: roleRes.data?.role || null,
          projects: accessRes.data?.map((a: any) => ({
            key: a.sso_projects?.project_key,
            name: a.sso_projects?.name,
            active: a.active,
          })) || [],
        },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === Admin endpoints (require auth) ===

    if (action === "grant_access" || action === "revoke_access" || action === "audit_log" || action === "generate_secret") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) throw new Error("Nicht autorisiert");

      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user: caller } } = await supabaseClient.auth.getUser();
      if (!caller) throw new Error("Nicht autorisiert");

      const { data: callerRole } = await supabaseAdmin
        .from("user_roles").select("role").eq("user_id", caller.id).single();
      if (callerRole?.role !== "superadmin") {
        throw new Error("Nur Superadmins können Projektzugriffe verwalten");
      }

      if (action === "grant_access") {
        const { user_id, project_id } = payload;
        const { error } = await supabaseAdmin
          .from("project_access")
          .upsert({ user_id, project_id, granted_by: caller.id, active: true }, { onConflict: "user_id,project_id" });
        if (error) throw error;

        await supabaseAdmin.from("auth_audit_log").insert({
          user_id, project_key: "admin", action: "access_granted",
          metadata: { project_id, granted_by: caller.id },
        });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "revoke_access") {
        const { user_id, project_id } = payload;
        const { error } = await supabaseAdmin
          .from("project_access")
          .update({ active: false })
          .eq("user_id", user_id)
          .eq("project_id", project_id);
        if (error) throw error;

        await supabaseAdmin.from("auth_audit_log").insert({
          user_id, project_key: "admin", action: "access_revoked",
          metadata: { project_id, revoked_by: caller.id },
        });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "audit_log") {
        const { limit = 50, offset = 0 } = payload;
        const { data, error } = await supabaseAdmin
          .from("auth_audit_log")
          .select("*")
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);
        if (error) throw error;

        return new Response(JSON.stringify({ logs: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "generate_secret") {
        const { project_id } = payload;
        if (!project_id) throw new Error("project_id ist erforderlich");

        // Generate a secure random API secret
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        const secret = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");

        const { error } = await supabaseAdmin
          .from("sso_projects")
          .update({ api_secret: secret })
          .eq("id", project_id);
        if (error) throw error;

        await supabaseAdmin.from("auth_audit_log").insert({
          user_id: caller.id,
          user_email: caller.email,
          project_key: "admin",
          action: "secret_generated",
          metadata: { project_id },
        });

        return new Response(JSON.stringify({ success: true, api_secret: secret }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    throw new Error("Unbekannte Aktion");
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
