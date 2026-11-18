import nodemailer from "npm:nodemailer@6.9.16";

export type SmtpConfig = { host: string; port: number; secure: boolean; username: string; password: string; from_email: string; from_name: string; notify_email: string; enabled: boolean };

// deno-lint-ignore no-explicit-any
export async function loadSmtp(sb: any): Promise<SmtpConfig | null> {
  const { data } = await sb.from("smtp_settings").select("*").eq("id", 1).maybeSingle();
  if (!data || !data.enabled || !data.host || !data.from_email) return null;
  return data as SmtpConfig;
}

export type Mail = { to: string | string[]; bcc?: string | string[]; replyTo?: string; subject: string; html: string };

export async function sendSmtp(cfg: SmtpConfig, m: Mail) {
  const t = nodemailer.createTransport({
    host: cfg.host, port: cfg.port, secure: cfg.secure,
    auth: cfg.username ? { user: cfg.username, pass: cfg.password } : undefined,
    connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 20000,
  });
  return await t.sendMail({ from: `"${cfg.from_name}" <${cfg.from_email}>`, to: m.to, bcc: m.bcc, replyTo: m.replyTo, subject: m.subject, html: m.html });
}
