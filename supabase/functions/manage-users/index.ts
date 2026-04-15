import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Nicht autorisiert");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user: caller } } = await supabaseClient.auth.getUser();
    if (!caller) throw new Error("Nicht autorisiert");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check caller is superadmin or admin
    const { data: callerRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .single();

    if (callerRole?.role !== "superadmin" && callerRole?.role !== "admin") {
      throw new Error("Nur Superadmins und Admins können Benutzer verwalten");
    }

    const isSuperadminCaller = callerRole?.role === "superadmin";
    const { action, ...payload } = await req.json();

    if (action === "create") {
      const { email, password, display_name, role, project_ids } = payload;

      const adminAllowedRoles = ["controlling", "geschaeftsleitung", "hr"];
      if (!isSuperadminCaller && !adminAllowedRoles.includes(role)) {
        throw new Error("Admins dürfen nur Controlling, Geschäftsleitung und HR Rollen zuweisen");
      }

      const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name },
      });
      if (createError) throw createError;

      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: userData.user.id, role });
      if (roleError) throw roleError;

      // Grant project access if project_ids provided
      if (Array.isArray(project_ids) && project_ids.length > 0) {
        const accessRows = project_ids.map((pid: string) => ({
          user_id: userData.user.id,
          project_id: pid,
          granted_by: caller.id,
          active: true,
        }));
        await supabaseAdmin.from("project_access").insert(accessRows);
      }

      return new Response(JSON.stringify({ success: true, user_id: userData.user.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update_role") {
      const { user_id, role } = payload;

      const adminAllowedRoles = ["controlling", "geschaeftsleitung", "hr"];
      if (!isSuperadminCaller && !adminAllowedRoles.includes(role)) {
        throw new Error("Admins dürfen nur Controlling, Geschäftsleitung und HR Rollen zuweisen");
      }

      if (role !== "superadmin") {
        const { data: superadmins } = await supabaseAdmin
          .from("user_roles")
          .select("user_id")
          .eq("role", "superadmin");
        const isLastSuperadmin = superadmins?.length === 1 && superadmins[0].user_id === user_id;
        if (isLastSuperadmin) throw new Error("Es muss mindestens ein Superadmin existieren");
      }

      // Upsert role
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id, role }, { onConflict: "user_id,role" });
      if (error) {
        // If conflict on unique, update instead
        const { error: updateError } = await supabaseAdmin
          .from("user_roles")
          .update({ role })
          .eq("user_id", user_id);
        if (updateError) throw updateError;
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update_email") {
      const { user_id, new_email } = payload;
      if (!new_email || !new_email.includes("@")) {
        throw new Error("Ungültige E-Mail-Adresse");
      }

      const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
        email: new_email,
        email_confirm: true,
      });
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "reset_password") {
      const { user_id, new_password } = payload;
      if (!new_password || new_password.length < 8) {
        throw new Error("Passwort muss mindestens 8 Zeichen lang sein");
      }

      const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
        password: new_password,
      });
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      const { user_id } = payload;
      if (user_id === caller.id) throw new Error("Sie können sich nicht selbst löschen");

      const { data: superadmins } = await supabaseAdmin
        .from("user_roles")
        .select("user_id")
        .eq("role", "superadmin");
      const { data: targetRole } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", user_id)
        .single();
      if (targetRole?.role === "superadmin" && superadmins?.length === 1) {
        throw new Error("Es muss mindestens ein Superadmin existieren");
      }

      const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "list") {
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) throw error;

      const { data: roles } = await supabaseAdmin.from("user_roles").select("*");
      const { data: profiles } = await supabaseAdmin.from("profiles").select("*");

      const enriched = users.map((u: any) => ({
        id: u.id,
        email: u.email,
        display_name: profiles?.find((p: any) => p.id === u.id)?.display_name || u.email,
        avatar_url: profiles?.find((p: any) => p.id === u.id)?.avatar_url || null,
        role: roles?.find((r: any) => r.user_id === u.id)?.role || null,
        created_at: u.created_at,
      }));

      return new Response(JSON.stringify({ users: enriched }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Unbekannte Aktion");
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
