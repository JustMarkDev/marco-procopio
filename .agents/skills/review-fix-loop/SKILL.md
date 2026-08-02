---
name: review-fix-loop
description: Review a branch against its Linear MAR issue, repair substantive findings, and repeat verification until the pre-PR gate passes. Use after implementation or a non-trivial repair.
---

# Review fix loop

Use the global `/code-review` output as the review source; do not reproduce or alter its two-axis method.

## Review

1. Resolve the MAR issue from the branch and fetch it completely.
2. Commit the complete intended change and require a clean worktree so `HEAD` contains everything under review.
3. Use `main` as the fixed point and inspect the complete three-dot diff.
4. Invoke global `/code-review` with the Linear issue as the specification source.
5. Preserve its separate Standards and Spec reports, then classify actionable findings for this gate:
   - P0: catastrophic or release-blocking;
   - P1: serious correctness, security, or data defect;
   - P2: meaningful defect, regression risk, or missing required coverage;
   - P3: optional improvement.

Do not invent findings for stylistic preference. P0-P2 block the gate.

## Repair and repeat

- Fix blocking findings with the smallest correct change.
- Apply global `/diagnosing-bugs` for newly discovered bugs.
- Apply global `/tdd` for behavioral changes, using issue-approved seams; never weaken or delete valid tests to obtain green results.
- Run focused checks, then every applicable command in `AGENTS.md`.
- Commit the repair before reviewing again and require a clean worktree.
- Review the new complete diff again.

Perform at most three repair cycles. Stop for a persistent finding, incompatible review conclusions, product or scope decision, destructive migration, or security-sensitive architecture decision.

## Gate

Pass only when no P0-P2 findings remain, every acceptance criterion is satisfied, applicable checks pass, the worktree is clean, and scope changes are explained. Report cycles, resolved findings, verification results, and the exact reviewed `HEAD` SHA. The gate is valid only for that SHA.

Invoke `/prepare-pr` when the branch does not already have a PR. For an existing PR repair, return the gate result to the calling workflow instead.
