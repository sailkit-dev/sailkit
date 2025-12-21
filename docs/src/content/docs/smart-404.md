---
title: Smart 404
description: Tune your 404 page for the best user experience.
---

# Smart 404 Guide

This guide covers tuning [[lighthouse]] for optimal 404 handling.

## How Matching Works

Lighthouse scores URLs against your page list using three strategies:

### 1. Exact Slug Matcher (60% weight)

Compares the last path segment:

```
Requested: /docs/instalation/
Page URL:  /docs/installation/

Last segment: "instalation" vs "installation"
Very similar → High score
```

### 2. Levenshtein Distance (20% weight)

Counts character edits needed:

```
"instalation" → "installation"
        ↑
     1 edit (add 'l')

Score = 1 - (edits / max_length)
      = 1 - (1 / 12)
      = 0.917
```

### 3. Token Overlap (20% weight)

Matches words in URL and title:

```
Requested: /docs/quick-start-guide/
Page: { url: '/docs/quick-start/', title: 'Quick Start Guide' }

Request tokens: [quick, start, guide]
Page tokens: [quick, start, guide]
Overlap: 3/3 = 1.0
```

## Threshold Configuration

### Auto-Redirect Threshold

When a single match exceeds this score, redirect automatically:

```astro
<!-- Conservative: Only redirect near-perfect matches -->
<NotFound pages={pages} autoRedirectThreshold={0.8} />

<!-- Aggressive: Redirect more liberally -->
<NotFound pages={pages} autoRedirectThreshold={0.5} />

<!-- Disable auto-redirect -->
<NotFound pages={pages} autoRedirectThreshold={1.1} />
```

**Recommendations**:
- `0.6` (default): Good balance for documentation
- `0.7-0.8`: When wrong redirects are costly
- `0.4-0.5`: When users expect fuzzy matching

### Match Threshold

Minimum score to show as suggestion:

```typescript nocheck
const matches = findMatches(path, pages, {
  threshold: 0.15,  // Default: Show most suggestions
});

const strictMatches = findMatches(path, pages, {
  threshold: 0.4,   // Only show good matches
});
```

## Custom Matchers

### Prioritize Title Matching

For content-heavy sites where titles matter more:

```typescript nocheck
import {
  createCompositeMatcher,
  tokenOverlapMatcher,
  levenshteinMatcher,
  exactSlugMatcher
} from '@sailkit-dev/lighthouse';

const titleFocusedMatcher = createCompositeMatcher([
  { matcher: tokenOverlapMatcher, weight: 0.5 },
  { matcher: exactSlugMatcher, weight: 0.3 },
  { matcher: levenshteinMatcher, weight: 0.2 },
]);
```

### Category Matching

Boost matches in the same section:

```typescript nocheck
const categoryMatcher = {
  score(requestedPath: string, page: Page): number {
    const requestCategory = requestedPath.split('/')[1];
    const pageCategory = page.url.split('/')[1];

    // Bonus for same category
    const categoryBonus = requestCategory === pageCategory ? 0.2 : 0;

    // Base score from default matcher
    const baseScore = defaultMatcher.score(requestedPath, page);

    return Math.min(baseScore + categoryBonus, 1.0);
  },
};
```

### Alias Matching

Support URL aliases:

```typescript nocheck
const aliases = {
  'setup': 'installation',
  'intro': 'introduction',
  'keyboard': 'teleport',
  'theme': 'lantern',
};

const aliasMatcher = {
  score(requestedPath: string, page: Page): number {
    const slug = requestedPath.split('/').pop()?.replace(/\/$/, '');
    const pageSlug = page.url.split('/').pop()?.replace(/\/$/, '');

    // Check if requested slug is an alias
    const resolvedSlug = aliases[slug] || slug;

    if (resolvedSlug === pageSlug) {
      return 1.0;  // Perfect match via alias
    }

    return defaultMatcher.score(requestedPath, page);
  },
};
```

## Page List Strategies

### Include All Pages

```typescript nocheck
import { getCollection } from 'astro:content';

const docs = await getCollection('docs');
const pages = docs.map(doc => ({
  url: `/docs/${doc.slug}/`,
  title: doc.data.title,
  section: doc.slug.split('/')[0],
}));
```

### Group by Section

```typescript nocheck
const pages = [
  // Getting Started
  { url: '/docs/introduction/', title: 'Introduction', section: 'Getting Started' },
  { url: '/docs/installation/', title: 'Installation', section: 'Getting Started' },

  // Packages
  { url: '/docs/compass/', title: 'Compass', section: 'Packages' },
  { url: '/docs/teleport/', title: 'Teleport', section: 'Packages' },
];
```

The `section` field groups suggestions in the UI.

### Exclude Redirects

Don't include pages that already redirect:

```typescript nocheck
const pages = allPages.filter(page => !page.redirect);
```

## Analytics Integration

Track 404s to improve content:

```typescript nocheck
// In your 404.astro
const requestedPath = Astro.url.pathname;
const matches = findMatches(requestedPath, pages);

// Log for analytics
console.log('404', {
  path: requestedPath,
  matches: matches.map(m => m.url),
  topScore: matches[0]?.score,
});
```

### Common Patterns to Address

1. **High-score redirects**: These URLs work but are typos—consider actual redirects
2. **No matches**: Content gaps or very wrong URLs
3. **Multiple similar scores**: Ambiguous URL structure—clarify naming

## Redirect Delay

Control how long users see the redirect message:

```astro
<!-- Instant feel -->
<NotFound pages={pages} redirectDelay={800} />

<!-- More time to read message -->
<NotFound pages={pages} redirectDelay={2500} />

<!-- Default -->
<NotFound pages={pages} redirectDelay={1500} />
```

## UI Customization

### Custom Actions

```astro
<NotFound pages={pages}>
  <Fragment slot="actions">
    <a href="/" class="btn primary">Go Home</a>
    <a href="/docs/" class="btn">Browse Docs</a>
    <a href="/search/" class="btn">Search</a>
  </Fragment>
</NotFound>
```

### Custom Styling

```css
.lighthouse-container {
  /* Layout */
  max-width: 600px;
  margin: 4rem auto;
  padding: 2rem;

  /* Colors */
  --lighthouse-accent: var(--color-accent);
  --lighthouse-bg: var(--color-surface);
}

.lighthouse-suggestion {
  border-radius: 8px;
  transition: transform 0.15s;
}

.lighthouse-suggestion:hover {
  transform: translateX(4px);
}
```

## Related

- [[lighthouse]] - Full API reference
- [[atlas]] - Prevent 404s with consistent links
- [[architecture]] - How 404 handling fits the system
