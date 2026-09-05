import type { Config, Context } from '@netlify/functions';
import matter from 'gray-matter';
import { verifySession } from '../../src/lib/descope-auth';
import { getFile } from '../../src/lib/github-content';
import wiki from '../../wiki.config';

/**
 * Returns one page's current frontmatter + body, read live from GitHub (not
 * from the last Astro build) so the editor never opens on stale content —
 * e.g. right after another save, before Netlify's rebuild has finished.
 *
 * Requires a valid Descope session (any role) — reading isn't privileged,
 * but this endpoint isn't meant for anonymous/public use either. Only .md
 * pages are supported; .mdx pages use custom components a plain-text editor
 * can't safely round-trip, so they stay on Sveltia/GitHub-direct editing.
 */
export default async (req: Request, _context: Context) => {
  const projectId = process.env.DESCOPE_PROJECT_ID;
  const claims = await verifySession(req, projectId);
  if (!claims) return new Response('Unauthorized', { status: 401 });

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return new Response('Missing ?id', { status: 400 });

  const token = process.env.GITHUB_COMMIT_TOKEN;
  if (!token)
    return new Response('Server not configured: GITHUB_COMMIT_TOKEN unset', { status: 500 });

  const path = `${wiki.contentPath}/${id}.md`;
  const file = await getFile(wiki.repo, wiki.branch, path, token);
  if (!file)
    return new Response('Page not found (only .md pages are editable here)', { status: 404 });

  const parsed = matter(file.content);
  return new Response(
    JSON.stringify({ data: parsed.data, body: parsed.content.trim(), sha: file.sha }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
};

export const config: Config = {
  path: '/api/wiki/get',
};
