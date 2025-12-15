/**
 * Small utility functions for working with NavItem types.
 * Type guards and slug extraction.
 */

import type { NavItem, NavBranch } from './types.js';

/**
 * Check if item is a branch (has children)
 */
export function isBranch(item: NavItem): item is NavBranch {
  return typeof item === 'object' && 'children' in item;
}

/**
 * Get the slug from any nav item
 */
export function getSlug(item: NavItem): string {
  return isBranch(item) ? item.slug : item;
}
