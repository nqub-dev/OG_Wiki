---
title: Architecture
description: How this wiki is built, why each piece was chosen, and what to change per client.
icon: 🏗️
section: Engineering
order: 1
tags: [architecture, astro, daisyui]
status: stable
updated: 2026-08-26
owner: Platform Team
featured: true
---

## The stack

| Layer          | Choice         | Why                                                         |
| -------------- | -------------- | ----------------------------------------------------------- |
| Site framework | Astro 7        | Ships zero JS by default; Markdown is a first-class citizen |
| Styling        | Tailwind CSS 4 | CSS-first config, no `tailwind.config.js` to maintain       |
| Components     | daisyUI 5.5.20 | Semantic classes + 35 themes, all driven by CSS variables   |
| Search         | Pagefind       | Static index built at deploy time; no server, no API key    |
| Content        | Markdown / MDX | Portable. Clients keep their content if they leave          |

Everything renders to static HTML. There is no database, no runtime, and no
per-seat licence — a finished wiki is a folder you can host anywhere.

## Why daisyUI carries the design system

Every colour in the UI resolves to a daisyUI theme variable — `--color-primary`,
`--color-base-100`, `--color-base-content`, and so on. No component hardcodes a
hex value.

The practical consequence: **re-skinning a client wiki is a one-line change.**
Point `wiki.config.ts` at a different theme, or define a custom one in
`src/styles/global.css`:

```css
@plugin 'daisyui/theme' {
  name: 'acme';
  default: true;
  color-scheme: light;
  --color-primary: oklch(55% 0.2 25);
  --color-base-100: oklch(99% 0 0);
  --radius-box: 0.875rem;
  /* …the rest of the tokens */
}
```

Every card, badge, alert, button and prose block picks it up. No component edits.

## Data flow

```
src/content/docs/**/*.md
        │
        ▼
  content.config.ts        ← schema validation (Zod)
        │
        ▼
  src/lib/content.ts       ← nav, tags, backlinks, siblings
        │
        ├──► Sidebar        (grouped by `section`)
        ├──► /wiki/[...slug] (page + TOC + backlinks + prev/next)
        ├──► /tags/[tag]     (generated from frontmatter)
        └──► Pagefind index  (built from `data-pagefind-body`)
```

Adding a page touches exactly one file. Nothing else needs updating — that's the
modularity requirement made concrete.

## Backlinks

`getBacklinks()` in `src/lib/content.ts` scans every page's raw body for
`[[this-page]]` and `/wiki/this-page` references. It runs at build time, so
backlinks cost nothing at runtime.

Unresolved wikilinks — links to pages nobody has written — render in red. That
turns the wiki into its own backlog.

## What ships to the browser

| Page                            | JS payload                            |
| ------------------------------- | ------------------------------------- |
| Any doc page                    | ~2 KB (theme picker + TOC scroll-spy) |
| Search opened                   | ~50 KB, lazy-loaded on first `⌘K`     |
| Tabs, callouts, cards, steppers | 0 KB                                  |

## See also

- [[engineering/deploy]] — hosting and CI
- [[reference/frontmatter]] — the content schema
