# Manual Verification Guide

## Overview

The sailkit project is a monorepo containing:
- **6 library packages** (compass, teleport, lantern, atlas, lighthouse, scribe)
- **1 documentation site** (`docs/`) that dogfoods the libraries

Before merging, verify:
1. Libraries build correctly
2. Documentation site builds
3. Code samples in docs are valid
4. Interactive features work

---

## Part 1: Library Packages

**What you're checking:** Each library compiles and TypeScript types are correct.

```bash
# Build all packages
npm run build --workspaces
```

**Success:** No errors, each package creates `dist/index.js` and `dist/index.d.ts`.

---

## Part 2: Documentation Site

### 2a. Static Build

**What you're checking:** Astro resolves all imports and generates static pages.

```bash
cd docs
npm run build
```

**Success:** `20 page(s) built`, no errors.

### 2b. Code Sample Validation

**What you're checking:** Code blocks in documentation actually execute.

```bash
node packages/scribe/dist/cli.js docs/src/content/docs/
```

**Success:** `Results: 10/10 passed`

### 2c. Interactive Testing

**What you're checking:** Runtime JavaScript features work.

```bash
cd docs
npm run dev
# Visit http://localhost:4321
```

| Test | How to verify |
|------|---------------|
| Theme toggle | Click sun/moon icon, theme switches, persists on reload |
| j/k navigation | Press `j`/`k` to move through sidebar, highlight moves |
| Enter to navigate | Highlight item with j/k, press Enter, navigates |
| Magic links | Visit `/docs/atlas/`, `[[installation]]` links work |
| Home page nav | On `/`, press j/k to cycle through cards |
| 404 suggestions | Visit `/docs/compas/` (typo), suggests `/docs/compass/` |

---

## Part 3: Package Naming

**What you're checking:** All references use `@sailkit-dev/*`.

```bash
grep -r "@sailkit/" --include="*.json" --include="*.ts" --include="*.js" --include="*.mjs" --include="*.astro" --include="*.md" . | grep -v node_modules | grep -v ".git"
```

**Success:** No output.

---

## Part 4: Git State

```bash
git status                              # Clean working tree
git log --oneline origin/docs-website..HEAD  # Nothing (fully pushed)
```

---

## Summary Checklist

| Step | Command | Expected |
|------|---------|----------|
| Build packages | `npm run build --workspaces` | No errors |
| Build docs | `cd docs && npm run build` | 20 pages built |
| Validate samples | `node packages/scribe/dist/cli.js docs/src/content/docs/` | 10/10 passed |
| Check naming | `grep -r "@sailkit/" ...` | No matches |
| Git clean | `git status` | Clean |
| Browser test | `cd docs && npm run dev` | Features work |
