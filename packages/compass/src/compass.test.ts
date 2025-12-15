/**
 * Tests for the Compass navigation state machine.
 * Covers: helpers, navigator, tree traversal, and stateless utilities.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  createNavigator,
  flattenSlugs,
  getNeighbors,
  getSlug,
  isBranch,
  type NavItem,
} from './index.js';

describe('compass', () => {
  describe('helpers', () => {
    it('isBranch distinguishes strings from branches', () => {
      expect(isBranch('slug')).toBe(false);
      expect(isBranch({ slug: 'section', children: ['a'] })).toBe(true);
    });

    it('getSlug extracts slug from any item', () => {
      expect(getSlug('plain')).toBe('plain');
      expect(getSlug({ slug: 'branch', children: [] })).toBe('branch');
    });
  });

  describe('createNavigator', () => {
    describe('edge cases', () => {
      it('handles empty item list', () => {
        const nav = createNavigator({ items: [] });
        expect(nav.current).toBeNull();
        expect(nav.currentIndex).toBe(-1);
        expect(nav.count).toBe(0);
      });

      it('handles single item', () => {
        const nav = createNavigator({ items: ['only'] });
        expect(nav.current).toBe('only');
        expect(nav.currentIndex).toBe(0);
        expect(nav.count).toBe(1);
      });

      it('starts at first item', () => {
        const nav = createNavigator({ items: ['first', 'second'] });
        expect(nav.current).toBe('first');
        expect(nav.currentIndex).toBe(0);
      });
    });

    describe('next/prev navigation', () => {
      it('moves forward through flat list', () => {
        const nav = createNavigator({ items: ['a', 'b', 'c'] });

        expect(nav.current).toBe('a');
        nav.next();
        expect(nav.current).toBe('b');
        nav.next();
        expect(nav.current).toBe('c');
      });

      it('moves backward through flat list', () => {
        const nav = createNavigator({ items: ['a', 'b', 'c'] });
        nav.goTo(2);

        expect(nav.current).toBe('c');
        nav.prev();
        expect(nav.current).toBe('b');
        nav.prev();
        expect(nav.current).toBe('a');
      });

      it('wraps from end to start by default', () => {
        const nav = createNavigator({ items: ['a', 'b'] });
        nav.goTo(1);

        nav.next();
        expect(nav.current).toBe('a');
        expect(nav.currentIndex).toBe(0);
      });

      it('wraps from start to end by default', () => {
        const nav = createNavigator({ items: ['a', 'b'] });

        nav.prev();
        expect(nav.current).toBe('b');
        expect(nav.currentIndex).toBe(1);
      });

      it('does not wrap when wrap=false', () => {
        const nav = createNavigator({ items: ['a', 'b'], wrap: false });

        nav.prev();
        expect(nav.current).toBe('a');
        expect(nav.currentIndex).toBe(0);

        nav.goTo(1);
        nav.next();
        expect(nav.current).toBe('b');
        expect(nav.currentIndex).toBe(1);
      });
    });

    describe('goToSlug', () => {
      it('jumps to specific slug', () => {
        const nav = createNavigator({ items: ['a', 'b', 'c'] });

        nav.goToSlug('c');
        expect(nav.current).toBe('c');
        expect(nav.currentIndex).toBe(2);
      });

      it('ignores unknown slug', () => {
        const nav = createNavigator({ items: ['a', 'b'] });

        nav.goToSlug('unknown');
        expect(nav.current).toBe('a');
        expect(nav.currentIndex).toBe(0);
      });
    });

    describe('DFS pre-order traversal', () => {
      it('traverses tree in DFS pre-order', () => {
        const items: NavItem[] = [
          {
            slug: 'concepts',
            children: ['context', 'prompting'],
          },
          {
            slug: 'failure-modes',
            children: ['hallucination'],
          },
        ];
        const nav = createNavigator({ items });

        const visited: string[] = [];
        for (let i = 0; i < nav.count; i++) {
          nav.goTo(i);
          visited.push(nav.current!);
        }

        expect(visited).toEqual([
          'concepts',
          'context',
          'prompting',
          'failure-modes',
          'hallucination',
        ]);
      });

      it('handles deeply nested trees', () => {
        const items: NavItem[] = [
          {
            slug: 'L1',
            children: [
              {
                slug: 'L2',
                children: [
                  {
                    slug: 'L3',
                    children: ['L4'],
                  },
                ],
              },
            ],
          },
        ];
        const nav = createNavigator({ items });

        const visited: string[] = [];
        for (let i = 0; i < nav.count; i++) {
          nav.goTo(i);
          visited.push(nav.current!);
        }

        expect(visited).toEqual(['L1', 'L2', 'L3', 'L4']);
      });
    });

    describe('leavesOnly option', () => {
      it('skips branch nodes when leavesOnly=true', () => {
        const items: NavItem[] = [
          {
            slug: 'concepts',
            children: ['context', 'prompting'],
          },
          {
            slug: 'failure-modes',
            children: ['hallucination'],
          },
        ];
        const nav = createNavigator({ items, leavesOnly: true });

        const visited: string[] = [];
        for (let i = 0; i < nav.count; i++) {
          nav.goTo(i);
          visited.push(nav.current!);
        }

        expect(visited).toEqual(['context', 'prompting', 'hallucination']);
        expect(nav.count).toBe(3);
      });

      it('includes all items when leavesOnly=false (default)', () => {
        const items: NavItem[] = [
          {
            slug: 'section',
            children: ['item'],
          },
        ];
        const nav = createNavigator({ items });

        expect(nav.count).toBe(2);
        expect(nav.current).toBe('section');
        nav.next();
        expect(nav.current).toBe('item');
      });

      it('handles empty tree when leavesOnly=true', () => {
        const nav = createNavigator({ items: [], leavesOnly: true });
        expect(nav.count).toBe(0);
        expect(nav.current).toBeNull();
      });
    });

    describe('tree navigation', () => {
      const items: NavItem[] = [
        {
          slug: 'section-a',
          children: ['a1', 'a2', 'a3'],
        },
        {
          slug: 'section-b',
          children: ['b1', 'b2'],
        },
      ];

      describe('parent()', () => {
        it('navigates to parent node', () => {
          const nav = createNavigator({ items });
          nav.goTo(1); // a1
          expect(nav.current).toBe('a1');

          nav.parent();
          expect(nav.current).toBe('section-a');
        });

        it('does nothing at root level', () => {
          const nav = createNavigator({ items });
          expect(nav.current).toBe('section-a');

          nav.parent();
          expect(nav.current).toBe('section-a');
        });

        it('does nothing when leavesOnly=true (parent not visitable)', () => {
          const nav = createNavigator({ items, leavesOnly: true });
          expect(nav.current).toBe('a1');

          nav.parent();
          expect(nav.current).toBe('a1');
        });
      });

      describe('firstChild()', () => {
        it('navigates to first child', () => {
          const nav = createNavigator({ items });
          expect(nav.current).toBe('section-a');

          nav.firstChild();
          expect(nav.current).toBe('a1');
        });

        it('does nothing on leaf node', () => {
          const nav = createNavigator({ items });
          nav.goTo(1); // a1
          expect(nav.current).toBe('a1');

          nav.firstChild();
          expect(nav.current).toBe('a1');
        });
      });

      describe('nextSibling()', () => {
        it('navigates to next sibling', () => {
          const nav = createNavigator({ items });
          expect(nav.current).toBe('section-a');

          nav.nextSibling();
          expect(nav.current).toBe('section-b');
        });

        it('navigates between child siblings', () => {
          const nav = createNavigator({ items });
          nav.goTo(1); // a1
          expect(nav.current).toBe('a1');

          nav.nextSibling();
          expect(nav.current).toBe('a2');

          nav.nextSibling();
          expect(nav.current).toBe('a3');
        });

        it('jumps to parent sibling when at last child', () => {
          const nav = createNavigator({ items });
          nav.goTo(3); // a3
          expect(nav.current).toBe('a3');

          nav.nextSibling();
          expect(nav.current).toBe('section-b');
        });

        it('wraps to start when at end and wrap=true', () => {
          const nav = createNavigator({ items });
          nav.goTo(nav.count - 1); // b2
          expect(nav.current).toBe('b2');

          nav.nextSibling();
          expect(nav.current).toBe('section-a');
        });
      });

      describe('prevSibling()', () => {
        it('navigates to previous sibling', () => {
          const nav = createNavigator({ items });
          nav.goTo(4); // section-b
          expect(nav.current).toBe('section-b');

          nav.prevSibling();
          expect(nav.current).toBe('section-a');
        });

        it('wraps to end when at start and wrap=true', () => {
          const nav = createNavigator({ items });
          expect(nav.current).toBe('section-a');

          nav.prevSibling();
          expect(nav.current).toBe('b2');
        });
      });
    });

    describe('goTo()', () => {
      it('jumps to specific index', () => {
        const nav = createNavigator({ items: ['a', 'b', 'c'] });

        nav.goTo(2);
        expect(nav.current).toBe('c');
        expect(nav.currentIndex).toBe(2);
      });

      it('ignores invalid indices', () => {
        const nav = createNavigator({ items: ['a', 'b'] });

        nav.goTo(-1);
        expect(nav.currentIndex).toBe(0);

        nav.goTo(999);
        expect(nav.currentIndex).toBe(0);
      });
    });

    describe('reset()', () => {
      it('resets to first item', () => {
        const nav = createNavigator({ items: ['a', 'b', 'c'] });
        nav.goTo(2);

        nav.reset();
        expect(nav.current).toBe('a');
        expect(nav.currentIndex).toBe(0);
      });

      it('handles empty list', () => {
        const nav = createNavigator({ items: [] });
        nav.reset();
        expect(nav.current).toBeNull();
        expect(nav.currentIndex).toBe(-1);
      });
    });

    describe('onChange callback', () => {
      it('fires on navigation', () => {
        const onChange = vi.fn();
        const nav = createNavigator({ items: ['a', 'b'], onChange });

        nav.next();

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith('a', 'b', 1);
      });

      it('provides correct prev/next slugs', () => {
        const calls: Array<{
          prev: string | null;
          next: string | null;
          index: number;
        }> = [];
        const onChange = (
          prev: string | null,
          next: string | null,
          index: number
        ) => {
          calls.push({ prev, next, index });
        };

        const nav = createNavigator({ items: ['a', 'b', 'c'], onChange });

        nav.next();
        nav.next();
        nav.prev();

        expect(calls).toEqual([
          { prev: 'a', next: 'b', index: 1 },
          { prev: 'b', next: 'c', index: 2 },
          { prev: 'c', next: 'b', index: 1 },
        ]);
      });
    });

    describe('root property', () => {
      it('returns original items', () => {
        const items: NavItem[] = [{ slug: 'a', children: ['b'] }];
        const nav = createNavigator({ items });

        expect(nav.root).toBe(items);
      });
    });

    describe('currentItem property', () => {
      it('returns the full item (string or branch)', () => {
        const items: NavItem[] = [{ slug: 'section', children: ['leaf'] }];
        const nav = createNavigator({ items });

        expect(nav.currentItem).toEqual({ slug: 'section', children: ['leaf'] });
        nav.next();
        expect(nav.currentItem).toBe('leaf');
      });
    });
  });

  describe('flattenSlugs', () => {
    it('flattens tree to DFS pre-order list', () => {
      const items: NavItem[] = [
        {
          slug: 'a',
          children: ['a1', 'a2'],
        },
        'b',
      ];

      const slugs = flattenSlugs(items);
      expect(slugs).toEqual(['a', 'a1', 'a2', 'b']);
    });

    it('respects leavesOnly option', () => {
      const items: NavItem[] = [
        {
          slug: 'section',
          children: ['item1', 'item2'],
        },
      ];

      const slugs = flattenSlugs(items, true);
      expect(slugs).toEqual(['item1', 'item2']);
    });

    it('handles empty list', () => {
      expect(flattenSlugs([])).toEqual([]);
    });
  });

  describe('getNeighbors', () => {
    it('returns prev and next slugs', () => {
      const items = ['a', 'b', 'c'];

      const { prev, next } = getNeighbors(items, 'b');
      expect(prev).toBe('a');
      expect(next).toBe('c');
    });

    it('returns null for prev at start', () => {
      const items = ['a', 'b'];

      const { prev, next } = getNeighbors(items, 'a');
      expect(prev).toBeNull();
      expect(next).toBe('b');
    });

    it('returns null for next at end', () => {
      const items = ['a', 'b'];

      const { prev, next } = getNeighbors(items, 'b');
      expect(prev).toBe('a');
      expect(next).toBeNull();
    });

    it('returns null for both if slug not found', () => {
      const items = ['a'];

      const { prev, next } = getNeighbors(items, 'unknown');
      expect(prev).toBeNull();
      expect(next).toBeNull();
    });

    it('works with nested trees', () => {
      const items: NavItem[] = [
        {
          slug: 'parent',
          children: ['child1', 'child2'],
        },
      ];

      // DFS order: parent, child1, child2
      const neighbors1 = getNeighbors(items, 'child1');
      expect(neighbors1.prev).toBe('parent');
      expect(neighbors1.next).toBe('child2');

      const neighbors2 = getNeighbors(items, 'child2');
      expect(neighbors2.prev).toBe('child1');
      expect(neighbors2.next).toBeNull();
    });

    it('respects leavesOnly option', () => {
      const items: NavItem[] = [
        {
          slug: 'parent',
          children: ['child1', 'child2'],
        },
      ];

      // With leavesOnly, order is: child1, child2
      const neighbors = getNeighbors(items, 'child1', { leavesOnly: true });
      expect(neighbors.prev).toBeNull();
      expect(neighbors.next).toBe('child2');
    });
  });

  describe('real-world scenario: documentation navigation', () => {
    it('navigates documentation structure', () => {
      // Slugs only - metadata lives elsewhere
      const docTree: NavItem[] = [
        {
          slug: 'concepts',
          children: ['context', 'prompting'],
        },
        {
          slug: 'patterns',
          children: ['checkpoint'],
        },
      ];

      // With leavesOnly=false (include section slugs)
      const navFull = createNavigator({ items: docTree });
      expect(navFull.count).toBe(5);

      const fullPath: string[] = [];
      for (let i = 0; i < navFull.count; i++) {
        navFull.goTo(i);
        fullPath.push(navFull.current!);
      }
      expect(fullPath).toEqual([
        'concepts',
        'context',
        'prompting',
        'patterns',
        'checkpoint',
      ]);

      // With leavesOnly=true (skip section slugs)
      const navLeaves = createNavigator({ items: docTree, leavesOnly: true });
      expect(navLeaves.count).toBe(3);

      const leavesPath: string[] = [];
      for (let i = 0; i < navLeaves.count; i++) {
        navLeaves.goTo(i);
        leavesPath.push(navLeaves.current!);
      }
      expect(leavesPath).toEqual(['context', 'prompting', 'checkpoint']);
    });

    it('gets neighbors for build-time nav computation', () => {
      const docTree: NavItem[] = [
        {
          slug: 'concepts',
          children: ['context', 'prompting'],
        },
      ];

      // For context page, get prev/next including section
      const { prev, next } = getNeighbors(docTree, 'context');
      expect(prev).toBe('concepts');
      expect(next).toBe('prompting');

      // For context page, get prev/next excluding sections
      const { prev: prevLeaf, next: nextLeaf } = getNeighbors(
        docTree,
        'context',
        { leavesOnly: true }
      );
      expect(prevLeaf).toBeNull();
      expect(nextLeaf).toBe('prompting');
    });
  });
});
