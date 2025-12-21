---
title: Installation
description: How to install Sailkit packages in your project.
---

# Installation

Sailkit packages are designed to be installed individually based on your needs.

## From Git

Sailkit packages are not yet published to npm. Install from the GitHub repository using git URLs:

```json nocheck
{
  "dependencies": {
    "@sailkit-dev/compass": "github:sailkit-dev/sailkit#main",
    "@sailkit-dev/teleport": "github:sailkit-dev/sailkit#main",
    "@sailkit-dev/lantern": "github:sailkit-dev/sailkit#main",
    "@sailkit-dev/lighthouse": "github:sailkit-dev/sailkit#main",
    "@sailkit-dev/atlas": "github:sailkit-dev/sailkit#main"
  }
}
```

**Note:** npm resolves all packages from the monorepo. The prepare script builds packages automatically.

## Local Development

For contributing or active development, clone and link locally:

```bash nocheck
git clone https://github.com/sailkit-dev/sailkit.git
cd sailkit && npm install
npm link packages/compass packages/teleport packages/lantern
```

Then in your project:

```bash nocheck
npm link @sailkit-dev/compass @sailkit-dev/teleport @sailkit-dev/lantern
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
import type { NavItem, Navigator } from '@sailkit-dev/compass';
import type { KeyBindings, Teleport } from '@sailkit-dev/teleport';
import type { Theme } from '@sailkit-dev/lantern';
import type { Page, ScoredPage, Matcher } from '@sailkit-dev/lighthouse';
import type { RemarkMagicLinksConfig, LinkSyntax } from '@sailkit-dev/atlas';
```

## Peer Dependencies

Sailkit packages have minimal dependencies:

- [[atlas]] requires `mdast-util-from-markdown` (part of remark ecosystem)
- All other packages are dependency-free

## Next Steps

Now that you have Sailkit installed, check out the [[quick-start]] guide to see how the packages work together.
