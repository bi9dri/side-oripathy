---
name: update-dependencies
description: Update dependencies of side-oripathy (a Docusaurus static site) safely, avoiding build breakage and breaking changes. Inspect npm packages and GitHub Actions with a 7-day cooldown, check vulnerabilities via bun audit and osv-scanner, then triage packages into Batched / Individual and delegate PR creation to sub-agents. Because pushes to main are auto-deployed to GitHub Pages, the build check is mandatory. Use this skill when asked to update dependencies, respond to vulnerabilities, or bump npm packages or GitHub Actions versions.
disable-model-invocation: true
allowed-tools:
  - Read
  - Bash(bunx --bun ncu:*)
  - Bash(bun run --bun ncu:*)
  - Bash(pinact:*)
  - Bash(bun audit)
  - Bash(osv-scanner:*)
  - Bash(gh:*)
  - Write
  - Edit
  - Bash(git:*)
  - Bash(bun install:*)
  - Bash(bun add:*)
  - Bash(bun info:*)
  - Bash(bun run:*)
  - Bash(grep:*)
  - Bash(head:*)
  - Bash(jq:*)
---

update dependencies with following instructions

use `jq` to parse JSON outputs and `grep` to filter for relevant information.

This repository is a Docusaurus static site, and every push to `main` is automatically deployed to GitHub Pages. Therefore **any change that breaks `bun run build` results in a production outage**. Never skip the build step in the validation phase.

## Constraints

- When updating bun itself, keep the `bun@x.y.z` versions in `devbox.json` and `package.json` in sync. Both files pin bun and must reference the same version.
- Do not use `overrides` as a general tool. Direct dependency updates are the default resolution path. `overrides` (and equivalent mechanisms) are permitted only when **both** conditions hold: (1) the issue cannot be resolved by updating the direct dependency, and (2) a critical vulnerability has been reported against the transitive dependency.

## Step 1: Deep Inspection & Security

1. Sync the environment with `bun install --frozen-lockfile`

2. To mitigate supply chain attacks, check for the latest versions released more than 7 days ago. Unless specified otherwise, check across all package managers.
```
# npm packages (the `ncu` script in package.json applies `-c 7 -p bun -w` by default)
bun run --bun ncu

# GitHub Actions
pinact run --min-age 7
```

3. Gather security information. Security updates take priority and bypass the 7-day rule in Step 1.2.
```
bun audit
osv-scanner scan source -r .
```

## Step 2: Triage

For each package detected in Steps 1.2 and 1.3, do the following:

1. Resolve the repository URL with `bun info {package} repository.url`.
2. Check the tag naming convention (e.g., whether tags are prefixed with `v`) using `gh release list -R {repo} -L 3 --json tagName -q '.[].tagName'`, so that `{from}` and `{to}` can be passed in the correct format to the next command.
3. Estimate the impact on the project and triage each package into one of two classes using `gh api repos/{repo}/compare/{from}...{to} --jq '.commits[].commit.message' | grep -iE '(^[a-z]+(\([^)]+\))?!:|BREAKING[ _-]?CHANGE|^(deprecate|remove|drop)\b)' | head -30` (this grep detects conventional commit breaking markers and fallback keywords).

Batched: no impact on project code or behavior → processed together in a single PR
Individual: likely to have impact → processed in a dedicated PR per package

**Do not over-trust SemVer. Even patch updates can contain breaking changes. That said, major updates are unconditionally treated as Individual.**

## Step 3: Orchestrate Sub-Agents

Based on the triage results, delegate update work to sub-agents.

**All PRs, issues, and commit messages must be written in Japanese.**

### Batched updates

Pass the list of Batched packages (identified in Step 2) to a single sub-agent. The sub-agent must not re-triage; it operates on the provided list.

- Work in a single git worktree and produce a single PR.
- Update packages one at a time, running the following checks after each update:
  ```
  bun run --bun typecheck && bun run --bun lint && bun run --bun format && bun run build
  ```
  - `build` verifies the Docusaurus static build. It is mandatory because main is auto-deployed.
  - If `format` (oxfmt) rewrites files, include those rewrites in the same commit.
- If checks pass, proceed to the next package (one commit per package).
- If checks fail, do not create a commit for that package. Revert to the pre-update state with `git stash && bun install --frozen-lockfile` and skip the package.
- Once all packages have been processed, create a PR containing only the packages that passed.
  - PR body: list of updated packages with before/after versions.
- On completion, report the list of skipped packages (package name, from/to versions, and a summary of the failure) to the orchestrator.

**The sub-agent must not attempt to fix skipped packages.** Report failures to the orchestrator so they can be re-triaged as Individual and handled with dedicated context.

### Re-triage by the orchestrator

When the Batched sub-agent reports skipped packages, re-triage them as Individual and add them to the Individual updates below.

### Individual updates

Packages classified as Individual (both originally Individual and those promoted from Batched) are processed by a dedicated sub-agent, git worktree, and PR per package.

- Address the following:
  - Fixes for failing checks (`typecheck` / `lint` / `format` / `build`).
  - Code improvements that leverage new or improved APIs.
  - Replacement of deprecated APIs.
- For major Docusaurus updates, consult the upstream Migration Guide and verify/apply any breaking changes affecting `docusaurus.config.ts` / `sidebars.ts` / `src/theme/` / `src/css/` (plugin API changes, swizzled component signature changes, theme class name renames, etc.).
- PR body: updated package, before/after versions, affected project code or behavior, summary of changes made, and rationale for any items left unaddressed.
- If checks still fail after 5 fix attempts (one attempt = one cycle of code change → `bun run --bun typecheck && bun run --bun lint && bun run --bun format && bun run build`), create a GitHub Issue and a Draft PR, then stop.
  - Title: `[Package Name] from vA to vB`
  - Body: error details, the upstream change causing the impact, affected project code or behavior, and approaches attempted.
  - After creating the Issue, create a Draft PR and include a link to the Issue in its description.
