---
name: fix-ci
description: Diagnose and repair a failed GitHub Actions run after the user explicitly requests CI repair for a PR, branch, main, or run ID. Use only after that authorization.
---

# Fix CI

The invocation authorizes routine diagnosis, repair changes, tests, commits, pushes, and reruns. Stop only at the authorization boundaries in `AGENTS.md`.

## Diagnose

1. Resolve the target and read actual failed logs with `gh pr checks`, `gh run view`, and `gh run view --log-failed` as appropriate.
2. Classify the failure as code, test, environment/configuration, transient infrastructure, or permission/secret.
3. Rerun clearly transient failed jobs once before changing code. Diagnose a repeated substantive failure normally.
4. Reproduce locally when practical using Bun and repository scripts. Apply global `/diagnosing-bugs`; apply `/tdd` for behavior changes.

Make the smallest correct repair. Never disable CI, remove required checks, weaken valid tests, add blanket ignores, broaden the MAR scope, or push directly to `main`.

## Existing feature PR

Repair its existing branch, run focused and applicable checks, commit the repair, and run `/review-fix-loop` before every push that changes the branch. Update the PR body's review-gate SHA to the reviewed `HEAD`, push, and watch the new checks for up to three repair cycles. When green, report readiness but do not merge without separate authorization.

## Failure on main

Create a MAR repair issue in `In Progress`, create `fix/MAR-XYZ-ci-short-description`, repair and test, then run `/review-fix-loop` and `/prepare-pr`. The original `/fix-ci` invocation authorizes squash-merging this repair PR after review and required checks pass. Move the repair issue to `Merged`.

Report root cause, changed files and tests, attempts, final Actions status, and any repair issue or PR.
