/**
 * Keyboard detection module
 *
 * Determines whether to show keyboard hints based on:
 * 1. localStorage flag (permanent, set on keydown)
 * 2. Consumer override (always/never/auto)
 * 3. Touch events (hide unless localStorage flag)
 * 4. Breakpoint default (desktop=show, mobile=hide)
 */

export type EnabledProp = 'auto' | 'always' | 'never' | boolean;

export interface KeyboardDetectorConfig {
  /** Control visibility: 'auto' (detect), 'always', 'never', or boolean */
  enabled?: EnabledProp;
  /** Desktop breakpoint media query (default: '(min-width: 769px)') */
  desktopQuery?: string;
}

export interface KeyboardDetector {
  /** Returns whether hints should be shown */
  shouldShow(): boolean;
  /** Handle touch event (hides hints unless localStorage flag) */
  handleTouch(): void;
  /** Handle keydown event (shows hints + persists to localStorage) */
  handleKeydown(): void;
  /** Subscribe to visibility changes */
  subscribe(callback: (visible: boolean) => void): () => void;
  /** Cleanup event listeners */
  destroy(): void;
}

const STORAGE_KEY = 'kbd:hasKeyboard';

export function createKeyboardDetector(
  config: KeyboardDetectorConfig = {}
): KeyboardDetector {
  const { enabled = 'auto', desktopQuery = '(min-width: 769px)' } = config;

  // Normalize enabled prop
  const mode = enabled === true ? 'always' : enabled === false ? 'never' : enabled;

  // State
  let touchHidden = false;
  const subscribers = new Set<(visible: boolean) => void>();

  // Check localStorage for permanent flag
  function hasKeyboardFlag(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  // Set localStorage flag
  function setKeyboardFlag(): void {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Ignore storage errors
    }
  }

  // Check if desktop breakpoint matches
  function isDesktop(): boolean {
    return matchMedia(desktopQuery).matches;
  }

  // Notify subscribers of visibility change
  function notify(visible: boolean): void {
    subscribers.forEach(cb => cb(visible));
  }

  function shouldShow(): boolean {
    // Consumer overrides
    if (mode === 'always') return true;
    if (mode === 'never') return false;

    // localStorage flag trumps all detection
    if (hasKeyboardFlag()) return true;

    // Touch hidden (unless localStorage flag set)
    if (touchHidden) return false;

    // Breakpoint default
    return isDesktop();
  }

  function handleTouch(): void {
    // If localStorage flag is set, touch doesn't hide
    if (hasKeyboardFlag()) return;

    const wasVisible = shouldShow();
    touchHidden = true;
    const nowVisible = shouldShow();

    if (wasVisible !== nowVisible) {
      notify(nowVisible);
    }
  }

  function handleKeydown(): void {
    const wasVisible = shouldShow();
    setKeyboardFlag();
    touchHidden = false; // Reset touch hidden state
    const nowVisible = shouldShow();

    if (wasVisible !== nowVisible) {
      notify(nowVisible);
    }
  }

  function subscribe(callback: (visible: boolean) => void): () => void {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  }

  function destroy(): void {
    subscribers.clear();
  }

  return {
    shouldShow,
    handleTouch,
    handleKeydown,
    subscribe,
    destroy,
  };
}
