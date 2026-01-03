import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { checkLinks, formatCheckResults } from './check-links.js';

const TEST_DIR = join(import.meta.dirname, '../test-fixtures/content');

function setupFixtures(files: Record<string, string>) {
  // Clean up first
  rmSync(join(import.meta.dirname, '../test-fixtures'), { recursive: true, force: true });

  for (const [path, content] of Object.entries(files)) {
    const fullPath = join(TEST_DIR, path);
    const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));
    mkdirSync(dir, { recursive: true });
    writeFileSync(fullPath, content);
  }
}

function cleanup() {
  rmSync(join(import.meta.dirname, '../test-fixtures'), { recursive: true, force: true });
}

describe('checkLinks', () => {
  afterEach(cleanup);

  it('returns empty when no broken links', () => {
    setupFixtures({
      'patterns/foo.md': 'See [[bar]] for more.',
      'patterns/bar.md': 'This links to [[foo]].',
    });

    const result = checkLinks(TEST_DIR);
    expect(result.broken).toHaveLength(0);
    expect(result.total).toBe(2);
  });

  it('detects broken wiki-style links', () => {
    setupFixtures({
      'patterns/foo.md': 'See [[nonexistent]] here.',
      'patterns/bar.md': 'Valid content.',
    });

    const result = checkLinks(TEST_DIR);
    expect(result.broken).toHaveLength(1);
    expect(result.broken[0]).toEqual({
      file: 'patterns/foo.md',
      line: 1,
      link: '[[nonexistent]]',
      id: 'nonexistent',
    });
  });

  it('detects broken colon-style links', () => {
    setupFixtures({
      'concepts/intro.md': 'Check [:missing] out.',
    });

    const result = checkLinks(TEST_DIR);
    expect(result.broken).toHaveLength(1);
    expect(result.broken[0].link).toBe('[:missing]');
    expect(result.broken[0].id).toBe('missing');
  });

  it('reports correct line numbers', () => {
    setupFixtures({
      'patterns/multi.md': `# Header

This is line 3.

See [[broken-one]] on line 5.

More text.

And [[broken-two]] on line 9.`,
    });

    const result = checkLinks(TEST_DIR);
    expect(result.broken).toHaveLength(2);
    expect(result.broken[0].line).toBe(5);
    expect(result.broken[1].line).toBe(9);
  });

  it('handles multiple broken links on same line', () => {
    setupFixtures({
      'patterns/dense.md': 'See [[one]] and [[two]] and [[three]].',
    });

    const result = checkLinks(TEST_DIR);
    expect(result.broken).toHaveLength(3);
    expect(result.broken.map(b => b.id)).toEqual(['one', 'two', 'three']);
  });

  it('handles links with display text', () => {
    setupFixtures({
      'patterns/a.md': 'Content.',
      'concepts/b.md': 'See [[a|link text]] and [[missing|also missing]].',
    });

    const result = checkLinks(TEST_DIR);
    expect(result.broken).toHaveLength(1);
    expect(result.broken[0].id).toBe('missing');
  });

  it('works across multiple collections', () => {
    setupFixtures({
      'patterns/one.md': 'Link to [[two]] in concepts.',
      'concepts/two.md': 'Link to [[one]] in patterns.',
    });

    const result = checkLinks(TEST_DIR);
    expect(result.broken).toHaveLength(0);
    expect(result.total).toBe(2);
  });

  it('handles .mdx files', () => {
    setupFixtures({
      'patterns/component.mdx': 'See [[missing]] in MDX.',
      'patterns/other.md': 'Regular markdown.',
    });

    const result = checkLinks(TEST_DIR);
    expect(result.broken).toHaveLength(1);
    expect(result.broken[0].file).toBe('patterns/component.mdx');
  });
});

describe('formatCheckResults', () => {
  it('formats success message', () => {
    const result = formatCheckResults({ broken: [], total: 5 });
    expect(result).toBe('✓ All 5 magic links valid');
  });

  it('formats broken links', () => {
    const result = formatCheckResults({
      broken: [
        { file: 'patterns/foo.md', line: 10, link: '[[bar]]', id: 'bar' },
        { file: 'concepts/baz.md', line: 3, link: '[:qux]', id: 'qux' },
      ],
      total: 10,
    });
    expect(result).toContain('2 broken link(s) found');
    expect(result).toContain('patterns/foo.md:10 - [[bar]]');
    expect(result).toContain('concepts/baz.md:3 - [:qux]');
  });
});
