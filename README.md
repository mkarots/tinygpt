# TinyGPT

A Next.js app. Signed-in makers save an agent in Supabase. Visitors chat with it through Gemini on `/chat/<id>`, or through the embed script.

How the app works is in [docs/how-it-works.md](docs/how-it-works.md).

## Local setup

```bash
npm install
npm run dev
```

Set these environment variables. Do not commit the values.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `GEMINI_API_KEY`

Google sign-in also needs the local origin on the Supabase redirect allowlist. Visitor chat does not.

## Deploy

Deploy the Next.js app on Vercel ([ADR 0001](docs/adr/0001-deploy-on-vercel.md)). Do not install Chromium.

The same host must serve the app, `/api`, and `public/tinygpt.js`. The widget sets the iframe host from the script URL origin, so a preview deployment embeds itself.

`POST /api/crawl` fetches the page (30 second timeout), extracts `main` / `article` / content with Cheerio, converts it to markdown, then asks Gemini to strip navigation and footers. The route sets `maxDuration` to 60 seconds. The Vercel plan must allow that duration. An invalid URL returns `Invalid URL format`. A timeout returns `Timed out loading the page`. Pages that only render in a browser are not executed.

Opening `/chat/<id>` from a second machine is a check against a real deployment. This repository does not register a domain.

## Stack

- Next.js, React, TypeScript
- Supabase for auth and the agent row
- Gemini for chat and crawl cleanup
- Tailwind CSS
