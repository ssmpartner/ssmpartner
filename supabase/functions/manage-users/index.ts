import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const decodeJwtPayload = (authHeader: string) => {
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

const getCallerContext = async (authHeader: string) => {
  const payload = decodeJwtPayload(authHeader);
  const callerId = payload?.sub;

  if (!callerId || typeof callerId !== "string") {
    throw new Error("Nicht autorisiert");
  }

  const supabaseUser = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: roleRows, error } = await supabaseUser
    .from("user_roles")
    .select("role")
    .eq("user_id", callerId);

  if (error || !roleRows?.length) {
    throw new Error("Nicht autorisiert");
  }

  const elevatedRole = roleRows.find((row: { role: string }) =>
    row.role === "superadmin" || row.role === "admin"
  )?.role;

  return {
    id: callerId,
    role: elevatedRole ?? roleRows[0].role,
  };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Nicht autorisiert" }, 401);
    }

    const { action, ...payload } = await req.json();
    if (!action || typeof action !== "string") {
      throw new Error("Unbekannte Aktion");
    }

    const caller = await getCallerContext(authHeader);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (caller.role !== "superadmin" && caller.role !== "admin") {
      return json({ error: "Nur Superadmins und Admins können Benutzer verwalten" }, 403);
    }

    const isSuperadminCaller = caller.role === "superadmin";

    if (action === "create") {
      const { email, password, display_name, role, project_ids } = payload;

      const adminAllowedRoles = ["controlling", "geschaeftsleitung", "hr"];
      if (!isSuperadminCaller && !adminAllowedRoles.includes(role)) {
        throw new Error("Admins dürfen nur Controlling, Geschäftsleitung und HR Rollen zuweisen");
      }

      let userId: string;
      let reused = false;

      const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name },
      });

      if (createError) {
        const msg = (createError as any)?.message || "";
        const isDuplicate =
          msg.toLowerCase().includes("already been registered") ||
          (createError as any)?.code === "email_exists" ||
          (createError as any)?.status === 422;

        if (!isDuplicate) throw createError;

        // Find existing user by email
        let existing: any = null;
        for (let page = 1; page <= 20 && !existing; page++) {
          const { data, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
            page,
            perPage: 200,
          });
          if (listErr) throw listErr;
          existing = data.users.find(
            (u: any) => (u.email || "").toLowerCase() === email.toLowerCase(),
          );
          if (data.users.length < 200) break;
        }
        if (!existing) throw new Error("Benutzer existiert, konnte aber nicht gefunden werden");

        userId = existing.id;
        reused = true;

        // Update password + display_name
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          password,
          user_metadata: { display_name },
        });
        await supabaseAdmin
          .from("profiles")
          .update({ display_name })
          .eq("id", userId);
      } else {
        userId = userData.user.id;
      }

      // Upsert role
      const { error: roleDelErr } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", userId);
      if (roleDelErr) throw roleDelErr;
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: userId, role });
      if (roleError) throw roleError;

      // Add missing project access
      if (Array.isArray(project_ids) && project_ids.length > 0) {
        const { data: existingAccess } = await supabaseAdmin
          .from("project_access")
          .select("project_id")
          .eq("user_id", userId);
        const existingIds = new Set((existingAccess || []).map((r: any) => r.project_id));
        const newRows = project_ids
          .filter((pid: string) => !existingIds.has(pid))
          .map((pid: string) => ({
            user_id: userId,
            project_id: pid,
            granted_by: caller.id,
            active: true,
          }));
        if (newRows.length > 0) {
          await supabaseAdmin.from("project_access").insert(newRows);
        }
      }

      return json({ success: true, user_id: userId, reused });
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

      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id, role }, { onConflict: "user_id,role" });
      if (error) {
        const { error: updateError } = await supabaseAdmin
          .from("user_roles")
          .update({ role })
          .eq("user_id", user_id);
        if (updateError) throw updateError;
      }

      return json({ success: true });
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

      return json({ success: true });
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

      return json({ success: true });
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

      return json({ success: true });
    }

    if (action === "list") {
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) throw error;

      const [{ data: roles }, { data: profiles }] = await Promise.all([
        supabaseAdmin.from("user_roles").select("*"),
        supabaseAdmin.from("profiles").select("*"),
      ]);

      const enriched = users.map((u: any) => ({
        id: u.id,
        email: u.email,
        display_name: profiles?.find((p: any) => p.id === u.id)?.display_name || u.email,
        avatar_url: profiles?.find((p: any) => p.id === u.id)?.avatar_url || null,
        role: roles?.find((r: any) => r.user_id === u.id)?.role || null,
        created_at: u.created_at,
      }));

      return json({ users: enriched });
    }

    throw new Error("Unbekannte Aktion");
  } catch (error: any) {
    const message = error?.message || "Unbekannter Fehler";
    const status = message === "Nicht autorisiert"
      ? 401
      : message === "Nur Superadmins und Admins können Benutzer verwalten"
      ? 403
      : message === "Ungültige Anfrage"
      ? 400
      : 400;

    return json({ error: message }, status);
  }
});