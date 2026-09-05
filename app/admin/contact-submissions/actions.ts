"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import type { ContactSubmissionStatus } from "@/lib/db/contact-submissions";

const validStatuses = new Set<ContactSubmissionStatus>(["new", "read", "replied", "archived"]);

export async function updateContactSubmissionStatus(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as ContactSubmissionStatus;

  if (!id || !validStatuses.has(status)) {
    throw new Error("Invalid contact inquiry update.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_submissions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/contact-submissions");
}

