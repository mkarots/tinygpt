# ADR 0001: Deploy the Next.js app on Vercel

- **Status:** Accepted
- **Date:** 2026-09-25
- **Issue:** [#9](https://github.com/mkarots/tinygpt/issues/9)

## Context

TinyGPT is a Next.js app. Supabase holds auth, agent rows, and knowledge. Gemini answers chat and cleans crawled pages. A visitor must open `/chat/<id>` and an embed on a public origin, without the maker's laptop.

`POST /api/crawl` fetches a page (30 second timeout), extracts content with Cheerio, and asks Gemini to strip navigation. It does not launch Chromium. That is what makes a normal serverless host viable. See [docs/how-it-works.md](../how-it-works.md).

Issue #9 requires one documented deploy target that can run chat and persistence. `public/tinygpt.js` sets the iframe host from `new URL(script.src).origin`, so the embed follows whichever deployment served the script.

## Decision

Deploy the Next.js app on **Vercel**.

Supabase and Gemini stay external services. Vercel runs the app and its route handlers only.

Required host environment variables (names only):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
- `GEMINI_API_KEY`

Google OAuth in Supabase must allow the production origin as a redirect URL.

## Alternatives considered

| Option | Why not |
| --- | --- |
| Railway, Render, or Fly.io | A long-running `next start` process works, and it has looser timeouts. It is extra process ops for an app that no longer needs a browser. |
| A VPS or Docker host | Same app, more to operate than the MVP needs. |
| Stay on `next dev` | A laptop is not a public origin. Embeds and a second machine cannot use it. |

## Consequences

- Production origin is the Vercel deployment URL, or a custom domain attached to that project.
- The crawl route sets `maxDuration` to 60 seconds: 30 seconds for the fetch, then Gemini cleanup. The Vercel plan must allow that duration. A lower cap kills website import while chat can still succeed.
- JavaScript-only sites still come back thin or empty. Vercel does not change that.
- `public/tinygpt.js` takes its base URL from the script origin. A shop that copies the file onto another host will embed that host, not this deployment.
- Preview deployments are optional. If they should accept Google sign-in, add each preview origin to the Supabase redirect allowlist.
- This ADR does not choose a custom domain, a Vercel plan, or how env vars are entered in the dashboard.
