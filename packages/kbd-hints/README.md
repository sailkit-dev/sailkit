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
.kbd-hints-legend { /* container */ }
.kbd-hints-legend--compact { /* header bar variant */ }
.kbd-hints-title { /* "Keyboard" heading */ }
.kbd-hints-row { /* single shortcut row */ }
.kbd-hints-badge { /* inline badge container */ }
.kbd-hints-group { /* compact group */ }
.kbd-hints-label { /* label text */ }
kbd { /* key badge */ }
```

## Visibility

Control visibility with the `enabled` prop:

```astro
<!-- Auto-detect (default) -->
<KbdLegend bindings={DEFAULT_BINDINGS} enabled="auto" />

<!-- Always show -->
<KbdLegend bindings={DEFAULT_BINDINGS} enabled="always" />

<!-- Always hide -->
<KbdLegend bindings={DEFAULT_BINDINGS} enabled="never" />
```

Detection strategy (when `enabled="auto"`):
1. Desktop breakpoint → show by default
2. Mobile breakpoint → hide by default
3. Touch event → hide (unless localStorage flag set)
4. Keydown event → show + persist to localStorage permanently
