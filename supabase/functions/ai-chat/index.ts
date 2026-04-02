import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BAG_API = "https://primai-okp-api.fly.dev/v1/compare";

// Tool definition for premium lookup
const premiumTool = {
  type: "function",
  function: {
    name: "lookup_visana_premiums",
    description: "Sucht Visana Krankenkassen-Prämien basierend auf PLZ, Alter und weiteren Parametern. Verwende dieses Tool wenn der User nach Prämien, Kosten oder Preisen für Krankenkassen/Grundversicherung fragt.",
    parameters: {
      type: "object",
      properties: {
        plz: { type: "string", description: "Schweizer Postleitzahl (z.B. '6003' für Luzern)" },
        age: { type: "number", description: "Alter der versicherten Person" },
        deductible: { type: "number", description: "Franchise in CHF (300, 500, 1000, 1500, 2000 oder 2500). Standard: 2500", enum: [300, 500, 1000, 1500, 2000, 2500] },
        accident: { type: "boolean", description: "Mit Unfalldeckung? Standard: false" },
        model: { type: "string", description: "Versicherungsmodell. Standard: alle Modelle", enum: ["standard", "hmo", "hausarzt", "telmed"] },
      },
      required: ["plz", "age"],
    },
  },
};

// Call BAG API for premiums
async function fetchVisanaPremiums(args: { plz: string; age: number; deductible?: number; accident?: boolean; model?: string }) {
  const params = new URLSearchParams({
    plz: args.plz,
    age: String(args.age),
    deductible: String(args.deductible || 2500),
    accident: String(args.accident ?? false),
    limit: "200",
  });
  if (args.model) params.set("model", args.model);

  const response = await fetch(`${BAG_API}?${params}`);
  if (!response.ok) throw new Error(`BAG API error: ${response.status}`);
  const data = await response.json();

  // Filter to Visana only
  if (data.offers) {
    data.offers = data.offers.filter((o: { insurer: string }) =>
      o.insurer.toLowerCase().includes("visana")
    );
  }

  return data;
}

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

    const systemPrompt = `Du bist der digitale Assistent der SSM Partner AG – einem Vertriebsunternehmen für Finanz- und Versicherungsprodukte. Die SSM Partner AG ist eine gebundene Versicherungsvermittlerin gemäss VAG (Versicherungsaufsichtsgesetz) und eine Tochtergesellschaft der Visana-Gruppe mit Sitz in Rothenburg (LU). Wir arbeiten mit ausgewählten Partnern zusammen und unterstützen sie dabei, den Vertrieb von Finanz- und Versicherungsprodukten effizient, zuverlässig und abgestimmt zu gestalten. Wir rekrutieren und bilden Finanzcoaches sowie Führungskräfte für unsere interne Struktur aus.

WISSENSBASIS:
${knowledgeContext || "Keine spezifischen Einträge vorhanden."}

UNSERE AGENTUREN:
${agencyList || "Keine Agenturen verfügbar."}

UNSERE TEAM-MITGLIEDER:
${teamList || "Keine Team-Mitglieder verfügbar."}

PRÄMIEN-ABFRAGE:
- Du hast Zugriff auf ein Tool "lookup_visana_premiums" um Visana Krankenkassen-Prämien (Grundversicherung OKP) nachzuschlagen.
- Wenn ein User nach Prämien fragt, nutze das Tool. Frage nach PLZ und Alter falls nicht angegeben.
- Für Kantone nutze eine typische PLZ: Luzern=6003, Bern=3001, Zürich=8001, Basel=4001, St.Gallen=9000, Aarau=5000, Solothurn=4500, Thun=3600, Winterthur=8400, Zug=6300.
- Präsentiere die Ergebnisse KURZ und KOMPAKT: nur Modell und Prämie/Monat in CHF als einfache Liste. Keine langen Erklärungen, keine Tabellen-Header, keine Fussnoten.
- Beispielformat: "• Standard: CHF 385/Mt." — kurz und knapp.
- Erwähne kurz dass es BAG-Daten 2026 sind. Verweise auf /onlinecheck für eine persönliche Beratung.
- WICHTIG: Verwende KEINE Sonderzeichen wie *, **, #, | oder Tabellenformatierung. Nutze einfache Aufzählungen mit • oder -.

VERHALTEN:
- Antworte immer freundlich, professionell und auf Deutsch (oder in der Sprache des Users).
- Nutze die Wissensbasis, um Fragen zu beantworten.
- Wenn eine Agentur relevant ist, empfehle sie mit Link.
- Wenn du die Antwort nicht weisst, leite den User zum Kontaktformular weiter: "Sie können uns gerne über unser [Kontaktformular](/kontakt) erreichen."
- Halte Antworten kurz und hilfreich (max 3-4 Sätze, ausser bei Prämien-Tabellen).
- Wir sind KEIN Temporärbüro und KEIN Personaldienstleister. Wir sind ein Vertriebsunternehmen für Finanz- und Versicherungsprodukte.
- Wenn jemand eine Karriere bei uns sucht, verweise auf die Karriereseite (/karriere) – wir suchen Finanzcoaches und Führungskräfte.
- Formatiere Links als Markdown: [Linktext](url)

KONTAKTKARTEN-FUNKTION:
- Wenn ein User nach einem Mitarbeiter fragt (Name erwähnt), erkenne den Mitarbeiter aus der Team-Liste.
- Frage freundlich ob der User die Kontaktdaten oder die digitale Visitenkarte haben möchte.
- Wenn ja, antworte mit dem speziellen Marker: [VCARD:mitarbeiter_id] — ersetze mitarbeiter_id mit der tatsächlichen ID aus der Team-Liste.
- Beispiel: "Hier ist die Visitenkarte von Max Muster: [VCARD:abc-123-def]"
- Nutze NUR IDs die in der Team-Liste existieren. Erfinde keine IDs.
- Der Marker wird im Frontend automatisch als interaktive Kontaktkarte mit QR-Code angezeigt.`;

    // First call with tools enabled (non-streaming to handle tool calls)
    const firstResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
        tools: [premiumTool],
        stream: false,
      }),
    });

    if (!firstResponse.ok) {
      if (firstResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (firstResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Service vorübergehend nicht verfügbar." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await firstResponse.text();
      console.error("AI gateway error:", firstResponse.status, t);
      return new Response(JSON.stringify({ error: "AI-Service nicht verfügbar." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const firstResult = await firstResponse.json();
    const firstChoice = firstResult.choices?.[0];

    // Check if the model wants to call a tool
    if (firstChoice?.finish_reason === "tool_calls" || firstChoice?.message?.tool_calls?.length > 0) {
      const toolCalls = firstChoice.message.tool_calls;
      const toolResults: any[] = [];

      for (const tc of toolCalls) {
        if (tc.function.name === "lookup_visana_premiums") {
          try {
            const args = JSON.parse(tc.function.arguments);
            const premiumData = await fetchVisanaPremiums(args);
            toolResults.push({
              role: "tool",
              tool_call_id: tc.id,
              content: JSON.stringify(premiumData),
            });
          } catch (err) {
            toolResults.push({
              role: "tool",
              tool_call_id: tc.id,
              content: JSON.stringify({ error: "Prämien konnten nicht abgerufen werden." }),
            });
          }
        }
      }

      // Second call: stream the final response with tool results
      const secondResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            firstChoice.message,
            ...toolResults,
          ],
          stream: true,
        }),
      });

      if (!secondResponse.ok) {
        const t = await secondResponse.text();
        console.error("AI gateway second call error:", secondResponse.status, t);
        return new Response(JSON.stringify({ error: "AI-Service nicht verfügbar." }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Stream with assistant content capture
      const reader = secondResponse.body!.getReader();
      let assistantContent = "";
      const stream = new ReadableStream({
        async pull(controller) {
          const { done, value } = await reader.read();
          if (done) {
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
          const text = new TextDecoder().decode(value);
          for (const line of text.split("\n")) {
            if (line.startsWith("data: ") && line.trim() !== "data: [DONE]") {
              try {
                const parsed = JSON.parse(line.slice(6));
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) assistantContent += delta;
              } catch { /* partial JSON */ }
            }
          }
          controller.enqueue(value);
        },
      });

      return new Response(stream, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream", "X-Session-Id": currentSessionId || "" },
      });
    }

    // No tool call — stream the response directly
    // Since we already consumed a non-streaming response, we re-format it as SSE
    const content = firstChoice?.message?.content || "Entschuldigung, ich konnte keine Antwort generieren.";
    
    // Save assistant response
    if (currentSessionId && content.trim()) {
      sb.from("chat_messages").insert({
        session_id: currentSessionId,
        role: "assistant",
        content: content,
      }).then(() => {});
    }

    // Re-stream as SSE for consistent frontend handling
    const sseData = `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\ndata: [DONE]\n\n`;
    return new Response(sseData, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "X-Session-Id": currentSessionId || "" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unbekannter Fehler" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
