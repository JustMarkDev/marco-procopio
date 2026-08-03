---
name: prepare-pr
description: Verify and open a draft GitHub pull request for a completed MAR issue after its review-fix gate passes. Use when implementation is ready to publish for review.
---

# Prepare pull request

## Validate

- Resolve and fetch the MAR issue from the current non-`main` branch.
- Require the issue to be in the active implementation state configured in `docs/agents/issue-tracker.md` and the branch to contain its identifier.
- Require a clean worktree. If intended changes remain uncommitted, commit them and rerun `/review-fix-loop`.
- Require a successful `/review-fix-loop` report for the current `HEAD` SHA. If the report is unavailable or stale, rerun the loop.
- Inspect `git diff main...HEAD` for unrelated work, debug output, temporary files, generated artifacts, and secrets.
- Run every applicable verification script in `AGENTS.md` and list only commands actually run.

Use a Conventional Commit PR title ending in the MAR identifier.

## Publish

1. Push with `git push --set-upstream origin HEAD`.
2. Open a draft PR with `gh`.
3. Include Linear issue, summary, checked acceptance criteria, verification results, reviewed `HEAD` SHA, review-gate result, and out-of-scope notes in the body.
4. Link the PR to Linear and move the issue from the configured active implementation state to the configured review state unless integration already did so.

Return the PR number and URL, Linear issue, local verification, reviewed SHA, and current GitHub check status. Do not merge.
