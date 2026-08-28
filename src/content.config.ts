import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/**
 * One collection, one schema. Adding a page = dropping a .md file
 * into src/content/docs/<section>/<name>.md — the sidebar, search
 * index, tag pages and backlinks all pick it up automatically.
 */
const docs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    /** Emoji shown beside the page in nav and cards. */
    icon: z.string().default('📄'),
    /** Sidebar group. Order controlled by `sections` in wiki.config.ts. */
    section: z.string().default('Reference'),
    /** Sort position inside the section (lower first). */
    order: z.number().default(999),
    tags: z.array(z.string()).default([]),
    status: z.enum(['draft', 'review', 'stable', 'deprecated']).default('stable'),
    updated: z.coerce.date().optional(),
    owner: z.string().optional(),
    /** Hide from nav and search without deleting the file. */
    draft: z.boolean().default(false),
    /** Feature this page on the home page grid. */
    featured: z.boolean().default(false),
  }),
});

export const collections = { docs };
