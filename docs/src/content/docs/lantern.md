---
title: Lantern
description: Theme toggle with flash-free dark mode.
---

# Lantern

**@sailkit-dev/lantern** provides dark mode done right. No flash of wrong theme, localStorage persistence, and reactive updates.

## Installation

See [[installation]] for setup instructions.

## The Flash Problem

Typical dark mode implementations cause a "flash" when the page loads:

1. HTML loads with default theme
2. JavaScript runs
3. JavaScript checks localStorage/preference
4. JavaScript updates theme
5. User sees a flash from wrong to right theme

Lantern solves this with an inline script that runs before any paint.

## Quick Start (Astro)

```astro
---
import { initScript } from '@sailkit-dev/lantern';
import ThemeToggle from '@sailkit-dev/lantern/ThemeToggle.astro';
---
<html>
  <head>
    <!-- Must be inline, before any render -->
    <script is:inline set:html={initScript} />
  </head>
  <body>
    <ThemeToggle />
    <slot />
  </body>
</html>
```

The `initScript` is a minified string that:
1. Reads theme from localStorage
2. Falls back to system preference
3. Sets `data-theme` attribute immediately

## The Convention

Lantern uses a simple convention:

- **localStorage key**: `theme`
- **HTML attribute**: `data-theme` on `<html>`
- **Values**: `light` or `dark`

Style your CSS accordingly:

```css
:root {
  --color-bg: white;
  --color-text: black;
}

[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-text: #f1f5f9;
}

body {
  background: var(--color-bg);
  color: var(--color-text);
}
```

## Programmatic API

```typescript
import {
  initTheme,
  getTheme,
  setTheme,
  toggleTheme,
  onThemeChange
} from '@sailkit-dev/lantern';

// Initialize (restore from localStorage)
initTheme();

// Get current theme
const current = getTheme(); // 'light' | 'dark'

// Set theme explicitly
setTheme('dark');

// Toggle between themes
const newTheme = toggleTheme(); // Returns new theme

// Subscribe to changes
const unsubscribe = onThemeChange((theme) => {
  console.log('Theme changed to:', theme);
  // Update UI, icons, etc.
});

// Later, unsubscribe
unsubscribe();
```

## Astro Component

The `ThemeToggle.astro` component renders a toggle button:

```astro
<ThemeToggle />
<ThemeToggle showLabel={false} />
<ThemeToggle class="my-custom-class" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showLabel` | `boolean` | `true` | Show "Light"/"Dark" text |
| `class` | `string` | - | Additional CSS class |

The component shows sun/moon emojis and responds to clicks.

## System Preference

By default, Lantern respects `prefers-color-scheme`:

```typescript
// initScript behavior:
// 1. Check localStorage for saved preference
// 2. If none, check prefers-color-scheme
// 3. Default to 'dark' if neither available
```

## Reactive Updates

Multiple components can react to theme changes:

```typescript
import { onThemeChange } from '@sailkit-dev/lantern';

// In component A
onThemeChange((theme) => {
  updateIcon(theme);
});

// In component B
onThemeChange((theme) => {
  updateChart(theme);
});
```

## Integration Example

Full layout with [[teleport|Teleport]] and Lantern:

```astro
---
import { initScript } from '@sailkit-dev/lantern';
import ThemeToggle from '@sailkit-dev/lantern/ThemeToggle.astro';
import Teleport from '@sailkit-dev/teleport/Teleport.astro';
---
<html>
  <head>
    <script is:inline set:html={initScript} />
    <style>
      :root { --bg: white; }
      [data-theme="dark"] { --bg: #0f172a; }
    </style>
  </head>
  <body>
    <header>
      <ThemeToggle />
    </header>
    <nav class="sidebar">
      <a class="nav-item" href="/">Home</a>
    </nav>
    <main><slot /></main>
    <Teleport />
  </body>
</html>
```

## Related

- [[theming]] - Guide for designing your dark mode colors
- [[architecture]] - How Lantern fits into the larger system
