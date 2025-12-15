# @sailkit/spyglass

Site search UI with command palette and sidebar filtering.

Spyglass is a **UI layer**, not a search engine. It provides the modal, input, results rendering, and keyboard navigation. Bring your own fuzzy search library (Fuse.js, MiniSearch, Pagefind, etc.).

```typescript
import { createSpyglass } from '@sailkit/spyglass';
import Fuse from 'fuse.js';

const fuse = new Fuse(items, { keys: ['title', 'description'] });

const spyglass = createSpyglass({
  engine: 'fuse',
  fuse,
  hotkey: 'mod+k',
});

spyglass.on('select', (item) => {
  window.location.href = item.url;
});
```

## Architecture

```
┌─────────────────────────────────────────┐
│              Spyglass UI                │
│  (modal, input, results, highlighting)  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           Adapter Layer                 │
│  (normalize input/output for engines)   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Search Engine (BYO)             │
│  Fuse.js │ MiniSearch │ Pagefind │ etc  │
└─────────────────────────────────────────┘
```

## Why Not Build the Search Engine?

Search engines already exist and are well-tested:

- **Fuse.js** — Fuzzy matching, client-side, zero config
- **MiniSearch** — Full-text search, client-side, fast indexing
- **Pagefind** — Static site search, WASM-powered, scales to huge sites

What doesn't exist: a consistent UI layer that works with any of them.

## What Spyglass Provides

### Command Palette

Press `⌘K` (or custom hotkey) to open a search modal:

```typescript
const spyglass = createSpyglass({
  hotkey: 'mod+k',
  placeholder: 'Search docs...',
});
```

### Sidebar Filter

Inline mode for filtering navigation:

```typescript
const spyglass = createSpyglass({
  mode: 'inline',
  container: '#sidebar-filter',
});
```

### Keyboard Navigation

- `↑`/`↓` or `j`/`k` — Move selection
- `Enter` — Navigate to selected
- `Escape` — Close palette

### Result Highlighting

Get match positions to highlight in your UI:

```typescript
spyglass.on('results', (results) => {
  results.forEach(({ item, matches }) => {
    // matches: [{ start: 0, end: 4 }]
  });
});
```

## Supported Engines

| Engine | Adapter | Notes |
|--------|---------|-------|
| Fuse.js | `fuse` | Fuzzy matching, good defaults |
| MiniSearch | `minisearch` | Full-text, typo tolerance |
| Pagefind | `pagefind` | Static sites, WASM |
| Custom | `custom` | Provide your own |

### Using Fuse.js

```typescript
import Fuse from 'fuse.js';
import { createSpyglass } from '@sailkit/spyglass';

const fuse = new Fuse(items, {
  keys: ['title', 'description', 'keywords'],
  threshold: 0.3,
});

const spyglass = createSpyglass({
  engine: 'fuse',
  fuse,
});
```

### Using MiniSearch

```typescript
import MiniSearch from 'minisearch';
import { createSpyglass } from '@sailkit/spyglass';

const miniSearch = new MiniSearch({
  fields: ['title', 'description'],
  storeFields: ['title', 'url'],
});
miniSearch.addAll(items);

const spyglass = createSpyglass({
  engine: 'minisearch',
  miniSearch,
});
```

### Using Pagefind

```typescript
import { createSpyglass } from '@sailkit/spyglass';

const spyglass = createSpyglass({
  engine: 'pagefind',
  pagefindPath: '/pagefind/pagefind.js',
});
```

### Custom Engine

```typescript
const spyglass = createSpyglass({
  engine: 'custom',
  search: async (query) => {
    // Your search logic
    return results.map(r => ({
      id: r.id,
      title: r.title,
      url: r.url,
      matches: [],
    }));
  },
});
```

## Integration with Sailkit

### With Compass

Build searchable items from navigation structure:

```typescript
import { flattenSlugs } from '@sailkit/compass';

const slugs = flattenSlugs(navigation, true);
const items = slugs.map(slug => ({
  id: slug,
  title: getTitle(slug),
  url: `/docs/${slug}/`,
}));
```

### With Teleport

Teleport emits `teleport:open-finder` on `t` press:

```typescript
document.addEventListener('teleport:open-finder', () => {
  spyglass.open();
});
```

## Configuration

```typescript
interface SpyglassConfig {
  // Engine selection
  engine: 'fuse' | 'minisearch' | 'pagefind' | 'custom';

  // Engine instances (depending on engine choice)
  fuse?: Fuse<any>;
  miniSearch?: MiniSearch;
  pagefindPath?: string;
  search?: (query: string) => Promise<SearchResult[]>;

  // UI options
  mode?: 'modal' | 'inline';
  container?: string | HTMLElement;
  hotkey?: string;
  placeholder?: string;
  maxResults?: number;

  // Behavior
  autoFocus?: boolean;
  closeOnSelect?: boolean;
  closeOnEscape?: boolean;
}
```

## API

### `createSpyglass(config): Spyglass`

Create a spyglass instance.

### `spyglass.open(): void`

Open the command palette (modal mode).

### `spyglass.close(): void`

Close the command palette.

### `spyglass.toggle(): void`

Toggle open/closed state.

### `spyglass.search(query: string): Promise<void>`

Trigger a search programmatically.

### `spyglass.on(event, callback): void`

Subscribe to events:

- `open` — Palette opened
- `close` — Palette closed
- `search` — Search executed
- `results` — Results received
- `select` — Item selected

### `spyglass.destroy(): void`

Clean up event listeners and DOM.

## Types

```typescript
interface SearchResult {
  id: string;
  title: string;
  url?: string;
  description?: string;
  matches?: Match[];
}

interface Match {
  field: string;
  start: number;
  end: number;
}
```

## Status

This package is planned but not yet implemented. This README serves as the design specification.
