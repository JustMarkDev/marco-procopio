# Agent instructions

## Package manager and commands

Use Bun for dependency installation and as the entry point for repository scripts.

- Never use `npm`, `pnpm`, or `yarn`.
- Do not invoke `vp` directly. Vite+ remains an implementation dependency behind the repository's lint, format, and test scripts.
- Use `bun install --frozen-lockfile` for deterministic installs.
- Inspect `package.json` and run only scripts that exist.

Typical checks are:

- `bun run format:check`
- `bun run lint`
- `bun run typecheck`
- `bun run test`
- `bun run build`

Run `bun run check` when the combined formatting, lint, and typecheck gate is appropriate. Run `bun run test:e2e` only if that script is added later.

## Work source

Implementation work is specified by repository-local issue files. Treat the active local issue as the source of truth for scope, acceptance criteria, testing seams, and completion.

The local issue system and synchronization with GitHub will be configured separately. When its repository instructions exist, follow them. Until then, ask the user to identify the approved local issue before starting implementation. Do not create or update an external issue tracker unless the user asks. Treat synchronized GitHub Issues as mirrors unless the local issue configuration explicitly says otherwise.

Before exploring or changing the codebase, read the active local issue, `docs/agents/domain.md`, `DECISIONS.md`, and any relevant context files or ADRs.

## Global engineering skills

Matt Pocock engineering skills are installed globally and are upstream-owned dependencies. Never modify them, copy customized versions into this repository, or create project-local forks.

Use the global skills when appropriate, including:

- `/grill-with-docs`
- `/to-spec`
- `/to-tickets`
- `/implement`
- `/tdd`
- `/diagnosing-bugs`
- `/code-review`
- `/resolving-merge-conflicts`

## Controlled implementation loop

Once the user approves a local issue and explicitly starts implementation, continue routine work without requesting confirmation between steps:

1. Read the complete issue and relevant repository context.
2. Plan the smallest testable slices that satisfy its acceptance criteria.
3. For each behavioral slice, apply `/tdd`: add or update a failing test, confirm the intended failure, implement the smallest correct change, and verify the test passes.
4. Run focused checks while developing.
5. Review the complete branch diff against the local issue and repository standards with `/code-review`.
6. Fix substantive findings, rerun focused checks, and review again.
7. Run every applicable repository check before publishing.
8. Commit intentionally, push the feature branch, and open or update a draft pull request.

Perform at most three full review-and-repair cycles. A cycle may contain as many small TDD iterations as the approved acceptance criteria require. When a selected global skill explicitly calls for independent subagents and they are available, use them for isolated review or diagnosis; the main agent remains responsible for integrating their findings.

The implementation gate passes only when the acceptance criteria are satisfied, no unresolved substantive review findings remain, all applicable checks pass, and the diff contains no unexplained scope changes.

## Pull request and CI loop

After pushing, inspect the actual GitHub check results. For routine failures:

1. Read the failing logs.
2. Reproduce locally when practical.
3. Apply `/diagnosing-bugs` and `/tdd` when behavior changes.
4. Make the smallest correct repair.
5. Rerun focused and complete applicable checks.
6. Review non-trivial repairs, commit, push, and monitor the new run.

Perform at most three substantive CI repair cycles. Never disable required checks, weaken valid tests, add blanket ignores, bypass protections, or push directly to `main`.

## Git, pull requests, and releases

- Never push directly to `main`.
- When the local issue system provides an identifier or slug, include it in the branch name and PR body.
- Use Conventional Commit pull request titles.
- Open pull requests as drafts until implementation, review, and CI gates pass.
- Squash merge and preserve the PR title as the squash commit title.
- Never bypass branch protection or required checks.
- GitHub is authoritative for pull requests, CI, tags, releases, and non-website deployments.
- Vercel is authoritative for this website's deployments.

## Human authorization and stop conditions

Human authorization is required to approve the local issue, start implementation, resolve genuine ambiguity, and merge the final pull request. Starting implementation authorizes routine edits, tests, reviews, repairs, commits, feature-branch pushes, draft PR updates, and CI repair within the approved scope.

Stop and ask the user when work requires a product or public API decision, scope expansion, destructive data change, new credential or secret, broader permission, bypassed security control, security-sensitive architectural decision, or when the same blocking failure persists through three repair cycles.
