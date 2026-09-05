import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX = { name: 100, email: 254, phone: 40, intent: 80, city: 80, message: 3000 } as const;

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (clean(body.website, 200)) {
    return NextResponse.json({ ok: true, ref: "EB-RECEIVED" });
  }

  const name = clean(body.name, MAX.name);
  const email = clean(body.email, MAX.email).toLowerCase();
  const phone = clean(body.phone, MAX.phone);
  const message = clean(body.message, MAX.message);
  const intent = clean(body.intent, MAX.intent) || "General inquiry";
  const city = clean(body.city, MAX.city);

  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid name and email address." }, { status: 400 });
  }

  const ref = `EB-${crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`;
  const supabase = await createClient();
  const { error } = await supabase.from("contact_submissions").insert({
    reference: ref,
    name,
    email,
    phone: phone || null,
    intent,
    city: city || null,
    message: message || null,
    status: "new",
    source_path: "/contact",
  });

  if (error) {
    console.error("Unable to store contact inquiry", error.code);
    return NextResponse.json({ error: "We could not send your inquiry. Please try WhatsApp or call us." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ref });
}
