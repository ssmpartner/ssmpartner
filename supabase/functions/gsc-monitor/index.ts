import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SITE = 'https://ssmpartner.ch/';
const SITE_ENC = encodeURIComponent(SITE);
const GW = 'https://connector-gateway.lovable.dev/google_search_console';

const URLS_TO_INSPECT = [
  'https://ssmpartner.ch/',
  'https://ssmpartner.ch/ueber-uns',
  'https://ssmpartner.ch/agenturen',
  'https://ssmpartner.ch/karriere',
  'https://ssmpartner.ch/kontakt',
  'https://ssmpartner.ch/onlinecheck',
  'https://ssmpartner.ch/vag45',
  'https://ssmpartner.ch/rechtliches',
];

function authHeaders() {
  return {
    Authorization: `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
    'X-Connection-Api-Key': Deno.env.get('GOOGLE_SEARCH_CONSOLE_API_KEY') ?? '',
    'Content-Type': 'application/json',
  };
}

async function gw(path: string, init?: RequestInit) {
  const r = await fetch(`${GW}${path}`, { ...init, headers: { ...authHeaders(), ...(init?.headers || {}) } });
  const text = await r.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* ignore */ }
  return { ok: r.ok, status: r.status, body: json ?? text };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supa = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const started = Date.now();
  const issues: Array<{
    source: string; severity: string; url?: string | null;
    issue_code?: string | null; message: string; details?: any;
    fingerprint: string;
  }> = [];
  const errors: string[] = [];

  // --- 1) Sitemaps status
  let sitemapStatus: any = null;
  try {
    const r = await gw(`/webmasters/v3/sites/${SITE_ENC}/sitemaps`);
    if (!r.ok) {
      errors.push(`sitemaps list failed: ${r.status} ${JSON.stringify(r.body)}`);
    } else {
      sitemapStatus = r.body;
      const sitemaps = (r.body?.sitemap ?? []) as any[];
      if (sitemaps.length === 0) {
        issues.push({
          source: 'sitemap', severity: 'error',
          message: 'Keine Sitemap in der Search Console eingereicht',
          fingerprint: 'sitemap|none',
        });
      }
      for (const sm of sitemaps) {
        if (sm.errors && Number(sm.errors) > 0) {
          issues.push({
            source: 'sitemap', severity: 'error', url: sm.path,
            issue_code: 'sitemap_errors',
            message: `Sitemap enthält ${sm.errors} Fehler`,
            details: sm,
            fingerprint: `sitemap|errors|${sm.path}`,
          });
        }
        if (sm.warnings && Number(sm.warnings) > 0) {
          issues.push({
            source: 'sitemap', severity: 'warning', url: sm.path,
            issue_code: 'sitemap_warnings',
            message: `Sitemap enthält ${sm.warnings} Warnungen`,
            details: sm,
            fingerprint: `sitemap|warnings|${sm.path}`,
          });
        }
        if (sm.isPending) {
          issues.push({
            source: 'sitemap', severity: 'warning', url: sm.path,
            issue_code: 'sitemap_pending',
            message: 'Sitemap wird noch verarbeitet',
            details: sm,
            fingerprint: `sitemap|pending|${sm.path}`,
          });
        }
      }
    }
  } catch (e) {
    errors.push(`sitemaps exception: ${(e as Error).message}`);
  }

  // --- 2) URL Inspection
  const inspections: any[] = [];
  for (const url of URLS_TO_INSPECT) {
    try {
      const r = await gw(`/v1/urlInspection/index:inspect`, {
        method: 'POST',
        body: JSON.stringify({ inspectionUrl: url, siteUrl: SITE }),
      });
      if (!r.ok) {
        // 403 or 404 likely means URL inspection not enabled / site not verified yet
        errors.push(`urlInspection ${url}: ${r.status}`);
        continue;
      }
      const result = r.body?.inspectionResult ?? {};
      const idx = result.indexStatusResult ?? {};
      inspections.push({ url, indexStatus: idx });

      const verdict = idx.verdict; // PASS | PARTIAL | FAIL | NEUTRAL
      const coverage = idx.coverageState as string | undefined;
      const robots = idx.robotsTxtState; // ALLOWED | DISALLOWED
      const indexing = idx.indexingState; // INDEXING_ALLOWED | BLOCKED_BY_META_TAG | …

      if (verdict === 'FAIL') {
        issues.push({
          source: 'url_inspection', severity: 'error', url,
          issue_code: 'verdict_fail',
          message: `Nicht indexiert: ${coverage ?? 'unbekannt'}`,
          details: idx,
          fingerprint: `url|${url}|verdict_fail`,
        });
      }
      if (robots && robots !== 'ALLOWED') {
        issues.push({
          source: 'url_inspection', severity: 'error', url,
          issue_code: 'robots_blocked',
          message: `Durch robots.txt blockiert (${robots})`,
          details: idx,
          fingerprint: `url|${url}|robots_blocked`,
        });
      }
      if (indexing && indexing !== 'INDEXING_ALLOWED') {
        issues.push({
          source: 'url_inspection', severity: 'error', url,
          issue_code: 'indexing_blocked',
          message: `Indexierung blockiert (${indexing})`,
          details: idx,
          fingerprint: `url|${url}|indexing_blocked`,
        });
      }
      if (coverage && /not (found|indexed)|error|excluded/i.test(coverage)) {
        issues.push({
          source: 'url_inspection',
          severity: coverage.toLowerCase().includes('error') ? 'error' : 'warning',
          url, issue_code: 'coverage_issue',
          message: `Coverage-Problem: ${coverage}`,
          details: idx,
          fingerprint: `url|${url}|coverage|${coverage}`,
        });
      }
    } catch (e) {
      errors.push(`urlInspection ${url} exception: ${(e as Error).message}`);
    }
  }

  // --- 3) Performance (last 28 days)
  let performance: any = null;
  try {
    const end = new Date().toISOString().slice(0, 10);
    const start = new Date(Date.now() - 28 * 86400_000).toISOString().slice(0, 10);
    const r = await gw(`/webmasters/v3/sites/${SITE_ENC}/searchAnalytics/query`, {
      method: 'POST',
      body: JSON.stringify({
        startDate: start, endDate: end,
        dimensions: ['date'], rowLimit: 1000,
      }),
    });
    if (r.ok) {
      const rows = (r.body?.rows ?? []) as any[];
      const totals = rows.reduce((acc, row) => ({
        clicks: acc.clicks + (row.clicks ?? 0),
        impressions: acc.impressions + (row.impressions ?? 0),
      }), { clicks: 0, impressions: 0 });
      performance = {
        period: { start, end },
        totals,
        days: rows.length,
        series: rows.map((r) => ({
          date: r.keys?.[0], clicks: r.clicks, impressions: r.impressions,
          ctr: r.ctr, position: r.position,
        })),
      };
    } else {
      errors.push(`searchAnalytics: ${r.status}`);
    }
  } catch (e) {
    errors.push(`searchAnalytics exception: ${(e as Error).message}`);
  }

  // --- 4) Persist issues (upsert by fingerprint) + resolve missing
  const seenFingerprints = new Set(issues.map((i) => i.fingerprint));

  for (const it of issues) {
    await supa.from('gsc_monitor_issues').upsert(
      {
        source: it.source, severity: it.severity, url: it.url ?? null,
        issue_code: it.issue_code ?? null, message: it.message,
        details: it.details ?? null, fingerprint: it.fingerprint,
        last_seen_at: new Date().toISOString(),
        resolved_at: null, acknowledged: false,
      },
      { onConflict: 'fingerprint' }
    );
  }

  // Auto-resolve previously open issues not seen this run
  const { data: open } = await supa
    .from('gsc_monitor_issues')
    .select('id,fingerprint')
    .is('resolved_at', null);
  if (open) {
    const toResolve = open.filter((o) => !seenFingerprints.has(o.fingerprint)).map((o) => o.id);
    if (toResolve.length) {
      await supa.from('gsc_monitor_issues')
        .update({ resolved_at: new Date().toISOString() })
        .in('id', toResolve);
    }
  }

  // --- 5) Log run
  const ok = errors.length === 0;
  await supa.from('gsc_monitor_runs').insert({
    status: ok ? 'success' : 'partial',
    duration_ms: Date.now() - started,
    sitemap_status: sitemapStatus,
    performance,
    url_inspections: inspections,
    issues_found: issues.length,
    error_message: errors.length ? errors.join('\n') : null,
  });

  return new Response(
    JSON.stringify({ ok, issues_found: issues.length, errors }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});