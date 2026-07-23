import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

async function fetchPublicPageData(token: string) {
  const supabase = createPublicClient();
  const [
    { data: artistRows },
    { data: queue },
    { data: gallery },
    { data: socials },
  ] = await Promise.all([
    supabase.rpc("get_public_artist", { p_token: token }),
    supabase.rpc("get_public_queue", { p_token: token }),
    supabase.rpc("get_public_gallery", { p_token: token }),
    supabase.rpc("get_public_socials", { p_token: token }),
  ]);

  return {
    artist: artistRows?.[0] ?? null,
    queue: queue ?? [],
    gallery: gallery ?? [],
    socials: socials ?? [],
  };
}

/** Short-lived cache for the public client page (avoids cold RPC hits every request). */
export function getPublicPageData(token: string) {
  return unstable_cache(
    () => fetchPublicPageData(token),
    ["public-page", token],
    { revalidate: 20 }
  )();
}
