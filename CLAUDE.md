# CLAUDE.md - Project Guide for @bacons/mdx

## Overview

This is a universal MDX implementation for Expo (React & React Native). It transforms MDX files at build time via Metro and renders them using universal React Native components.

## Repository Structure

```
├── apps/
│   └── demo/              # Demo Expo app for testing MDX features
├── packages/
│   └── mdx/               # Main @bacons/mdx package
│       ├── src/
│       │   ├── react/     # Runtime React components (universal + DOM)
│       │   └── server/    # Build-time plugins (Metro transformer)
│       └── build/         # Compiled output (do not edit directly)
```

## Quick Commands

```bash
# From repo root
bun install                # Install dependencies
bun run build              # Build the @bacons/mdx package

# From packages/mdx
bun run build              # Build the package (uses taskr)
bun run test               # Run tests in watch mode
bun run typecheck          # TypeScript type checking

# From apps/demo
bun start                  # Start Expo dev server
bun run ios                # Run on iOS
bun run android            # Run on Android
```

## Build System

The package uses **taskr** for builds (not standard npm scripts):

- `taskfile.js` - Main build configuration (ESM)
- `taskfile-swc.js` - SWC transpilation for server code
- Source in `src/` compiles to `build/`
- Server code (plugins) uses SWC, React code uses TypeScript compiler

**Important:** After editing source files in `src/`, run `bun run build` from `packages/mdx`. The demo app uses the built files, not source directly.

## Architecture

### MDX Compilation Pipeline

1. **Metro Transformer** (`src/server/metro-transformer.ts`)
   - Entry point for MDX compilation
   - Creates singleton MDX compiler with plugins
   - Chains: remark plugins → rehype plugins → recma plugins

2. **Rehype Plugins** (operate on HTML AST):
   - `rehype-expo-local-images.ts` - Converts local image paths to `require()` strings
   - `rehype-strip-table-whitespace.ts` - Removes whitespace from table elements (prevents React hydration errors)
   - `rehype-prefix-tag-names.ts` - Prefixes HTML tags with `html.` for component resolution

3. **Recma Plugin** (operates on JS AST):
   - `recma-expo-runtime.ts` - Transforms compiled JSX:
     - Injects `useMDXComponents` import
     - Converts `require("...")` string literals to actual `require()` calls
     - Passes `components` prop to all JSX elements

### React Components (`src/react/`)

- `getDOMComponents.tsx` - Web-only DOM element wrappers
- `getUniversalComponents.tsx` - Cross-platform React Native components
- `MDXComponents.tsx` / `useMDXComponents.tsx` - Component context provider
- `MDXStyles.tsx` - Style cascading context
- `headings.tsx` - H1-H6 heading components

## Common Tasks

### Adding a New Rehype Plugin

1. Create `src/server/plugins/rehype-your-plugin.ts`:
```typescript
import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

export function rehypeYourPlugin(options = {}) {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      // Transform node
    });
  };
}
```

2. Import and add to `metro-transformer.ts` rehypePlugins array
3. Run `bun run build`

### Adding a New Remark Plugin

Remark plugins are passed via the transformer options, not hardcoded. See `apps/demo/metro.transformer.js` for example usage with `remark-gfm` and `remark-math`.

### Modifying AST Transformations

The recma plugin (`recma-expo-runtime.ts`) uses `estree-util-visit` to traverse the JavaScript AST. The visitor receives `(node, key, index, ancestors)`.

## Testing

Tests are in `src/server/__tests__/`. Note: Many tests are skipped due to Jest ESM compatibility issues. The transformer works correctly in production - test via the demo app:

```bash
cd apps/demo
bun start --clear  # Clear Metro cache after changes
```

## Key Patterns

### Singleton Compiler
The MDX compiler is cached as a singleton for performance. After changing plugins, restart Metro or call `resetCompiler()` in tests.

### HTML Tag Prefixing
All HTML tags are prefixed with `html.` (e.g., `html.h1`, `html.p`) so MDX can resolve them from the components object without conflicts.

### Local Image Handling
Local images (`./image.png`, `@/assets/image.png`) are:
1. Converted to `require("path")` strings by rehype plugin
2. Converted from string literals to actual `require()` calls by recma plugin
3. Resolved at runtime via `resolveAssetUrl.ts`

## Debugging

Enable debug output:
```bash
DEBUG=bacons:mdx:transform bun start
```

To inspect compiled MDX output, check Metro bundler output or add `console.log(contents)` in `metro-transformer.ts` after compilation.

## Dependencies

Key dependencies in the MDX pipeline:
- `@mdx-js/mdx` - Core MDX compiler
- `unist-util-visit` - AST traversal for rehype plugins
- `estree-util-visit` - AST traversal for recma plugins

## Publishing

The package auto-publishes to npm when changes are merged to main. The workflow (`.github/workflows/publish.yml`):

1. Triggers on push to `main` when `packages/mdx/**` changes
2. Auto-bumps the patch version (e.g., 0.5.1 → 0.5.2)
3. Builds the package
4. Commits the version bump with `[skip ci]`
5. Publishes to npm with provenance

**To release:** Just merge to main. Version bumping and publishing is automatic.

**Required setup:** Add `NPM_TOKEN` secret to GitHub repository settings (Settings → Secrets → Actions).

## Known Issues

- Jest tests are mostly skipped due to ESM compatibility
- ol/li/ul components need improvement
- Native image aspect ratios can be inconsistent
