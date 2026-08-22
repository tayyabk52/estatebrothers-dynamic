import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export class AdminAccessError extends Error {
  constructor(message = "You do not have permission to manage this site.") {
    super(message);
    this.name = "AdminAccessError";
  }
}

export async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || !isAdmin) return null;

  return user;
}

export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function assertAdmin() {
  const user = await getAdminUser();
  if (!user) throw new AdminAccessError();
  return user;
}

