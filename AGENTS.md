# Project map

Read only the context relevant to the current task:

- [Architecture](.ai/architecture.md): boundaries and current structure.
- [Conventions](.ai/conventions.md): code, dependencies and formatting.
- [Domain](.ai/domain.md): approved candidate and PDF rules.
- [Testing](.ai/testing.md): quality gates and verification.
- [Workflow](.ai/workflow.md): planning, approval and delivery.
- [README](README.md): setup, installed versions and current capabilities.
- [Development record](DESENVOLVIMENTO.md): actual decisions and AI involvement.

`frontend/` and `backend/` are independent npm projects. Run `npm install` inside each.
Both expose `dev`, `format`, `format:check`, `lint`, `typecheck` and `build`.
Backend additionally exposes `start`; frontend exposes `preview`.
Run scripts from the corresponding application directory, not the repository root.

Before a new implementation, read its GitHub Issue, inspect relevant files and present a plan.
Wait for explicit approval; an already approved plan authorizes its implementation.
Do not commit, push or expand the approved scope without the developer's instruction.
