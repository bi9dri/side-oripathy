# Update Dependencies - Detailed Workflow

## Step 1: Identify Outdated Packages

```bash
bun run --bun ncu
bun audit
```

## Step 1b: Update GitHub Actions

```bash
pinact run -u --min-age 7
```

- `--min-age 7`: 7日以内にリリースされたバージョンはスキップ（npm-check-updatesと同じクールダウン）
- 更新内容を確認: `git diff .github/workflows/`
- 変更があれば、npmパッケージの更新と同じPRにまとめる

## Step 2: Review Release Notes

For each package, check in order:

1. **GitHub releases page**: `WebFetch: https://github.com/org/repo/releases`
2. **Repo changelog files**: Search for RELEASES, CHANGELOG, RELEASE_NOTES
3. **Git history**: Browse commits if no dedicated changelog exists

Pay special attention to:
- Breaking changes
- API changes
- Deprecated features
- Migration guides

## Step 3: Update Safe Packages

### Classify packages

| Class | Description |
|-------|-------------|
| a | Bug fixes only, type updates, internal improvements — update immediately |
| b | Deprecated API used but still works; better implementation available |
| c | Limited breaking changes; 1-2 file fixes needed |
| d | Many deprecated APIs; migration to new best practices recommended |
| e | Major breaking changes; many files affected; architecture changes needed |

Update class **a** packages in this step. Defer b-e for issues.

### Check usage of breaking APIs

```bash
# Find specific API usage
Grep: "\.(extend|pick|omit)\("

# Find package imports
Grep: "import.*packageName|from ['\"]packageName['\"]"
```

### Install updates

```bash
bun install package-name@version
```

### Verify

```bash
bun run --bun typecheck
```

Revert any package that fails type checks.

## Step 4: Create PR for Safe Updates

### Branch and commit

```bash
git checkout -b update-dependencies-safe-updates
git add package.json bun.lock
git commit -m "chore: Update npm dependencies (safe updates)

Updated the following packages without code changes required:
- package-name: old-version -> new-version

All packages include only bug fixes, type improvements, and minor enhancements.
Type checks pass successfully.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

git push -u origin update-dependencies-safe-updates
```

### PR body format

```markdown
## アップデート内容

- package-name: old -> [new](https://github.com/org/repo/releases/tag/new)
  - 変更内容の概要

## 備考
- package-name は破壊的変更があるため、別issueで対応予定

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Do NOT include summary or test result sections.

```bash
gh pr create --title "chore: Update npm dependencies (safe updates)" --body "..."
```

## Step 5: Create Issues for Deferred Packages

For class b-e packages:

```bash
gh issue create --title "chore: Update package-name to vX.Y.Z" --body "..."
```

Issue body should include:
- Overview
- Breaking changes / new features
- Impact analysis
- Work plan (checklist)
- References
- Related PRs/issues

## Special Case: @types/bun

When updating `@types/bun`, also update bun version in these files:

1. **`mise.toml`**: `bun = "X.Y.Z"`
2. **`package.json`**: `"packageManager": "bun@X.Y.Z"`
3. **`.github/workflows/*.yml`**:
   ```yaml
   - uses: oven-sh/setup-bun@<hash>  # vX.Y.Z
     with:
       bun-version: "X.Y.Z"
   ```
