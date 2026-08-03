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

## Agent skills

### Issue tracker

Implementation work is tracked in Linear team `MAR`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the canonical Matt Pocock triage vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repository. See `docs/agents/domain.md` before exploring or changing the codebase.

### Skill ownership

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

Project lifecycle skills live under `.agents/skills/`. They may orchestrate global skills but must not reproduce or alter their engineering methods.

## Git and pull requests

- Never push directly to `main`.
- Use `feat/MAR-123-short-description`, `fix/MAR-123-short-description`, or `refactor/MAR-123-short-description` branches.
- Use Conventional Commit pull request titles ending in the Linear identifier, for example `feat(projects): add technology filtering (MAR-123)`.
- Squash merge. Preserve the PR title as the squash commit title.
- Never bypass branch protection or required checks.

## Testing seams

The test strategy and public seams documented in an approved Linear issue count as the confirmation required by the global `/tdd` skill. If the issue does not identify suitable seams, confirm them with the user before writing tests.

## Human authorization

Normal feature work requires human authorization when:

1. approving the Linear issue;
2. starting implementation;
3. resolving genuine product ambiguity;
4. merging the final pull request.

Explicitly invoking `/fix-ci` for CI, release, or deployment repair authorizes routine diagnosis, repair changes, commits, pushes, reruns, and repair pull requests without intermediate confirmation. The repair skill may merge its own repair PR when its documented gates pass. Stop for a product decision, destructive data change, new secret or credential, broader permission, bypassed security control, or security-sensitive architectural decision.
