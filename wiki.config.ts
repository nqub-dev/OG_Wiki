/**
 * ─────────────────────────────────────────────────────────────
 *  THE ONLY FILE YOU EDIT TO RE-BRAND THIS WIKI FOR A CLIENT.
 * ─────────────────────────────────────────────────────────────
 *  Clone the repo → change the values below → ship.
 *  Everything else (nav, search, tags, backlinks) is generated
 *  from the Markdown in src/content/docs/.
 */

export interface WikiConfig {
  /** Public site URL. Used for sitemap + canonical tags. */
  site: string;
  /**
   * Deployment sub-path. '/' for a domain root or a GitHub *user/org* page.
   * For a GitHub *project* page (https://org.github.io/client-wiki/) set this
   * to '/client-wiki/'. Every internal link is base-aware, so this is the
   * only place it needs changing.
   */
  base: string;
  /** Brand shown in the navbar and <title>. */
  name: string;
  /** Short tagline under the hero. */
  tagline: string;
  /** Emoji or single character used as the logo mark. */
  mark: string;
  /**
   * Render the SVG wordmark from src/components/Logo.astro instead of the
   * `mark` emoji. Swap that component's paths to re-brand.
   */
  useLogo: boolean;
  /** Longer description for SEO / social cards. */
  description: string;
  /**
   * daisyUI themes offered in the theme picker.
   * All 35 daisyUI 5 built-ins are valid, plus the two custom
   * themes defined in src/styles/global.css ("og-light" / "og-dark").
   */
  themes: { light: string; dark: string; palette: string[] };
  /** Sidebar section order. Sections not listed are appended alphabetically. */
  sections: string[];
  /** Navbar links rendered to the right of the search box. */
  navLinks: { label: string; href: string; external?: boolean }[];
  /** Footer columns. */
  footer: { heading: string; links: { label: string; href: string }[] }[];
  /** Feature flags — turn parts of the wiki off without deleting code. */
  features: {
    search: boolean;
    themePicker: boolean;
    backlinks: boolean;
    tableOfContents: boolean;
    editLinks: boolean;
    tags: boolean;
    lastUpdated: boolean;
  };
  /**
   * Path to a favicon in public/, e.g. '/favicon.png'.
   * Leave '' to fall back to an emoji favicon built from `mark`.
   */
  favicon: string;
  /**
   * GitHub repository as "owner/name". Single source of truth for
   * "Edit this page" links AND the /admin CMS backend.
   * Leave '' to disable both.
   */
  repo: string;
  /** Branch that content is edited on. */
  branch: string;
  /** Where content lives inside the repo. */
  contentPath: string;
  /** Auto-generated social share images (Open Graph / Twitter cards). */
  ogImage: {
    enabled: boolean;
    /** Background gradient, as two RGB triplets. */
    bgGradient: [number, number, number][];
    /** Accent bar colour, RGB triplet. */
    border: [number, number, number];
    /** Optional logo drawn on the card. Path is relative to the project root. */
    logo?: { path: string; size?: [number, number?] };
  };
}

export const wiki: WikiConfig = {
  site: 'https://wiki.example.com',
  base: '/',
  name: 'OG Wiki',
  tagline: 'The knowledge base your team will actually read.',
  mark: '◆',
  useLogo: true,
  description:
    'A fast, beautiful, modular wiki template built with Astro, Tailwind CSS 4 and daisyUI 5.',

  themes: {
    light: 'og-light',
    dark: 'og-dark',
    // Curated shortlist shown in the picker. Swap freely — these are
    // real daisyUI 5 theme names, verified against daisyui@5.5.20.
    palette: [
      'og-light',
      'og-dark',
      'light',
      'dark',
      'corporate',
      'business',
      'emerald',
      'nord',
      'winter',
      'dim',
      'night',
      'sunset',
      'dracula',
      'forest',
      'lofi',
      'silk',
      'caramellatte',
      'abyss',
      'cupcake',
      'retro',
      'synthwave',
      'cyberpunk',
    ],
  },

  sections: ['Start Here', 'Handbook', 'Engineering', 'Operations', 'Reference'],

  navLinks: [
    { label: 'Tags', href: '/tags' },
    { label: 'Astro', href: 'https://astro.build', external: true },
  ],

  footer: [
    {
      heading: 'Wiki',
      links: [
        { label: 'Home', href: '/' },
        { label: 'All tags', href: '/tags' },
        { label: 'Start here', href: '/wiki/start-here/welcome' },
      ],
    },
    {
      heading: 'Built with',
      links: [
        { label: 'Astro', href: 'https://astro.build' },
        { label: 'Tailwind CSS', href: 'https://tailwindcss.com' },
        { label: 'daisyUI', href: 'https://daisyui.com' },
      ],
    },
  ],

  features: {
    search: true,
    themePicker: true,
    backlinks: true,
    tableOfContents: true,
    editLinks: true,
    tags: true,
    lastUpdated: true,
  },

  favicon: '/favicon.png',
  repo: 'your-org/your-wiki',
  branch: 'main',
  contentPath: 'src/content/docs',

  ogImage: {
    enabled: true,
    // Matches the og-light / og-dark primary ramp.
    bgGradient: [
      [23, 26, 41],
      [46, 41, 96],
    ],
    border: [241, 107, 36],
    logo: { path: './src/assets/nqub-wordmark-white.png', size: [180] },
  },
};

export default wiki;
