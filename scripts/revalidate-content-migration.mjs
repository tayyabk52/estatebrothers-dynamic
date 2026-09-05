// Use the existing authenticated cache hook after the reviewed content replacement.
const endpoint = 'https://estatebrothers-dynamic.vercel.app/api/revalidate';
const secret = process.env.SUPABASE_WEBHOOK_SECRET;
if (!secret) throw new Error('Missing local revalidation credential');
for (const table of ['media_assets', 'real_estate_listings', 'pages', 'page_sections', 'page_blocks', 'site_settings', 'team_members', 'office_locations', 'updates', 'seo_landing_pages', 'seo_redirects', 'seo_url_rules']) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${secret}` },
    body: JSON.stringify({ table }),
    signal: AbortSignal.timeout(15000),
  });
  console.log(table, response.status, await response.text());
  if (!response.ok) throw new Error(`Revalidation failed for ${table}`);
}
