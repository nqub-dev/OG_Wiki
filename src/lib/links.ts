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
