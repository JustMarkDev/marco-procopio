# Triage labels

Map the canonical Matt Pocock triage roles to these Linear label names:

| Canonical role    | Linear label      | Meaning                                          |
| ----------------- | ----------------- | ------------------------------------------------ |
| `needs-triage`    | `needs-triage`    | Maintainer evaluation is required                |
| `needs-info`      | `needs-info`      | More information is required                     |
| `ready-for-agent` | `ready-for-agent` | Approved and sufficiently specified for an agent |
| `ready-for-human` | `ready-for-human` | Human implementation is required                 |
| `wontfix`         | `wontfix`         | The issue will not be actioned                   |

When a global skill names a canonical role, use the corresponding Linear label. Do not create a duplicate if an equivalent label already exists; ask the user before changing this mapping.
