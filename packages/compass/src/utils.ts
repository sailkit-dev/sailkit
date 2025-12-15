/**
 * Utility functions for common navigation tasks.
 * These are stateless helpers - useful for build-time computation (SSG).
 *
 * - flattenSlugs: Get all slugs in DFS order
 * - getNeighbors: Get prev/next for a specific slug
 */

import type { NavItem } from './types.js';
import { buildFlatList } from './buildFlatList.js';

/**
 * Flatten items to DFS pre-order list of slugs
 */
export function flattenSlugs(items: NavItem[], leavesOnly = false): string[] {
  return buildFlatList(items, leavesOnly).map((n) => n.slug);
}

/**
 * Get prev/next slugs for a target slug.
 * Primary API for build-time navigation (SSG).
 */
export function getNeighbors(
  items: NavItem[],
  targetSlug: string,
  options: { leavesOnly?: boolean } = {}
): { prev: string | null; next: string | null } {
  const slugs = flattenSlugs(items, options.leavesOnly);
  const index = slugs.indexOf(targetSlug);

  if (index === -1) {
    return { prev: null, next: null };
  }

  return {
    prev: index > 0 ? slugs[index - 1] : null,
    next: index < slugs.length - 1 ? slugs[index + 1] : null,
  };
}
