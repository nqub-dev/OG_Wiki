/**
 * Base-path–aware URL helpers.
 *
 * GitHub Pages project sites are served from a sub-path
 * (https://org.github.io/client-wiki/), and Astro does NOT rewrite hrefs in
 * your markup — you have to prefix them yourself. Every internal link in this
 * template goes through these helpers, so switching `base` in wiki.config.ts
 * is all it takes to move the site under a sub-path.
 */

const raw = import.meta.env.BASE_URL || '/';
/** Always exactly one trailing slash, so joining is unambiguous. */
export const BASE = raw.endsWith('/') ? raw : `${raw}/`;

/** Prefix an internal path with the deployment base. External URLs pass through. */
export function url(path = ''): string {
  if (/^([a-z]+:)?\/\//i.test(path) || path.startsWith('mailto:') || path.startsWith('#')) {
    return path;
  }
  return `${BASE}${path.replace(/^\//, '')}`;
}

export const homeUrl = (): string => url();
export const docUrl = (id: string): string => url(`wiki/${id}`);
export const tagUrl = (tag?: string): string => url(tag ? `tags/${tag}` : 'tags');

/**
 * "Edit this page" URL on GitHub, derived from `repo` / `branch` /
 * `contentPath` in wiki.config.ts. Returns undefined when `repo` is unset,
 * which also hides the link — better than shipping one that 404s.
 *
 * `ext` matters: .md and .mdx pages coexist and GitHub needs the real path.
 */
/**
 * Values that ship with the template and are not a real repository. Treated
 * exactly like an unset `repo`: a link we know 404s is worse than no link, so
 * a freshly cloned wiki hides "Edit this page" until someone sets it.
 */
const PLACEHOLDER_REPO = /^\s*$|your-org|your-wiki|owner\/name|example/i;

export function isPlaceholderRepo(repo: string): boolean {
  return PLACEHOLDER_REPO.test(repo);
}

export function editUrl(
  repo: string,
  branch: string,
  contentPath: string,
  id: string,
  ext: string,
): string | undefined {
  if (isPlaceholderRepo(repo)) return undefined;
  const slug = repo.replace(/^https?:\/\/github\.com\//, '').replace(/\.git$|\/$/, '');
  return `https://github.com/${slug}/edit/${branch}/${contentPath}/${id}${ext}`;
}

/**
 * Deep link into the /admin CMS editor for one page.
 *
 * The CMS has one collection per section folder (see
 * scripts/gen-cms-config.mjs), so a page id of "start-here/welcome" maps to
 * collection "start-here", entry "welcome".
 */
export function cmsEditUrl(id: string): string | undefined {
  const slash = id.lastIndexOf('/');
  if (slash === -1) return undefined; // top-level file: no collection to target
  const collection = id.slice(0, slash);
  const entry = id.slice(slash + 1);
  return `${url('admin/')}#/collections/${collection}/entries/${entry}`;
}

/**
 * Link into the in-page editor (src/pages/wiki/edit.astro). Only .md pages
 * are supported there — see netlify/functions/wiki-get.mts for why.
 */
export function inlineEditUrl(id: string): string {
  return `${url('wiki/edit/')}?id=${encodeURIComponent(id)}`;
}
