// Read-only CMS inventory. Credentials stay in the local environment.
import { createClient } from '@supabase/supabase-js';
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(12000) }) },
});
const tables = process.argv.slice(2);
for (const table of tables.length ? tables : ['pages']) {
  const { data, error } = await client.from(table).select('*');
  console.log(JSON.stringify({ table, data, error }));
  if (error) process.exitCode = 1;
}
