# Admin performance review

Initial investigation: 2026-09-06. No database migrations or auth changes applied.

## Evidence

- Supabase `EXPLAIN (ANALYZE, BUFFERS)` on the admin listings projection ordered by `updated_at DESC`: 15 rows, execution 0.18 ms, planning 0.91 ms. This was a privileged SQL measurement, not a browser/PostgREST/authenticated-RLS benchmark. It does not establish end-to-end latency.
- `lib/admin/auth.ts`: each `getAdminUser()` performs `auth.getUser()` and then the `is_admin` RPC. Parallel editor loaders each independently call `assertAdmin()`, repeating these checks within one render.
- `app/admin/page.tsx`: four parallel queries download status rows and aggregate counts in JavaScript. At current data volume this is small; aggregate database queries become useful as content grows.
- `lib/db/contact-submissions.ts`: all inquiry rows are fetched with no pagination. Pagination is a useful scaling improvement, but must preserve filters, counts and access policies.
- `lib/db/pages-admin.ts`: page editing loads the complete sections/blocks/media graph. Large galleries can increase transfer and render cost even when SQL execution is fast.
- Further Supabase inspection stopped when the MCP connection returned `Auth required`.

## Next pass

1. Capture authenticated cold/warm page timings and separate auth, RPC, PostgREST, server rendering and transfer time. Compare local and deployed environments.
2. Evaluate request-scoped React `cache()` deduplication for admin identity checks during rendering. Preserve fresh per-request authorization and mandatory checks inside every mutation; do not use shared public caching for admin sessions.
3. Measure authenticated query plans including RLS before adding indexes. Add only indexes justified by the actual filter/order/row-volume workload.
4. Add server-side pagination where row growth warrants it, with accurate totals and consistent filters.
5. Consider lazy loading large editor panels and database-side counts only after measuring their contribution.
6. Repeat the same timings and verify authorization, saving, uploading, filtering and cache invalidation before claiming a speedup.

Loading indicators added in the current pass improve feedback; they are not evidence of faster data fetching.
