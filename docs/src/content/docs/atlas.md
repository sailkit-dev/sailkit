---
title: Atlas
description: Wikipedia-style magic links in markdown.
---

# Atlas

**@sailkit/atlas** provides Wikipedia-style link syntax for markdown. Write `[[page]]` instead of `[page](/docs/page/)`.

## Installation

```bash
npm install @sailkit/atlas
```

## The Problem

Documentation often has many internal links. Standard markdown is verbose:

```markdown
Check out the [installation guide](/docs/installation/) for setup,
then see the [quick start](/docs/quick-start/) tutorial.
Read about [keyboard navigation](/docs/teleport/) too.
```

With Atlas:

```markdown
Check out the [[installation]] guide for setup,
then see the [[quick-start]] tutorial.
Read about [[teleport|keyboard navigation]] too.
```

## Quick Start (Astro)

Add Atlas to your Astro config:

```javascript nocheck
// astro.config.mjs
import { remarkMagicLinks } from '@sailkit/atlas';

export default {
  markdown: {
    remarkPlugins: [
      [remarkMagicLinks, {
        urlBuilder: (id) => `/docs/${id}/`,
        syntax: 'wiki',
      }],
    ],
  },
};
```

Now wiki links work in all markdown files.

## Syntax Options

### Wiki Syntax (Default)

```markdown
[[page-id]]                → <a href="/docs/page-id/">page-id</a>
[[page-id|Custom Text]]    → <a href="/docs/page-id/">Custom Text</a>
```

### Colon Syntax

```markdown
[:page-id]                 → <a href="/docs/page-id/">page-id</a>
[:page-id|Custom Text]     → <a href="/docs/page-id/">Custom Text</a>
```

### Both

Enable both syntaxes in the same document:

```javascript nocheck
[remarkMagicLinks, {
  urlBuilder: (id) => `/docs/${id}/`,
  syntax: 'both'
}]
```

## URL Builder

The `urlBuilder` function transforms link IDs to URLs:

```javascript nocheck
// Simple prefix
urlBuilder: (id) => `/docs/${id}/`

// With category detection
urlBuilder: (id) => {
  if (id.startsWith('api-')) {
    return `/api/${id.slice(4)}/`;
  }
  return `/docs/${id}/`;
}

// External wiki links
urlBuilder: (id) => {
  if (id.startsWith('wp:')) {
    return `https://en.wikipedia.org/wiki/${id.slice(3)}`;
  }
  return `/docs/${id}/`;
}
```

## Examples

This documentation uses Atlas extensively. These are all magic links:

- [[introduction]] - Links to Introduction page
- [[compass|navigation package]] - Custom display text
- [[lighthouse|smart 404 handling]] - Descriptive link

In markdown source:

```markdown
- [[introduction]] - Links to Introduction page
- [[compass|navigation package]] - Custom display text
- [[lighthouse|smart 404 handling]] - Descriptive link
```

## How It Works

Atlas is a Remark plugin that runs at build time:

1. Parse markdown AST
2. Find text nodes with `[[...]]` patterns
3. Extract ID and optional display text
4. Call `urlBuilder(id)` to generate URL
5. Replace with standard link node
6. Remark renders to HTML

No runtime JavaScript required.

## Integration with Other Tools

### With Content Collections

Atlas works with Astro content collections:

```javascript nocheck
// astro.config.mjs
export default {
  markdown: {
    remarkPlugins: [
      [remarkMagicLinks, {
        urlBuilder: (id) => `/docs/${id}/`,
      }],
    ],
  },
};
```

All `.md` files in `src/content/` will process magic links.

### With MDX

Works identically with MDX files:

```javascript nocheck
// astro.config.mjs
import mdx from '@astrojs/mdx';
import { remarkMagicLinks } from '@sailkit/atlas';

export default {
  integrations: [mdx()],
  markdown: {
    remarkPlugins: [
      [remarkMagicLinks, { urlBuilder: (id) => `/docs/${id}/` }],
    ],
  },
};
```

## Preventing 404s

Atlas helps prevent broken links by centralizing URL generation. Combined with [[lighthouse]], you get:

1. **Consistent URLs** - All internal links go through `urlBuilder`
2. **Easy refactoring** - Change URL structure in one place
3. **Fallback handling** - Lighthouse catches any remaining 404s

## Configuration Reference

```typescript nocheck
interface RemarkMagicLinksConfig {
  /** Build URL from link ID (required) */
  urlBuilder: (id: string) => string;

  /** Syntax style to parse */
  syntax?: 'wiki' | 'colon' | 'both'; // default: 'wiki'
}
```

## Related

- [[magic-links]] - Guide for advanced link patterns
- [[lighthouse]] - Handle any remaining 404s
- [[architecture]] - How Atlas fits into the build pipeline
