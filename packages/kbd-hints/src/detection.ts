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
  _config: KeyboardDetectorConfig = {}
): KeyboardDetector {
  // TODO: Implement detection logic
  // This stub will fail all tests

  return {
    shouldShow: () => false,
    handleTouch: () => {},
    handleKeydown: () => {},
    subscribe: () => () => {},
    destroy: () => {},
  };
}
