import type { Config, Context } from '@netlify/edge-functions';
import { verifySession } from '../../src/lib/descope-auth.ts';

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
 * Verification itself lives in src/lib/descope-auth.ts, shared with the
 * Node functions under netlify/functions/ that gate saving a page.
 */

const PROJECT_ID = Netlify.env.get('DESCOPE_PROJECT_ID');

function redirectToLogin(request: Request): Response {
  const url = new URL(request.url);
  const login = new URL('/login/', url.origin);
  login.searchParams.set('redirect', url.pathname + url.search);
  return new Response(null, { status: 302, headers: { Location: login.toString() } });
}

export default async (request: Request, context: Context) => {
  // Not configured yet (e.g. a fresh clone before Descope is set up):
  // fail open so the wiki doesn't lock everyone out by accident.
  if (!PROJECT_ID) return context.next();

  const claims = await verifySession(request, PROJECT_ID);
  if (!claims) return redirectToLogin(request);

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
    // Astro/Vite's own bundled JS and CSS. Missing this meant an
    // unauthenticated visitor's request for THESE files also got redirected
    // to /login — including the login page's own script, which is what
    // mounts the Descope widget and clears the "not configured" fallback.
    // The page rendered, but the one script that makes it work never ran.
    '/_astro/*',
  ],
};
