# Architecture Decision Records

ADRs capture important technical decisions and the context around them. Each ADR
is a short, dated document. Decisions are **never modified after acceptance** —
if a decision needs to change, write a new ADR that supersedes the old one.

## Status legend

- **Accepted** — the decision is in force.
- **Proposed** — under discussion.
- **Superseded by ADR-XXXX** — replaced by a newer decision.

## Records

| # | Title | Status | Date |
| - | ----- | ------ | ---- |
| 0001 | [Use Next.js App Router](0001-use-nextjs-app-router.md) | Accepted | 2026-08-13 |
| 0002 | [Server-side catalog fetch with disk caching](0002-server-side-fetch-and-cache.md) | Accepted | 2026-08-13 |
| 0003 | [Image proxy for product images](0003-image-proxy.md) | Accepted | 2026-08-13 |

## Template

```markdown
# ADR-XXXX: <Title>

- Status: <proposed | accepted | superseded by ADR-YYYY>
- Date: <YYYY-MM-DD>

## Context

## Decision

## Consequences

### Positive

### Negative

### Trade-offs
```
