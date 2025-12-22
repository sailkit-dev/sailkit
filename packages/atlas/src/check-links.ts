import { readdirSync, readFileSync, statSync } from 'fs';
import { join, basename } from 'path';

export interface BrokenLinkResult {
  file: string;
  line: number;
  link: string;
  id: string;
}

export interface CheckLinksResult {
  broken: BrokenLinkResult[];
  total: number;
}

// Match [[id]] or [[id|text]] or [:id] or [:id|text]
const MAGIC_LINK_PATTERN = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]|\[:([^\]|]+)(?:\|[^\]]+)?\]/g;

/**
 * Build slug map from content directory.
 */
function buildSlugMap(contentDir: string): Set<string> {
  const slugs = new Set<string>();

  const collections = readdirSync(contentDir).filter(name => {
    const path = join(contentDir, name);
    return statSync(path).isDirectory();
  });

  for (const collection of collections) {
    const collectionPath = join(contentDir, collection);
    const files = readdirSync(collectionPath).filter(f =>
      f.endsWith('.md') || f.endsWith('.mdx')
    );

    for (const file of files) {
      const slug = basename(file).replace(/\.mdx?$/, '');
      slugs.add(slug);
    }
  }

  return slugs;
}

/**
 * Check a single file for broken magic links.
 */
function checkFile(
  filePath: string,
  content: string,
  validSlugs: Set<string>
): BrokenLinkResult[] {
  const broken: BrokenLinkResult[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match: RegExpExecArray | null;
    MAGIC_LINK_PATTERN.lastIndex = 0;

    while ((match = MAGIC_LINK_PATTERN.exec(line)) !== null) {
      const id = (match[1] || match[2]).trim();
      if (!validSlugs.has(id)) {
        broken.push({
          file: filePath,
          line: i + 1,
          link: match[0],
          id,
        });
      }
    }
  }

  return broken;
}

/**
 * Check all content files for broken magic links.
 * Returns structured results for fast feedback during authoring.
 */
export function checkLinks(contentDir: string): CheckLinksResult {
  const validSlugs = buildSlugMap(contentDir);
  const broken: BrokenLinkResult[] = [];
  let total = 0;

  const collections = readdirSync(contentDir).filter(name => {
    const path = join(contentDir, name);
    return statSync(path).isDirectory();
  });

  for (const collection of collections) {
    const collectionPath = join(contentDir, collection);
    const files = readdirSync(collectionPath).filter(f =>
      f.endsWith('.md') || f.endsWith('.mdx')
    );

    for (const file of files) {
      const filePath = join(collection, file);
      const fullPath = join(collectionPath, file);
      const content = readFileSync(fullPath, 'utf-8');

      // Count total links in this file
      MAGIC_LINK_PATTERN.lastIndex = 0;
      const matches = content.match(MAGIC_LINK_PATTERN);
      if (matches) total += matches.length;

      broken.push(...checkFile(filePath, content, validSlugs));
    }
  }

  return { broken, total };
}

/**
 * Format check results for console output.
 */
export function formatCheckResults(result: CheckLinksResult): string {
  if (result.broken.length === 0) {
    return `✓ All ${result.total} magic links valid`;
  }

  const lines = [`✗ ${result.broken.length} broken link(s) found:\n`];
  for (const b of result.broken) {
    lines.push(`  ${b.file}:${b.line} - ${b.link}`);
  }
  return lines.join('\n');
}
