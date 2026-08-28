#!/usr/bin/env node
/**
 * Reports internal links that point at pages which do not exist.
 *
 * Covers both [[wikilinks]] and Markdown links to /wiki/<id>. Unresolved links
 * render red in the browser, but that only helps someone who happens to open
 * the page — this surfaces the whole list at once, and in CI.
 *
 *   npm run check:links             → report, exit 0
 *   npm run check:links -- --strict → fail the build on any broken link
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const strict = process.argv.includes('--strict');
const DOCS = new URL('../src/content/docs/', import.meta.url).pathname;

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name);
    if (e.isDirectory()) return walk(full);
    return /\.mdx?$/.test(e.name) ? [full] : [];
  });
}

const files = walk(DOCS);
const idOf = (f) =>
  relative(DOCS, f)
    .replace(/\\/g, '/')
    .replace(/\.mdx?$/, '');
const known = new Set(files.map(idOf));

const WIKILINK = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g;
const MDLINK = /\]\(\/wiki\/([^)#\s]+)/g;

/**
 * Blank out fenced blocks and inline code, preserving line numbers, so that
 * documentation *about* the syntax (`[[this-page]]`) isn't reported as a
 * broken link. This mirrors the remark plugin, which only visits text nodes.
 */
function stripCode(body) {
  let inFence = false;
  return body.split('\n').map((line) => {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      return '';
    }
    if (inFence) return '';
    return line.replace(/`[^`]*`/g, '');
  });
}

const broken = [];
for (const file of files) {
  const body = readFileSync(file, 'utf8');
  const lines = stripCode(body);

  lines.forEach((line, i) => {
    for (const re of [WIKILINK, MDLINK]) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(line)) !== null) {
        const target = m[1].trim().toLowerCase().replace(/\s+/g, '-').replace(/\/$/, '');
        if (!known.has(target)) {
          broken.push({ from: idOf(file), line: i + 1, target });
        }
      }
    }
  });
}

if (broken.length === 0) {
  console.log(`✓ check:links — ${known.size} pages, no broken internal links`);
  process.exit(0);
}

console.log(
  `\n${strict ? '✗' : '!'} check:links — ${broken.length} unresolved internal link(s):\n`,
);
for (const b of broken) {
  console.log(`  ${b.from}.md:${b.line}  →  ${b.target}  (no such page)`);
}
console.log(
  `\nEither create src/content/docs/<id>.md, or fix the link.` +
    `\nUnresolved links are intentional in a wiki — they mark pages worth writing.\n`,
);
process.exit(strict ? 1 : 0);
