import fs from 'node:fs';
import path from 'node:path';
import { visit } from 'unist-util-visit';

/**
 * Obsidian-style [[wikilinks]] for Markdown and MDX.
 *
 *   [[engineering/deploy]]                → /wiki/engineering/deploy, labelled
 *                                            with that page's real `title`
 *   [[engineering/deploy|the deploy doc]] → custom label
 *   [[engineering/deploy#hosting]]        → deep link to a heading
 *
 * Links whose target page does not exist get `data-wikilink`, which the page
 * script turns into a red "unresolved" link — a built-in backlog of pages
 * worth writing.
 */
const WIKILINK = /\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g;
const DOCS_DIR = path.resolve('src/content/docs');

/** slug -> title, rebuilt whenever a content file changes. */
let titleCache = null;
let cacheStamp = 0;

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.mdx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

function getTitles() {
  if (!fs.existsSync(DOCS_DIR)) return new Map();

  const files = walk(DOCS_DIR);
  // Cheap invalidation: newest mtime across the content tree.
  const stamp = files.reduce((max, f) => Math.max(max, fs.statSync(f).mtimeMs), files.length);
  if (titleCache && stamp === cacheStamp) return titleCache;

  const map = new Map();
  for (const file of files) {
    const slug = path
      .relative(DOCS_DIR, file)
      .replace(/\\/g, '/')
      .replace(/\.mdx?$/, '');
    const source = fs.readFileSync(file, 'utf8');
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const title = frontmatter?.[1]
      .match(/^title:\s*(.+)$/m)?.[1]
      .trim()
      .replace(/^["']|["']$/g, '');
    if (title) map.set(slug, title);
  }

  titleCache = map;
  cacheStamp = stamp;
  return map;
}

export function remarkWikiLinks(options = {}) {
  const rawBase = options.base || '/';
  const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

  return (tree) => {
    const titles = getTitles();

    visit(tree, 'text', (node, index, parent) => {
      if (!parent || typeof index !== 'number') return;
      if (!node.value.includes('[[')) return;

      const children = [];
      let cursor = 0;
      let match;

      WIKILINK.lastIndex = 0;
      while ((match = WIKILINK.exec(node.value)) !== null) {
        const [raw, target, hash, label] = match;

        if (match.index > cursor) {
          children.push({ type: 'text', value: node.value.slice(cursor, match.index) });
        }

        const slug = target
          .trim()
          .toLowerCase()
          .replace(/\.mdx?$/, '')
          .replace(/\s+/g, '-');

        const anchor = hash ? `#${hash.trim().toLowerCase().replace(/\s+/g, '-')}` : '';

        children.push({
          type: 'link',
          url: `${base}wiki/${slug}${anchor}`,
          data: { hProperties: { 'data-wikilink': slug } },
          // Explicit label wins; otherwise use the target page's real title.
          children: [{ type: 'text', value: (label ?? titles.get(slug) ?? target).trim() }],
        });

        cursor = match.index + raw.length;
      }

      if (!children.length) return;
      if (cursor < node.value.length) {
        children.push({ type: 'text', value: node.value.slice(cursor) });
      }

      parent.children.splice(index, 1, ...children);
      return index + children.length;
    });
  };
}

export default remarkWikiLinks;
