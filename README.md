# OG Wiki

A cloneable wiki template. Drop in Markdown, change one config file, hand it to a client.

Built with **Astro 7**, **Tailwind CSS 4**, and **daisyUI 5.5.20** — real packages, real
class names, no placeholders. `npm run check` passes with 0 errors.

---

## Quick start

```bash
npm install
npm run dev
```

Search only works against a real build, so use this to test it:

```bash
npm run preview
```

| Command           | What it does                                             |
| ----------------- | -------------------------------------------------------- |
| `npm run dev`     | Dev server with hot reload (no search index)             |
| `npm run build`   | Static build to `dist/` **+ Pagefind search index**      |
| `npm run preview` | Build, index, and serve — the true production experience |
| `npm run check`   | Type-check components and content schemas                |

> **Important for CI/hosting:** set the build command to `npm run build`, not
> `astro build`. The Pagefind index generation is chained onto `npm run build`;
> skip it and search silently returns nothing.

---

## Cloning this for a client

1. **Edit `wiki.config.ts`** — the single branding surface. Name, tagline, logo
   mark, theme, sidebar sections, nav links, footer, feature flags, edit links.
2. **Pick a theme.** Set `themes.light` / `themes.dark` to any of the 35 built-in
   daisyUI themes, or customise `og-light` / `og-dark` in `src/styles/global.css`.
3. **Swap the logo.** `src/components/Logo.astro` holds an inline SVG wordmark.
   Replace the paths with the client's, keeping two rules:
   - shapes that should follow the theme use `fill="currentColor"`
   - fixed brand accents use `var(--brand-accent, #hex)`

   That's what lets one wordmark stay legible on all 37 themes without
   shipping light and dark copies. Set `useLogo: false` to fall back to the
   `mark` emoji. Replace `public/favicon.png` and
   `src/assets/nqub-wordmark-white.png` (the OG card logo) too.

4. **Replace `src/content/docs/`** with their content.
5. **Trim the theme bundle.** `src/styles/global.css` ships `themes: all` so you can
   demo every look. Before production, narrow it:
   ```css
   @plugin 'daisyui' {
     themes:
       og-light --default,
       og-dark --prefersdark;
   }
   ```
6. **Set `site`** in `wiki.config.ts` to the real URL (sitemap, canonicals, OG images).
7. **Set `base`** if it deploys to a sub-path. `'/'` for a domain root or a GitHub
   user/org page; `'/client-wiki/'` for a GitHub _project_ page. Every internal
   link goes through `src/lib/links.ts`, so this one value moves the whole site.
8. Run `npm run preflight` — it lists any placeholder you forgot.
9. `npm run verify && npm run preview`, click through search, then deploy `dist/`.

### Brand assets

| Asset            | Where                                | Notes                                      |
| ---------------- | ------------------------------------ | ------------------------------------------ |
| Wordmark         | `src/components/Logo.astro`          | Inline SVG, theme-aware via `currentColor` |
| Original vectors | `src/assets/brand/`                  | Kept for future re-brands; not bundled     |
| Favicon          | `public/favicon.png`                 | Set the path in `wiki.config.ts`           |
| OG card logo     | `src/assets/nqub-wordmark-white.png` | Raster only — CanvasKit can't decode SVG   |

### Re-branding is one block of CSS

Every colour resolves to a daisyUI theme variable. No component hardcodes a hex
value, so a new palette re-skins the entire site:

```css
@plugin 'daisyui/theme' {
  name: 'acme';
  default: true;
  color-scheme: light;
  --color-primary: oklch(55% 0.2 25);
  --color-base-100: oklch(99% 0 0);
  --radius-box: 0.875rem;
  /* …remaining tokens */
}
```

---

## Adding a page

Create `src/content/docs/<section>/<name>.md`:

```yaml
---
title: Deploy checklist
description: What to verify before shipping.
icon: 🚀
section: Operations
order: 3
tags: [deploy, checklist]
status: stable # draft | review | stable | deprecated
updated: 2026-08-26
owner: Ana Ruiz
featured: false
---
```

The sidebar, search index, tag pages, backlinks and prev/next navigation all
update from that one file. There is no separate nav config to maintain.

Only `title` is required. Full field reference: `CONTRIBUTING.md`.

---

## Features

| Feature               | Notes                                                                              |
| --------------------- | ---------------------------------------------------------------------------------- |
| **Full-text search**  | Pagefind, static index, `⌘K` or `/`. No server, no API key.                        |
| **37 themes**         | 35 daisyUI built-ins + custom `og-light` / `og-dark`, persisted to `localStorage`. |
| **Wikilinks**         | `[[section/page]]` auto-labels with the target's real title.                       |
| **Unresolved links**  | Links to pages that don't exist render in red — a built-in backlog.                |
| **Backlinks**         | "Linked from" computed at build time on every page.                                |
| **Table of contents** | Sticky right rail with scroll-spy; collapses on mobile.                            |
| **Tags**              | `/tags` index and per-tag pages, generated from frontmatter.                       |
| **Status badges**     | `draft` / `review` / `deprecated` surface in nav, header, and home counters.       |
| **MDX components**    | `Callout`, `CardGrid`, `LinkCard`, `Steps`, `Tabs` — no imports needed.            |
| **Schema validation** | Zod. A frontmatter typo fails the build with a precise error.                      |

### JS payload

| Page                            | Ships                                 |
| ------------------------------- | ------------------------------------- |
| Any doc page                    | ~2 KB (theme picker + TOC scroll-spy) |
| Search                          | ~50 KB, lazy-loaded on first open     |
| Tabs, callouts, cards, steppers | 0 KB — CSS only                       |

---

## Project layout

```
wiki.config.ts              ← the only file you edit to re-brand
astro.config.ts             ← integrations, markdown pipeline, Shiki
CONTRIBUTING.md             ← how each tier of editor works
scripts/
  preflight.mjs             ← blocks shipping with placeholders
  check-links.mjs           ← unresolved wikilink report
  check-a11y.mjs            ← dependency-free a11y smoke test
  gen-cms-config.mjs        ← /admin config, generated from wiki.config.ts
public/admin/               ← Sveltia CMS (config.yml is generated)
.github/
  CODEOWNERS                ← review routing
  workflows/
    ci.yml                  ← format, types, links, build, a11y
    deploy-cloudflare.yml   ← Cloudflare Pages + PR previews (default)
    deploy.yml              ← GitHub Pages, manual-only (public wikis)
src/
  content.config.ts         ← Zod schema for frontmatter
  content/docs/**/*.md      ← all wiki content
  lib/
    content.ts              ← nav, tags, backlinks, siblings
    links.ts                ← base-path-aware URL helpers
    remark-wikilinks.mjs    ← [[wikilink]] support
  layouts/BaseLayout.astro  ← shell: drawer, navbar, footer
  components/
    Navbar, Sidebar, Toc, Breadcrumbs, PageNav, Backlinks,
    DocCard, Footer, Search, ThemeSwitcher
    mdx/                    ← Callout, CardGrid, LinkCard, Steps, Tabs
  pages/
    index.astro             ← portal home
    wiki/[...slug].astro    ← every doc page
    tags/                   ← tag index + per-tag pages
    og/[...route].ts        ← generated social images
    404.astro
```

---

## Hosting and access control

This is a **static site**, and that single fact decides how it gets delivered.

Every file in `dist/` is downloadable by anyone who knows its URL, and the
Pagefind index is a second copy of the page text. So hiding a page from the
sidebar does not make it private, and any "gate some sections" scheme leaks
through search. **Access control has to happen at the edge, and isolation has to
be per-deployment.**

### One repo, one deployment, one client

Do **not** build a shared multi-tenant wiki with per-section permissions. On a
static host it cannot be made safe. Clone the template per client instead —
client A cannot see client B's content because it is a different repository, a
different build, a different search index and a different domain. A client who
leaves takes a self-contained folder of Markdown with them.

### Choosing a host

| Host                      | Can gate a private site?                      | Use it for                    |
| ------------------------- | --------------------------------------------- | ----------------------------- |
| Netlify (git-connected)   | Yes — team-only, built in, free tier          | **This wiki** (nqub's own)    |
| Cloudflare Pages + Access | Yes — email, one-time PIN, or SSO, free tier  | Client wikis                  |
| Vercel                    | Yes, on Pro                                   | Alternative if already in use |
| GitHub Pages              | **No** — private Pages needs Enterprise Cloud | Public wikis only             |

This wiki runs on Netlify, connected directly to this repo (Site configuration
→ Build & deploy → Continuous deployment). Every push to `main` rebuilds and
republishes — no workflow needed for that.

`deploy-cloudflare.yml` targets Cloudflare Pages + PR previews and is the right
default for a **client** wiki. `deploy.yml` (GitHub Pages) is manual-only, for
the rare genuinely-public wiki — kept manual so it never races Netlify's
auto-deploy on this repo.

**Netlify credits are a hard cap, not a soft limit** (free tier: 300/month, 15
per production deploy — roughly 20 deploys before the site pauses entirely).
During a content-heavy stretch, turn off auto-deploy without losing the
editors' ability to keep saving: **Project configuration → Build & deploy →
Continuous deployment → Build settings → Configure → Build status → Stopped
builds.** Pushes queue for free; flip back to **Active** and trigger one
deploy to publish the whole batch. ("Lock to stop auto publishing" is a
_different_, unrelated toggle — it still builds on every push, just doesn't
publish it. Only **Stopped builds** stops the credit spend.)

### Gating this wiki: Descope

Netlify's own "team protection" gate requires every viewer to be invited as a
Netlify teammate — fine here, wrong for a client. This wiki instead uses
**Descope**, wired directly into the template:

- `netlify/edge-functions/auth-gate.ts` runs in front of every page and checks
  for a valid Descope session cookie (`DS`), verified against that Descope
  project's public JWKS.
- `src/pages/login.astro` renders Descope's hosted login widget, and copies
  the session it produces into a first-party `DS` cookie itself — Descope's
  own cookie-mode only sets cookies on its own domain unless you pay for a
  custom domain, which never reaches this origin.
- Turn it on: `auth.enabled: true` + `auth.descopeProjectId` in
  `wiki.config.ts`, the `DESCOPE_PROJECT_ID` env var in Netlify (scoped to
  include Functions), and in the Descope Console set session persistence to a
  cookie named `DS`.

**Self-signup is not the same as an allowlist.** A `sign-up-or-in` flow lets
anyone who can receive an email verify it and get in — a speed bump, not
access control. Restrict the flow itself with a domain condition (e.g. only
`@yourcompany.com`), or use `sign-in` mode and pre-provision every user in the
Descope Console, before treating this as a real gate.

While `auth.enabled` is `false` (the default), the edge function fails open —
a fresh clone is never accidentally locked out before Descope is configured.

Cloudflare Access is the better fit for an **external client** — gates by the
client's own email domain or SSO, no seat per reader.

### Editing without a GitHub account

Two people-facing editors ship, both gated the same way as reading:

- **`/admin`** — [Sveltia CMS](https://github.com/sveltia/sveltia-cms), a full
  visual editor. Needs a GitHub account (its own OAuth sign-in).
- **`/wiki/edit?id=<page>`** — this repo's own in-page editor. No GitHub
  account needed: it checks the same Descope session already gating the wiki,
  requires a `Wiki Edit` permission (Descope RBAC, not the default role), and
  commits through one shared, repo-scoped credential (`GITHUB_COMMIT_TOKEN`, a
  fine-grained PAT — Contents: Read and write only, set as a **secret**
  Netlify env var, unlike `DESCOPE_PROJECT_ID` which is meant to be public).
  `.md` pages only; `.mdx` pages carry custom components a plain-text editor
  can't safely round-trip, so they fall back to `/admin`.

Setting up `Wiki Edit`: Descope Console → **Authorization → RBAC** → create a
permission named exactly `Wiki Edit`, attach it to a role, assign that role to
whoever should be able to save. Everyone else keeps read access via the
default role, just not write.

### Provisioning a new client wiki

1. **Create the repo.** Private. Copy this template into it.
2. **Fill in `wiki.config.ts`** — `site`, `base`, `name`, `tagline`, `repo`, a theme.
3. **`npm run preflight`** — lists any template placeholder still in place. The production deploy runs it with `--strict` and refuses to publish while any remain.
4. **Pick a host per the table above.** Client → Cloudflare Pages (secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, variable `CLOUDFLARE_PROJECT_NAME`, enable the `push` trigger in `deploy-cloudflare.yml`). Internal → connect the Netlify site to the repo (build settings come from `netlify.toml`).
5. **Put an access gate in front of it** (Cloudflare Access for a client, Descope for something Netlify-hosted) _before_ the first real content goes in.
6. **Set up editing.** `/admin` needs a GitHub OAuth app registered with Netlify's OAuth provider (two clicks, no Worker, since Sveltia falls back to Netlify's own OAuth client). The in-page editor needs `GITHUB_COMMIT_TOKEN` plus the `Wiki Edit` Descope permission.
7. **Update `.github/CODEOWNERS`** so reviews route to real people.
8. **Replace the content** in `src/content/docs/`.
9. **Hand over** — walk them through `CONTRIBUTING.md`.

### Who gets what access

| Role             | Repo                          | Site                                            |
| ---------------- | ----------------------------- | ----------------------------------------------- |
| Us               | Admin                         | Access policy owner                             |
| Client reviewers | None                          | Access allowlist                                |
| Client editors   | None — use the in-page editor | Access allowlist + `Wiki Edit` permission       |
| The public       | None                          | Blocked, unless the wiki is deliberately public |

**Before publishing anything real:** confirm the gate is live by opening the
production URL in a private window. If the page loads without a sign-in
prompt, it is public — and so is the search index.

## Who edits it

Three tiers, no one forced up a level:

| Editor                  | How                                                                 | Needs                         |
| ----------------------- | ------------------------------------------------------------------- | ----------------------------- |
| Anyone with `Wiki Edit` | **"Edit this page"** → in-page editor → saves straight to `main`    | A Descope login, nothing else |
| Anyone with repo access | GitHub web editor → PR                                              | A GitHub account              |
| Developers              | `npm run dev`, or open `src/content/docs/` as an **Obsidian vault** | Node                          |

The Obsidian route works with no export step because the content is plain
Markdown and the `[[wikilink]]` syntax is the same one this wiki renders.

`/admin` is [Sveltia CMS](https://github.com/sveltia/sveltia-cms). Its config
is **generated** from `wiki.config.ts` by `npm run gen:cms` (which
`npm run build` runs for you), so the editor can never end up pointed at the
wrong client's repo.

Review routing is in `.github/CODEOWNERS`.

## Notes for the dev team

Four things here are deliberate and worth not "fixing":

- **`src/styles/global.css` puts the prose/code overrides outside `@layer`.**
  daisyUI themes `.prose` from `@layer utilities` using `:root .prose`. Unlayered
  CSS beats every layer, which avoids a specificity arms race. Code token colours
  use `light-dark()`, which resolves against each theme's `color-scheme` — so all
  37 themes stay readable with no theme allow-list.

- **`Search.astro` injects a `<script>` tag instead of using `import()`.**
  Vite rewrites dynamic imports through its preload helper and leaves an
  unresolved `__VITE_PRELOAD__` reference for paths it doesn't own, which throws
  at runtime. Pagefind is an IIFE that assigns `window.PagefindUI`, so a plain
  script tag is both simpler and correct.

- **Every Pagefind filter sits on its own element.** `data-pagefind-filter`
  does _not_ accept a comma-separated list — `"section:X,status:Y"` is stored as
  one filter value called `X,status:Y`. The section and status badges each carry
  a single bare filter name, so Pagefind uses the element's own text as the value.

- **`scripts/check-links.mjs` blanks out code spans before scanning.** Otherwise
  documentation _about_ the syntax (`[[this-page]]` in a code span) is reported
  as a broken link. This mirrors the remark plugin, which only visits text nodes.

## Licence

Template code: use freely. daisyUI, Astro, Tailwind and Pagefind retain their own
licences (all MIT).
