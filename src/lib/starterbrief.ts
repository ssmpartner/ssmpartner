import { supabase } from "@/integrations/supabase/client";

const TTL = 60 * 60 * 6;
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// Cache signed links so repeated visits don't hit the storage service again; retry briefly when it is busy (429).
export const signedStarterbriefUrl = async (path: string) => {
  const key = `sb-sign:${path}`;
  try {
    const c = JSON.parse(sessionStorage.getItem(key) || "null");
    if (c && c.exp > Date.now() + 60_000) return c.url as string;
  } catch { /* ignore */ }
  let lastErr: unknown;
  for (let i = 0; i < 3; i++) {
    const { data, error } = await supabase.storage.from("starterbrief").createSignedUrl(path, TTL);
    if (!error && data) {
      sessionStorage.setItem(key, JSON.stringify({ url: data.signedUrl, exp: Date.now() + TTL * 1000 }));
      return data.signedUrl;
    }
    lastErr = error;
    await sleep(1500 * (i + 1));
  }
  throw lastErr;
};
