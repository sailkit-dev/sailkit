# @sailkit/kbd-hints

Keyboard shortcut visibility components. Renders `<kbd>` badges and legends from teleport bindings.

## Usage

```astro
---
import { DEFAULT_BINDINGS } from '@sailkit/teleport';
import KbdLegend from '@sailkit/kbd-hints/KbdLegend.astro';
import KbdBadge from '@sailkit/kbd-hints/KbdBadge.astro';
---

<!-- Full legend (sidebar) -->
<KbdLegend bindings={DEFAULT_BINDINGS} />

<!-- Compact legend (header bar) -->
<KbdLegend bindings={DEFAULT_BINDINGS} layout="compact" />

<!-- Individual badge -->
<KbdBadge keys={['j', 'k']} label="navigate" />
```

## Props

### KbdLegend

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `bindings` | `TeleportBindings` | required | Teleport bindings object |
| `enabled` | `boolean` | `true` | Whether to render |
| `layout` | `'compact' \| 'full'` | `'full'` | Layout style |
| `class` | `string` | - | Additional CSS class |

### KbdBadge

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `keys` | `string[]` | required | Keys to display |
| `label` | `string` | - | Label after keys |
| `enabled` | `boolean` | `true` | Whether to render |
| `class` | `string` | - | Additional CSS class |

## Styling

Components apply CSS classes; sites define styles:

```css
.kbd-legend { /* container */ }
.kbd-legend--compact { /* header bar variant */ }
.kbd-legend-title { /* "Keyboard" heading */ }
.kbd-row { /* single shortcut row */ }
.kbd-badge { /* inline badge container */ }
.kbd-group { /* compact group */ }
.kbd-label { /* label text */ }
kbd { /* key badge */ }
```

## Visibility

No detection built-in. Sites handle visibility:

```css
/* Hide on touch devices */
@media (pointer: coarse) and (hover: none) {
  .kbd-legend { display: none; }
}
```

Or pass `enabled={false}` prop.
