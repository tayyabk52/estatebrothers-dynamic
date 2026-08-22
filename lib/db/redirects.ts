import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/admin/auth";

export interface SeoRedirect {
  id: string;
  source_path: string;
  target_path: string;
  status_code: number;
  active: boolean;
}

/**
 * Cached lookup for dynamic 301/308 redirects.
 * Resolves source paths (e.g. old slugs) to their new canonical destination.
 */
export async function getRedirectForPath(sourcePath: string): Promise<SeoRedirect | null> {
  "use cache";
  cacheLife("days");
  cacheTag("redirects");

  const normalizedSource = sourcePath.startsWith("/") ? sourcePath : `/${sourcePath}`;
  const supabase = createPublicClient();

  const { data } = await supabase
    .from("seo_redirects")
    .select("id, source_path, target_path, status_code, active")
    .eq("source_path", normalizedSource)
    .eq("active", true)
    .maybeSingle();

  if (!data) return null;
  return data as SeoRedirect;
}

/**
 * Records or updates a permanent redirect from an old path to a new path.
 * Also collapses redirect chains (e.g., A -> B, and now B -> C becomes A -> C).
 */
export async function recordRedirect(
  sourcePath: string,
  targetPath: string,
  statusCode: 301 | 302 | 307 | 308 = 301
): Promise<void> {
  const normSource = sourcePath.startsWith("/") ? sourcePath : `/${sourcePath}`;
  const normTarget = targetPath.startsWith("/") ? targetPath : `/${targetPath}`;

  if (normSource === normTarget) return;

  await assertAdmin();
  const supabase = await createClient();

  // 1. Collapse existing chains: Any redirect that pointed to normSource should now point to normTarget
  await supabase
    .from("seo_redirects")
    .update({ target_path: normTarget, status_code: statusCode })
    .eq("target_path", normSource)
    .eq("active", true);

  // 2. Prevent redirect loops: Remove any redirect pointing in the opposite direction
  await supabase
    .from("seo_redirects")
    .delete()
    .eq("source_path", normTarget)
    .eq("target_path", normSource);

  // 3. Upsert the new redirect
  const { data: existing } = await supabase
    .from("seo_redirects")
    .select("id")
    .eq("source_path", normSource)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("seo_redirects")
      .update({
        target_path: normTarget,
        status_code: statusCode,
        active: true,
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("seo_redirects").insert({
      source_path: normSource,
      target_path: normTarget,
      status_code: statusCode,
      active: true,
    });
  }

  // 4. Invalidate the redirect cache
  revalidateTag("redirects", "max");
}
