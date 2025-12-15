# @sailkit/compass

A cursor for lists. Move forward, backward, or through nested items.

```typescript
const nav = createNavigator({ items: ['a', 'b', 'c'] });

nav.next();    // move forward
nav.prev();    // move back
nav.current;   // where you are now
```

Works with nested items too:

```typescript
const nav = createNavigator({
  items: [
    { slug: 'ch-1', children: ['1.1', '1.2'] },
    { slug: 'ch-2' }
  ]
});

nav.next();       // ch-1 → 1.1
nav.parent();     // 1.1 → ch-1
nav.firstChild(); // ch-1 → 1.1
```

## Options

- `wrap` - loop around at the ends (default: true)
- `leavesOnly` - skip parents, only visit leaves

## Details

No framework needed. Handles edge cases like wrapping, siblings, and depth-first traversal. See [`src/types.ts`](./src/types.ts) for full API.
