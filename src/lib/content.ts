import { getCollection, type CollectionEntry } from 'astro:content';
import wiki from '../../wiki.config';
import { docUrl, homeUrl } from './links';

export type Doc = CollectionEntry<'docs'>;

/** Every publishable page, sorted by section order then page order. */
export async function getDocs(): Promise<Doc[]> {
  const docs = await getCollection('docs', ({ data }) => import.meta.env.DEV || !data.draft);
  return docs.sort((a, b) => {
    const sa = sectionRank(a.data.section);
    const sb = sectionRank(b.data.section);
    if (sa !== sb) return sa - sb;
    if (a.data.order !== b.data.order) return a.data.order - b.data.order;
    return a.data.title.localeCompare(b.data.title);
  });
}

function sectionRank(section: string): number {
  const i = wiki.sections.indexOf(section);
  return i === -1 ? wiki.sections.length + 1 : i;
}

export interface NavSection {
  heading: string;
  items: { title: string; href: string; icon: string; id: string; status: string }[];
}

/** Sidebar tree, grouped by frontmatter `section`. */
export async function getNav(): Promise<NavSection[]> {
  const docs = await getDocs();
  const groups = new Map<string, NavSection>();

  for (const doc of docs) {
    const heading = doc.data.section;
    if (!groups.has(heading)) groups.set(heading, { heading, items: [] });
    groups.get(heading)!.items.push({
      title: doc.data.title,
      href: docUrl(doc.id),
      icon: doc.data.icon,
      id: doc.id,
      status: doc.data.status,
    });
  }

  return [...groups.values()];
}

/** Flat ordered list — powers prev/next paging. */
export async function getSiblings(id: string) {
  const docs = await getDocs();
  const i = docs.findIndex((d) => d.id === id);
  return {
    prev: i > 0 ? docs[i - 1] : undefined,
    next: i >= 0 && i < docs.length - 1 ? docs[i + 1] : undefined,
  };
}

/**
 * Pages that link *to* `id`. Scans raw Markdown for both
 * [[wikilinks]] and regular /wiki/<slug> hrefs.
 */
export async function getBacklinks(id: string): Promise<Doc[]> {
  const docs = await getDocs();
  return docs.filter((doc) => {
    if (doc.id === id) return false;
    const body = doc.body ?? '';
    const wikilink = new RegExp(`\\[\\[\\s*${escapeRe(id)}\\s*(?:[#|][^\\]]*)?\\]\\]`, 'i');
    const href = new RegExp(`\\(/wiki/${escapeRe(id)}[)#]`, 'i');
    return wikilink.test(body) || href.test(body);
  });
}

/** All tags with their page counts, most used first. */
export async function getTags(): Promise<{ tag: string; count: number; docs: Doc[] }[]> {
  const docs = await getDocs();
  const map = new Map<string, Doc[]>();
  for (const doc of docs) {
    for (const tag of doc.data.tags) {
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag)!.push(doc);
    }
  }
  return [...map.entries()]
    .map(([tag, docs]) => ({ tag, count: docs.length, docs }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Set of valid page ids — used to flag unresolved wikilinks. */
export async function getKnownIds(): Promise<Set<string>> {
  const docs = await getDocs();
  return new Set(docs.map((d) => d.id));
}

export function statusStyle(status: string): { badge: string; label: string } {
  switch (status) {
    case 'draft':
      return { badge: 'badge-warning', label: 'Draft' };
    case 'review':
      return { badge: 'badge-info', label: 'In review' };
    case 'deprecated':
      return { badge: 'badge-error', label: 'Deprecated' };
    default:
      return { badge: 'badge-success', label: 'Stable' };
  }
}

export function breadcrumbsFor(doc: Doc) {
  const parts = doc.id.split('/');
  const crumbs = [{ label: 'Wiki', href: homeUrl() }];
  if (parts.length > 1) {
    crumbs.push({ label: doc.data.section, href: `${homeUrl()}#${slugify(doc.data.section)}` });
  }
  crumbs.push({ label: doc.data.title, href: docUrl(doc.id) });
  return crumbs;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatDate(date?: Date): string | undefined {
  if (!date) return undefined;
  // Frontmatter dates ("2026-08-26") parse as UTC midnight. Format in UTC too,
  // or readers west of Greenwich see the previous day.
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function escapeRe(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
