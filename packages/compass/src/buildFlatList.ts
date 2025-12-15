/**
 * Internal helper that flattens a tree into DFS pre-order.
 * This powers next/prev navigation - consumers don't call this directly.
 *
 * Given: [{ slug: 'a', children: ['a1', 'a2'] }, 'b']
 * Returns: [a, a1, a2, b] (as InternalNode objects with parent refs)
 */

import type { NavItem, InternalNode } from './types.js';
import { isBranch, getSlug } from './helpers.js';

/**
 * Build flat list of visitable items in DFS pre-order
 */
export function buildFlatList(
  items: NavItem[],
  leavesOnly: boolean
): InternalNode[] {
  const result: InternalNode[] = [];

  function traverse(
    itemList: NavItem[],
    parent: InternalNode | null,
    depth: number
  ): void {
    for (let i = 0; i < itemList.length; i++) {
      const item = itemList[i];
      const slug = getSlug(item);
      const hasBranch = isBranch(item);

      const internal: InternalNode = {
        item,
        slug,
        parent,
        depth,
        indexInParent: i,
      };

      // Add to flat list if not skipping branches or if this is a leaf
      if (!leavesOnly || !hasBranch) {
        result.push(internal);
      }

      // Recurse into children
      if (hasBranch) {
        traverse(item.children, internal, depth + 1);
      }
    }
  }

  traverse(items, null, 0);
  return result;
}
