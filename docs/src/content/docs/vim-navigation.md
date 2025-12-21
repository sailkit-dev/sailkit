---
title: Vim Navigation
description: Customize keyboard shortcuts and navigation behavior.
---

# Vim Navigation Guide

This guide covers customizing [[teleport|Teleport's]] keyboard navigation beyond the defaults.

## Default Bindings

Out of the box, Teleport uses these Vim-inspired keys:

| Key | Action |
|-----|--------|
| `j` / `ArrowDown` | Next sidebar item |
| `k` / `ArrowUp` | Previous sidebar item |
| `h` / `ArrowLeft` | Previous page |
| `l` / `ArrowRight` | Next page |
| `Ctrl+d` | Scroll down half page |
| `Ctrl+u` | Scroll up half page |
| `Enter` | Navigate to highlighted item |
| `Escape` | Clear highlight |
| `t` | Open fuzzy finder |

## Custom Key Bindings

### Changing Individual Keys

```typescript nocheck
import { initTeleport } from '@sailkit-dev/teleport';

initTeleport({
  itemSelector: '.nav-item',
  bindings: {
    nextItem: ['n', 'j', 'ArrowDown'],  // Add 'n'
    prevItem: ['p', 'k', 'ArrowUp'],    // Add 'p'
  },
});
```

### Full Emacs-Style Bindings

```typescript nocheck
initTeleport({
  itemSelector: '.nav-item',
  bindings: {
    nextItem: ['Ctrl+n', 'ArrowDown'],
    prevItem: ['Ctrl+p', 'ArrowUp'],
    scrollDown: ['Ctrl+v'],
    scrollUp: ['Alt+v'],
    select: ['Enter'],
    nextPage: ['Ctrl+f'],
    prevPage: ['Ctrl+b'],
  },
});
```

### Disabling Bindings

Set to empty array to disable:

```typescript nocheck
initTeleport({
  itemSelector: '.nav-item',
  bindings: {
    openFinder: [],      // Disable 't' key
    scrollDown: [],      // Disable Ctrl+d
    scrollUp: [],        // Disable Ctrl+u
  },
});
```

## Key Syntax

Keys are specified as strings with optional modifiers:

```typescript nocheck
// Simple keys
'j'
'Enter'
'Escape'
'ArrowDown'

// With modifiers
'Ctrl+d'
'Alt+f'
'Shift+Enter'
'Ctrl+Shift+p'
'Meta+k'  // Cmd on Mac
```

## Custom Actions

### Page Navigation with Compass

Combine [[teleport]] with [[compass]] for intelligent page navigation:

```typescript nocheck
import { initTeleport } from '@sailkit-dev/teleport';
import { createNavigator } from '@sailkit-dev/compass';
import { navigation } from './navigation';

const nav = createNavigator({
  items: navigation,
  leavesOnly: true,  // Skip section pages
});

// Set initial position based on current URL
const currentSlug = window.location.pathname.split('/')[2];
nav.goToSlug(currentSlug);

initTeleport({
  itemSelector: '.nav-item',
  onNextPage: () => {
    nav.next();
    if (nav.current) {
      window.location.href = `/docs/${nav.current}/`;
    }
  },
  onPrevPage: () => {
    nav.prev();
    if (nav.current) {
      window.location.href = `/docs/${nav.current}/`;
    }
  },
});
```

### Custom Scroll Behavior

```typescript nocheck
import { initTeleport, scrollElement } from '@sailkit-dev/teleport';

initTeleport({
  itemSelector: '.nav-item',
  scrollAmount: 500,  // Pixels per Ctrl+d/u press
});

// Or handle manually
const handler = createKeyboardHandler({
  onScrollDown: () => {
    scrollElement(document.querySelector('main'), 300, 'down');
  },
  onScrollUp: () => {
    scrollElement(document.querySelector('main'), 300, 'up');
  },
});
```

### Fuzzy Finder Integration

```typescript nocheck
initTeleport({
  itemSelector: '.nav-item',
  onOpenFinder: () => {
    // Open your fuzzy finder modal
    document.getElementById('search-modal').showModal();
  },
});

// Or listen for custom event
document.addEventListener('teleport:open-finder', () => {
  openSearchModal();
});
```

## Layer Selection

Teleport offers three abstraction layers. Choose based on your needs:

### Layer 1: Just Key Handling

Use when you have custom DOM handling:

```typescript nocheck
import { createKeyboardHandler } from '@sailkit-dev/teleport';

let currentIndex = 0;
const items = document.querySelectorAll('.item');

const handler = createKeyboardHandler({
  onNextItem: () => {
    currentIndex = Math.min(currentIndex + 1, items.length - 1);
    highlightItem(currentIndex);
  },
  onPrevItem: () => {
    currentIndex = Math.max(currentIndex - 1, 0);
    highlightItem(currentIndex);
  },
});

document.addEventListener('keydown', handler.handleKeydown);
```

### Layer 2: Key Handling + DOM

Use when you need highlighting but custom keyboard callbacks:

```typescript nocheck
import { createDOMNavigator, createKeyboardHandler } from '@sailkit-dev/teleport';

const navigator = createDOMNavigator({
  getItems: () => document.querySelectorAll('.nav-item'),
  highlightClass: 'active',
});

const handler = createKeyboardHandler({
  onNextItem: () => navigator.next(),
  onPrevItem: () => navigator.prev(),
  onSelect: () => navigator.currentItem?.click(),
});

document.addEventListener('keydown', handler.handleKeydown);
```

### Layer 3: Full Integration

Use for standard documentation navigation:

```typescript nocheck
import { initTeleport } from '@sailkit-dev/teleport';

const teleport = initTeleport({
  itemSelector: '.nav-item',
  onNextPage: () => navigateNext(),
  onPrevPage: () => navigatePrev(),
});
```

## Text Input Handling

By default, key bindings are disabled in text inputs:

```typescript nocheck
// Keys won't trigger when typing in:
// <input>, <textarea>, [contenteditable]

// To check manually:
import { isTypingContext } from '@sailkit-dev/teleport';

document.addEventListener('keydown', (e) => {
  if (isTypingContext(e)) return;
  // Handle key...
});
```

## Styling Highlights

```css
/* Default class */
.teleport-highlight {
  outline: 2px solid #3b82f6;
  background-color: rgba(59, 130, 246, 0.1);
  border-radius: 4px;
}

/* Dark mode with Lantern */
[data-theme="dark"] .teleport-highlight {
  outline-color: #60a5fa;
  background-color: rgba(96, 165, 250, 0.15);
}
```

## Related

- [[teleport]] - Full API reference
- [[compass]] - Navigation state for page traversal
- [[architecture]] - How keyboard nav fits the system
