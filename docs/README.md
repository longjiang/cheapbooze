# Documentation

This folder holds the project's living documentation. It is organized into three
sections:

| Folder  | Purpose                                                        |
| ------- | -------------------------------------------------------------- |
| `arch/` | Architecture documentation — how the system is structured and why |
| `spec/` | Specifications — what the system does, feature-level requirements |
| `adr/`  | Architecture Decision Records — individual decisions and their rationale |

## Index

- [Architecture overview](arch/overview.md)
- [Data flow](arch/data-flow.md)
- [Runbook](arch/runbook.md)
- [Product browsing spec](spec/product-browsing.md)
- [ADRs](adr/README.md)

## Conventions

- Documents are plain Markdown. No tooling required to read them.
- ADRs are numbered (`NNNN-title.md`) and never rewritten after acceptance —
  superseded decisions get a new ADR.
- Keep diagrams as Mermaid blocks so they render on GitHub and in VS Code.
