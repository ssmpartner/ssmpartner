import { supabase } from "@/integrations/supabase/client";
export const signedStarterbriefUrl = async (path: string) => {
  const { data, error } = await supabase.storage.from("starterbrief").createSignedUrl(path, 60 * 60 * 6);
  if (error) throw error;
  return data.signedUrl;
};
