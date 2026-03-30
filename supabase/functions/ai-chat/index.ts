import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch knowledge base
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const { data: knowledge } = await sb
      .from("chatbot_knowledge")
      .select("category, question, answer")
      .eq("active", true)
      .order("sort_order");

    // Fetch agencies for recommendations
    const { data: agencies } = await sb
      .from("agencies")
      .select("name, slug, address, phone, email")
      .eq("active", true);

    const knowledgeContext = (knowledge || [])
      .map((k: any) => `[${k.category}] F: ${k.question}\nA: ${k.answer}`)
      .join("\n\n");

    const agencyList = (agencies || [])
      .map((a: any) => `- ${a.name} (Link: /agenturen/${a.slug}, Adresse: ${a.address || "k.A."}, Tel: ${a.phone || "k.A."}, E-Mail: ${a.email || "k.A."})`)
      .join("\n");

    const systemPrompt = `Du bist der digitale Assistent der SSM Partner AG – einem führenden Personaldienstleister in der Schweiz. Du hilfst Besuchern der Website bei Fragen rund um Temporärarbeit, Festanstellungen, Karrieremöglichkeiten und unsere Agenturen.

WISSENSBASIS:
${knowledgeContext || "Keine spezifischen Einträge vorhanden."}

UNSERE AGENTUREN:
${agencyList || "Keine Agenturen verfügbar."}

VERHALTEN:
- Antworte immer freundlich, professionell und auf Deutsch (oder in der Sprache des Users).
- Nutze die Wissensbasis, um Fragen zu beantworten.
- Wenn eine Agentur relevant ist, empfehle sie mit Link.
- Wenn du die Antwort nicht weisst, leite den User zum Kontaktformular weiter: "Sie können uns gerne über unser [Kontaktformular](/kontakt) erreichen."
- Halte Antworten kurz und hilfreich (max 3-4 Sätze).
- Wenn jemand eine Stelle sucht, verweise auf die Karriereseite (/karriere) oder den Bewerbungswizard.
- Erwähne bei Bedarf, dass eine persönliche Online-Beratung bald verfügbar sein wird.
- Formatiere Links als Markdown: [Linktext](url)`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-10), // last 10 messages for context
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service vorübergehend nicht verfügbar." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI-Service nicht verfügbar." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unbekannter Fehler" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
