import type { TeleportBindings, KbdShortcut, KbdGroup } from './types.js';

/** Labels for teleport binding actions */
const ACTION_LABELS: Record<keyof TeleportBindings, string> = {
  down: 'next',
  up: 'prev',
  left: 'prev page',
  right: 'next page',
  scrollDown: 'scroll down',
  scrollUp: 'scroll up',
  select: 'open',
  toggleSidebar: 'sidebar',
  openFinder: 'search',
  goToTop: 'top',
  goToBottom: 'bottom',
};

/** Group assignments for teleport bindings */
const ACTION_GROUPS: Record<keyof TeleportBindings, string> = {
  down: 'Navigation',
  up: 'Navigation',
  left: 'Navigation',
  right: 'Navigation',
  scrollDown: 'Scrolling',
  scrollUp: 'Scrolling',
  select: 'Actions',
  toggleSidebar: 'Actions',
  openFinder: 'Actions',
  goToTop: 'Jump',
  goToBottom: 'Jump',
};

/**
 * Convert teleport bindings to flat shortcut list
 */
export function getShortcuts(bindings: TeleportBindings): KbdShortcut[] {
  const shortcuts: KbdShortcut[] = [];

  for (const [action, keys] of Object.entries(bindings)) {
    if (keys && keys.length > 0) {
      shortcuts.push({
        keys,
        label: ACTION_LABELS[action as keyof TeleportBindings] ?? action,
      });
    }
  }

  return shortcuts;
}

/**
 * Convert teleport bindings to grouped shortcut list
 */
export function getBindingGroups(bindings: TeleportBindings): KbdGroup[] {
  const groupMap = new Map<string, KbdShortcut[]>();

  for (const [action, keys] of Object.entries(bindings)) {
    if (!keys || keys.length === 0) continue;

    const groupName = ACTION_GROUPS[action as keyof TeleportBindings] ?? 'Other';
    const shortcut: KbdShortcut = {
      keys,
      label: ACTION_LABELS[action as keyof TeleportBindings] ?? action,
    };

    if (!groupMap.has(groupName)) {
      groupMap.set(groupName, []);
    }
    groupMap.get(groupName)!.push(shortcut);
  }

  // Return in consistent order
  const groupOrder = ['Navigation', 'Scrolling', 'Jump', 'Actions', 'Other'];
  return groupOrder
    .filter(name => groupMap.has(name))
    .map(name => ({ name, shortcuts: groupMap.get(name)! }));
}

/**
 * Format a key for display (e.g., 'Ctrl+d' -> 'Ctrl+D', 'gg' -> 'gg')
 */
export function formatKey(key: string): string {
  // Sequences like 'gg' stay lowercase
  if (key.length > 1 && !key.includes('+')) {
    return key;
  }
  // Modifier combos: capitalize the final key
  if (key.includes('+')) {
    const parts = key.split('+');
    const lastKey = parts.pop()!;
    return [...parts, lastKey.toUpperCase()].join('+');
  }
  // Single keys stay as-is
  return key;
}
