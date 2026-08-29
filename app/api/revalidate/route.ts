import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

// Map of Supabase table names → cache tags to purge on any mutation
const TABLE_TAG_MAP: Record<string, string[]> = {
  real_estate_listings: ["all-listings"],
  pages: ["all-pages"],
  page_sections: ["all-pages"],
  page_blocks: ["all-pages"],
  page_block_media: ["all-pages"],
  media_assets: ["all-pages", "all-listings", "updates", "team", "offices", "site-settings", "seo-landing-pages", "seo-pages"],
  site_settings: ["site-settings"],
  team_members: ["team"],
  updates: ["updates"],
  update_links: ["updates"],
  update_media: ["updates"],
  faqs: ["faqs"],
  office_locations: ["offices"],
  listing_media: ["all-listings"],
  seo_landing_pages: ["seo-landing-pages"],
  seo_pages: ["seo-pages"],
  seo_redirects: ["redirects"],
  seo_url_rules: ["seo-url-rules"],
};

export async function POST(request: NextRequest) {
  // Verify the request comes from our trusted Supabase webhook
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.SUPABASE_WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const table = payload.table as string | undefined;
  const record = (payload.record ?? payload.old_record) as Record<string, unknown> | undefined;

  if (!table) {
    return NextResponse.json({ error: "Missing table in payload" }, { status: 400 });
  }

  // Revalidate all table-level tags
  const tags = TABLE_TAG_MAP[table] ?? [];
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }

  // Also revalidate record-specific tags for surgical precision
  if (table === "real_estate_listings" && record?.slug) {
    revalidateTag(`listing-${record.slug}`, "max");
  }
  if (table === "pages" && record?.route_path) {
    revalidateTag(`page-${record.route_path}`, "max");
  }
  if (table === "seo_landing_pages" && record?.canonical_path) {
    revalidateTag(`seo-landing-${record.canonical_path}`, "max");
  }
  if (table === "seo_pages" && record?.route_path) {
    revalidateTag(`seo-page-${record.route_path}`, "max");
  }
  if (table === "seo_url_rules" && record?.source_pattern) {
    revalidateTag(`seo-url-rule-${record.source_pattern}`, "max");
  }
  if (table === "updates" && record?.slug) {
    revalidateTag(`update-${record.slug}`, "max");
  }
  if (table === "team_members" && record?.id) {
    revalidateTag(`team-member-${record.id}`, "max");
  }
  if (table === "team_members" && record?.slug) {
    revalidateTag(`team-profile-${record.slug}`, "max");
  }

  return NextResponse.json({
    revalidated: true,
    table,
    tags: [...tags],
    now: Date.now(),
  });
}
