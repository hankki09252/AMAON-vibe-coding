# Agent guidance

Use repository context progressively. Read only what the task requires; do not preload architecture, schema, deployment, or unrelated feature files for every edit.

## Work to completion
- Implement the requested change, inspect the result, and fix failures caused by the change without pausing for routine approval.
- Prefer focused edits. Avoid broad cleanup unless it is necessary to complete the task.
- Preserve working product behavior and existing Korean UX/copy unless the request changes it.

## Where to look
- `app/`: Next.js application, routes, UI, auth, and server logic.
- `supabase/schema.sql`: source of truth for database schema changes. Read it when the task changes tables, policies, or database-backed behavior.
- `VERCEL_DEPLOYMENT.md`: deployment notes. Read it only for deployment or environment-variable work.
- `.env.example`: environment-variable names only; never commit real secrets.

## Local checks
- Node.js: `>=22.13.0`; package manager: pnpm.
- Use the narrowest useful check: `pnpm lint` for TypeScript/React changes; `pnpm build` when routes, server behavior, configuration, or a larger feature is affected.
- Documentation-only or clearly isolated edits do not require a full build.
- Rerun affected checks and fix failures introduced by the requested change without asking for approval each time.

## Data and production boundaries
- Do not apply `supabase/schema.sql` to a live project, delete production data, change auth/provider settings, or deploy to Vercel unless the user explicitly asks for that external action.
- When schema work is requested, update the repository schema/migration artifacts and verify application compatibility; leave production application as a separate explicit step.
