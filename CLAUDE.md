# CLAUDE.md

Docusaurus site for "Side Oripathy", an Arknights × Emoklore TRPG add-on ruleset (Japanese).

## Commands

Package manager: bun (v1.3.8).

```bash
bun run start        # dev server
bun run build        # production build
bun run --bun lint       # oxlint
bun run --bun format     # oxfmt
bun run --bun typecheck  # tsc --noEmit
bun run --bun ncu        # dependency updates
```

## Testing

Unit tests live alongside lib modules in `src/lib/*.test.ts`. Run via:

```bash
bun run test/logic/unit  # unit tests with coverage
bun run test/logic       # all logic tests (currently delegates to unit)
```

Coverage scope: `src/lib/**` only (pages/components/theme are excluded).

## Layout

- `docs/` — rule docs (sidebar auto-generated via `sidebars.ts`)
- `src/pages/converter.tsx` — character sheet converter (CCFOLIA / chat palette)
- `src/components/` — MDX components (`Expression`, `Memo`)

Pushing to `main` auto-deploys to GitHub Pages.
