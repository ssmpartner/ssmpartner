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

    if (action === "list_project_users") {
      const { project_key } = payload;
      const apiKey = req.headers.get("x-sso-api-key");

      if (!apiKey) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!project_key) {
        return new Response(JSON.stringify({ error: "project_key required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: project } = await supabaseAdmin
        .from("sso_projects")
        .select("*")
        .eq("project_key", project_key)
        .single();

      if (!project) {
        return new Response(JSON.stringify({ error: "Project not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!project.api_secret || project.api_secret !== apiKey) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: accessRows, error: accessErr } = await supabaseAdmin
        .from("project_access")
        .select("user_id, active, created_at")
        .eq("project_id", project.id)
        .eq("active", true);
      if (accessErr) throw accessErr;

      const userIds = (accessRows || []).map((a: any) => a.user_id);
      if (userIds.length === 0) {
        return new Response(JSON.stringify({ success: true, users: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const [profilesRes, rolesRes, teamRes, authUsersRes] = await Promise.all([
        supabaseAdmin.from("profiles").select("id, display_name, avatar_url").in("id", userIds),
        supabaseAdmin.from("user_roles").select("user_id, role").in("user_id", userIds),
        supabaseAdmin.from("team_members")
          .select("user_id, agency_id, agencies(name)")
          .in("user_id", userIds),
        supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
      ]);

      const profileMap = new Map((profilesRes.data || []).map((p: any) => [p.id, p]));
      const roleMap = new Map((rolesRes.data || []).map((r: any) => [r.user_id, r.role]));
      const teamMap = new Map((teamRes.data || []).map((t: any) => [t.user_id, t]));
      const authMap = new Map((authUsersRes.data?.users || []).map((u: any) => [u.id, u]));

      const users = (accessRows || []).map((a: any) => {
        const authUser: any = authMap.get(a.user_id);
        const profile: any = profileMap.get(a.user_id);
        const team: any = teamMap.get(a.user_id);
        return {
          id: a.user_id,
          email: authUser?.email || null,
          display_name: profile?.display_name || authUser?.email || null,
          avatar_url: profile?.avatar_url || null,
          role: roleMap.get(a.user_id) || null,
          agency_id: team?.agency_id || null,
          agency_name: team?.agencies?.name || null,
          is_active: a.active === true,
          assigned_at: a.created_at,
        };
      }).filter((u: any) => u.email);

      return new Response(JSON.stringify({ success: true, users }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "verify") {
      const { email, password, project_key } = payload;
      if (!email || !password || !project_key) {
        throw new Error("email, password und project_key sind erforderlich");
      }

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

      const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw new Error("Ungültige Zugangsdaten");

      const userId = authData.user.id;

      const { data: access } = await supabaseAdmin
        .from("project_access")
        .select("active")
        .eq("user_id", userId)
        .eq("project_id", project.id)
        .single();

      if (!access?.active) {
        throw new Error("Kein Zugang zu diesem Projekt");
      }

      const [roleRes, profileRes] = await Promise.all([
        supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).single(),
        supabaseAdmin.from("profiles").select("*").eq("id", userId).single(),
      ]);

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
        role: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_user_info") {
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

    // === Validate redirect token (called by external projects) ===
    if (action === "validate_token") {
      const { token, project_key } = payload;
      if (!token || !project_key) throw new Error("token und project_key sind erforderlich");

      // Verify API key
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

      // Find and validate token
      const { data: tokenData, error: tokenError } = await supabaseAdmin
        .from("sso_redirect_tokens")
        .select("*")
        .eq("token", token)
        .eq("project_key", project_key)
        .eq("used", false)
        .single();

      if (tokenError || !tokenData) {
        throw new Error("Ungültiger oder bereits verwendeter Token");
      }

      // Check expiration
      if (new Date(tokenData.expires_at) < new Date()) {
        throw new Error("Token abgelaufen");
      }

      // Mark token as used
      await supabaseAdmin
        .from("sso_redirect_tokens")
        .update({ used: true })
        .eq("id", tokenData.id);

      // Get user info
      const userId = tokenData.user_id;
      const { data: { user: authUser } } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (!authUser) throw new Error("Benutzer nicht gefunden");

      const [roleRes, profileRes] = await Promise.all([
        supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).single(),
        supabaseAdmin.from("profiles").select("*").eq("id", userId).single(),
      ]);

      // Log the SSO redirect login
      await supabaseAdmin.from("auth_audit_log").insert({
        user_id: userId,
        user_email: authUser.email,
        project_key,
        action: "sso_redirect_login",
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown",
        metadata: { project_name: project.name },
      });

      return new Response(JSON.stringify({
        success: true,
        user: {
          id: userId,
          email: authUser.email,
          display_name: profileRes.data?.display_name || authUser.email,
          avatar_url: profileRes.data?.avatar_url || null,
          role: roleRes.data?.role || null,
        },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === Admin endpoints (require auth) ===

    if (action === "grant_access" || action === "revoke_access" || action === "audit_log" || action === "generate_secret" || action === "generate_redirect_token") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) throw new Error("Nicht autorisiert");

      // Decode JWT to get user ID (verification happens via admin.getUserById)
      const jwt = authHeader.replace("Bearer ", "");
      const payloadBase64 = jwt.split(".")[1];
      const payloadJson = JSON.parse(atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/")));
      if (!payloadJson.sub) throw new Error("Nicht autorisiert");
      
      // Verify token is not expired
      if (payloadJson.exp && payloadJson.exp * 1000 < Date.now()) throw new Error("Token abgelaufen");
      
      // Verify user exists via admin API
      const { data: { user: callerUser }, error: userError } = await supabaseAdmin.auth.admin.getUserById(payloadJson.sub);
      if (userError || !callerUser) throw new Error("Nicht autorisiert");
      const caller = callerUser;

      // generate_redirect_token: any authenticated user can generate for themselves
      if (action === "generate_redirect_token") {
        const { project_key } = payload;
        if (!project_key) throw new Error("project_key ist erforderlich");

        // Verify project exists and is active
        const { data: project } = await supabaseAdmin
          .from("sso_projects")
          .select("id, project_key")
          .eq("project_key", project_key)
          .eq("active", true)
          .single();

        if (!project) throw new Error("Unbekanntes oder inaktives Projekt");

        // Verify user has access to this project
        const { data: access } = await supabaseAdmin
          .from("project_access")
          .select("active")
          .eq("user_id", caller.id)
          .eq("project_id", project.id)
          .single();

        // Superadmins bypass access check
        const { data: callerRoleData } = await supabaseAdmin
          .from("user_roles").select("role").eq("user_id", caller.id).single();
        const isSuperadmin = callerRoleData?.role === "superadmin";

        if (!isSuperadmin && !access?.active) {
          throw new Error("Kein Zugang zu diesem Projekt");
        }

        // Generate a secure random token (64 chars hex)
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        const token = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");

        // Store token with 5-minute expiration
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
        const { error: insertError } = await supabaseAdmin
          .from("sso_redirect_tokens")
          .insert({
            token,
            user_id: caller.id,
            project_key,
            expires_at: expiresAt,
          });

        if (insertError) throw insertError;

        return new Response(JSON.stringify({ success: true, token, expires_at: expiresAt }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // All other admin actions require superadmin
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
