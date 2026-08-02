---
name: fix-release
description: Diagnose and repair a failed GitHub release or Vercel production deployment after the user explicitly requests release repair. Use only after that authorization.
---

# Fix release

This repository relies on Vercel for deployment and does not use semantic-release. Never introduce a new release mechanism merely to retry a deployment.

The invocation authorizes routine investigation, repair issues and branches, pull requests, CI repair, repair-PR merges, workflow reruns, and redeployment. Stop at the authorization boundaries in `AGENTS.md`.

## Establish state

1. Resolve the failed GitHub or Vercel deployment and record its run/deployment ID, commit SHA, environment, and partial effects.
2. Read actual logs and classify the failure as transient infrastructure, repository code/build, deployment configuration, permission/credential, or partial deployment.
3. Retry a clearly transient failure once without code changes.
4. Stop when a new secret, credential, permission, or protected-environment authorization is required. Never weaken protections or fabricate credentials.

## Repair

When repository changes are required, create a MAR issue in `In Progress` and a `fix/MAR-XYZ-release-short-description` branch. Apply global `/diagnosing-bugs`, `/tdd`, and `/implement` as appropriate, then `/review-fix-loop` and `/prepare-pr`. Use `/fix-ci` if its checks fail.

The original `/fix-release` invocation authorizes squash-merging the repair PR after review and required checks pass. Retry deployment for the existing commit through Vercel's established integration; do not create an unrelated tag or release.

Perform at most three substantive repair cycles. Report the failed deployment, root cause, MAR issue, repair PR, deployed commit, and final deployment status.
