---
title: Architecture
description: How Sailkit packages work together.
---

# Architecture

This page explains how Sailkit's five packages compose into a cohesive documentation system.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Documentation Site                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BUILD TIME                          RUNTIME                     │
│  ───────────                         ───────                     │
│                                                                  │
│  ┌───────────┐                       ┌───────────┐              │
│  │   Atlas   │                       │ Teleport  │              │
│  │  (Remark) │                       │ (Keyboard)│              │
│  └─────┬─────┘                       └─────┬─────┘              │
│        │                                   │                     │
│        ▼                                   ▼                     │
│  ┌───────────┐    ┌───────────┐     ┌───────────┐              │
│  │  Markdown │───▶│   HTML    │────▶│    DOM    │              │
│  │   Files   │    │   Pages   │     │ (Browser) │              │
│  └───────────┘    └───────────┘     └─────┬─────┘              │
│        │                                   │                     │
│        │          ┌───────────┐           │                     │
│        └─────────▶│  Compass  │◀──────────┘                     │
│                   │(Nav State)│                                  │
│                   └───────────┘                                  │
│                                                                  │
│                   ┌───────────┐     ┌───────────┐              │
│                   │  Lantern  │     │Lighthouse │              │
│                   │ (Theming) │     │   (404)   │              │
│                   └───────────┘     └───────────┘              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Package Responsibilities

### [[atlas|Atlas]] - Build Time

**When**: During `astro build` or `astro dev`
**What**: Transforms `[[wiki-links]]` to standard HTML links
**How**: Remark plugin in markdown pipeline

```
author.md                    author.html
─────────                    ────────────
See [[compass]]      →       See <a href="/docs/compass/">compass</a>
```

Atlas has zero runtime footprint—it's purely a build-time transformation.

### [[compass|Compass]] - Build + Runtime

**Build time**: Generate prev/next links statically

```typescript nocheck
// In Astro component
const { prev, next } = getNeighbors(navigation, slug);
```

**Runtime**: Manage navigation state in SPAs

```typescript nocheck
// In client JavaScript
const nav = createNavigator({ items: navigation });
nav.next();
```

Compass provides the navigation data structure that other packages consume.

### [[teleport|Teleport]] - Runtime

**When**: In the browser, after page load
**What**: Handles keyboard events, manages DOM highlights
**How**: Event listeners + DOM manipulation

```
User presses 'j' → Teleport intercepts → Highlights next nav item
User presses 'l' → Teleport calls onNextPage() → Your code navigates
```

Teleport can work standalone or integrate with Compass for intelligent page navigation.

### [[lantern|Lantern]] - Build + Runtime

**Build time**: Inject inline script for flash prevention

```astro
<script is:inline set:html={initScript} />
```

**Runtime**: Toggle theme, persist to localStorage, notify subscribers

```typescript nocheck
toggleTheme();
onThemeChange(callback);
```

The inline script runs synchronously before render, preventing theme flash.

### [[lighthouse|Lighthouse]] - Runtime

**When**: On 404 pages only
**What**: Fuzzy-matches requested URL against valid pages
**How**: Client-side scoring and optional redirect

```
User visits /docs/instalation/ (typo)
→ 404.astro loads
→ Lighthouse scores against all pages
→ Finds /docs/installation/ with high score
→ Auto-redirects (or shows suggestions)
```

## Data Flow

### Navigation Data

```
navigation.ts (source of truth)
       │
       ├──▶ Sidebar.astro (renders nav items)
       │
       ├──▶ DocsLayout.astro (getNeighbors for prev/next)
       │
       └──▶ Teleport (onNextPage/onPrevPage callbacks)
```

### Theme State

```
initScript (sets initial theme)
       │
       ▼
localStorage.theme ◀──▶ Lantern API
       │
       ▼
[data-theme] attribute
       │
       ▼
CSS custom properties
```

### Keyboard Events

```
User keypress
       │
       ▼
Teleport keyboard handler
       │
       ├──▶ j/k: DOM navigator (highlight item)
       │
       ├──▶ h/l: onPrevPage/onNextPage (your callback)
       │
       └──▶ Ctrl+d/u: Scroll content container
```

## Integration Points

### Atlas + Lighthouse

Atlas creates consistent internal links. Lighthouse handles edge cases:

```markdown
[[installation]]  →  /docs/installation/  (Atlas creates link)

User types /docs/install  →  Lighthouse suggests /docs/installation/
```

### Compass + Teleport

Compass provides structure, Teleport provides interaction:

```typescript nocheck
// Define structure once
const navigation: NavItem[] = [...];

// Use in Teleport callbacks
initTeleport({
  onNextPage: () => {
    const { next } = getNeighbors(navigation, currentSlug);
    if (next) navigate(`/docs/${next}/`);
  },
});
```

### Lantern + Teleport

Theme affects Teleport's highlight styling:

```css
.teleport-highlight {
  outline-color: var(--color-accent);  /* Responds to theme */
}

[data-theme="dark"] .teleport-highlight {
  outline-color: var(--color-accent);  /* Different accent in dark */
}
```

## File Structure

Typical Sailkit documentation project:

```
docs/
├── astro.config.mjs        # Atlas plugin configured here
├── src/
│   ├── navigation.ts       # Compass NavItem[] structure
│   ├── layouts/
│   │   └── DocsLayout.astro # Integrates Lantern + Teleport
│   ├── components/
│   │   ├── Sidebar.astro   # Uses navigation.ts
│   │   └── PrevNext.astro  # Uses getNeighbors
│   ├── pages/
│   │   ├── docs/
│   │   │   └── [...slug].astro
│   │   └── 404.astro       # Lighthouse integration
│   └── content/
│       └── docs/           # Markdown with [[wiki-links]]
└── package.json
```

## Bundle Impact

Sailkit is designed for minimal runtime overhead:

| Package | Bundle Size | When Loaded |
|---------|-------------|-------------|
| Atlas | 0 KB | Build only |
| Compass | ~1 KB | If using runtime API |
| Teleport | ~3 KB | Every page |
| Lantern | <1 KB | Every page |
| Lighthouse | ~2 KB | 404 page only |

Total for typical page: **~4-5 KB** (Teleport + Lantern)

## Customization Layers

Each package offers multiple abstraction levels:

### Low Level (Full Control)

```typescript nocheck
// Teleport: Just key handling
import { createKeyboardHandler } from '@sailkit/teleport';

// Lighthouse: Just matching
import { findMatches } from '@sailkit/lighthouse';

// Compass: Just utilities
import { getNeighbors } from '@sailkit/compass';
```

### Mid Level (Some Opinions)

```typescript nocheck
// Teleport: DOM handling included
import { createDOMNavigator } from '@sailkit/teleport';

// Compass: Full state machine
import { createNavigator } from '@sailkit/compass';
```

### High Level (Batteries Included)

```astro
<!-- Teleport: Full integration -->
<Teleport itemSelector=".nav-item" />

<!-- Lighthouse: Full 404 page -->
<NotFound pages={pages} />

<!-- Lantern: Toggle button -->
<ThemeToggle />
```

Choose the level that matches your customization needs.

## Related

- [[introduction]] - Project overview
- [[packages]] - Individual package documentation
- [[guides]] - Task-based tutorials
