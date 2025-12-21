---
title: Theming
description: Design your dark mode color scheme and theme transitions.
---

# Theming Guide

This guide covers designing dark mode with [[lantern]], including CSS custom properties, color selection, and smooth transitions.

## The Lantern Convention

Lantern uses a simple convention:

- **Attribute**: `data-theme` on `<html>` element
- **Values**: `"light"` or `"dark"`
- **Storage**: `localStorage.theme`

Your CSS responds to this attribute.

## Basic Theme Variables

```css
:root {
  /* Light mode (default) */
  --color-bg: #ffffff;
  --color-text: #1a1a2e;
  --color-text-muted: #64748b;
  --color-border: #e2e8f0;
  --color-accent: #3b82f6;
}

[data-theme="dark"] {
  /* Dark mode overrides */
  --color-bg: #0f172a;
  --color-text: #f1f5f9;
  --color-text-muted: #94a3b8;
  --color-border: #334155;
  --color-accent: #60a5fa;
}

body {
  background: var(--color-bg);
  color: var(--color-text);
}
```

## Color Palette Selection

### For Light Mode

- **Background**: Pure white (#ffffff) or soft gray (#f8fafc)
- **Text**: Near-black for contrast (#1a1a2e)
- **Muted text**: Gray that passes WCAG (#64748b)
- **Borders**: Light gray (#e2e8f0)
- **Accent**: Vibrant but not harsh (#3b82f6)

### For Dark Mode

- **Background**: Dark blue-gray (#0f172a) rather than pure black
- **Text**: Off-white (#f1f5f9) to reduce eye strain
- **Muted text**: Lighter gray (#94a3b8)
- **Borders**: Visible but subtle (#334155)
- **Accent**: Lighter shade of light mode accent (#60a5fa)

## Extended Variables

For a complete documentation site:

```css
:root {
  /* Base */
  --color-bg: #ffffff;
  --color-text: #1a1a2e;
  --color-text-muted: #64748b;

  /* Surfaces */
  --color-surface: #f8fafc;
  --color-surface-hover: #f1f5f9;

  /* Borders */
  --color-border: #e2e8f0;
  --color-border-strong: #cbd5e1;

  /* Accent */
  --color-accent: #3b82f6;
  --color-accent-hover: #2563eb;
  --color-accent-dim: rgba(59, 130, 246, 0.1);

  /* Code */
  --color-code-bg: #f1f5f9;
  --color-code-text: #1e293b;

  /* Semantic */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
}

[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-text: #f1f5f9;
  --color-text-muted: #94a3b8;

  --color-surface: #1e293b;
  --color-surface-hover: #334155;

  --color-border: #334155;
  --color-border-strong: #475569;

  --color-accent: #60a5fa;
  --color-accent-hover: #93c5fd;
  --color-accent-dim: rgba(96, 165, 250, 0.15);

  --color-code-bg: #1e293b;
  --color-code-text: #e2e8f0;

  --color-success: #4ade80;
  --color-warning: #fbbf24;
  --color-error: #f87171;
}
```

## Smooth Transitions

Add transitions for theme changes:

```css
body {
  background: var(--color-bg);
  color: var(--color-text);
  transition: background-color 0.2s, color 0.2s;
}

/* Apply to all themed elements */
a, button, .card, .sidebar {
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}
```

**Caution**: Don't transition everything—it can feel sluggish:

```css
/* Avoid */
* {
  transition: all 0.2s;  /* Too slow */
}

/* Better: Only key elements */
body, .header, .sidebar, .card {
  transition: background-color 0.2s, color 0.2s;
}
```

## Flash Prevention

The `initScript` must run before any render:

```astro
---
import { initScript } from '@sailkit-dev/lantern';
---
<html>
  <head>
    <!-- MUST be inline and first -->
    <script is:inline set:html={initScript} />
    <!-- Other head elements after -->
    <link rel="stylesheet" href="/styles.css" />
  </head>
</html>
```

If you see flash, check:
1. Is `initScript` inline? (`is:inline` in Astro)
2. Is it before stylesheets?
3. Is CSS using `[data-theme]` selectors?

## System Preference Detection

Lantern respects `prefers-color-scheme` by default:

```css
/* The initScript checks this */
@media (prefers-color-scheme: dark) {
  /* Used when no localStorage preference */
}
```

To handle manually:

```typescript nocheck
import { setTheme } from '@sailkit-dev/lantern';

// Respect system preference
const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
setTheme(systemDark ? 'dark' : 'light');

// Listen for system changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  setTheme(e.matches ? 'dark' : 'light');
});
```

## Reactive Components

Update UI when theme changes:

```typescript nocheck
import { onThemeChange, getTheme } from '@sailkit-dev/lantern';

// Update icon based on theme
function updateThemeIcon() {
  const icon = document.querySelector('.theme-icon');
  icon.textContent = getTheme() === 'dark' ? '🌙' : '☀️';
}

// Subscribe to changes
onThemeChange(updateThemeIcon);

// Initial update
updateThemeIcon();
```

## Images and Media

Handle images that need different versions:

```html
<!-- Using picture element -->
<picture>
  <source
    srcset="/logo-dark.svg"
    media="(prefers-color-scheme: dark)"
  />
  <img src="/logo-light.svg" alt="Logo" />
</picture>

<!-- Using CSS -->
<style>
  .logo-light { display: block; }
  .logo-dark { display: none; }

  [data-theme="dark"] .logo-light { display: none; }
  [data-theme="dark"] .logo-dark { display: block; }
</style>
```

## Integration with Teleport

Style [[teleport|Teleport's]] highlight for both themes:

```css
.teleport-highlight {
  outline: 2px solid var(--color-accent);
  background-color: var(--color-accent-dim);
  border-radius: 4px;
}
```

The CSS variables automatically adjust for dark mode.

## Related

- [[lantern]] - Full API reference
- [[architecture]] - How theming fits the system
- [[vim-navigation]] - Style keyboard navigation
