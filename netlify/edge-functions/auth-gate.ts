import type { Config, Context } from '@netlify/edge-functions';
import { createRemoteJWKSet, jwtVerify } from 'jose';

/**
 * Gates every wiki page behind a Descope session.
 *
 * The Descope web component (see src/pages/login.astro) is configured in the
 * Descope Console to persist its session as a cookie named `DS` (Project
 * Settings → session persistence → Cookie). This function reads that cookie
 * and verifies it — no Descope SDK needed at the edge, just its public JWKS.
 *
 * The JWKS endpoint is scoped to one Descope project
 * (https://api.descope.com/<project-id>/.well-known/jwks.json), so a
 * signature that verifies against it could only have been issued by that
 * project. That's what stands in for an audience check here.
 */

const PROJECT_ID = Netlify.env.get('DESCOPE_PROJECT_ID');
const COOKIE_NAME = 'DS';

// createRemoteJWKSet caches the key set and re-fetches only on a signature
// miss, so this doesn't hit the network on every request.
const JWKS = PROJECT_ID
  ? createRemoteJWKSet(new URL(`https://api.descope.com/${PROJECT_ID}/.well-known/jwks.json`))
  : undefined;

function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get('cookie');
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return undefined;
}

function redirectToLogin(request: Request): Response {
  const url = new URL(request.url);
  const login = new URL('/login/', url.origin);
  login.searchParams.set('redirect', url.pathname + url.search);
  return new Response(null, { status: 302, headers: { Location: login.toString() } });
}

export default async (request: Request, context: Context) => {
  // Not configured yet (e.g. a fresh clone before Descope is set up):
  // fail open so the wiki doesn't lock everyone out by accident.
  if (!PROJECT_ID || !JWKS) return context.next();

  const token = readCookie(request, COOKIE_NAME);
  if (!token) return redirectToLogin(request);

  try {
    await jwtVerify(token, JWKS);
  } catch {
    return redirectToLogin(request);
  }

  return context.next();
};

export const config: Config = {
  path: '/*',
  excludedPath: [
    '/login',
    '/login/*',
    '/admin',
    '/admin/*',
    '/og/*',
    '/pagefind/*',
    '/favicon*',
    '/sitemap*',
  ],
};
