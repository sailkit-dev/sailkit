# atlas

Remark plugin for Wikipedia-style magic links.

## Syntax

```markdown
<!-- Wiki syntax (default) -->
Check out [[context-collapse]] for more.
[[context-collapse|Learn about context]] with custom display text.

<!-- Colon syntax -->
Check out [:context-collapse] for more.
[:context-collapse|Learn about context] with custom display text.
```

## Usage with Astro

Pass your collections directly. Atlas builds the ID → URL map automatically.

```javascript
import { remarkMagicLinks } from '@sailkit/atlas';
import { getCollection } from 'astro:content';

const patterns = await getCollection('patterns');
const concepts = await getCollection('concepts');

export default defineConfig({
  markdown: {
    remarkPlugins: [
      [remarkMagicLinks, {
        collections: [
          { name: 'patterns', entries: patterns },
          { name: 'concepts', entries: concepts },
        ],
      }],
    ],
  },
});
```

Each entry needs an `id` in frontmatter:

```yaml
---
title: Context Collapse
id: context-collapse
---
```

Now `[[context-collapse]]` → `/context-collapse/` (global ID, like Wikipedia).

### Custom URL patterns

Override the default `/${slug}/` pattern to include collection prefixes:

```javascript
remarkMagicLinks({
  collections: [...],
  urlPattern: (collection, entry) => {
    // Map collection names to URL prefixes
    const prefixes = { patterns: 'ai-patterns', concepts: 'ai-concepts' };
    return `/${prefixes[collection] || collection}/${entry.slug}/`;
  },
})
```

### Custom urlBuilder (escape hatch)

For full control, provide your own resolver:

```javascript
remarkMagicLinks({
  urlBuilder: (id) => `/wiki/${id}/`,
})
```

See [`remark-magic-links.test.ts`](./src/remark-magic-links.test.ts) for more examples.

## Editor Support

The `[[wiki-link]]` syntax is a widely-adopted convention. Many editors can follow these links natively:

- **Neovim**: `Ctrl+]` jumps to the linked file
- **VS Code**: Extensions like "Markdown Links" add support

Your content stays navigable in your editor without any build step.

## Prior Art

The `[[wiki-link]]` syntax appears in many tools:

| Tool | Linking Model | Resolution |
|------|--------------|------------|
| **Wikipedia** | Global titles | `[[Atom]]` → `/wiki/Atom`. Case-insensitive first char. Disambiguation pages for collisions. |
| **Obsidian** | Global filenames | Filename = ID. "Shortest path when possible" or "relative to file" modes. |
| **Org-mode** | Multiple ID types | Priority: `CUSTOM_ID` → headline → dedicated target → `NAME`. Optional global tracking. |
| **Docusaurus** | Relative paths only | `[link](../doc.md)`. No global IDs (declined for portability). |
| **Hugo** | Shortcodes | `{{< ref "doc.md" >}}`. Relative-first, then global. |
| **Starlight** | Standard markdown | No wiki-links. Slug-based sidebar config. |

## Design Philosophy

Atlas assumes **globally unique IDs** across all content.

**Why not full Astro routing compatibility?**

Astro allows arbitrary routing: dynamic pages, hardcoded paths, random content generation. There's no guaranteed one-to-one mapping between content and URLs. Full compatibility would require re-implementing Astro's routing engine.

Instead, Atlas is opinionated:
- IDs must be unique across all collections
- URL pattern is `/${slug}/` by default (global ID, like Wikipedia)
- Sites needing collection prefixes or custom routing provide a `urlPattern`

This covers the common case while allowing escape hatches.

## How It Works

1. You write `[[some-page]]` in markdown
2. Plugin finds the syntax in text nodes (not code blocks)
3. Calls your `urlBuilder(id)` to get the URL
4. Transforms to a standard markdown link
