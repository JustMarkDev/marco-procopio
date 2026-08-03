---
name: merge-pr
description: Perform the final squash merge of a MAR pull request after the user explicitly authorizes that merge. Use for requests such as "merge it" or a specific PR number.
---

# Merge pull request

Treat the invocation as the final human authorization boundary.

## Gate

Resolve the PR and its MAR issue, then require:

- the Linear issue is in the review state configured in `docs/agents/issue-tracker.md`;
- a review-gate SHA in the PR body matching the current PR head SHA;
- no unresolved P0-P2 findings;
- all required GitHub checks green;
- no merge conflicts;
- a Conventional Commit title ending in the MAR identifier;
- compliance with branch protection.

If the review SHA is absent or stale, run `/review-fix-loop` and update the PR. If CI fails, run `/fix-ci` only when the user has authorized CI repair. Apply global `/resolving-merge-conflicts` when conflicts exist. Never bypass protection.

Mark a draft ready, then squash merge with branch deletion while preserving the PR title as the squash commit title. Confirm Linear moves to the completed state configured in `docs/agents/issue-tracker.md`, avoiding a duplicate integration transition.

Report the PR, squash commit, Linear issue, and final issue state. Do not create a release.
