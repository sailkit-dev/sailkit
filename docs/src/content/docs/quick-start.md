---
title: Quick Start
description: Get up and running with Sailkit in minutes.
---

# Quick Start

This guide shows you how to set up a documentation site using all five Sailkit packages.

## 1. Configure Atlas (Magic Links)

First, add [[atlas]] to your Astro config to enable wiki-style links:

```javascript nocheck
// astro.config.mjs
import { remarkMagicLinks } from '@sailkit-dev/atlas';

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

Now you can write `[[page-name]]` in markdown to create internal links.

## 2. Set Up Lantern (Theme Toggle)

Add [[lantern|theme toggle]] with flash prevention:

```astro
---
import { initScript } from '@sailkit-dev/lantern';
import ThemeToggle from '@sailkit-dev/lantern/ThemeToggle.astro';
---
<html>
  <head>
    <!-- Prevent flash of wrong theme -->
    <script is:inline set:html={initScript} />
  </head>
  <body>
    <ThemeToggle />
    <slot />
  </body>
</html>
```

## 3. Create Navigation with Compass

Define your navigation structure using [[compass]]:

```typescript nocheck
// navigation.ts
import type { NavItem } from '@sailkit-dev/compass';

export const navigation: NavItem[] = [
  'introduction',
  {
    slug: 'getting-started',
    children: ['installation', 'quick-start'],
  },
  {
    slug: 'packages',
    children: ['compass', 'teleport', 'lantern'],
  },
];
```

Use `getNeighbors()` for prev/next links:

```typescript nocheck
import { getNeighbors } from '@sailkit-dev/compass';

const { prev, next } = getNeighbors(navigation, 'installation');
// prev: 'introduction', next: 'quick-start'
```

## 4. Enable Teleport (Vim Navigation)

Add [[teleport]] for keyboard navigation:

```astro
---
import Teleport from '@sailkit-dev/teleport/Teleport.astro';
---
<body>
  <nav class="sidebar">
    <a class="nav-item" href="/docs/intro/">Intro</a>
    <a class="nav-item" href="/docs/setup/">Setup</a>
  </nav>
  <main>
    <slot />
  </main>
  <Teleport itemSelector=".nav-item" />
</body>
```

Users can now press `j`/`k` to navigate the sidebar and `Enter` to select.

## 5. Create 404 Page with Lighthouse

Add [[lighthouse|smart 404]] handling:

```astro
---
// src/pages/404.astro
import NotFound from '@sailkit-dev/lighthouse/NotFound.astro';

const pages = [
  { url: '/docs/intro/', title: 'Introduction' },
  { url: '/docs/setup/', title: 'Setup Guide' },
];
---
<NotFound pages={pages} autoRedirectThreshold={0.6}>
  <Fragment slot="actions">
    <a href="/">Go Home</a>
  </Fragment>
</NotFound>
```

Now typos like `/docs/intro` automatically redirect to `/docs/intro/`.

## Complete Example

See the [[architecture]] page for how this documentation site combines all five packages into a cohesive experience.

## Individual Package Guides

For detailed information on each package:

- [[compass]] - Navigation state and structure
- [[teleport]] - Keyboard bindings
- [[lantern]] - Theme management
- [[lighthouse]] - 404 handling
- [[atlas]] - Magic links

Or check out the [[guides|guide section]] for task-based tutorials:

- [[vim-navigation]] - Customize keyboard shortcuts
- [[theming]] - Style your dark mode
- [[magic-links]] - Link syntax patterns
- [[smart-404]] - Fuzzy matching strategies
