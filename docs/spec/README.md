# Specifications

Feature-level specifications describing **what** the product does, written from
a user/behavior perspective. Architecture details live in `../arch/`, decisions
in `../adr/`.

## Documents

- [Product browsing](product-browsing.md) — the core catalog browsing experience

## Template

When adding a spec, use this skeleton:

```markdown
# <Feature name>

## Summary
One or two sentences.

## User stories
- As a <role>, I want <capability>, so that <benefit>.

## Requirements
### Functional
- REQ-F-xx: ...

### Non-functional
- REQ-N-xx: ...

## Acceptance criteria
- [ ] ...
```
