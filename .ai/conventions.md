# Conventions

- Code, identifiers, code filenames and commit messages: English.
- Evaluator documentation and user-facing messages: Portuguese.
- TypeScript strict mode; prefer small focused functions and explicit boundaries.
- ES modules. Backend relative imports use `.js` extensions for the compiled Node output.
- ESLint checks code; Prettier formats it. Root configuration defines formatting.
- UTF-8, two-space indentation and LF endings; no global Git or PowerShell changes.
- Keep each npm project private, with its own lockfile and exact direct dependency versions.
- Document project commands with `npm` only; do not use platform-specific executable variants.
- Agent environment workarounds are not project requirements or instructions for future agents.
- TypeScript stays on compatible 5.x for this challenge; currently 5.9.3.
- Add a dependency only for a concrete use in the approved Issue; verify compatibility first.
- Comments explain non-obvious decisions, limitations or heuristics, not literal code behavior.
- Never commit secrets or real personal data. Keep local `.env` files ignored.
- Backend is the final validation authority; future frontend schemas improve usability.
- Use parameterized SQL when persistence is implemented.
- No unrelated refactoring, business features or abstractions outside the approved plan.
