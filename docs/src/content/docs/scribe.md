---
title: Scribe
description: Extract and test code from markdown documentation.
---

# Scribe

**@sailkit/scribe** extracts and tests code from markdown documentation. Ensure your documentation examples actually work.

## Installation

```bash nocheck
npm install @sailkit/scribe
```

## CLI Usage

```bash nocheck
# Test a single file
npx scribe README.md

# Test all markdown files in a directory
npx scribe docs/

# Run tests sequentially (no parallelism)
npx scribe docs/ --runInBand

# Set number of parallel workers
npx scribe docs/ --parallel 4
```

## How It Works

1. Scribe parses markdown files for code fences
2. JavaScript and TypeScript blocks are extracted
3. Each block is bundled with esbuild and executed in a VM sandbox
4. Results are reported with pass/fail status

## Opting Out

Mark blocks that shouldn't be tested with `nocheck`:

````markdown nocheck
```typescript nocheck
// This example is intentionally incomplete
const partial =
```
````

## Programmatic API

```typescript nocheck
import { parseMarkdown, filterTestableBlocks, runBlocks } from '@sailkit/scribe';

const content = `
# Example

\`\`\`typescript
const x = 1;
assert(x === 1);
\`\`\`
`;

const blocks = parseMarkdown(content, 'example.md');
const testable = filterTestableBlocks(blocks);
const results = await runBlocks(testable);

results.forEach(result => {
  console.log(result.passed ? 'PASS' : 'FAIL', result.block.file);
});
```

## API Reference

### parseMarkdown(content, filename)

Extracts all code blocks from markdown content.

```typescript nocheck
import { parseMarkdown } from '@sailkit/scribe';

const blocks = parseMarkdown(markdownContent, 'file.md');
// Returns: CodeBlock[]
```

### filterTestableBlocks(blocks)

Filters to only JS/TS blocks without `nocheck`.

```typescript nocheck
import { filterTestableBlocks } from '@sailkit/scribe';

const testable = filterTestableBlocks(blocks);
// Returns blocks that should be tested
```

### runBlocks(blocks)

Executes code blocks and returns results.

```typescript nocheck
import { runBlocks } from '@sailkit/scribe';

const results = await runBlocks(blocks);
// Returns: RunResult[]
```

### runBlock(block)

Execute a single code block.

```typescript nocheck
import { runBlock } from '@sailkit/scribe';

const result = await runBlock(block);
// Returns: RunResult
```

## Features

- **TypeScript support**: Blocks are transpiled with esbuild
- **Import support**: Code can use npm packages (bundled automatically)
- **Global assert**: Node's `assert` module is available without imports
- **Parallel execution**: Tests run concurrently by default
- **No disk writes**: Everything runs in memory (safe for read-only filesystems)
- **TTY-aware output**: Interactive spinner for terminals, clean output for CI

## Supported Languages

Scribe tests blocks marked as:
- `typescript` / `ts`
- `javascript` / `js`

Other language blocks are ignored.

## Use Cases

- **CI pipelines**: Fail builds when examples break
- **Pre-commit hooks**: Catch issues before merge
- **Documentation audits**: Find stale examples across a codebase
- **Tutorial validation**: Ensure learning materials work

## Related

- [[architecture]] - How Scribe fits into the larger system
