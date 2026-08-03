---
name: start-issue
description: Start implementation of an approved Linear MAR issue. Use only when the user explicitly asks to begin work on a specific MAR issue.
---

# Start issue

Prepare and implement an approved MAR issue without modifying or copying globally installed skills.

## Establish the work

1. Fetch the complete Linear issue and verify its identifier belongs to team `MAR`.
2. Require the approved implementation state configured in `docs/agents/issue-tracker.md`, unless the user explicitly authorized another state.
3. Require a clear problem statement and testable acceptance criteria.
4. Read `AGENTS.md`, `docs/agents/*.md`, relevant domain docs, ADRs, and linked material.
5. Treat issue-defined test seams as pre-approved. If suitable seams are absent, confirm them before using `/tdd`.

Ask before proceeding only when a missing decision changes product behavior, security, data semantics, or public API behavior.

## Prepare Linear and Git

- Verify the worktree can be used without disturbing unrelated changes.
- Update `main` with `git pull --ff-only`; never discard local work.
- Create a branch containing the issue identifier with the appropriate `feat/`, `fix/`, or `refactor/` prefix.
- Move the issue to the configured active implementation state and post one concise plan covering code areas, approach, tests, and material risks.

## Implement and verify

- For bugs, apply the global `/diagnosing-bugs` skill first.
- Apply the global `/implement` skill. Let it use `/tdd` at the approved seams and `/code-review` as directed by upstream.
- Use Bun and repository-defined scripts only.
- Run focused tests while developing, then every applicable verification script listed in `AGENTS.md`. Report skipped checks.

After implementation succeeds, invoke `/review-fix-loop` against `main`.
