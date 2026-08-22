<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Supabase Authentication Architecture

When implementing or modifying Supabase authentication flows in this Next.js project, you must strictly follow this pattern to avoid browser-level QUIC protocol and CORS errors:

1. **Server Actions Only:** Never execute Supabase Auth mutations (e.g., `signInWithPassword`, `signUp`) directly in Client Components. All auth credential handling must happen within a Next.js Server Action.
2. **Server-Side Authorization:** The Server Action must handle the Supabase Auth call, perform any necessary authorization checks (like calling `is_admin` via RPC), write the session cookies using the SSR server client, and handle the final redirect.
3. **Client Integration:** Client login forms should submit to the Server Action using React's `useActionState` to manage loading states and error messages gracefully. Ensure robust error handling for network failures.
4. **Middleware Validation:** In the route proxy (middleware), avoid unnecessary `getUser()` network calls if possible. Rely on efficient session/claims validation according to Supabase SSR best practices.
