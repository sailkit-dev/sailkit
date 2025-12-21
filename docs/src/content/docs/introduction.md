---
title: Introduction
description: Welcome to Sailkit - a collection of lightweight, composable libraries for building modern documentation sites.
---

# Introduction

Welcome to **Sailkit** - a collection of lightweight, composable libraries for building modern documentation sites with delightful user experiences.

## What is Sailkit?

Sailkit is a suite of five focused packages that work together seamlessly:

| Package | Purpose |
|---------|---------|
| [[compass]] | Navigation state machine for nested content structures |
| [[teleport]] | Vim-style keyboard navigation bindings |
| [[lantern]] | Theme toggle with flash-free dark mode |
| [[lighthouse]] | Smart 404 handling with fuzzy matching |
| [[atlas]] | Wikipedia-style magic links in markdown |

## Philosophy

Each package follows these principles:

- **Single responsibility** - One package, one job, done well
- **Framework agnostic** - Core logic works anywhere; Astro components optional
- **Zero runtime overhead** - Static where possible, minimal JavaScript
- **Composable** - Use one package or all five together
- **Type-safe** - Full TypeScript support throughout

## Why Sailkit?

Modern documentation sites should feel fast and navigable. Sailkit provides the building blocks:

1. **Vim users feel at home** with [[teleport|keyboard navigation]]
2. **Dark mode just works** without flash via [[lantern]]
3. **Broken links get fixed** automatically with [[lighthouse|smart 404 pages]]
4. **Internal linking is easy** using [[atlas|wiki-style links]]
5. **Navigation state is handled** by [[compass]]

## Quick Example

This documentation site is built with Sailkit. Try these features:

- Press `j` and `k` to navigate the sidebar
- Press `h` and `l` for previous/next pages
- Press `Ctrl+d` and `Ctrl+u` to scroll
- Toggle dark mode with the button in the header
- Notice the prev/next links at the bottom of each page

Ready to get started? Head to [[installation]].
