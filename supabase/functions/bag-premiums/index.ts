const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BAG_API = "https://primai-okp-api.fly.dev/v1/compare";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { plz, age, deductible, accident, model, limit } = await req.json();

    if (!plz || !age) {
      return new Response(
        JSON.stringify({ error: "PLZ und Alter sind erforderlich" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const params = new URLSearchParams({
      plz: String(plz),
      age: String(age),
      deductible: String(deductible || 2500),
      accident: String(accident ?? false),
      limit: String(limit || "all"),
    });
    if (model) params.set("model", model);

    const response = await fetch(`${BAG_API}?${params}`);
    if (!response.ok) {
      throw new Error(`BAG API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
