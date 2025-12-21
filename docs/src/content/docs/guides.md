---
title: Guides
description: Task-based tutorials for common Sailkit use cases.
---

# Guides

This section contains task-based tutorials showing how to accomplish specific goals with Sailkit.

## Available Guides

### [[vim-navigation]]
Customize keyboard shortcuts beyond the defaults. Learn how to add custom bindings, disable certain keys, and integrate with your own UI components.

### [[theming]]
Design your dark mode color scheme. Covers CSS custom properties, system preference detection, and creating smooth theme transitions.

### [[magic-links]]
Advanced patterns for wiki-style links. Learn about custom URL builders, multiple link syntaxes, and external wiki integration.

### [[smart-404]]
Tune your 404 page for the best user experience. Covers threshold configuration, custom matchers, and analytics integration.

## Common Patterns

### Full Documentation Setup

A complete setup typically involves:

1. **[[compass]]** for navigation structure
2. **[[atlas]]** in astro.config for magic links
3. **[[lantern]]** in layout for theming
4. **[[teleport]]** in layout for keyboard nav
5. **[[lighthouse]]** in 404.astro page

```astro
---
// Layout.astro - combines all five packages
import { initScript } from '@sailkit-dev/lantern';
import { getNeighbors } from '@sailkit-dev/compass';
import ThemeToggle from '@sailkit-dev/lantern/ThemeToggle.astro';
import Teleport from '@sailkit-dev/teleport/Teleport.astro';
import { navigation } from '../navigation';

const { slug } = Astro.props;
const { prev, next } = getNeighbors(navigation, slug);
---
<html>
  <head>
    <script is:inline set:html={initScript} />
  </head>
  <body>
    <ThemeToggle />
    <nav class="sidebar">...</nav>
    <main><slot /></main>
    <footer>
      {prev && <a href={`/docs/${prev}/`}>Previous</a>}
      {next && <a href={`/docs/${next}/`}>Next</a>}
    </footer>
    <Teleport />
  </body>
</html>
```

### Minimal Setup

Start with just one or two packages:

```astro
---
// Just keyboard navigation
import Teleport from '@sailkit-dev/teleport/Teleport.astro';
---
<nav>
  <a class="nav-item" href="/a">A</a>
  <a class="nav-item" href="/b">B</a>
</nav>
<Teleport />
```

## Need Help?

- Check the [[packages]] reference for API details
- See the [[architecture]] overview for how things fit together
- File issues at the [GitHub repository](https://github.com/sailkit/sailkit)
