import type { Config, Context } from '@netlify/functions';
import matter from 'gray-matter';
import { z } from 'zod';
import { verifySession, hasEditPermission } from '../../src/lib/descope-auth';
import { getFile, putFile } from '../../src/lib/github-content';
import wiki from '../../wiki.config';

/**
 * Commits an edited page to GitHub on the editor's behalf.
 *
 * Authorization is the Descope session's `Wiki Edit` permission — checked
 * here, server-side, not just hidden in the UI. The actual GitHub commit
 * uses one shared credential (GITHUB_COMMIT_TOKEN), so editors never need
 * their own GitHub account. The real person's identity still shows up in
 * git history via the commit `author` field.
 *
 * Mirrors the Zod schema in src/content.config.ts. That one can't be
 * imported here — it depends on the `astro:content` virtual module, which
 * only exists inside Astro's own build. Keep the two in sync by hand.
 */
const frontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().default('📄'),
  section: z.string().default('Reference'),
  order: z.number().default(999),
  tags: z.array(z.string()).default([]),
  status: z.enum(['draft', 'review', 'stable', 'deprecated']).default('stable'),
  updated: z.string().optional(),
  owner: z.string().optional(),
  draft: z.boolean().default(false),
  featured: z.boolean().default(false),
});

const requestSchema = z.object({
  id: z.string().min(1),
  data: frontmatterSchema,
  body: z.string(),
  /** sha from the prior GET; omitted only when creating a brand-new page. */
  sha: z.string().optional(),
});

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const projectId = process.env.DESCOPE_PROJECT_ID;
  const claims = await verifySession(req, projectId);
  if (!claims) return new Response('Unauthorized', { status: 401 });
  if (!hasEditPermission(claims))
    return new Response('Forbidden — missing Wiki Edit permission', { status: 403 });

  const token = process.env.GITHUB_COMMIT_TOKEN;
  if (!token)
    return new Response('Server not configured: GITHUB_COMMIT_TOKEN unset', { status: 500 });

  let parsedReq: z.infer<typeof requestSchema>;
  try {
    parsedReq = requestSchema.parse(await req.json());
  } catch (err) {
    return new Response(`Invalid request: ${err instanceof Error ? err.message : String(err)}`, {
      status: 400,
    });
  }

  const { id, data, body, sha } = parsedReq;
  const path = `${wiki.contentPath}/${id}.md`;

  // Re-check the live sha rather than trust the client's — closes the small
  // window between opening the editor and clicking save. GitHub's own PUT
  // also enforces this (409 on mismatch), so this is belt-and-suspenders,
  // not the only thing standing between two editors clobbering each other.
  const current = await getFile(wiki.repo, wiki.branch, path, token);
  if (sha && current && current.sha !== sha) {
    return new Response('Conflict: this page changed since you opened it. Reload and try again.', {
      status: 409,
    });
  }

  const content = matter.stringify(body.trim() + '\n', data);
  const editorEmail = typeof claims.email === 'string' ? claims.email : `${claims.sub}@descope`;

  try {
    await putFile(
      wiki.repo,
      wiki.branch,
      path,
      content,
      token,
      `Edit "${data.title}" via wiki editor`,
      current?.sha,
      { name: editorEmail.split('@')[0], email: editorEmail },
    );
  } catch (err) {
    return new Response(`Save failed: ${err instanceof Error ? err.message : String(err)}`, {
      status: 502,
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const config: Config = {
  path: '/api/wiki/save',
};
