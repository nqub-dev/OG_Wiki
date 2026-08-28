#!/usr/bin/env node
/**
 * Refuses to let a wiki ship with template placeholders still in it.
 *
 *   npm run preflight            → warns, exit 0 (so demos/dev never break)
 *   npm run preflight -- --strict → fails, exit 1 (used by the deploy workflow)
 */
import { readFileSync } from 'node:fs';

const strict = process.argv.includes('--strict');
const config = readFileSync(new URL('../wiki.config.ts', import.meta.url), 'utf8');

const value = (key) => config.match(new RegExp(`^\\s*${key}:\\s*'([^']*)'`, 'm'))?.[1] ?? '';

const checks = [
  {
    name: 'site',
    ok: !/example\.com/.test(value('site')),
    found: value('site'),
    fix: 'Set `site` in wiki.config.ts to the real public URL — sitemap, canonical tags and OG images all derive from it.',
  },
  {
    name: 'editBase',
    ok: !/your-org|your-wiki/.test(value('editBase')),
    found: value('editBase'),
    fix: 'Point `editBase` at the real repo, or set it to \'\' to hide the "Edit this page" links.',
  },
  {
    name: 'name',
    ok: value('name') !== 'OG Wiki',
    found: value('name'),
    fix: 'Set `name` in wiki.config.ts to the client or project name.',
  },
];

const failed = checks.filter((c) => !c.ok);

if (failed.length === 0) {
  console.log('✓ preflight: no template placeholders left in wiki.config.ts');
  process.exit(0);
}

const label = strict ? 'ERROR' : 'warning';
console.log(`\n${strict ? '✗' : '!'} preflight: ${failed.length} placeholder(s) still set\n`);
for (const c of failed) {
  console.log(`  [${label}] ${c.name} = ${JSON.stringify(c.found)}`);
  console.log(`            ${c.fix}\n`);
}

if (strict) {
  console.log('Run without --strict to treat these as warnings.\n');
  process.exit(1);
}
console.log('Not fatal here. The deploy workflow runs this with --strict.\n');
