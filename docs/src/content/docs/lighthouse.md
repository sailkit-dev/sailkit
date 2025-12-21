---
title: Lighthouse
description: Smart 404 handling with fuzzy matching.
---

# Lighthouse

**@sailkit-dev/lighthouse** provides smart 404 handling with fuzzy matching. Automatically redirects typos and shows suggestions for near-matches.

## Installation

See [[installation]] for setup instructions.

## The Problem

Users encounter 404s for many reasons:
- Typos: `/docs/instalation/` instead of `/docs/installation/`
- Missing trailing slash: `/docs/intro` instead of `/docs/intro/`
- Outdated links from bookmarks or external sites
- URL guessing: `/docs/setup/` when it's actually `/docs/quick-start/`

Lighthouse intelligently handles all these cases.

## Quick Start (Astro)

```astro
---
// src/pages/404.astro
import NotFound from '@sailkit-dev/lighthouse/NotFound.astro';

const pages = [
  { url: '/docs/introduction/', title: 'Introduction' },
  { url: '/docs/installation/', title: 'Installation' },
  { url: '/docs/quick-start/', title: 'Quick Start' },
];
---
<html>
  <body>
    <NotFound pages={pages}>
      <Fragment slot="actions">
        <a href="/">Go Home</a>
        <a href="/docs/">Browse Docs</a>
      </Fragment>
    </NotFound>
  </body>
</html>
```

## How It Works

1. User hits 404 page (e.g., `/docs/instalation/`)
2. Lighthouse scores all pages against the requested URL
3. If there's a clear match (score > threshold), auto-redirect
4. Otherwise, show ranked suggestions
5. If no matches, show fallback actions

## Matching Strategies

Lighthouse combines three strategies:

### Exact Slug Matcher (60%)
Compares the last URL segment:
- `/docs/instalation/` vs `/docs/installation/` → High match
- `/docs/instalation/` vs `/docs/quick-start/` → No match

### Levenshtein Matcher (20%)
Edit distance similarity:
- "instalation" to "installation" = 1 edit → High score
- "instalation" to "architecture" = many edits → Low score

### Token Overlap Matcher (20%)
Word overlap in URL and title:
- URL `/docs/quick-start/`, title "Quick Start Guide"
- Search tokens: ["quick", "start", "guide"]
- More overlapping words = higher score

## Programmatic API

```typescript
import {
  findMatches,
  shouldAutoRedirect,
  defaultMatcher
} from '@sailkit-dev/lighthouse';

const pages = [
  { url: '/docs/introduction/', title: 'Introduction' },
  { url: '/docs/installation/', title: 'Installation' },
];

// Find matches for a bad URL
const matches = findMatches('/docs/instalation/', pages, {
  matcher: defaultMatcher,
  threshold: 0.15,
  maxResults: 5,
});

// Check if we should auto-redirect
if (shouldAutoRedirect(matches, 0.6)) {
  window.location.href = matches[0].url;
}
```

## Custom Matchers

Create specialized matching logic:

```typescript
import {
  createCompositeMatcher,
  levenshteinMatcher,
  exactSlugMatcher,
  tokenOverlapMatcher
} from '@sailkit-dev/lighthouse';

// Emphasize exact slug matching
const strictMatcher = createCompositeMatcher([
  { matcher: exactSlugMatcher, weight: 0.8 },
  { matcher: levenshteinMatcher, weight: 0.2 },
]);

// Or create entirely custom logic
const customMatcher = {
  score(requestedPath: string, page: Page): number {
    // Your scoring logic (return 0-1)
    if (page.url.includes('important')) return 1;
    return 0.5;
  },
};
```

## Configuration Options

### NotFound Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pages` | `Page[]` | required | All valid pages |
| `autoRedirectThreshold` | `number` | `0.6` | Score for auto-redirect |
| `maxSuggestions` | `number` | `5` | Max suggestions shown |
| `redirectDelay` | `number` | `1500` | Delay before redirect (ms) |
| `class` | `string` | - | Custom CSS class |

### Page Type

```typescript
interface Page {
  url: string;    // Full URL path
  title: string;  // Display title
  section?: string; // Optional category
}
```

## Building Page List

For Astro, collect pages at build time:

```astro
---
import { getCollection } from 'astro:content';
import NotFound from '@sailkit-dev/lighthouse/NotFound.astro';

const docs = await getCollection('docs');
const pages = docs.map(doc => ({
  url: `/docs/${doc.slug}/`,
  title: doc.data.title,
  section: doc.slug.split('/')[0],
}));
---
<NotFound pages={pages} />
```

## Styling

The NotFound component uses these CSS variables:

```css
.lighthouse-container {
  --lighthouse-accent: #3b82f6;
  --lighthouse-bg: #f8fafc;
  --lighthouse-border: #e2e8f0;
}
```

Override for dark mode:

```css
[data-theme="dark"] .lighthouse-container {
  --lighthouse-bg: #1e293b;
  --lighthouse-border: #334155;
}
```

## Related

- [[smart-404]] - Guide for tuning your 404 experience
- [[architecture]] - How Lighthouse fits into the larger system
- [[atlas]] - Prevent 404s with consistent internal links
