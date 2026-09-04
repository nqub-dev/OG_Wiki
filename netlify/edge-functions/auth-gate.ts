import type { Config, Context } from '@netlify/edge-functions';
import { createRemoteJWKSet, jwtVerify } from 'jose';

/**
 * Gates every wiki page behind a Descope session.
 *
 * The `DS` cookie this reads is set by src/pages/login.astro itself, on this
 * site's own origin — NOT by Descope's console-level cookie mode. That mode
 * only sets cookies on Descope's own domain (api.descope.com by default; a
 * custom domain fixes that, but custom domains are a paid Descope feature),
 * which the browser would never send to this origin anyway. So login.astro
 * reads the session JWT the widget already wrote to localStorage
 * (`getSessionToken()`) and copies it into a first-party cookie here.
 *
 * This function just verifies that JWT — no Descope SDK needed at the edge,
 * only its public JWKS. The JWKS endpoint is scoped to one Descope project
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
    // Astro/Vite's bundled JS and CSS. Without this, the login page's own
    // script gets caught by the gate (no cookie exists yet on /login by
    // definition) and redirected back to /login — so the browser receives
    // the login page's HTML where it expected a JS module, and every script
    // and stylesheet on the site fails the same way pre-auth.
    '/_astro/*',
    // CMS-uploaded images should render without a session too.
    '/uploads/*',
  ],
};
