# @sailkit/compass

Headless navigation state for lists and trees. Framework-agnostic state machine that handles DFS traversal, sibling navigation, wrap-around, and parent/child movement.

## Quick Start

```typescript
import { createNavigator, getNeighbors, flattenSlugs } from '@sailkit/compass';

// Flat list
const nav = createNavigator({ items: ['a', 'b', 'c'] });
nav.next();
console.log(nav.current); // 'b'

// Tree structure (forest - multiple roots supported)
const items = [
  { slug: 'part-1', children: ['1.1', '1.2'] },
  { slug: 'part-2', children: ['2.1'] },
];
const nav = createNavigator({ items });

// DFS order: part-1 → 1.1 → 1.2 → part-2 → 2.1
nav.next();       // 'part-1' → '1.1'
nav.next();       // '1.1' → '1.2'
nav.parent();     // '1.2' → 'part-1'
nav.firstChild(); // 'part-1' → '1.1'
nav.nextSibling(); // '1.1' → '1.2'

// Build-time (SSG) - stateless helpers
const { prev, next } = getNeighbors(items, '1.1');
// prev: 'part-1', next: '1.2'

const slugs = flattenSlugs(items);
// ['part-1', '1.1', '1.2', 'part-2', '2.1']
```

## Options

```typescript
createNavigator({
  items,
  wrap: true,       // Wrap at ends (default: true)
  leavesOnly: true, // Skip branch nodes, only visit leaves
  onChange: (prev, next, index) => { /* ... */ }
});
```

## API

See [`src/types.ts`](./src/types.ts) for full type definitions.

**Navigator methods:** `next()`, `prev()`, `nextSibling()`, `prevSibling()`, `parent()`, `firstChild()`, `goTo(index)`, `goToSlug(slug)`, `reset()`

**Navigator properties:** `current`, `currentItem`, `currentIndex`, `count`, `root`

**Helpers:** `getNeighbors(items, slug, options?)`, `flattenSlugs(items, leavesOnly?)`, `isBranch(item)`, `getSlug(item)`

## Why Compass?

- **Pure state** - no DOM, no framework dependencies
- **Portable** - works in browser, Node, or any JS runtime
- **Tree-aware** - handles nested structures natively
- **Build-time friendly** - stateless helpers for SSG
