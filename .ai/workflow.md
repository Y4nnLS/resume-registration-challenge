# Workflow

1. Read the assigned GitHub Issue, its checklist, acceptance criteria and Definition of Done.
2. Inspect relevant repository context and the working tree; preserve unrelated changes.
3. PLAN: understanding, current state, changes, affected files, decisions, verification, risks and scope.
4. Stop and wait for explicit human approval before changing files or installing dependencies.
5. IMPLEMENTATION: follow the approved plan incrementally. Do not request the same approval again.
6. Stop for a relevant architectural change, structural dependency or scope expansion.
7. Run applicable quality gates, review the result and update relevant documentation.
8. Report implementation, files, tests, validation, decisions, manual checks, documentation,
   a suggested Conventional Commit and the next step. Do not start the next Issue automatically.

Use `main` and a branch per major delivery. Current foundation branch: `feat/project-foundation`.
Preserve the original initial commit; use Conventional Commits for subsequent authorized commits.
Do not commit or push automatically. A reviewed PR is part of the Issue's delivery workflow.

Update `DESENVOLVIMENTO.md` while working, with actual decisions, AI contributions and results.
Distinguish developer requirements from agent proposals and record accepted/changed/rejected ideas.
Do not invent elapsed time, manual edits, model names, reviews or successful checks.
The developer will record time later. No delegation is requested for the current Issue.
