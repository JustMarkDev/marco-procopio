---
name: fix-ci
description: Diagnose and repair failed GitHub Actions CI, release jobs, or Vercel deployments after the user explicitly requests repair for a PR, branch, run, or deployment. Use only after that authorization.
---

# Fix CI, release, or deployment

The invocation authorizes routine diagnosis, repair changes, tests, commits, pushes, and reruns. Stop only at the authorization boundaries in `AGENTS.md`.

## Diagnose

1. Resolve the target and read actual GitHub or Vercel failure logs. Record the run or deployment ID, commit, environment, and any partial effects.
2. Classify the failure as code, test, environment/configuration, transient infrastructure, permission/secret, or partial deployment.
3. Rerun clearly transient failed jobs once before changing code. Diagnose a repeated substantive failure normally.
4. Reproduce locally when practical using Bun and repository scripts. Apply global `/diagnosing-bugs`; apply `/tdd` for behavior changes.

Make the smallest correct repair. Never disable CI, remove required checks, weaken valid tests, add blanket ignores, broaden the MAR scope, push directly to `main`, introduce semantic-release, or create a release merely to retry deployment. Stop when a new secret, credential, permission, or protected-environment authorization is required.

## Existing feature PR

Repair its existing branch, run focused and applicable checks, commit the repair, and run `/review-fix-loop` before every push that changes the branch. Update the PR body's review-gate SHA to the reviewed `HEAD`, push, and watch the new checks for up to three repair cycles. When green, report readiness but do not merge without separate authorization.

## Failure on main

Create a MAR repair issue in the active implementation state configured in `docs/agents/issue-tracker.md`, create `fix/MAR-XYZ-ci-short-description`, repair and test, then run `/review-fix-loop` and `/prepare-pr`. The original `/fix-ci` invocation authorizes squash-merging this repair PR after review and required checks pass. Move the repair issue to the configured completed state.

## Vercel deployment failure

Vercel is authoritative for this website's deployments. Retry a clearly transient deployment once. When repository changes are required, follow the main-repair workflow above and redeploy the intended existing commit after merge. Never fabricate credentials or bypass protected-environment approval.

Report root cause, changed files and tests, attempts, final Actions or Vercel status, deployed commit when relevant, and any repair issue or PR.
