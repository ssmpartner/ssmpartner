import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const FROM = "SSM Partner AG <noreply@ssmpartner.ch>";
const BCC = "marketing@ssmpartner.ch";
const HQ = { name: "Hauptsitz (HQ) Rothenburg", email: "marketing@ssmpartner.ch" };

const Body = z.object({
  agency: z.string().min(1).max(64), // "hq" or agency uuid
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(50).optional().nullable(),
  subject: z.string().trim().min(1).max(100),
  message: z.string().trim().min(1).max(5000),
  lang: z.enum(["de", "fr", "it", "en"]).default("de"),
});

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const confirm = {
  de: { s: "Vielen Dank für Ihre Anfrage – SSM Partner AG", h: "Vielen Dank für Ihre Anfrage", p: "Wir haben Ihre Nachricht erhalten und melden uns so rasch wie möglich bei Ihnen.", y: "Ihre Nachricht", a: "Zuständige Stelle" },
  fr: { s: "Merci pour votre demande – SSM Partner AG", h: "Merci pour votre demande", p: "Nous avons bien reçu votre message et vous recontacterons dès que possible.", y: "Votre message", a: "Interlocuteur" },
  it: { s: "Grazie per la sua richiesta – SSM Partner AG", h: "Grazie per la sua richiesta", p: "Abbiamo ricevuto il suo messaggio e la contatteremo al più presto.", y: "Il suo messaggio", a: "Sede competente" },
  en: { s: "Thank you for your inquiry – SSM Partner AG", h: "Thank you for your inquiry", p: "We have received your message and will get back to you as soon as possible.", y: "Your message", a: "Responsible office" },
};

async function send(payload: Record<string, unknown>) {
  const r = await fetch(`${GATEWAY_URL}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      "X-Connection-Api-Key": Deno.env.get("RESEND_API_KEY")!,
    },
    body: JSON.stringify(payload),
  });
  const t = await r.text();
  if (!r.ok) throw new Error(`[${r.status}]: ${t}`);
  return t;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const d = parsed.data;

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    let target = HQ;
    let agencyId: string | null = null;
    if (d.agency !== "hq") {
      const { data: ag } = await sb.from("agencies").select("id,name,email").eq("id", d.agency).eq("active", true).maybeSingle();
      if (!ag) return json({ error: "Unknown agency" }, 400);
      target = { name: `Agentur ${ag.name}`, email: ag.email || HQ.email };
      agencyId = ag.id;
    }

    const { data: row, error } = await sb.from("inquiries").insert({
      source: "contact", agency_id: agencyId, agency_name: target.name,
      name: d.name, email: d.email, phone: d.phone || null, subject: d.subject, message: d.message,
    }).select("id").single();
    if (error) throw error;

    const msg = esc(d.message).replace(/\n/g, "<br>");
    const wrap = (inner: string) => `<div style="font-family:Arial,sans-serif;color:#243e3a;max-width:600px;margin:auto;padding:24px">${inner}<p style="margin-top:32px;font-size:12px;color:#777">SSM Partner AG · Stationsstrasse 92 · 6023 Rothenburg · 041 220 20 50</p></div>`;

    const errors: string[] = [];
    try {
      await send({
        from: FROM, to: [target.email], bcc: target.email === BCC ? undefined : [BCC], reply_to: d.email,
        subject: `Neue Kontaktanfrage: ${d.subject} – ${d.name}`,
        html: wrap(`<h2>Neue Kontaktanfrage für ${esc(target.name)}</h2>
          <p><b>Name:</b> ${esc(d.name)}<br><b>E-Mail:</b> ${esc(d.email)}<br><b>Telefon:</b> ${esc(d.phone || "–")}<br><b>Anliegen:</b> ${esc(d.subject)}</p>
          <p><b>Nachricht:</b><br>${msg}</p><p style="font-size:12px;color:#777">Antworten Sie direkt auf diese E-Mail, um dem Kunden zu schreiben.</p>`),
        headers: { "X-Entity-Ref-ID": `inquiry-${row.id}` },
      });
    } catch (e) { console.error("agency mail failed", e); errors.push(String(e)); }

    const c = confirm[d.lang];
    try {
      await send({
        from: FROM, to: [d.email], reply_to: target.email, subject: c.s,
        html: wrap(`<h2>${c.h}</h2><p>${esc(d.name)},</p><p>${c.p}</p><p><b>${c.a}:</b> ${esc(target.name)}</p><p><b>${c.y}:</b><br>${msg}</p>`),
        headers: { "X-Entity-Ref-ID": `inquiry-confirm-${row.id}` },
      });
    } catch (e) { console.error("confirmation mail failed", e); errors.push(String(e)); }

    return json({ ok: true, id: row.id, mailErrors: errors });
  } catch (e) {
    console.error(e);
    return json({ error: String(e) }, 500);
  }
});
