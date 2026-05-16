import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, phone, message, intent, city } = body;

  if (!name?.trim() || !email?.includes("@")) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Phase 2: send to Supabase or email provider
  const ref = `EB-${String(Date.now()).slice(-6)}`;
  console.log("Contact inquiry:", { name, email, phone, message, intent, city, ref });

  return NextResponse.json({ ok: true, ref });
}
