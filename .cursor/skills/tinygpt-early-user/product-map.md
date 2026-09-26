# TinyGPT product map (early-user testers)

Read this only when you need to know what the current MVP is supposed to do.

## Routes

| URL | Who | Purpose |
|---|---|---|
| `/` | Anyone | Landing page. Signed-in users go to `/admin`. Sign-in is `/login`. |
| `/login` | Anyone | Google OAuth. Returns to `/admin` via `/auth/callback`. |
| `/admin` | Signed-in | **Official** owner builder: onboarding, knowledge, appearance, deploy. |
| `/admin/create` | Signed-in | Opens the official builder. Redirects to `/admin/new`. |
| `/internal/prospector` | Signed-in (founder) | Internal demo factory. Not a product path. |
| `/chat/[id]` | Public | Hosted agent page + chat. |
| `/embed/[id]` | Public | Widget-sized chat. |

## What save does

The official builder calls `saveAgent`. You must be signed in. The agent
gets a UUID. Full source text is stored on the agent (not vector search).
You should get `/chat/[id]`. Prospector uses the same save so a demo
link works; it is not a second product create flow.

## What chat does

Hosted chat loads that agent and sends **all active knowledge** plus the
**last 20 turns** (this tab only) to Gemini. Answers should stay inside
the knowledge. Refresh clears the conversation.

Preview chat in the builder can run without a saved id (sends knowledge
from the browser).

## What files do

Drop zone accepts text-like types (`.txt`, `.md`, etc.). PDF and DOCX are
not parsed. A website URL is crawled to markdown.

## Auth notes

Use `http://localhost:3000` only. If Google shows `redirect_uri_mismatch`,
stop and tell the human — do not debug Cloud Console in this skill.
