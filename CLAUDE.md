# CLAUDE.md

Docusaurus site for "Side Oripathy", an Arknights × Emoklore TRPG add-on ruleset (Japanese).

## Commands

Package manager: bun

```bash
bun run start        # dev server
bun run build        # production build
bun run --bun lint       # oxlint
bun run --bun format     # oxfmt
bun run --bun typecheck  # tsc --noEmit
bun run --bun ncu        # dependency updates
```

## Testing

```bash
bun run test             # logic + content prose (no network, CI-safe)
```

### Logic tests

Unit tests live alongside lib modules in `src/lib/*.test.ts`.

```bash
bun run test/logic/unit  # unit tests with coverage
bun run test/logic       # all logic tests (currently delegates to unit)
```

Coverage scope: `src/lib/**` only (pages/components/theme are excluded).

### Content Quality Gates

```bash
bun run test/content/prose   # textlint: prose lint over docs/
bun run test/content/links   # lychee: external link rot check over docs/
bun run test/content         # prose only (links excluded — network, slow)
```

`test/content/links` makes real HTTP requests; run manually when adding or changing external URLs.

Note: `bun run test` dispatches to the `test` script in package.json (logic + content prose). `bun test` invokes bun's native test runner directly.

## Layout

- `docs/` — rule docs (sidebar auto-generated via `sidebars.ts`)
- `src/pages/converter.tsx` — character sheet converter (CCFOLIA / chat palette)
- `src/components/` — MDX components (`Expression`, `Memo`)

Pushing to `main` auto-deploys to GitHub Pages.

## Changelog Rule

`docs/licence.md` の末尾には更新履歴がある。プロジェクトに変更を加えてコミットする前に、その変更を更新履歴に追記すべきか確認すること。
