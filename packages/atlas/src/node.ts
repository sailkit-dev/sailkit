import { readdirSync, statSync } from 'fs';
import { join, basename } from 'path';

/**
 * Scan content directory and create urlBuilder using slug as global ID.
 * Throws if duplicate slugs found. Returns null for unknown slugs (broken links).
 */
export function createSlugResolver(
  contentDir: string,
  urlPattern?: (collection: string, slug: string) => string
): (id: string) => string | null {
  const slugMap = new Map<string, string>();
  const pattern = urlPattern || ((collection, slug) => `/${collection}/${slug}/`);

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
      if (slugMap.has(slug)) {
        throw new Error(
          `Duplicate slug "${slug}" in collection "${collection}". ` +
          `Already exists at ${slugMap.get(slug)}`
        );
      }
      slugMap.set(slug, pattern(collection, slug));
    }
  }

  return (id: string) => slugMap.get(id) ?? null;
}
