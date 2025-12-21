---
title: Compass
description: Navigation state machine for nested content structures.
---

# Compass

**@sailkit-dev/compass** is a headless navigation state machine for nested content structures. It provides DFS traversal, prev/next neighbors, and parent/child navigation without any UI assumptions.

## Navigation Structure

Navigation is defined as a tree of items. Strings are leaves, objects with `children` are branches:

```typescript
import { isBranch, getSlug } from '@sailkit-dev/compass'

const nav = [
  'a',
  { slug: 'b', children: ['b1', 'b2'] },
  { slug: 'c', children: ['c1', 'c2', 'c3'] },
]

// strings are leaves, objects with children are branches
assert.strictEqual(isBranch(nav[0]), false)
assert.strictEqual(isBranch(nav[1]), true)

// getSlug extracts the slug from either form
assert.strictEqual(getSlug(nav[0]), 'a')
assert.strictEqual(getSlug(nav[1]), 'b')
```

## Flattening to DFS Order

Flatten the tree to a list of slugs in depth-first order:

```typescript
import { flattenSlugs } from '@sailkit-dev/compass'

const nav = [
  'a',
  { slug: 'b', children: ['b1', 'b2'] },
  { slug: 'c', children: ['c1', 'c2', 'c3'] },
]

const all = flattenSlugs(nav)
const leaves = flattenSlugs(nav, true)

// DFS order: a, b, b1, b2, c, c1, c2, c3
assert.strictEqual(all.length, 8)
assert.deepStrictEqual(all, ['a', 'b', 'b1', 'b2', 'c', 'c1', 'c2', 'c3'])

// leavesOnly=true excludes branches (b and c)
assert.strictEqual(leaves.length, 6)
assert.deepStrictEqual(leaves, ['a', 'b1', 'b2', 'c1', 'c2', 'c3'])
```

## Getting Neighbors

Get prev/next for any slug - useful for pagination:

```typescript
import { getNeighbors } from '@sailkit-dev/compass'

const nav = [
  'a',
  { slug: 'b', children: ['b1', 'b2'] },
  { slug: 'c', children: ['c1', 'c2', 'c3'] },
]

// flattened: a, b, b1, b2, c, c1, c2, c3
const { prev, next } = getNeighbors(nav, 'b1')

// b1's neighbors in flattened order
assert.strictEqual(prev, 'b')
assert.strictEqual(next, 'b2')
```

## Runtime Navigation

For SPAs, create a stateful navigator:

```typescript
import { createNavigator } from '@sailkit-dev/compass'

const nav = createNavigator({ items: ['a', 'b', 'c'], wrap: true })

// starts at first item
assert.strictEqual(nav.current, 'a')
assert.strictEqual(nav.count, 3)

// next() advances position
nav.next()
assert.strictEqual(nav.current, 'b')

// wraps around when wrap=true
nav.next()
nav.next()
assert.strictEqual(nav.current, 'a')

// goToSlug jumps directly
nav.goToSlug('c')
assert.strictEqual(nav.current, 'c')
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `items` | `NavItem[]` | required | Navigation structure |
| `wrap` | `boolean` | `true` | Loop around at ends |
| `leavesOnly` | `boolean` | `false` | Skip section pages |
| `onChange` | `function` | - | Callback on navigation |

## Related

- [[teleport]] - Keyboard navigation that works with Compass
- [[architecture]] - How Compass fits into the larger system
