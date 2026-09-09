# Contributing to the wiki

There are four ways to edit this wiki. Pick the one that matches you — they all
end up in the same place, as Markdown files committed to the repo.

---

## 1. I just want to fix some words or add a page

Click **"Edit this page"** at the top of any page — or, on the home page, add
a new one. That opens the in-page editor: title, tags, section, status, owner,
and the page body as plain Markdown. Click **Save**.

You need a **`Wiki Edit`** permission in Descope — ask an admin to grant it
(Descope Console → Authorization → RBAC → assign the `Wiki Editor` role to
your account). No GitHub account, no install.

Saving commits straight to `main`; the site rebuilds and republishes in about
a minute. This editor only handles `.md` pages — `.mdx` pages (ones using
custom components like `<Callout>` or `<Tabs>`) fall back to option 2 or 3
below.

---

## 2. I have a GitHub account and want the raw file

Click **"Edit on GitHub"** (or set `editTarget: 'github'` in `wiki.config.ts`
to make this the default). Opens GitHub's own editor. Make the change, write a
one-line summary, and choose _"Create a new branch and start a pull request"_.

---

## 3. I write a lot and want a visual editor

Go to **`/admin`**. A form for the page settings, a rich text area for the
body, and drag-and-drop for images.

> **One-time setup, by an admin:** sign-in needs a GitHub OAuth app registered
> with Netlify. Because this wiki is hosted on Netlify, Sveltia CMS uses
> Netlify's built-in OAuth client automatically — no Worker, no client secret
> in the repo.
>
> 1. GitHub → Settings → Developer settings → **OAuth Apps → New OAuth App**.
>    Authorization callback URL: `https://api.netlify.com/auth/done`
> 2. Netlify → Site configuration → **Access control → OAuth → Install
>    provider → GitHub**, and paste the Client ID and Client Secret from step 1.
> 3. Done. `/admin` sign-in now works for anyone with write access to the repo.

---

## 4. I'm a developer

```bash
npm install
npm run dev
```

Content lives in `src/content/docs/`. Add a `.md` file, and the sidebar,
search index, tag pages, backlinks and prev/next navigation all pick it up —
there is no navigation config to update.

Before pushing:

```bash
npm run verify
```

That type-checks, fails on broken internal links, builds the site and search
index, and runs the accessibility smoke test — the same gates CI runs.

### Writing with Obsidian

Because the content is plain Markdown using `[[wikilinks]]`, you can open
`src/content/docs/` directly as an Obsidian vault. Obsidian's link syntax is
the same one this wiki renders, so backlinks and graph view work locally with
no export step and no extra tooling. Commit the files when you're done.

---

## Frontmatter reference

Only `title` is required — everything else has a sensible default.

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
| `featured`    | boolean  | `false`      | Promotes the page to the home page "Featured" row        |

```yaml
---
title: Deploy checklist
description: What to verify before shipping.
icon: 🚀
section: Operations
order: 3
tags: [deploy, checklist]
status: stable
updated: 2026-08-26
owner: Ana Ruiz
featured: false
---
```

## MDX components

Only in `.mdx` files (not `.md`) — no import needed, they're global.

```mdx
<Callout type="tip" title="Do this">
  The recommended path. Types: note (default), tip, warning, danger.
</Callout>

<CardGrid cols={3}>
  <LinkCard title="Welcome" href="/wiki/start-here/welcome" icon="👋" description="Orientation." />
</CardGrid>

<Steps>

1. First thing
2. Second thing

</Steps>

<Tabs labels={['macOS', 'Linux']}>
  <Fragment slot="tab-0">macOS instructions</Fragment>
  <Fragment slot="tab-1">Linux instructions</Fragment>
</Tabs>
```

`Tabs` and the CSS-only components ship 0 KB of JS. Leave a blank line after
`<Steps>` and before `</Steps>` so MDX parses the list as Markdown, not JSX.

---

## Page conventions

- **One page, one job.** If it needs a three-level table of contents, split it.
- **Set a `status`.** It shows as a badge in the sidebar and on the page, and
  feeds the "Needs attention" count on the home page.
- **Name an `owner`.** Unowned pages rot.
- **Link generously.** `[[section/page]]` auto-labels itself with that page's
  real title. Links to pages that don't exist yet render in red — that's a
  feature, it turns the wiki into its own backlog. `npm run check:links` lists
  them all.

---

## Review

`.github/CODEOWNERS` routes reviews automatically — content changes go to the
docs owners, build and styling changes go to the platform owners. Update it
when you clone this template for a new client.
