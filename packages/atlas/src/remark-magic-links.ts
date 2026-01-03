import type { Root, Text, Link, Parent } from 'mdast';
import { visit } from 'unist-util-visit';

export type LinkSyntax = 'colon' | 'wiki' | 'both';

/** Shape of an Astro collection entry (minimal required fields) */
export interface CollectionEntry {
  slug: string;
  data: { id?: string; [key: string]: unknown };
}

/** A named collection with its entries */
export interface Collection {
  name: string;
  entries: CollectionEntry[];
}

export type BrokenLinkBehavior = 'throw' | 'warn' | 'ignore';

export interface RemarkMagicLinksConfig {
  /**
   * Astro collections to build URL map from.
   * When provided, builds ID → URL mapping automatically.
   */
  collections?: Collection[];

  /**
   * Custom URL pattern per entry. Receives collection name and entry.
   * Default: `/${collection}/${entry.slug}/`
   */
  urlPattern?: (collection: string, entry: CollectionEntry) => string;

  /**
   * Custom URL builder (escape hatch). Takes precedence over collections.
   * Use when you need full control over URL resolution.
   * Return null for broken links.
   */
  urlBuilder?: (id: string) => string | null;

  /** Syntax style to parse (default: 'wiki') */
  syntax?: LinkSyntax;

  /**
   * What to do when a broken link is found.
   * - 'throw': Fail the build (default)
   * - 'warn': Log warning, render as #broken-link
   * - 'ignore': Silently render as #broken-link
   */
  onBrokenLink?: BrokenLinkBehavior;
}

/** Minimal plugin type compatible with unified */
type RemarkPlugin = (config: RemarkMagicLinksConfig) => (tree: Root) => void;

/**
 * Build a urlBuilder from collections.
 * Maps entry.data.id → URL using urlPattern (or default pattern).
 * Returns null for unknown IDs (broken links).
 */
function createUrlBuilderFromCollections(
  collections: Collection[],
  urlPattern?: (collection: string, entry: CollectionEntry) => string
): (id: string) => string | null {
  const idMap = new Map<string, { collection: string; entry: CollectionEntry }>();

  for (const { name, entries } of collections) {
    for (const entry of entries) {
      const id = entry.data.id;
      if (id) {
        idMap.set(id, { collection: name, entry });
      }
    }
  }

  // Default: global ID (just slug, no collection prefix) like Wikipedia
  const defaultPattern = (_collection: string, entry: CollectionEntry) =>
    `/${entry.slug}/`;

  const pattern = urlPattern || defaultPattern;

  return (id: string) => {
    const match = idMap.get(id);
    if (!match) return null;
    return pattern(match.collection, match.entry);
  };
}

// Regex patterns for magic link syntax
// Colon syntax: [:id] or [:id|Display Text]
const COLON_LINK_PATTERN = /\[:([^\]|]+)(?:\|([^\]]+))?\]/g;
// Wiki syntax: [[id]] or [[id|Display Text]]
const WIKI_LINK_PATTERN = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

interface ParsedLink {
  fullMatch: string;
  id: string;
  displayText?: string;
  startIndex: number;
}

function parseMagicLinks(text: string, syntax: LinkSyntax): ParsedLink[] {
  const links: ParsedLink[] = [];

  if (syntax === 'colon' || syntax === 'both') {
    let match: RegExpExecArray | null;
    COLON_LINK_PATTERN.lastIndex = 0;
    while ((match = COLON_LINK_PATTERN.exec(text)) !== null) {
      links.push({
        fullMatch: match[0],
        id: match[1].trim(),
        displayText: match[2]?.trim(),
        startIndex: match.index,
      });
    }
  }

  if (syntax === 'wiki' || syntax === 'both') {
    let match: RegExpExecArray | null;
    WIKI_LINK_PATTERN.lastIndex = 0;
    while ((match = WIKI_LINK_PATTERN.exec(text)) !== null) {
      links.push({
        fullMatch: match[0],
        id: match[1].trim(),
        displayText: match[2]?.trim(),
        startIndex: match.index,
      });
    }
  }

  return links.sort((a, b) => a.startIndex - b.startIndex);
}

/** Broken link found during processing */
export interface BrokenLink {
  id: string;
  syntax: string;
}

/**
 * Remark plugin that transforms magic link syntax into actual links.
 * Detects broken links at build time.
 *
 * Supports two syntax styles:
 * - Colon: `[:id]` or `[:id|Display Text]`
 * - Wiki: `[[id]]` or `[[id|Display Text]]`
 */
export const remarkMagicLinks: RemarkPlugin = (config) => {
  const {
    collections,
    urlPattern,
    urlBuilder: customUrlBuilder,
    syntax = 'wiki',
    onBrokenLink = 'throw',
  } = config;

  // urlBuilder takes precedence, then collections, then error
  let urlBuilder: (id: string) => string | null;
  if (customUrlBuilder) {
    urlBuilder = customUrlBuilder;
  } else if (collections) {
    urlBuilder = createUrlBuilderFromCollections(collections, urlPattern);
  } else {
    throw new Error('remarkMagicLinks requires either `collections` or `urlBuilder`');
  }

  return (tree: Root) => {
    const brokenLinks: BrokenLink[] = [];

    visit(tree, 'text', (node: Text, index: number | undefined, parent: Parent | undefined) => {
      if (!parent || index === undefined) return;

      const magicLinks = parseMagicLinks(node.value, syntax);
      if (magicLinks.length === 0) return;

      const newNodes: (Text | Link)[] = [];
      let lastIndex = 0;

      for (const link of magicLinks) {
        // Text before this link
        if (link.startIndex > lastIndex) {
          newNodes.push({
            type: 'text',
            value: node.value.slice(lastIndex, link.startIndex),
          });
        }

        // Create link node
        const displayText = link.displayText || link.id;
        const url = urlBuilder(link.id);

        if (url === null) {
          brokenLinks.push({ id: link.id, syntax: link.fullMatch });
        }

        newNodes.push({
          type: 'link',
          url: url ?? `#broken-link-${link.id}`,
          children: [{ type: 'text', value: displayText }],
        });

        lastIndex = link.startIndex + link.fullMatch.length;
      }

      // Remaining text after last link
      if (lastIndex < node.value.length) {
        newNodes.push({
          type: 'text',
          value: node.value.slice(lastIndex),
        });
      }

      (parent.children as (Text | Link)[]).splice(index, 1, ...newNodes);
    });

    // Handle broken links based on config
    if (brokenLinks.length > 0) {
      const linkList = brokenLinks.map(l => `  ${l.syntax}`).join('\n');
      const message = `Broken magic links found:\n${linkList}`;

      if (onBrokenLink === 'throw') {
        throw new Error(message);
      } else if (onBrokenLink === 'warn') {
        console.warn(`[atlas] ${message}`);
      }
      // 'ignore' does nothing
    }
  };
};

export default remarkMagicLinks;

/**
 * Create a urlBuilder from collections using slug as global ID.
 * Throws if duplicate slugs found. Returns null for unknown slugs (broken links).
 */
export function createSlugResolver(
  collections: Collection[],
  urlPattern?: (collection: string, slug: string) => string
): (id: string) => string | null {
  const slugMap = new Map<string, string>();
  const pattern = urlPattern || ((collection, slug) => `/${collection}/${slug}/`);

  for (const { name, entries } of collections) {
    for (const entry of entries) {
      if (slugMap.has(entry.slug)) {
        throw new Error(
          `Duplicate slug "${entry.slug}" in collection "${name}". ` +
          `Already exists at ${slugMap.get(entry.slug)}`
        );
      }
      slugMap.set(entry.slug, pattern(name, entry.slug));
    }
  }

  return (id: string) => slugMap.get(id) ?? null;
}
