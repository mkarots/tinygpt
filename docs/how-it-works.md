# How TinyGPT works

A Next.js app that stores one signed-in user’s knowledge on a single Supabase agent row, then stuffs that text into Gemini at chat time. There is no retrieval step on the live answer path.

| Fact | Value |
| --- | --- |
| Agent id | UUID, minted with `crypto.randomUUID()` in `CreateAgentUseCase` |
| Knowledge storage | Full text as `jsonb` on the `agents` row |
| Size cap | 200,000 characters; larger saves are rejected |
| Chat model | `gemini-3.6-flash` for crawl cleaning and chat |

## Maker loop

Signed-in create. Local wizard state is not the system of record. Persistence starts at the save request.

1. **Sign in.** Google OAuth writes a Supabase session into cookies. `/login` uses the browser client. Middleware then sends a signed-in user to `/admin`.
2. **Build.** `/admin` lists that user's agents. `/admin/new` is the product create surface. The wizard collects files, a crawled URL, pasted text, appearance, and quick questions in React state.
3. **Persist.** `saveAgent` POSTs `/api/agent`. The route builds the cookie-aware server client, requires a user, and upserts a profile before the agent row.
4. **Share.** Save returns a UUID and opens `/admin/share/[id]`. That page shows `/chat/[id]` and a script tag whose `data-id` is the same UUID.

## Visitor loop

Public read and chat. The same agent id is the chat URL, the embed URL, and the script attribute.

1. **Open.** A visitor hits `/chat/[id]`, or `tinygpt.js` reads `data-id` and loads an iframe at `/embed/[id]`. The embed page reads `params.id`.
2. **Load.** Both pages GET `/api/agent/[id]`. That handler uses the server client and does not require a session. Public RLS allows the select.
3. **Answer.** `WidgetChat` POSTs `/api/chat`. `ChatUseCase` loads the row and Gemini streams a reply grounded only on the stored knowledge text.

## Request map

“Public” is the product rule, not a database role. Those routes still use the anon Supabase key inside the server client.

| Surface | Auth | Server work |
| --- | --- | --- |
| `/login` | Public | Browser client starts Google OAuth. Callback lands on `/admin`. |
| `/admin` | Required | Lists agents for the signed-in user (`listByUser`). |
| `/admin/new` | Required | Onboarding wizard. Files are read in the browser. URL crawl calls `POST /api/crawl`. |
| `POST /api/agent` | Required | Server client reads `auth.getUser()`. Missing user is 401. Sets `agents.user_id`. |
| `GET /api/agent/[id]` | Public | Same server client, no user check. Chat and embed both load this payload. |
| `POST /api/chat` | Public | Loads the agent when `agentId` is set, or previews unsaved config and knowledge. |
| `POST /api/crawl` | Public route | Fetch + Cheerio extract the page, Turndown makes markdown, Gemini strips nav and footers. No Chromium. |

## What a save writes

Apply `supa_schema.sql` in the Supabase SQL editor before the first save. The app does not create tables. If `profiles` or `agents` is missing, save tells the operator “Agent storage is not set up” instead of the PostgREST schema-cache string.

`CreateAgentUseCase` assigns `crypto.randomUUID()` unless the client already sent a UUID. Knowledge over 200,000 characters is rejected before the upsert. `SupabaseAgentRepository` then upserts `profiles` for that auth user, because `agents.user_id` references `profiles.id`.

The row stores name, description, the full `AgentConfig` jsonb (color, greeting, tone, quick questions), and the knowledge array. Item types are `file`, `url`, and `text`. Short random ids on those items are not the agent primary key.

## How an answer is formed

`GeminiLLMService.chat` concatenates active knowledge into a system instruction and tells the model to answer only from that block. Recent chat turns are passed as history. The response is streamed back as plain text.

`supa_schema.sql` also defines a `knowledge` table with a 768-d pgvector column, and `GeminiEmbeddingService` can call `text-embedding-004`. The chat use case does not query that table. The shipped answer path is context stuffing, not RAG.

## Session boundary

`src/lib/supabase.ts` is `createBrowserClient`, used by `/login` and `AuthProvider`. API routes cannot see that storage. They call `src/lib/supabase-server.ts`, which reads the Next cookie jar, and pass that client into `SupabaseAgentRepository`. `save()` then calls `auth.getUser()` on the same client and writes `user_id`.

## Modules

| Layer | Type | Role |
| --- | --- | --- |
| Onboarding, DropZone, PastedTextForm | Client | Collect knowledge before any save. |
| `saveAgent` | Client fetch | `POST /api/agent` with config and knowledge. |
| `CreateAgentUseCase` | Domain | UUID, size cap, then `repository.save`. |
| `SupabaseAgentRepository` | Infrastructure | Profile upsert, agent upsert, `getById`. |
| `ChatUseCase` | Domain | Load agent or preview, then call the LLM. |
| `GeminiLLMService` | Infrastructure | Clean crawled markdown and stream chat. |
| `tinygpt.js` | Static script | Iframe at `/embed/` plus the `data-id`. |
