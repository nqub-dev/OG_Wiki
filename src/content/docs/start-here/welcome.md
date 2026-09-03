---
title: Welcome - this is Big Daddy
description: What this wiki is, how it's organised, and where to go first.
icon: 👋
section: Start Here
order: 1
tags:
  - orientation
  - meta
status: stable
updated: 2026-08-26
owner: Platform Team
featured: true
---
## What this is

This is a **living wiki**, not a document dump. Every page is a Markdown file in
`src/content/docs/`. Add a file, and the sidebar, search index, tag pages and
backlink graph all update themselves — there is no separate navigation config to
keep in sync.

## How it's organised

Pages belong to a **section** (set in frontmatter) and are ordered inside it.
Four sections ship by default:

| Section     | What lives here             |
| ----------- | --------------------------- |
| Start Here  | Orientation for new readers |
| Handbook    | People, process, and policy |
| Engineering | Architecture, systems, code |
| Operations  | Runbooks and on-call        |
| Reference   | Lookups and specifications  |

Rename or replace them in `wiki.config.ts` — the `sections` array also controls
the order they appear in.

## Three ways to find things

1. **Search** — press <kbd>⌘K</kbd> (or `/`) anywhere. Full-text, instant, offline.
2. **Browse** — the sidebar mirrors the section structure.
3. **Follow links** — every page lists what links _to_ it under "Linked from".

That last one is the point. A wiki earns its keep when pages reference each
other, so link generously: see [[start-here/how-to-edit]] for the syntax.

## Conventions we follow

- **One page, one job.** If a page needs a table of contents three levels deep, split it.
- **Say when it's stale.** Set `status: draft` or `status: deprecated` and it gets a badge everywhere.
- **Name an owner.** Pages without owners rot. The `owner` field shows in the page header.

## Where to go next

- [[start-here/how-to-edit]] — write your first page in about two minutes
- [[reference/components]] — the component gallery
- [[engineering/architecture]] — how this site is built
