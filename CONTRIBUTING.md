# Contributing to the wiki

There are three ways to edit this wiki. Pick the one that matches you — they all
end up in the same place, as Markdown files committed to the repo.

---

## 1. I just want to fix some words

Click **"Edit this page"** at the top of any page. That opens GitHub's editor in
your browser. Make the change, write a one-line summary, and choose
_"Create a new branch and start a pull request"_.

A preview link gets posted to the pull request automatically. Open it, check
your change looks right, and ask for a review.

You need a GitHub account with access to this repo. You do **not** need to
install anything.

---

## 2. I write a lot and don't want to think about GitHub

Go to **`/admin`** on the wiki. That's a visual editor — a form for the page
settings, a rich text area for the body, and drag-and-drop for images. Saving
publishes through the same review process as everything else.

> **Setup note for whoever installs this:** `/admin` needs a one-time OAuth
> helper before anyone can sign in. A browser can't complete GitHub's OAuth flow
> on its own, because that requires a client secret that must never ship to the
> browser. Deploy the `sveltia-cms-auth` Worker to Cloudflare, register a GitHub
> OAuth app pointing at it, then set `base_url` in
> `public/admin/config.yml` — or rather, set `repo` in `wiki.config.ts` and run
> `npm run gen:cms`, since that file is generated. Until that's done, `/admin`
> loads but sign-in fails.

---

## 3. I'm a developer

```bash
npm install
npm run dev
```

Content lives in `src/content/docs/`. Add a `.md` file, and the sidebar, search
index, tag pages, backlinks and prev/next navigation all pick it up — there is
no navigation config to update.

Before pushing:

```bash
npm run verify
```

That type-checks, fails on broken internal links, builds the site and search
index, and runs the accessibility smoke test — the same gates CI runs.

### Writing with Obsidian

Because the content is plain Markdown using `[[wikilinks]]`, you can open
`src/content/docs/` directly as an Obsidian vault. Obsidian's link syntax is the
same one this wiki renders, so backlinks and graph view work locally with no
export step and no extra tooling. Commit the files when you're done.

---

## Page conventions

- **One page, one job.** If it needs a three-level table of contents, split it.
- **Set a `status`.** `draft`, `review`, `stable`, or `deprecated`. It shows as a
  badge in the sidebar and on the page, and feeds the "Needs attention" count on
  the home page.
- **Name an `owner`.** Unowned pages rot.
- **Link generously.** `[[section/page]]` auto-labels itself with that page's
  real title. Links to pages that don't exist yet render in red — that's a
  feature, it turns the wiki into its own backlog. `npm run check:links` lists
  them all.

Full field reference: `/wiki/reference/frontmatter`.

---

## Review

`.github/CODEOWNERS` routes reviews automatically — content changes go to the
docs owners, build and styling changes go to the platform owners. Update it when
you clone this template for a new client.
