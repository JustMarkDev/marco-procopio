# Issue tracker: Linear

Issues and specifications for this repository live in Linear.

- Workspace team: `MAR`
- Issue identifiers: `MAR-<number>`
- Use the connected Linear tools for reads and writes.
- Fetch an issue's complete description, comments, relationships, status, and relevant attachments before acting on it.

## Workflow

```text
Backlog -> Ready -> In Progress -> In Review -> Merged
```

`Ready` means a human has approved the issue for implementation. Normal implementation may begin only from `Ready` unless the user explicitly authorizes another starting state.

Do not silently substitute differently named states. If the MAR team does not expose one of these states, ask the user how to map it before changing issue state.

## Conventions

- Branch names and pull requests must contain the MAR identifier.
- Post one concise implementation plan when work begins; do not post routine edit-by-edit progress.
- Link the pull request to the Linear issue.
- Let the Linear GitHub integration perform transitions when configured; do not duplicate a transition that already occurred.

GitHub is authoritative for pull requests, CI, releases, tags, and deployments. Linear Releases is not used.

## Skill operations

- "Publish to the issue tracker" means create an issue in Linear team `MAR`.
- "Fetch the relevant ticket" means fetch the full Linear issue and its comments.
- "Ready for implementation" maps to the `Ready` state and `ready-for-agent` triage label.
