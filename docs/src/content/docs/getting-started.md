---
title: Getting Started
description: Everything you need to start using Sailkit.
---

# Getting Started

This section covers the basics of setting up Sailkit in your project.

## In This Section

- [[installation]] - Install packages via npm
- [[quick-start]] - Build your first Sailkit-powered site

## Prerequisites

Sailkit works with any modern JavaScript environment:

- Node.js 18+ recommended
- TypeScript 5+ for type definitions
- Astro 4+ for Astro components (optional)

## Choosing Packages

You don't need all five packages. Choose based on your needs:

| Need | Package |
|------|---------|
| Nested sidebar navigation | [[compass]] |
| Keyboard shortcuts | [[teleport]] |
| Dark mode toggle | [[lantern]] |
| Smart 404 redirects | [[lighthouse]] |
| Wiki-style internal links | [[atlas]] |

Most documentation sites benefit from all five, but each package works independently.

## Architecture Overview

Sailkit packages are designed to compose together:

```
┌─────────────────────────────────────────────────────┐
│  Your Documentation Site                            │
├─────────────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  ┌───────────┐       │
│  │  Compass  │  │ Teleport  │  │  Lantern  │       │
│  │ Nav State │  │ Keyboard  │  │  Theming  │       │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘       │
│        │              │              │              │
│        └──────────────┼──────────────┘              │
│                       │                             │
│  ┌───────────────────┴────────────────────┐        │
│  │            DOM / Browser                │        │
│  └────────────────────────────────────────┘        │
│                                                     │
│  ┌───────────┐  ┌───────────────────────────┐      │
│  │   Atlas   │  │       Lighthouse          │      │
│  │ Markdown  │  │      404 Handling         │      │
│  │  (Build)  │  │      (Runtime)            │      │
│  └───────────┘  └───────────────────────────┘      │
└─────────────────────────────────────────────────────┘
```

Ready? Start with [[installation]].
