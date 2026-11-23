import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { loadSmtp, sendSmtp, type SmtpConfig } from "../_shared/smtp.ts";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const FROM = "SSM Partner AG <noreply@ssmpartner.ch>";
const BCC = "marketing@ssmpartner.ch";
const HQ = { name: "Hauptsitz (HQ) Rothenburg", email: "marketing@ssmpartner.ch" };

const Body = z.object({
  agency: z.string().min(1).max(64), // "hq" or agency uuid
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(50).optional().nullable(),
  subject: z.string().trim().max(100).optional().nullable(),
  message: z.string().trim().min(1).max(5000),
  lang: z.enum(["de", "fr", "it", "en"]).default("de"),
  source: z.enum(["contact", "agency"]).default("contact"),
  recipient: z.string().trim().max(200).optional().nullable(),
  website: z.string().max(500).optional().nullable(), // honeypot
  started_at: z.number().optional().nullable(), // form load time (ms)
});

const MIN_FILL_MS = 3000;
const RATE_WINDOW_MIN = 10;
const RATE_MAX = 3;
const SPAM_RE = /(https?:\/\/|www\.)/i;
const CYRILLIC_RE = /[\u0400-\u04FF]{5,}/;

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const confirm = {
  de: { s: "Vielen Dank für Ihre Anfrage – SSM Partner AG", h: "Vielen Dank für Ihre Anfrage", p: "Wir haben Ihre Nachricht erhalten und melden uns so rasch wie möglich bei Ihnen.", y: "Ihre Nachricht", a: "Zuständige Stelle" },
  fr: { s: "Merci pour votre demande – SSM Partner AG", h: "Merci pour votre demande", p: "Nous avons bien reçu votre message et vous recontacterons dès que possible.", y: "Votre message", a: "Interlocuteur" },
  it: { s: "Grazie per la sua richiesta – SSM Partner AG", h: "Grazie per la sua richiesta", p: "Abbiamo ricevuto il suo messaggio e la contatteremo al più presto.", y: "Il suo messaggio", a: "Sede competente" },
  en: { s: "Thank you for your inquiry – SSM Partner AG", h: "Thank you for your inquiry", p: "We have received your message and will get back to you as soon as possible.", y: "Your message", a: "Responsible office" },
};

let smtp: SmtpConfig | null = null;
async function send(payload: Record<string, any>) {
  if (smtp) {
    return await sendSmtp(smtp, { to: payload.to, bcc: payload.bcc, replyTo: payload.reply_to, subject: payloasubject, html: payload.html });
  }
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
    const subject = d.subject || (d.source === "agency" ? "Anfrage über Agenturseite" : "");
    if (!subject) return json({ error: { subject: ["required"] } }, 400);

    // Spam checks: silently accept so bots get no signal
    const fake = () => json({ ok: true, id: null });
    if (d.website && d.website.trim() !== "") { console.warn("honeypot hit"); return fake(); }
    if (!d.started_at || Date.now() - d.started_at < MIN_FILL_MS) { console.warn("too fast"); return fake(); }
    if (SPAM_RE.test(d.name) || CYRILLIC_RE.test(d.message) || (d.message.match(/https?:\/\//gi)?.length ?? 0) > 2) {
      console.warn("pattern spam"); return fake();
    }

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("cf-connecting-ip") || "unknown";
    const since = new Date(Date.now() - RATE_WINDOW_MIN * 60_000).toISOString();
    const { count } = await sb.from("form_rate_limits").select("id", { count: "exact", head: true }).eq("ip", ip).gte("created_at", since);
    if ((count ?? 0) >= RATE_MAX) return json({ error: "rate_limited" }, 429);
    await sb.from("form_rate_limits").insert({ ip });
    await sb.from("form_rate_limits").delete().lt("created_at", new Date(Date.now() - 86_400_000).toISOString());
    smtp = await loadSmtp(sb);
    let target = HQ;
    let agencyId: string | null = null;
    if (d.agency !== "hq") {
      const { data: ag } = await sb.from("agencies").select("id,name,email").eq("id", d.agency).eq("active", true).maybeSingle();
      if (!ag) return json({ error: "Unknown agency" }, 400);
      target = { name: `Agentur ${ag.name}`, email: ag.email || HQ.email };
      agencyId = ag.id;
    }

    const { data: row, error } = await sb.from("inquiries").insert({
      source: d.source, agency_id: agencyId, agency_name: d.source === "agency" ? target.name.replace(/^Agentur /, "") : target.name,
      recipient_name: d.recipient || null,
      name: d.name, email: d.email, phone: d.phone || null, subject, message: d.message,
    }).select("id").single();
    if (error) throw error;

    if (d.source === "agency") return json({ ok: true, id: row.id });

    const msg = esc(d.message).replace(/\n/g, "<br>");
    const wrap = (inner: string) => `<div style="font-family:Arial,sans-serif;color:#243e3a;max-width:600px;margin:auto;padding:24px">${inner}<p style="margin-top:32px;font-size:12px;color:#777">SSM Partner AG · Stationsstrasse 92 · 6023 Rothenburg · 041 220 20 50</p></div>`;

    const errors: string[] = [];
    try {
      await send({
        from: FROM, to: [target.email], bcc: target.email === BCC ? undefined : [BCC], reply_to: d.email,
        subject: `Neue Kontaktanfrage: ${subject} – ${d.name}`,
        html: wrap(`<h2>Neue Kontaktanfrage für ${esc(target.name)}</h2>
          <p><b>Name:</b> ${esc(d.name)}<br><b>E-Mail:</b> ${esc(d.email)}<br><b>Telefon:</b> ${esc(d.phone || "–")}<br><b>Anliegen:</b> ${esc(subject)}</p>
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
