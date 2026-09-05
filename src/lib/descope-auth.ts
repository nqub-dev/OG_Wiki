import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

/**
 * Runtime-agnostic Descope session verification, shared between the Deno
 * edge function (netlify/edge-functions/auth-gate.ts) and the Node
 * functions (netlify/functions/*.mts). Those two runtimes read environment
 * variables differently (`Netlify.env.get()` vs `process.env`), so this
 * takes the project id as a parameter instead of reading it itself.
 *
 * See src/pages/login.astro for how the `DS` cookie this reads gets set —
 * it's a first-party cookie we write ourselves, not Descope's own
 * cookie-mode (that needs a paid custom domain we don't have).
 */

export const SESSION_COOKIE = 'DS';

/** One permission name, exactly as created in Descope Console → Authorization → RBAC. */
export const EDIT_PERMISSION = 'Wiki Edit';

export interface DescopeClaims extends JWTPayload {
  permissions?: string[];
  roles?: string[];
}

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function jwksFor(projectId: string) {
  let jwks = jwksCache.get(projectId);
  if (!jwks) {
    jwks = createRemoteJWKSet(
      new URL(`https://api.descope.com/${projectId}/.well-known/jwks.json`),
    );
    jwksCache.set(projectId, jwks);
  }
  return jwks;
}

export function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get('cookie');
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return undefined;
}

/**
 * Verifies the `DS` cookie on `request` against Descope's project-scoped
 * JWKS. Returns the verified claims, or null if there's no session, it's
 * expired, or the signature doesn't check out.
 *
 * The JWKS endpoint is scoped to one Descope project, so a signature that
 * verifies against it could only have been issued by that project — that's
 * what stands in for an audience check here.
 */
export async function verifySession(
  request: Request,
  projectId: string | undefined,
): Promise<DescopeClaims | null> {
  if (!projectId) return null;
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, jwksFor(projectId));
    return payload as DescopeClaims;
  } catch {
    return null;
  }
}

export function hasEditPermission(claims: DescopeClaims | null): boolean {
  return !!claims?.permissions?.includes(EDIT_PERMISSION);
}
