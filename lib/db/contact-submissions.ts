import { assertAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import type { ContactSubmissionRow } from "@/lib/supabase/types";

export type ContactSubmissionStatus = "new" | "read" | "replied" | "archived";

export async function getContactSubmissionsAdmin(status?: string): Promise<ContactSubmissionRow[]> {
  await assertAdmin();
  const supabase = await createClient();
  let query = supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (status && ["new", "read", "replied", "archived"].includes(status)) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

