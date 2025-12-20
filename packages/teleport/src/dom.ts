/**
 * DOM utilities for Teleport
 *
 * Helper functions for scrolling. No navigation state here.
 */

/**
 * Scroll an element or window by a given amount.
 */
export function scrollElement(
  element: HTMLElement | Window,
  amount: number,
  direction: 'up' | 'down'
): void {
  const delta = direction === 'down' ? amount : -amount;

  if (element instanceof Window) {
    element.scrollBy({ top: delta, behavior: 'smooth' });
  } else {
    element.scrollBy({ top: delta, behavior: 'smooth' });
  }
}

/**
 * Get the viewport height for scroll calculations.
 */
export function getViewportHeight(): number {
  return window.innerHeight;
}
