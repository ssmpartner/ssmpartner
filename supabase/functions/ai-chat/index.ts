import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, session_id, source, page_url } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // Create or reuse chat session
    let currentSessionId = session_id;
    if (!currentSessionId) {
      const { data: sessionData, error: sessionError } = await sb
        .from("chat_sessions")
        .insert({ source: source || "website", page_url: page_url || null })
        .select("id")
        .single();
      if (!sessionError && sessionData) {
        currentSessionId = sessionData.id;
      }
    }

    // Save user message (last message in array)
    const lastMsg = messages[messages.length - 1];
    if (currentSessionId && lastMsg?.role === "user" && lastMsg?.content) {
      await sb.from("chat_messages").insert({
        session_id: currentSessionId,
        role: "user",
        content: lastMsg.content,
      });
    }

    // Fetch knowledge base
    const { data: knowledge } = await sb
      .from("chatbot_knowledge")
      .select("category, question, answer")
      .eq("active", true)
      .order("sort_order");

    // Fetch agencies
    const { data: agencies } = await sb
      .from("agencies")
      .select("name, slug, address, phone, email")
      .eq("active", true);

    // Fetch team members
    const { data: teamMembers } = await sb
      .from("team_members")
      .select("id, name, role_de, phone, email, image_url, category, agency_id, badge")
      .eq("active", true)
      .order("sort_order");

    // Fetch agency names for team members
    const { data: allAgencies } = await sb
      .from("agencies")
      .select("id, name, address");

    const agencyMap: Record<string, { name: string; address: string | null }> = {};
    (allAgencies || []).forEach((a: any) => { agencyMap[a.id] = { name: a.name, address: a.address }; });

    const knowledgeContext = (knowledge || [])
      .map((k: any) => `[${k.category}] F: ${k.question}\nA: ${k.answer}`)
      .join("\n\n");

    const agencyList = (agencies || [])
      .map((a: any) => `- ${a.name} (Link: /agenturen/${a.slug}, Adresse: ${a.address || "k.A."}, Tel: ${a.phone || "k.A."}, E-Mail: ${a.email || "k.A."})`)
      .join("\n");

    const teamList = (teamMembers || [])
      .map((m: any) => {
        const ag = m.agency_id ? agencyMap[m.agency_id] : null;
        return `- ${m.name} (ID: ${m.id}, Rolle: ${m.role_de || "k.A."}, Tel: ${m.phone || "k.A."}, E-Mail: ${m.email || "k.A."}${ag ? `, Agentur: ${ag.name}` : ""}${m.badge ? `, Badge: ${m.badge}` : ""})`;
      })
      .join("\n");

    const systemPrompt = `Du bist der digitale Assistent der SSM Partner AG – einem führenden Personaldienstleister in der Schweiz. Du hilfst Besuchern der Website bei Fragen rund um Temporärarbeit, Festanstellungen, Karrieremöglichkeiten und unsere Agenturen.

WISSENSBASIS:
${knowledgeContext || "Keine spezifischen Einträge vorhanden."}

UNSERE AGENTUREN:
${agencyList || "Keine Agenturen verfügbar."}

UNSERE TEAM-MITGLIEDER:
${teamList || "Keine Team-Mitglieder verfügbar."}

VERHALTEN:
- Antworte immer freundlich, professionell und auf Deutsch (oder in der Sprache des Users).
- Nutze die Wissensbasis, um Fragen zu beantworten.
- Wenn eine Agentur relevant ist, empfehle sie mit Link.
- Wenn du die Antwort nicht weisst, leite den User zum Kontaktformular weiter: "Sie können uns gerne über unser [Kontaktformular](/kontakt) erreichen."
- Halte Antworten kurz und hilfreich (max 3-4 Sätze).
- Wenn jemand eine Stelle sucht, verweise auf die Karriereseite (/karriere) oder den Bewerbungswizard.
- Erwähne bei Bedarf, dass eine persönliche Online-Beratung bald verfügbar sein wird.
- Formatiere Links als Markdown: [Linktext](url)

KONTAKTKARTEN-FUNKTION:
- Wenn ein User nach einem Mitarbeiter fragt (Name erwähnt), erkenne den Mitarbeiter aus der Team-Liste.
- Frage freundlich ob der User die Kontaktdaten oder die digitale Visitenkarte haben möchte.
- Wenn ja, antworte mit dem speziellen Marker: [VCARD:mitarbeiter_id] — ersetze mitarbeiter_id mit der tatsächlichen ID aus der Team-Liste.
- Beispiel: "Hier ist die Visitenkarte von Max Muster: [VCARD:abc-123-def]"
- Nutze NUR IDs die in der Team-Liste existieren. Erfinde keine IDs.
- Der Marker wird im Frontend automatisch als interaktive Kontaktkarte mit QR-Code angezeigt.`;

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
          ...messages.slice(-10),
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

    // We need to intercept the stream to save the assistant response
    const reader = response.body!.getReader();
    let assistantContent = "";

    const stream = new ReadableStream({
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) {
          // Save assistant response when stream ends
          if (currentSessionId && assistantContent.trim()) {
            sb.from("chat_messages").insert({
              session_id: currentSessionId,
              role: "assistant",
              content: assistantContent,
            }).then(() => {});
          }
          controller.close();
          return;
        }

        // Parse SSE to capture assistant content
        const text = new TextDecoder().decode(value);
        const lines = text.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ") && line.trim() !== "data: [DONE]") {
            try {
              const parsed = JSON.parse(line.slice(6));
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) assistantContent += delta;
            } catch { /* partial JSON, ignore */ }
          }
        }

        controller.enqueue(value);
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "X-Session-Id": currentSessionId || "",
      },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unbekannter Fehler" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
