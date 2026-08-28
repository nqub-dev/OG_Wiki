#!/usr/bin/env node
/**
 * Dependency-free accessibility smoke test over the built HTML in dist/.
 *
 * Deliberately narrow: it checks the mistakes that are easy to reintroduce
 * while editing templates, and that are cheap to detect without a headless
 * browser. It is a safety net, not a substitute for an audit.
 *
 *   npm run check:a11y             → report, exit 0
 *   npm run check:a11y -- --strict → fail on any violation
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const strict = process.argv.includes('--strict');
const DIST = new URL('../dist/', import.meta.url).pathname;

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name);
    if (e.isDirectory()) return walk(full);
    return e.name.endsWith('.html') ? [full] : [];
  });
}

const issues = [];
const add = (file, rule, detail) => issues.push({ file: relative(DIST, file), rule, detail });

for (const file of walk(DIST)) {
  const html = readFileSync(file, 'utf8');

  if (!/<html[^>]+lang=/.test(html))
    add(file, 'html-has-lang', '<html> is missing a lang attribute');

  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim();
  if (!title) add(file, 'document-title', 'page has no non-empty <title>');

  // <img> without alt (decorative images must use alt="")
  for (const img of html.match(/<img\b[^>]*>/g) ?? []) {
    if (!/\salt=/.test(img)) add(file, 'image-alt', img.slice(0, 90));
  }

  // Buttons/links with no text and no accessible name
  for (const el of html.match(/<(button|a)\b[^>]*>[\s\S]*?<\/\1>/g) ?? []) {
    const hasAria = /aria-label=|aria-labelledby=|title=/.test(el);
    const text = el
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!hasAria && !text) add(file, 'accessible-name', el.slice(0, 90));
  }

  // Duplicate ids break label/aria references
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dupes = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  for (const id of dupes)
    add(file, 'duplicate-id', `id="${id}" appears ${ids.filter((x) => x === id).length}×`);

  // Exactly one <h1> per page
  const h1s = (html.match(/<h1\b/g) ?? []).length;
  if (h1s === 0) add(file, 'page-has-heading-one', 'no <h1>');
  if (h1s > 1) add(file, 'page-has-heading-one', `${h1s} <h1> elements`);
}

const pages = walk(DIST).length;
if (issues.length === 0) {
  console.log(`✓ check:a11y — ${pages} pages, no violations`);
  process.exit(0);
}

console.log(
  `\n${strict ? '✗' : '!'} check:a11y — ${issues.length} issue(s) across ${pages} pages:\n`,
);
const byRule = issues.reduce((acc, i) => ((acc[i.rule] ??= []).push(i), acc), {});
for (const [rule, list] of Object.entries(byRule)) {
  console.log(`  ${rule} (${list.length})`);
  for (const i of list.slice(0, 5)) console.log(`    ${i.file}: ${i.detail}`);
  if (list.length > 5) console.log(`    …and ${list.length - 5} more`);
  console.log();
}
process.exit(strict ? 1 : 0);
