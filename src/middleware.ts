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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionId = request.cookies.get("session_id")?.value;

  // Protected routes
  const isAdminRoute = pathname.startsWith("/admin");
  const isShopRoute = pathname.startsWith("/shop");
  const isLoginRoute = pathname.startsWith("/login");
  const isApiAuthRoute = pathname.startsWith("/api/auth");
  const isApiRoute = pathname.startsWith("/api/");

  // Apply rate limiting only to API routes (except auth routes)
  if (isApiRoute && !isApiAuthRoute) {
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
  }

  // Allow API auth routes
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // For Supabase mode, skip session-based redirects (handled by Supabase SSR)
  const hasSupabaseConfig = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (hasSupabaseConfig) {
    // Let Supabase handle auth via cookies
    return NextResponse.next();
  }

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