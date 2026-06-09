import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  let code: string;
  try {
    const body = await req.json();
    code = body.code;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  // Atomic delete — only the first concurrent request finds and removes the row.
  // Any racing request gets no row back and is rejected.
  const { data, error } = await supabaseAdmin
    .from("desktop_auth_codes")
    .delete()
    .eq("code", code)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .select("token")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Invalid, expired, or already-used code" }, { status: 401 });
  }

  // Clean up any remaining expired codes
  await supabaseAdmin
    .from("desktop_auth_codes")
    .delete()
    .lt("expires_at", new Date(Date.now() - 10 * 60 * 1000).toISOString());

  return NextResponse.json({ token: data.token });
}
