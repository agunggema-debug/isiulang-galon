import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { methodNotAllowed } from "@/lib/api-helpers";

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase belum dikonfigurasi" },
        { status: 500 }
      );
    }

    // Supabase query
    const { data } = await supabase.from("settings").select("key, value");

    const settings: Record<string, string> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data as any[])?.forEach((row: { key: string; value: string }) => {
      settings[row.key] = row.value;
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Settings error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export const POST = () => methodNotAllowed(["GET"]);
export const PUT = () => methodNotAllowed(["GET"]);
export const PATCH = () => methodNotAllowed(["GET"]);
export const DELETE = () => methodNotAllowed(["GET"]);