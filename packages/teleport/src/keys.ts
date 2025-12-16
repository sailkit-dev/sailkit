/**
 * Layer 1: Pure key binding functions
 *
 * Handles parsing key patterns and matching against KeyboardEvents.
 * No DOM dependencies - pure functions only.
 */

import type {
  KeyBindings,
  ParsedKey,
  KeyboardHandlerConfig,
  KeyboardHandler,
} from './types.js';

/**
 * Default key bindings - vim-style hjkl
 */
export const DEFAULT_BINDINGS: Required<KeyBindings> = {
  down: ['j', 'ArrowDown'],
  up: ['k', 'ArrowUp'],
  left: ['h', 'ArrowLeft'],
  right: ['l', 'ArrowRight'],
  scrollDown: ['Ctrl+d'],
  scrollUp: ['Ctrl+u'],
  select: ['Enter'],
  toggleSidebar: ['t'],
  openFinder: ['/'],
  goToTop: ['gg'],      // vim sequence: g followed by g
  goToBottom: ['Shift+g'],  // vim: G (capital G)
};

/**
 * Valid modifier names (case-insensitive)
 */
const VALID_MODIFIERS = new Set(['ctrl', 'alt', 'shift', 'meta', 'cmd']);

/**
 * Valid multi-character key names that are not modifiers
 */
const VALID_SPECIAL_KEYS = new Set([
  'arrowdown',
  'arrowup',
  'arrowleft',
  'arrowright',
  'enter',
  'escape',
  'tab',
  'backspace',
  'delete',
  'home',
  'end',
  'pageup',
  'pagedown',
  'space',
  'insert',
  'capslock',
  'numlock',
  'scrolllock',
  'pause',
  'printscreen',
  'contextmenu',
  // Function keys F1-F24
  'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12',
  'f13', 'f14', 'f15', 'f16', 'f17', 'f18', 'f19', 'f20', 'f21', 'f22', 'f23', 'f24',
]);

/**
 * Parse a key pattern string into components.
 *
 * Supports modifiers: Ctrl, Alt, Shift, Meta (Cmd on Mac)
 * Examples: 'j', 'Ctrl+d', 'Shift+Tab', 'Meta+k'
 *
 * @throws Error if the pattern is invalid
 */
export function parseKey(pattern: string): ParsedKey {
  // Check for empty or whitespace-only
  if (!pattern || pattern.trim() === '') {
    throw new Error('Invalid key binding: empty string');
  }

  // Check for whitespace
  if (/\s/.test(pattern)) {
    throw new Error(`Invalid key binding "${pattern}": contains whitespace`);
  }

  // Check for plus-only
  if (pattern === '+') {
    throw new Error(`Invalid key binding "+": plus sign only`);
  }

  // Check for leading plus
  if (pattern.startsWith('+')) {
    throw new Error(`Invalid key binding "${pattern}": leading plus sign`);
  }

  // Check for consecutive plus signs
  if (/\+\+/.test(pattern)) {
    throw new Error(`Invalid key binding "${pattern}": consecutive plus signs`);
  }

  // Check for trailing plus (empty key after modifier)
  if (pattern.endsWith('+')) {
    throw new Error(`Invalid key binding "${pattern}": empty key after modifier`);
  }

  const parts = pattern.split('+');
  const key = parts.pop()!.toLowerCase();
  const modifierParts = parts;

  // Track seen modifiers to detect duplicates
  const seenModifiers = new Set<string>();

  // Validate each modifier
  for (const part of modifierParts) {
    const lowerPart = part.toLowerCase();

    if (!VALID_MODIFIERS.has(lowerPart)) {
      throw new Error(
        `Invalid key binding "${pattern}": unrecognized modifier "${part}"`
      );
    }

    // Normalize cmd to meta for duplicate detection
    const normalizedMod = lowerPart === 'cmd' ? 'meta' : lowerPart;
    if (seenModifiers.has(normalizedMod)) {
      throw new Error(
        `Invalid key binding "${pattern}": duplicate modifier "${part}"`
      );
    }
    seenModifiers.add(normalizedMod);
  }

  // If the key is itself a modifier, it's a modifier-only binding (missing key)
  if (VALID_MODIFIERS.has(key)) {
    throw new Error(
      `Invalid key binding "${pattern}": modifier-only binding, missing key`
    );
  }

  // Check for suspicious multi-character keys (likely missing +)
  if (key.length > 1 && !VALID_SPECIAL_KEYS.has(key)) {
    throw new Error(
      `Invalid key binding "${pattern}": key "${key}" looks like a missing plus sign`
    );
  }

  return {
    key,
    ctrl: seenModifiers.has('ctrl'),
    alt: seenModifiers.has('alt'),
    shift: seenModifiers.has('shift'),
    meta: seenModifiers.has('meta'),
  };
}

/**
 * Check if a KeyboardEvent matches a parsed key pattern.
 */
export function matchesKey(event: KeyboardEvent, parsed: ParsedKey): boolean {
  const eventKey = event.key.toLowerCase();

  // Handle special key names
  const normalizedEventKey =
    eventKey === ' ' ? 'space' : eventKey === 'arrowdown' ? 'arrowdown' : eventKey;
  const normalizedParsedKey = parsed.key.toLowerCase();

  if (normalizedEventKey !== normalizedParsedKey) {
    return false;
  }

  if (event.ctrlKey !== parsed.ctrl) return false;
  if (event.altKey !== parsed.alt) return false;
  if (event.shiftKey !== parsed.shift) return false;
  if (event.metaKey !== parsed.meta) return false;

  return true;
}

/**
 * Check if a KeyboardEvent matches any of the given key patterns.
 */
export function matchesAnyKey(event: KeyboardEvent, patterns: string[]): boolean {
  return patterns.some((pattern) => matchesKey(event, parseKey(pattern)));
}

/**
 * Check if the event target is a typing context (input, textarea, contenteditable).
 */
export function isTypingContext(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null;
  if (!target) return false;

  const tagName = target.tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea') return true;
  // Check contentEditable attribute directly for better test compatibility
  if (target.isContentEditable || target.getAttribute('contenteditable') === 'true') {
    return true;
  }

  return false;
}

/**
 * Check if a binding pattern is a key sequence (e.g., 'gg')
 */
function isSequencePattern(pattern: string): boolean {
  // A sequence is 2+ identical characters with no modifiers
  return pattern.length >= 2 && !pattern.includes('+') && new Set(pattern).size === 1;
}

/**
 * Check if any patterns in the list are sequences
 */
function hasSequenceBinding(patterns: string[]): boolean {
  return patterns.some(isSequencePattern);
}

/**
 * Get the sequence key and length from patterns
 */
function getSequenceInfo(patterns: string[]): { key: string; length: number } | null {
  const seqPattern = patterns.find(isSequencePattern);
  if (!seqPattern) return null;
  return { key: seqPattern[0].toLowerCase(), length: seqPattern.length };
}

/**
 * Create a keyboard handler that maps key events to directional callbacks.
 */
export function createKeyboardHandler(
  config: KeyboardHandlerConfig
): KeyboardHandler {
  const {
    bindings = {},
    onDown,
    onUp,
    onLeft,
    onRight,
    onScrollDown,
    onScrollUp,
    onSelect,
    onToggleSidebar,
    onOpenFinder,
    onGoToTop,
    onGoToBottom,
    ignoreWhenTyping = true,
  } = config;

  const mergedBindings: Required<KeyBindings> = {
    ...DEFAULT_BINDINGS,
    ...bindings,
  };

  // Sequence state for tracking multi-key patterns like 'gg'
  let pendingSequenceKey: string | null = null;
  let pendingSequenceCount = 0;
  let sequenceTimeout: ReturnType<typeof setTimeout> | null = null;
  const SEQUENCE_TIMEOUT_MS = 500;

  function resetSequence(): void {
    pendingSequenceKey = null;
    pendingSequenceCount = 0;
    if (sequenceTimeout) {
      clearTimeout(sequenceTimeout);
      sequenceTimeout = null;
    }
  }

  /**
   * Call a callback and preventDefault if it returns true (or undefined for backwards compat)
   */
  function callHandler(event: KeyboardEvent, callback: (event: KeyboardEvent) => boolean | void): boolean {
    const result = callback(event);
    // preventDefault unless callback explicitly returns false
    if (result !== false) {
      event.preventDefault();
    }
    return true;
  }

  /**
   * Check for sequence matches (like 'gg')
   */
  function checkSequence(event: KeyboardEvent, patterns: string[], callback: (event: KeyboardEvent) => boolean | void): boolean {
    if (!hasSequenceBinding(patterns)) return false;

    const seqInfo = getSequenceInfo(patterns);
    if (!seqInfo) return false;

    const eventKey = event.key.toLowerCase();

    // Must be the sequence key with no modifiers
    if (eventKey !== seqInfo.key || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
      resetSequence();
      return false;
    }

    // Start or continue sequence
    if (pendingSequenceKey === seqInfo.key) {
      pendingSequenceCount++;
    } else {
      pendingSequenceKey = seqInfo.key;
      pendingSequenceCount = 1;
    }

    // Reset timeout
    if (sequenceTimeout) clearTimeout(sequenceTimeout);
    sequenceTimeout = setTimeout(resetSequence, SEQUENCE_TIMEOUT_MS);

    // Check if sequence is complete
    if (pendingSequenceCount >= seqInfo.length) {
      resetSequence();
      return callHandler(event, callback);
    }

    // Sequence in progress - consume the key
    event.preventDefault();
    return true;
  }

  function handleKeydown(event: KeyboardEvent): boolean {
    // Skip if typing in input/textarea
    if (ignoreWhenTyping && isTypingContext(event)) {
      return false;
    }

    // Check sequence bindings first (like 'gg')
    if (onGoToTop && checkSequence(event, mergedBindings.goToTop, onGoToTop)) {
      return true;
    }

    // Single 'g' without modifiers might be start of sequence - don't process other bindings
    const eventKey = event.key.toLowerCase();
    if (eventKey === 'g' && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey) {
      if (hasSequenceBinding(mergedBindings.goToTop)) {
        // Already handled by checkSequence above, just return
        return true;
      }
    }

    // Directional bindings
    if (onDown && matchesAnyKey(event, mergedBindings.down)) {
      return callHandler(event, onDown);
    }

    if (onUp && matchesAnyKey(event, mergedBindings.up)) {
      return callHandler(event, onUp);
    }

    if (onLeft && matchesAnyKey(event, mergedBindings.left)) {
      return callHandler(event, onLeft);
    }

    if (onRight && matchesAnyKey(event, mergedBindings.right)) {
      return callHandler(event, onRight);
    }

    // Scroll bindings
    if (onScrollDown && matchesAnyKey(event, mergedBindings.scrollDown)) {
      return callHandler(event, onScrollDown);
    }

    if (onScrollUp && matchesAnyKey(event, mergedBindings.scrollUp)) {
      return callHandler(event, onScrollUp);
    }

    // Action bindings
    if (onSelect && matchesAnyKey(event, mergedBindings.select)) {
      return callHandler(event, onSelect);
    }

    if (onToggleSidebar && matchesAnyKey(event, mergedBindings.toggleSidebar)) {
      return callHandler(event, onToggleSidebar);
    }

    if (onOpenFinder && matchesAnyKey(event, mergedBindings.openFinder)) {
      return callHandler(event, onOpenFinder);
    }

    // Go to top/bottom (non-sequence patterns like Shift+g)
    if (onGoToTop && matchesAnyKey(event, mergedBindings.goToTop.filter(p => !isSequencePattern(p)))) {
      return callHandler(event, onGoToTop);
    }

    if (onGoToBottom && matchesAnyKey(event, mergedBindings.goToBottom)) {
      return callHandler(event, onGoToBottom);
    }

    return false;
  }

  return {
    handleKeydown,
    destroy: () => {
      resetSequence();
    },
  };
}
