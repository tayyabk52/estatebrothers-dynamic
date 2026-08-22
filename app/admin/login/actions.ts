"use server";

import { redirect } from "next/navigation";
import { getAdminLoginErrorMessage } from "@/lib/admin/login-error";
import { validateAdminLoginCredentials } from "@/lib/admin/login-validation";
import { createClient } from "@/lib/supabase/server";

export type AdminLoginState = { error: string | null };

export async function loginAdmin(_previousState: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  const validation = validateAdminLoginCredentials(formData);
  if ("error" in validation) return { error: validation.error };
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword(validation.credentials);
  if (signInError) return { error: getAdminLoginErrorMessage(signInError) };
  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError || !isAdmin) { await supabase.auth.signOut(); return { error: "This account is not approved for Estate Brothers admin access." }; }
  redirect("/admin");
}
