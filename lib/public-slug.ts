const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const RESERVED_PUBLIC_SLUGS = new Set([
  "u",
  "queue",
  "dashboard",
  "login",
  "signup",
  "forgot-password",
  "api",
  "settings",
  "admin",
  "orbit",
  "jupiter",
  "auth",
  "assets",
  "public",
  "hub",
  "earnings",
  "workflow",
  "availability",
  "commissions",
  "www",
]);

/** Normalize user input to a candidate slug (lowercase, trimmed). */
export function normalizePublicSlug(raw: string): string {
  return raw.trim().toLowerCase();
}

export type SlugValidation =
  | { ok: true; slug: string }
  | { ok: false; error: string };

export function validatePublicSlug(raw: string): SlugValidation {
  const slug = normalizePublicSlug(raw);
  if (!slug) {
    return { ok: false, error: "Username is required." };
  }
  if (slug.length < 3 || slug.length > 30) {
    return { ok: false, error: "Username must be 3–30 characters." };
  }
  if (!SLUG_RE.test(slug)) {
    return {
      ok: false,
      error: "Use lowercase letters, numbers, and single hyphens only.",
    };
  }
  if (RESERVED_PUBLIC_SLUGS.has(slug)) {
    return { ok: false, error: "That username is reserved." };
  }
  return { ok: true, slug };
}

/** Prefer /u/slug when claimed; otherwise fall back to /queue/token. */
export function publicClientUrl({
  slug,
  token,
  origin = "",
}: {
  slug?: string | null;
  token: string;
  origin?: string;
}): string {
  const base = origin.replace(/\/$/, "");
  const path =
    slug && slug.trim()
      ? `/u/${normalizePublicSlug(slug)}`
      : `/queue/${token}`;
  return base ? `${base}${path}` : path;
}
