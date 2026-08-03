# Issue tracker: Linear

Issues and specifications for this repository live in Linear.

- Workspace team: `MAR`
- Issue identifiers: `MAR-<number>`
- Use the connected Linear tools for reads and writes.
- Fetch an issue's complete description, comments, relationships, status, and relevant attachments before acting on it.

## Workflow

```text
Backlog -> Todo (Ready) -> In Progress -> In Review -> Done (Merged)
```

`Todo` is the team's Ready gate: it means a human has approved the issue for implementation. Normal implementation may begin only from `Todo` unless the user explicitly authorizes another starting state.

`Done` is the team's Merged state. Do not silently substitute other state names. If the MAR workflow changes, ask the user how to map it before changing issue state.

## Conventions

- Branch names and pull requests must contain the MAR identifier.
- Post one concise implementation plan when work begins; do not post routine edit-by-edit progress.
- Link the pull request to the Linear issue.
- Let the Linear GitHub integration perform transitions when configured; do not duplicate a transition that already occurred.

GitHub is authoritative for pull requests, CI, releases, and tags. Vercel is authoritative for this website's deployments. For a non-website repository, use its documented deployment system, defaulting to GitHub Actions when none is specified. Linear Releases is not used.

## Skill operations

- "Publish to the issue tracker" means create an issue in Linear team `MAR`.
- "Fetch the relevant ticket" means fetch the full Linear issue and its comments.
- "Ready for implementation" maps to the `Todo` state and `ready-for-agent` triage label.
