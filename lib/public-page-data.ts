import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { normalizePublicSlug } from "@/lib/public-slug";

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

async function resolveSlugToToken(slug: string) {
  const supabase = createPublicClient();
  const { data } = await supabase.rpc("resolve_public_slug", {
    p_slug: normalizePublicSlug(slug),
  });
  return data ?? null;
}

/** Resolve /u/slug → token, then reuse the token-based public page cache. */
export async function getPublicPageDataBySlug(slug: string) {
  const token = await unstable_cache(
    () => resolveSlugToToken(slug),
    ["public-slug", normalizePublicSlug(slug)],
    { revalidate: 20 }
  )();
  if (!token) {
    return { artist: null, queue: [], gallery: [], socials: [] };
  }
  return getPublicPageData(token);
}
