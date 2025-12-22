import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createKeyboardDetector, type KeyboardDetector } from './detection.js';

describe('KeyboardDetector', () => {
  let detector: KeyboardDetector;
  let mockMatchMedia: ReturnType<typeof vi.fn>;
  let mockLocalStorage: Record<string, string>;

  beforeEach(() => {
    // Reset mocks
    mockLocalStorage = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockLocalStorage[key] ?? null,
      setItem: (key: string, value: string) => { mockLocalStorage[key] = value; },
      removeItem: (key: string) => { delete mockLocalStorage[key]; },
    });

    // Default: desktop breakpoint
    mockMatchMedia = vi.fn().mockReturnValue({ matches: true });
    vi.stubGlobal('matchMedia', mockMatchMedia);
  });

  describe('breakpoint defaults', () => {
    it('shows hints on desktop breakpoint', () => {
      mockMatchMedia.mockReturnValue({ matches: true }); // desktop
      detector = createKeyboardDetector();
      expect(detector.shouldShow()).toBe(true);
    });

    it('hides hints on mobile breakpoint', () => {
      mockMatchMedia.mockReturnValue({ matches: false }); // mobile
      detector = createKeyboardDetector();
      expect(detector.shouldShow()).toBe(false);
    });
  });

  describe('touch interaction', () => {
    it('hides hints after touchstart on desktop', () => {
      mockMatchMedia.mockReturnValue({ matches: true }); // desktop
      detector = createKeyboardDetector();
      expect(detector.shouldShow()).toBe(true);

      // Simulate touch event
      detector.handleTouch();
      expect(detector.shouldShow()).toBe(false);
    });

    it('does not hide if localStorage flag set', () => {
      mockLocalStorage['kbd:hasKeyboard'] = 'true';
      mockMatchMedia.mockReturnValue({ matches: true }); // desktop
      detector = createKeyboardDetector();

      // Touch should not hide when localStorage flag is set
      detector.handleTouch();
      expect(detector.shouldShow()).toBe(true);
    });
  });

  describe('keyboard interaction', () => {
    it('shows hints after keydown on mobile', () => {
      mockMatchMedia.mockReturnValue({ matches: false }); // mobile
      detector = createKeyboardDetector();
      expect(detector.shouldShow()).toBe(false);

      // Simulate keydown
      detector.handleKeydown();
      expect(detector.shouldShow()).toBe(true);
    });

    it('sets localStorage flag on keydown', () => {
      mockMatchMedia.mockReturnValue({ matches: false }); // mobile
      detector = createKeyboardDetector();

      detector.handleKeydown();
      expect(mockLocalStorage['kbd:hasKeyboard']).toBe('true');
    });

    it('respects localStorage flag on subsequent visits', () => {
      mockLocalStorage['kbd:hasKeyboard'] = 'true';
      mockMatchMedia.mockReturnValue({ matches: false }); // mobile

      detector = createKeyboardDetector();
      // Should show despite mobile breakpoint
      expect(detector.shouldShow()).toBe(true);
    });
  });

  describe('consumer overrides', () => {
    it('always shows when enabled="always"', () => {
      mockMatchMedia.mockReturnValue({ matches: false }); // mobile
      detector = createKeyboardDetector({ enabled: 'always' });

      expect(detector.shouldShow()).toBe(true);

      // Even after touch
      detector.handleTouch();
      expect(detector.shouldShow()).toBe(true);
    });

    it('always hides when enabled="never"', () => {
      mockMatchMedia.mockReturnValue({ matches: true }); // desktop
      mockLocalStorage['kbd:hasKeyboard'] = 'true';
      detector = createKeyboardDetector({ enabled: 'never' });

      expect(detector.shouldShow()).toBe(false);

      // Even after keydown
      detector.handleKeydown();
      expect(detector.shouldShow()).toBe(false);
    });

    it('uses detection when enabled="auto"', () => {
      mockMatchMedia.mockReturnValue({ matches: true }); // desktop
      detector = createKeyboardDetector({ enabled: 'auto' });

      expect(detector.shouldShow()).toBe(true);

      detector.handleTouch();
      expect(detector.shouldShow()).toBe(false);
    });

    it('treats true as "always"', () => {
      mockMatchMedia.mockReturnValue({ matches: false }); // mobile
      detector = createKeyboardDetector({ enabled: true });
      expect(detector.shouldShow()).toBe(true);
    });

    it('treats false as "never"', () => {
      mockMatchMedia.mockReturnValue({ matches: true }); // desktop
      detector = createKeyboardDetector({ enabled: false });
      expect(detector.shouldShow()).toBe(false);
    });
  });

  describe('precedence', () => {
    it('localStorage trumps touch events', () => {
      mockLocalStorage['kbd:hasKeyboard'] = 'true';
      mockMatchMedia.mockReturnValue({ matches: true }); // desktop
      detector = createKeyboardDetector();

      // localStorage flag should prevent touch from hiding
      detector.handleTouch();
      expect(detector.shouldShow()).toBe(true);
    });

    it('keydown sets permanent flag', () => {
      mockMatchMedia.mockReturnValue({ matches: false }); // mobile
      detector = createKeyboardDetector();

      detector.handleKeydown();
      expect(mockLocalStorage['kbd:hasKeyboard']).toBe('true');

      // Create new detector to simulate page reload
      detector = createKeyboardDetector();
      expect(detector.shouldShow()).toBe(true);
    });

    it('touch hides unless permanent flag set', () => {
      mockMatchMedia.mockReturnValue({ matches: true }); // desktop
      detector = createKeyboardDetector();

      // No localStorage flag, touch should hide
      detector.handleTouch();
      expect(detector.shouldShow()).toBe(false);

      // Keydown sets flag
      detector.handleKeydown();
      expect(detector.shouldShow()).toBe(true);

      // Touch no longer hides
      detector.handleTouch();
      expect(detector.shouldShow()).toBe(true);
    });
  });

  describe('subscription', () => {
    it('notifies subscribers when visibility changes', () => {
      mockMatchMedia.mockReturnValue({ matches: true }); // desktop
      detector = createKeyboardDetector();

      const callback = vi.fn();
      detector.subscribe(callback);

      detector.handleTouch();
      expect(callback).toHaveBeenCalledWith(false);

      detector.handleKeydown();
      expect(callback).toHaveBeenCalledWith(true);
    });

    it('allows unsubscribing', () => {
      mockMatchMedia.mockReturnValue({ matches: true }); // desktop
      detector = createKeyboardDetector();

      const callback = vi.fn();
      const unsubscribe = detector.subscribe(callback);

      detector.handleTouch();
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();
      detector.handleKeydown();
      expect(callback).toHaveBeenCalledTimes(1); // no additional call
    });
  });

  describe('cleanup', () => {
    it('provides destroy method to remove event listeners', () => {
      detector = createKeyboardDetector();
      expect(typeof detector.destroy).toBe('function');
      // Should not throw
      detector.destroy();
    });
  });
});
