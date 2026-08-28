import { OGImageRoute } from 'astro-og-canvas';
import { getCollection } from 'astro:content';
import wiki from '../../../wiki.config';

/**
 * Auto-generated Open Graph images — one per wiki page, rendered at build time.
 * Output lands at /og/<page-id>.png and is referenced from BaseLayout.
 *
 * Turn it off with `ogImage.enabled: false` in wiki.config.ts; the layout then
 * falls back to a plain `summary` Twitter card with no image.
 *
 * Note: in astro-og-canvas 0.13 `OGImageRoute()` returns a Promise and infers
 * the route parameter from the filename — so this must be awaited, and there
 * is no `param` option.
 */
const docs = await getCollection('docs', ({ data }) => !data.draft);

const pages = Object.fromEntries(
  docs.map(({ id, data }) => [
    id,
    { title: data.title, description: data.description ?? wiki.name },
  ]),
);

const route = await OGImageRoute({
  pages,
  getImageOptions: (_path, page: { title: string; description: string }) => ({
    title: page.title,
    description: page.description,
    bgGradient: wiki.ogImage.bgGradient,
    border: { color: wiki.ogImage.border, width: 20, side: 'inline-start' },
    padding: 80,
    font: {
      title: { size: 72, weight: 'Bold', color: [255, 255, 255], lineHeight: 1.1 },
      description: { size: 32, weight: 'Normal', color: [190, 195, 215], lineHeight: 1.4 },
    },
  }),
});

export const getStaticPaths = route.getStaticPaths;
export const GET = route.GET;
