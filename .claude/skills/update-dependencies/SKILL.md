---
name: update-dependencies
description: Update npm/bun packages and GitHub Actions. Use when asked to update dependencies, update packages, check for outdated packages, or update GitHub Actions workflows. This project uses bun as the package manager.
---

# Update Dependencies

This project uses **bun** (not npm) as the package manager.

## Workflow Overview

1. Check outdated packages: `bun run --bun ncu` and `bun audit`
2. Update GitHub Actions pins: `pinact run -u --min-age 7`
3. Review release notes and changelogs for each package (via WebFetch on GitHub releases)
4. Classify packages by risk level and update safe ones first
5. Run type checks after updating: `bun run --bun typecheck`
6. Create a PR for safe updates; create issues for packages with breaking changes

See [references/workflow.md](references/workflow.md) for the full step-by-step procedure.

## Key Notes

- Type definition packages (`@types/*`) are generally safe to update
- When updating `@types/bun`, also update bun version in: `mise.toml`, `package.json` (`packageManager` field), and `.github/workflows/*.yml` (`bun-version`)
- PR descriptions: include update list with links to releases; omit summary/test result sections
- Packages with breaking changes: skip in PR, create separate issues instead
- GitHub Actions updates: use `pinact run -u --min-age 7` (7日間のmin-ageクールダウン); npmパッケージと同じPRにまとめる
