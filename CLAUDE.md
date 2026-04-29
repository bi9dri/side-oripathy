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

### Visual Quality Gates

```bash
bun run test/visual/e2e      # Playwright: VRT (Argos) + a11y (axe) over a built site
bun run test/visual/perf     # Lighthouse CI: perf / a11y / best-practices / seo budgets
bun run test/visual          # build + e2e + perf (full visual gate)
```

VRT runs across 4 variants per page (PC/mobile × light/dark) using `@argos-ci/playwright`. Without `ARGOS_TOKEN` the screenshots are generated locally under `screenshots/` (gitignored) but no upload/comparison is performed — useful for verifying that rendering itself does not break. With a token, screenshots get uploaded to Argos for visual diffing. In CI, `ARGOS_TOKEN` is required and the spec fails fast when absent. The a11y gate runs the full WCAG 2.0 + 2.1 levels A & AA ruleset on PC variants via axe-core, and the mobile-specific `target-size` rule (WCAG 2.5.8) on mobile variants. Lighthouse CI runs against the prebuilt static `build/` directory.

Run prerequisites: `bunx playwright install --with-deps chromium` once per machine. On Linux CI containers without root, run `bunx playwright install chromium` and install system libraries (`libnss3`, `libgbm1`, etc.) separately.

`test/visual/e2e` requires an existing `build/` directory (the Playwright `webServer` runs `docusaurus serve`, which serves a prebuilt site and does not build on its own). Run `bun run build` first, or use `bun run test/visual` which chains build → e2e → perf.

`test/visual` is excluded from the main `test` script — it is heavier and requires a build step. Run it manually before merging UI / dependency / CSS changes.

Note: `bun run test` dispatches to the `test` script in package.json (logic + content prose). `bun test` invokes bun's native test runner directly.

## Layout

- `docs/` — rule docs (sidebar auto-generated via `sidebars.ts`)
- `src/pages/converter.tsx` — character sheet converter (CCFOLIA / chat palette)
- `src/components/` — MDX components (`Expression`, `Memo`)

Pushing to `main` auto-deploys to GitHub Pages.

## Changelog Rule

`docs/licence.md` の末尾には更新履歴がある。プロジェクトに変更を加えてコミットする前に、その変更を更新履歴に追記すべきか確認すること。
ドキュメントの内容・表現やツールページの変更についてのみ記載して、非機能的変更については記載しない。
