import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // Max requests per window

function getRateLimitKey(request: NextRequest): string {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  return `${ip}:${request.nextUrl.pathname}`;
}

function applyRateLimit(request: NextRequest): NextResponse | null {
  const key = getRateLimitKey(request);
  const now = Date.now();

  const record = rateLimit.get(key);

  if (!record || now > record.resetTime) {
    rateLimit.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  } else if (record.count >= RATE_LIMIT_MAX) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  } else {
    record.count++;
  }

  // Clean up old entries periodically
  if (rateLimit.size > 10000) {
    for (const [k, v] of rateLimit.entries()) {
      if (now > v.resetTime) {
        rateLimit.delete(k);
      }
    }
  }

  return null;
}

function hasSupabaseConfig(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function requireAuth(request: NextRequest, pathname: string, sessionId: string | undefined): NextResponse | null {
  const isAdminRoute = pathname.startsWith("/admin");
  const isShopRoute = pathname.startsWith("/shop");
  const isLoginRoute = pathname.startsWith("/login");

  // Redirect to login if accessing protected routes without session (SQLite mode)
  if ((isAdminRoute || isShopRoute) && !sessionId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to home if accessing login while already logged in
  if (isLoginRoute && sessionId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return null;
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const sessionId = request.cookies.get("session_id")?.value;
  const isApiAuthRoute = pathname.startsWith("/api/auth");
  const isApiRoute = pathname.startsWith("/api/");

  // Apply rate limiting only to API routes (except auth routes)
  if (isApiRoute && !isApiAuthRoute) {
    const rateLimitResponse = applyRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  }

  // Allow API auth routes
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // For Supabase mode, skip session-based redirects (handled by Supabase SSR)
  if (hasSupabaseConfig()) {
    return NextResponse.next();
  }

  // Handle authentication redirects (SQLite mode)
  const authResponse = requireAuth(request, pathname, sessionId);
  if (authResponse) {
    return authResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/admin/:path*",
    "/shop",
    "/login",
  ],
};