---
title: Teleport
description: Vim-style keyboard navigation bindings with DOM integration.
---

# Teleport

**@sailkit/teleport** provides Vim-style keyboard navigation with DOM integration. Use the high-level `createTeleport` for full DOM navigation, or the lower-level `initTeleport` and `createKeyboardHandler` for custom integrations.

## Installation

```bash nocheck
npm install @sailkit/teleport
```

## Quick Start (Astro)

```astro nocheck
---
import Teleport from '@sailkit/teleport/Teleport.astro';
---
<html>
  <body>
    <nav class="sidebar">
      <a class="nav-item" href="/page-1">Page 1</a>
      <a class="nav-item" href="/page-2">Page 2</a>
    </nav>
    <main>Content</main>
    <Teleport sidebarSelector=".sidebar" />
  </body>
</html>
```

## Default Key Bindings

| Key | Action |
|-----|--------|
| `j` / `ArrowDown` | Next item in sidebar |
| `k` / `ArrowUp` | Previous item in sidebar |
| `Ctrl+d` | Scroll content down |
| `Ctrl+u` | Scroll content up |
| `l` / `ArrowRight` | Next page |
| `h` / `ArrowLeft` | Previous page |
| `Enter` | Navigate to highlighted item |
| `t` | Toggle sidebar |
| `/` | Open fuzzy finder |
| `g g` | Go to top of page |
| `G` | Go to bottom of page |

## API Layers

### Layer 1: Full DOM Integration (createTeleport)

The batteries-included option - handles DOM scanning, highlighting, scrolling, and keyboard bindings:

```typescript nocheck
import { createTeleport } from '@sailkit/teleport';

const teleport = createTeleport({
  itemSelector: '.nav-item',
  sidebarSelector: '.sidebar',
  highlightClass: 'teleport-highlight',
  wrap: true,
  whenHidden: 'ignore',
  onSelect: (el, slug) => console.log('Selected', slug),
  onToggleSidebar: () => document.body.classList.toggle('sidebar-open'),
});

// Access the underlying Compass navigator
teleport.navigator.current;  // Current slug
teleport.navigator.next();   // Move to next item

// Get currently highlighted element
teleport.currentElement;

// Refresh after DOM changes
teleport.refresh();

// Cleanup
teleport.destroy();
```

### Layer 2: Keyboard Bindings Only (initTeleport)

Just the keyboard handling, you manage navigation state:

```typescript
import { initTeleport } from '@sailkit/teleport';
import { createNavigator } from '@sailkit/compass';

const nav = createNavigator({ items: ['a', 'b', 'c'], wrap: false });
const teleport = initTeleport({
  onDown: () => nav.next(),
  onUp: () => nav.prev(),
});

teleport.destroy();
```

### Layer 3: Pure Key Handler (createKeyboardHandler)

Low-level key binding without any navigation logic:

```typescript
import { createKeyboardHandler, DEFAULT_BINDINGS } from '@sailkit/teleport';

const handler = createKeyboardHandler({
  bindings: DEFAULT_BINDINGS,
  onDown: () => console.log('down'),
  onUp: () => console.log('up'),
  onSelect: () => console.log('selected'),
  onToggleSidebar: () => console.log('toggle sidebar'),
});

document.addEventListener('keydown', handler.handleKeydown);
handler.destroy();
```

## Astro Component Props

```astro nocheck
<Teleport
  itemSelector=".nav-item"
  sidebarSelector=".sidebar"
  highlightClass="teleport-highlight"
  wrap={true}
  whenHidden="ignore"
  desktopMediaQuery="(min-width: 769px)"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `itemSelector` | `string` | `.nav-item` | CSS selector for nav items |
| `sidebarSelector` | `string` | — | Sidebar container (enables visibility awareness) |
| `highlightClass` | `string` | `teleport-highlight` | Class for highlighted item |
| `wrap` | `boolean` | `true` | Wrap around at list boundaries |
| `whenHidden` | `'ignore' \| 'show-sidebar'` | `ignore` | Behavior when sidebar is hidden |
| `desktopMediaQuery` | `string` | `(min-width: 769px)` | Media query for desktop mode |

## Sidebar Visibility

When you provide `sidebarSelector`, Teleport becomes visibility-aware:

- **Sidebar visible**: j/k/arrows navigate the sidebar
- **Sidebar hidden**: arrows pass through for native scroll, j/k do nothing

The `whenHidden` option controls behavior when sidebar is hidden:

```typescript nocheck
createTeleport({
  itemSelector: '.nav-item',
  sidebarSelector: '.sidebar',
  whenHidden: 'ignore',       // Default: arrows scroll, j/k do nothing
  // whenHidden: 'show-sidebar', // Auto-open sidebar on navigation keys
});
```

## Custom Bindings

```typescript
import { createKeyboardHandler } from '@sailkit/teleport';

createKeyboardHandler({
  bindings: {
    down: ['n', 'ArrowDown'],
    up: ['p', 'ArrowUp'],
    scrollDown: ['Ctrl+f'],
    scrollUp: ['Ctrl+b'],
    select: ['Enter', ' '],
    left: ['Shift+k'],
    right: ['Shift+j'],
  },
  onDown: () => {},
  onUp: () => {},
});
```

## Styling

Teleport adds the highlight class to the current item. You provide the styles:

```css nocheck
.teleport-highlight {
  outline: 2px solid var(--color-accent);
  background-color: var(--color-accent-dim);
  border-radius: 4px;
}
```

## Text Input Handling

By default, key bindings are disabled when typing in text inputs:

```typescript
import { isTypingContext } from '@sailkit/teleport';

document.addEventListener('keydown', (e) => {
  if (isTypingContext(e)) {
    return; // User is typing, don't intercept
  }
});
```

## Events

Teleport emits custom events when no callback is provided:

```javascript nocheck
// Sidebar toggle
document.addEventListener('teleport:toggle-sidebar', () => {
  document.body.classList.toggle('sidebar-open');
});

// Fuzzy finder
document.addEventListener('teleport:open-finder', () => {
  // Open your fuzzy finder UI
});
```

## Related

- [[compass]] - Navigation state that Teleport uses internally
- [[vim-navigation]] - Guide for customizing key bindings
