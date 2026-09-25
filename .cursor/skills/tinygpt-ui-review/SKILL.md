---
name: tinygpt-ui-review
description: >-
  Reviews the TinyGPT web app as a frontend, UI, and UX designer. Use when the
  user asks for a design review, UI/UX pass, layout critique, visual coherence
  check, or to judge pages for fonts, messaging, structure, accessibility,
  ease of use, or understandability.
disable-model-invocation: true
---

# TinyGPT UI review

Act as a frontend, UI, and UX designer. Judge the live product. Do not
implement fixes unless asked. Do not read source unless a control is missing
on screen and you need to confirm it does not exist.

Default app URL: `http://localhost:3000` (never `192.168.*`).

Product facts that are bugs when the UI contradicts them: [product-map.md](../tinygpt-early-user/product-map.md).

## Setup

1. If the app is not running, start `make dev` or `npm run dev` and wait for port 3000.
2. Use the browser. Lock the tab. Unlock when finished.
3. On a Google account picker or consent screen, stop and ask the user to finish sign-in. Resume when they are back on TinyGPT.
4. Walk signed-out pages first, then signed-in pages. Use a real agent id from the user's account for `/chat`, `/embed`, and `/admin/share`. If none exists, say so and skip those URLs.

## Pages

Visit each one. Exercise the controls, do not only look.

| URL | Who | What to do |
|---|---|---|
| `/` | Signed out | Read the page. Submit the site field. Resize to a phone width. |
| `/login` | Signed out | Find how to sign in. Note errors if Supabase is not configured. |
| `/admin` | Signed in | Find agents, create, and a way back out. |
| `/admin/new` | Signed in | Step through company, knowledge, appearance, quick questions, save. |
| `/admin/share/[id]` | Signed in | Find the public link and the embed snippet. |
| `/chat/[id]` | Public | Ask one in-knowledge question. Refresh. |
| `/embed/[id]` | Public | Check the widget size and that it can be used. |
| `/admin/create` | Signed in | Note where it sends you. |
| `/internal/prospector` | Founder | Only if asked. Not a product page. |

Also judge the shell that wraps these pages: is there one layout, a way to tell where you are, and a way to sign out?

## How to judge

Score each aspect 1–5. 1 means it blocks or misleads. 3 means a person can finish but has to guess. 5 means it is obvious and consistent with the rest of the app.

Judge these aspects on every page, and again for the app as a whole:

- **Design** — visual system, spacing, color, components
- **Fonts** — pairing, size, hierarchy
- **Messaging** — whether the words match what the product actually does
- **Structure** — layout, landmarks, how sections relate
- **Accessibility** — labels, contrast, keyboard, focus, hit targets
- **Ease of use** — steps, errors, empty states
- **Intuitive UI** — can someone act without being told
- **Coherence** — one product, or a pile of unrelated screens
- **Understandability** — what this page is for, in one glance

Quote on-screen text. Name the URL. One screenshot of a broken or confusing screen is useful. Do not screenshot every step.

## Output

```markdown
# TinyGPT UI review

**Shell:** one layout / several unrelated screens
**Could I tell where I am and get out?** yes / no

## App
| Aspect | Score | Note |
|---|---:|---|
| Design | | |
| Fonts | | |
| Messaging | | |
| Structure | | |
| Accessibility | | |
| Ease of use | | |
| Intuitive UI | | |
| Coherence | | |
| Understandability | | |

## Pages
### `/`
- What I did:
- Scores: Design n · Fonts n · Messaging n · Structure n · Accessibility n · Ease of use n · Intuitive UI n · Coherence n · Understandability n
- Issues: quote the screen, then what should change

(repeat for each URL visited)

## Missing chrome
- …

## Do not treat as bugs
Known MVP limits: no PDF/DOCX parse, knowledge cap ~200k characters, JavaScript-only sites crawl thin.

## If I shipped this
One paragraph: what a shop owner would feel, and the first three design changes.
```

Do not paste secrets, tokens, or `.env` values. Unlock the browser when finished.
