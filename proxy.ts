import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function needsAuthCheck(pathname: string) {
  return (
    pathname.startsWith("/dashboard") ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password"
  );
}

/** Best-effort per-isolate throttle for public client pages (soft abuse brake). */
const publicHits = new Map<string, { count: number; resetAt: number }>();

function allowPublicHit(key: string, limit = 90, windowMs = 60_000): boolean {
  const now = Date.now();
  const cur = publicHits.get(key);
  if (!cur || now >= cur.resetAt) {
    publicHits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (cur.count >= limit) return false;
  cur.count += 1;
  return true;
}

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/u/") || pathname.startsWith("/queue/")) {
    const ip = clientIp(request);
    if (!allowPublicHit(`${ip}:${pathname.startsWith("/u/") ? "u" : "q"}`)) {
      return new NextResponse("Too many requests. Try again shortly.", {
        status: 429,
        headers: { "Retry-After": "60" },
      });
    }
  }

  // Public routes skip Supabase session work entirely.
  if (!needsAuthCheck(pathname)) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Soft gate with local session read; RSC layout still verifies via getUser().
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (!user && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Skip static assets and Next internals. Auth check itself is further
     * gated in needsAuthCheck().
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
