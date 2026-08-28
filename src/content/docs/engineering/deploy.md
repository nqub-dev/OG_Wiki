---
title: Build & deploy
description: How to build the wiki and host it — including the search index step.
icon: 🚀
section: Engineering
order: 2
tags: [deploy, hosting, ci]
status: stable
updated: 2026-08-24
owner: Platform Team
---

## Commands

| Command           | What it does                                              |
| ----------------- | --------------------------------------------------------- |
| `npm run dev`     | Dev server with hot reload. Search is unavailable here.   |
| `npm run build`   | Builds to `dist/`, then generates the Pagefind index.     |
| `npm run preview` | Full build plus a local server — use this to test search. |
| `npm run check`   | Type-checks Astro components and content schemas.         |

<!-- The search index is the one non-obvious part of the pipeline. -->

## Why search needs the build

Pagefind indexes the **rendered HTML**, so it runs after Astro finishes:

```bash
astro build && pagefind --site dist
```

That's already wired into `npm run build`. If you configure a host to run
`astro build` directly, search will silently return nothing — set the build
command to `npm run build`.

## Hosting

The output is static files. Anything that serves a folder works:

- **Netlify / Vercel / Cloudflare Pages** — build `npm run build`, publish `dist`
- **GitHub Pages** — same, plus set `site` in `wiki.config.ts` to the Pages URL
- **S3 + CloudFront**, nginx, or a USB stick — it's just HTML

## Before handing a wiki to a client

1. Set `site` in `wiki.config.ts` to the real URL (sitemap and canonicals depend on it).
2. Point `editBase` at their repo, or set it to `''` to hide edit links.
3. Trim `themes: all` in `src/styles/global.css` to the themes they'll actually use —
   this cuts a meaningful amount of CSS.
4. Replace `src/content/docs/` with their content.
5. Run `npm run check` and `npm run preview`, and click through search.

## Related

- [[engineering/architecture]] — what's in the stack
- [[operations/runbook]] — what to do when a deploy goes wrong
