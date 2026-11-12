import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const s = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: e } = await s.from("starterbrief_editions").select("pdf_url").eq("is_published", true).eq("is_public", true).maybeSingle();
  if (!e) return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: { ...cors, "Content-Type": "application/json" } });
  const { data, error } = await s.storage.from("starterbrief").createSignedUrl(e.pdf_url, 60 * 60 * 6);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  return new Response(JSON.stringify({ url: data.signedUrl }), { headers: { ...cors, "Content-Type": "application/json" } });
});
