---
title: Magic Links
description: Advanced patterns for wiki-style internal links.
---

# Magic Links Guide

This guide covers advanced patterns for [[atlas|Atlas']] wiki-style links.

## Basic Syntax

### Wiki Style (Default)

```markdown
[[page-id]]                  → <a href="/docs/page-id/">page-id</a>
[[page-id|Display Text]]     → <a href="/docs/page-id/">Display Text</a>
```

### Colon Style

```markdown
[:page-id]                   → <a href="/docs/page-id/">page-id</a>
[:page-id|Display Text]      → <a href="/docs/page-id/">Display Text</a>
```

Enable with `syntax: 'colon'` or `syntax: 'both'`.

## URL Builder Patterns

### Simple Prefix

```javascript nocheck
urlBuilder: (id) => `/docs/${id}/`

// [[getting-started]] → /docs/getting-started/
```

### Category Detection

```javascript nocheck
urlBuilder: (id) => {
  const [category, ...rest] = id.split('/');
  if (['api', 'guide', 'tutorial'].includes(category)) {
    return `/${category}/${rest.join('/')}/`;
  }
  return `/docs/${id}/`;
}

// [[api/users]] → /api/users/
// [[introduction]] → /docs/introduction/
```

### External Wiki Links

```javascript nocheck
urlBuilder: (id) => {
  if (id.startsWith('wp:')) {
    const article = id.slice(3).replace(/ /g, '_');
    return `https://en.wikipedia.org/wiki/${article}`;
  }
  if (id.startsWith('mdn:')) {
    return `https://developer.mozilla.org/en-US/docs/${id.slice(4)}`;
  }
  return `/docs/${id}/`;
}

// [[wp:JavaScript]] → https://en.wikipedia.org/wiki/JavaScript
// [[mdn:Web/API/fetch]] → https://developer.mozilla.org/en-US/docs/Web/API/fetch
// [[installation]] → /docs/installation/
```

### Slug Transformation

```javascript nocheck
urlBuilder: (id) => {
  // Convert camelCase to kebab-case
  const slug = id.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  return `/docs/${slug}/`;
}

// [[gettingStarted]] → /docs/getting-started/
```

## Display Text Patterns

### Automatic Title Case

The display text (after `|`) is used as-is:

```markdown
[[installation|Installation Guide]]
[[vim-navigation|Vim-Style Navigation]]
[[atlas|magic link syntax]]
```

### Reference-Style Links

Create consistent link patterns:

```markdown
For keyboard navigation, see [[teleport|Teleport]].
Configure [[lantern|Lantern]] for dark mode.
Handle 404s with [[lighthouse|Lighthouse]].
```

### Inline Technical Terms

```markdown
The [[compass|Navigator]] object manages state.
Use [[teleport|createKeyboardHandler()]] for custom bindings.
```

## Multiple Syntaxes

Enable both wiki and colon syntax:

```javascript nocheck
// astro.config.mjs
[remarkMagicLinks, {
  urlBuilder: (id) => `/docs/${id}/`,
  syntax: 'both'
}]
```

Use cases:
- Wiki for internal docs: `[[installation]]`
- Colon for special links: `[:external/resource]`

## Error Prevention

### Validate Links at Build

Create a custom remark plugin to warn about missing targets:

```javascript nocheck
import { remarkMagicLinks } from '@sailkit-dev/atlas';

const validSlugs = new Set([
  'introduction',
  'installation',
  'compass',
  // ... all valid slugs
]);

function remarkValidateMagicLinks() {
  return (tree, file) => {
    // Walk tree, find magic links, validate against validSlugs
    // Log warnings for invalid links
  };
}

export default {
  markdown: {
    remarkPlugins: [
      [remarkMagicLinks, { urlBuilder: (id) => `/docs/${id}/` }],
      remarkValidateMagicLinks,
    ],
  },
};
```

### Use Lighthouse as Fallback

Even with careful linking, users might still hit 404s. [[lighthouse]] catches these:

```astro
---
// 404.astro
import NotFound from '@sailkit-dev/lighthouse/NotFound.astro';
const pages = await getCollection('docs');
---
<NotFound pages={pages.map(p => ({ url: `/docs/${p.slug}/`, title: p.data.title }))} />
```

## Performance Tips

### Build-Time Only

Atlas runs entirely at build time. No runtime JavaScript is added:

```
Markdown file → Remark → HTML → Browser
                  ↑
               Atlas transforms [[links]] here
```

### Caching

URL builder results aren't cached, so keep it simple:

```javascript nocheck
// Good: Simple logic
urlBuilder: (id) => `/docs/${id}/`

// Avoid: Complex async operations
urlBuilder: async (id) => {
  const data = await fetchMetadata(id);  // Runs for every link!
  return data.url;
}
```

## Integration Examples

### With Frontmatter

Reference related pages from frontmatter:

```markdown
---
title: Installation
related: ['quick-start', 'architecture']
---

# Installation

See also: [[quick-start]] and [[architecture]].
```

### With Code Blocks

Link to relevant docs inline:

```markdown
Use [[compass|createNavigator()]] to manage state:

\`\`\`typescript
import { createNavigator } from '@sailkit-dev/compass';

const nav = createNavigator({
  items: navigation,
});
\`\`\`

See [[vim-navigation]] for keyboard integration.
```

### Table of Links

```markdown
| Package | Description |
|---------|-------------|
| [[compass]] | Navigation state |
| [[teleport]] | Keyboard bindings |
| [[lantern]] | Theme toggle |
| [[lighthouse]] | Smart 404 |
| [[atlas]] | Magic links |
```

## Related

- [[atlas]] - Full API reference
- [[lighthouse]] - Handle broken links
- [[architecture]] - Build pipeline overview
