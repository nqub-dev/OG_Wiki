---
title: Frontmatter reference
description: Every field the content schema accepts and exactly what it controls.
icon: 📋
section: Reference
order: 2
tags: [reference, authoring, schema]
status: stable
updated: 2026-08-26
owner: Platform Team
---

Frontmatter is validated by Zod in `src/content.config.ts`. A typo fails the
build with a precise error rather than silently producing a broken page.

## Fields

| Field         | Type     | Default      | Controls                                                 |
| ------------- | -------- | ------------ | -------------------------------------------------------- |
| `title`       | string   | **required** | Page `<h1>`, sidebar label, search result title          |
| `description` | string   | —            | Subtitle, card text, `<meta name="description">`         |
| `icon`        | string   | `📄`         | Emoji in the sidebar, cards, and page heading            |
| `section`     | string   | `Reference`  | Sidebar group; ordered by `sections` in `wiki.config.ts` |
| `order`       | number   | `999`        | Position within the section (lower first)                |
| `tags`        | string[] | `[]`         | Tag badges and `/tags/*` pages                           |
| `status`      | enum     | `stable`     | Badge: `draft`, `review`, `stable`, `deprecated`         |
| `updated`     | date     | —            | "Updated" line and home page recency list                |
| `owner`       | string   | —            | Named owner in the page header                           |
| `draft`       | boolean  | `false`      | Hides from production; still visible in `npm run dev`    |
| `featured`    | boolean  | `false`      | Promotes the page to the home page "Start here" row      |

## Minimum viable page

```yaml
---
title: Something useful
---
```

## A fully specified page

```yaml
---
title: Incident response
description: What to do in the first fifteen minutes of an outage.
icon: 🚨
section: Operations
order: 1
tags: [oncall, incident, urgent]
status: stable
updated: 2026-08-26
owner: Ana Ruiz
featured: true
---
```

## Adding a field

1. Add it to the Zod schema in `src/content.config.ts`.
2. Render it wherever it belongs — usually `src/pages/wiki/[...slug].astro`.
3. Document it in the table above.

Because the schema is typed, `doc.data.yourField` autocompletes in the editor
immediately after step 1.

## Related

- [[start-here/how-to-edit]] — the authoring workflow
- [[reference/components]] — components available in MDX
