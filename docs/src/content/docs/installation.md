---
title: Installation
description: How to install Sailkit packages in your project.
---

# Installation

Sailkit packages are designed to be installed individually based on your needs.

## From Source

Sailkit packages are not yet published to npm. For now, install from the GitHub repository:

```bash
# Clone the repository
git clone https://github.com/joshribakoff/sailkit.git
cd sailkit

# Install dependencies
npm install

# Build all packages
npm run build
```

Then link the packages to your project using npm workspaces or local file paths:

```json
{
  "dependencies": {
    "@sailkit/compass": "file:../sailkit/packages/compass",
    "@sailkit/teleport": "file:../sailkit/packages/teleport",
    "@sailkit/lantern": "file:../sailkit/packages/lantern",
    "@sailkit/lighthouse": "file:../sailkit/packages/lighthouse",
    "@sailkit/atlas": "file:../sailkit/packages/atlas"
  }
}
```

## Coming Soon: npm Registry

Once published, you'll be able to install directly:

```bash
# Install individual packages (coming soon)
npm install @sailkit/compass
npm install @sailkit/teleport
npm install @sailkit/lantern
npm install @sailkit/lighthouse
npm install @sailkit/atlas
```

## Framework Support

All packages work with any JavaScript framework. Additionally, some packages provide Astro components for even easier integration:

| Package | Astro Component |
|---------|-----------------|
| [[compass]] | Headless (no component) |
| [[teleport]] | `Teleport.astro` |
| [[lantern]] | `ThemeToggle.astro` |
| [[lighthouse]] | `NotFound.astro` |
| [[atlas]] | Remark plugin (no component) |

## TypeScript

All packages include TypeScript definitions. No additional `@types` packages needed.

```typescript nocheck
// Types are exported from each package
import type { NavItem, Navigator } from '@sailkit/compass';
import type { KeyBindings, Teleport } from '@sailkit/teleport';
import type { Theme } from '@sailkit/lantern';
import type { Page, ScoredPage, Matcher } from '@sailkit/lighthouse';
import type { RemarkMagicLinksConfig, LinkSyntax } from '@sailkit/atlas';
```

## Peer Dependencies

Sailkit packages have minimal dependencies:

- [[atlas]] requires `mdast-util-from-markdown` (part of remark ecosystem)
- All other packages are dependency-free

## Next Steps

Now that you have Sailkit installed, check out the [[quick-start]] guide to see how the packages work together.
