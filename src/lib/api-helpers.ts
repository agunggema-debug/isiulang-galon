import { NextResponse } from "next/server";

/**
 * Returns a 405 Method Not Allowed response for unsupported HTTP methods.
 */
export function methodNotAllowed(allowedMethods: string[]): NextResponse {
  return NextResponse.json(
    { error: `Method not allowed. Use: ${allowedMethods.join(", ")}` },
    { status: 405, headers: { Allow: allowedMethods.join(", ") } }
  );
}