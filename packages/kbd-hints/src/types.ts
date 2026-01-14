/**
 * A single keyboard shortcut for display
 */
export interface KbdShortcut {
  /** Display keys, e.g. ['j', 'k'] or ['Ctrl+d'] */
  keys: string[];
  /** Human label, e.g. 'navigate' or 'scroll down' */
  label: string;
}

/**
 * A group of related shortcuts
 */
export interface KbdGroup {
  /** Group name, e.g. 'Navigation' or 'Scrolling' */
  name: string;
  shortcuts: KbdShortcut[];
}

/**
 * Teleport's KeyBindings shape (re-declared to avoid hard dep)
 */
export interface TeleportBindings {
  down?: string[];
  up?: string[];
  left?: string[];
  right?: string[];
  scrollDown?: string[];
  scrollUp?: string[];
  select?: string[];
  toggleSidebar?: string[];
  openFinder?: string[];
  goToTop?: string[];
  goToBottom?: string[];
}
