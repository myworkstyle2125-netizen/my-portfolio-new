import { Category } from '../types';

export interface CategoryDefinition {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  displayOrder: number;
}

export const PORTFOLIO_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'cat-1',
    name: 'Branding',
    slug: 'branding',
    subtitle: 'Brand & Identity Design',
    description: 'Distinctive logos, visual systems, color palettes, and brand guidelines crafted for lasting impact.',
    displayOrder: 1,
  },
  {
    id: 'cat-2',
    name: 'Social Media',
    slug: 'social-media',
    subtitle: 'Social Media Graphics',
    description: 'High-engagement carousels, post packs, stories, and feed templates designed for daily publishing.',
    displayOrder: 2,
  },
  {
    id: 'cat-3',
    name: 'Thumbnails',
    slug: 'thumbnails',
    subtitle: 'YouTube & Video Thumbnails',
    description: 'High-CTR YouTube thumbnails engineered with bold focal points, clear type, and striking contrast.',
    displayOrder: 3,
  },
  {
    id: 'cat-4',
    name: 'T Shirt',
    slug: 't-shirt',
    subtitle: 'Apparel & Merchandise Design',
    description: 'Bold typography, custom vector graphics, and screen-print ready artwork for apparel brands.',
    displayOrder: 4,
  },
  {
    id: 'cat-5',
    name: 'UI/UX',
    slug: 'ui-ux',
    subtitle: 'Web & Digital Interfaces',
    description: 'Clean, modern digital interfaces, web platforms, and mobile apps focused on usability.',
    displayOrder: 5,
  },
  {
    id: 'cat-6',
    name: 'Print Design',
    slug: 'print-design',
    subtitle: 'Print & Publication Collateral',
    description: 'Professional flyers, posters, business cards, brochures, and stationery ready for high-resolution print.',
    displayOrder: 6,
  },
];

export const CATEGORY_NAMES = PORTFOLIO_CATEGORIES.map((c) => c.name);
export const CATEGORY_SLUGS = PORTFOLIO_CATEGORIES.map((c) => c.slug);
export const APPROVED_PROJECT_CATEGORIES = [
  'Branding',
  'Social Media',
  'Thumbnails',
  'T Shirt',
  'UI/UX',
  'Print Design',
] as const;

/**
 * Normalizes any category string (name, slug, label) to canonical slug.
 */
export function toCategorySlug(val?: string): string {
  if (!val) return 'branding';
  const clean = val.toLowerCase().trim();

  if (clean === 'branding' || clean.includes('brand') || clean === 'advertising') return 'branding';
  if (clean === 'social-media' || clean === 'social media' || clean.includes('social')) return 'social-media';
  if (clean === 'thumbnails' || clean === 'thumbnail' || clean.includes('thumbnail') || clean.includes('youtube')) return 'thumbnails';
  if (clean === 't-shirt' || clean === 't shirt' || clean === 'tshirt' || clean.includes('shirt') || clean.includes('apparel')) return 't-shirt';
  if (clean === 'ui-ux' || clean === 'ui/ux' || clean === 'ui' || clean === 'ux' || clean.includes('ui/ux')) return 'ui-ux';
  if (clean === 'print-design' || clean === 'print design' || clean === 'print' || clean.includes('print')) return 'print-design';

  return 'branding';
}

/**
 * Normalizes any category string to canonical Name.
 */
export function toCategoryName(val?: string): string {
  const slug = toCategorySlug(val);
  const found = PORTFOLIO_CATEGORIES.find((c) => c.slug === slug);
  return found ? found.name : 'Branding';
}

/**
 * Finds CategoryDefinition by slug or name.
 */
export function getCategoryDefinition(slugOrName?: string): CategoryDefinition {
  const slug = toCategorySlug(slugOrName);
  const found = PORTFOLIO_CATEGORIES.find((c) => c.slug === slug);
  return found || PORTFOLIO_CATEGORIES[0];
}

/**
 * Checks if a project strictly belongs to a specific category.
 */
export function isProjectInCategory(projectCategory?: string, targetCategorySlugOrName?: string): boolean {
  if (!targetCategorySlugOrName || targetCategorySlugOrName.toLowerCase() === 'all') {
    return true;
  }
  const projSlug = toCategorySlug(projectCategory);
  const targetSlug = toCategorySlug(targetCategorySlugOrName);
  return projSlug === targetSlug;
}
