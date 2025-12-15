/**
 * Compass - Headless navigation state for lists and trees
 *
 * A framework-agnostic state machine for navigating ordered items.
 * Works with strings (slugs) - no metadata, purely structural.
 *
 * @example
 * ```typescript
 * // Flat list
 * const nav = createNavigator({ items: ['a', 'b', 'c'] });
 * nav.next();
 * nav.current; // 'b'
 *
 * // With hierarchy
 * const nav = createNavigator({
 *   items: [
 *     { slug: 'concepts', children: ['context', 'prompting'] },
 *     { slug: 'patterns', children: ['checkpoint'] },
 *   ]
 * });
 *
 * // Build-time (SSG) - get neighbors without state
 * const { prev, next } = getNeighbors(items, 'prompting');
 * ```
 */

// Types
export type { NavItem, NavBranch, Navigator, NavigatorConfig } from './types.js';

// Helpers
export { isBranch, getSlug } from './helpers.js';

// Main factory
export { createNavigator } from './navigator.js';

// Stateless utilities
export { flattenSlugs, getNeighbors } from './utils.js';
