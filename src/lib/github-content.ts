/**
 * Minimal GitHub Contents API client for the wiki's save/get functions.
 * One shared credential (GITHUB_COMMIT_TOKEN, a fine-grained PAT scoped to
 * exactly this repo's Contents: Read and write) does every commit — editors
 * authenticate with Descope, never with their own GitHub account.
 */

const API = 'https://api.github.com';

export interface GhFile {
  /** Decoded UTF-8 file content. */
  content: string;
  /** Blob sha, required when updating an existing file via PUT. */
  sha: string;
}

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

export async function getFile(
  repo: string,
  branch: string,
  path: string,
  token: string,
): Promise<GhFile | null> {
  const url = `${API}/repos/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, { headers: headers(token) });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${path} failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { content: string; sha: string; encoding: string };
  return { content: Buffer.from(json.content, 'base64').toString('utf-8'), sha: json.sha };
}

export async function putFile(
  repo: string,
  branch: string,
  path: string,
  content: string,
  token: string,
  message: string,
  sha: string | undefined,
  author: { name: string; email: string },
): Promise<void> {
  const url = `${API}/repos/${repo}/contents/${path}`;
  const body = {
    message,
    content: Buffer.from(content, 'utf-8').toString('base64'),
    branch,
    sha,
    author,
  };
  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub PUT ${path} failed: ${res.status} ${await res.text()}`);
}
