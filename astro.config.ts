import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { unified } from '@astrojs/markdown-remark';
import { remarkWikiLinks } from './src/lib/remark-wikilinks.mjs';
import wiki from './wiki.config';

export default defineConfig({
  site: wiki.site,
  base: wiki.base,
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    // Astro 7: remark/rehype plugins go through the `unified()` processor.
    processor: unified({
      remarkPlugins: [[remarkWikiLinks, { base: wiki.base }]],
    }),
    shikiConfig: {
      // `defaultColor: false` emits --shiki-light and --shiki-dark on every
      // token instead of baking one theme in. global.css then picks between
      // them with light-dark(), which follows each daisyUI theme's
      // `color-scheme` — so code blocks stay readable on all 37 themes.
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
      wrap: true,
    },
  },
});
