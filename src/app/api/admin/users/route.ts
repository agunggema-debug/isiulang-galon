import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { methodNotAllowed } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 500 });
    }

    const { data: users, error } = await supabase
      .from("users")
      .select("id, email, name, role, phone, address, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase users error:", error);
      return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
    }

    return NextResponse.json({
      users: users?.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        phone: u.phone,
        address: u.address,
        createdAt: u.created_at,
      })) || [],
    });
  } catch (error) {
    console.error("Users error:", error);
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