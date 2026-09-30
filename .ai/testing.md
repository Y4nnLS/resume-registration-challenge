# Verification

Run inside both npm projects:

```text
npm run format:check
npm run lint
npm run typecheck
npm run build
```

Foundation verification also requires `GET /health`, frontend startup and basic browser inspection.
Check the backend compiled output with `npm start` and frontend output with `npm run preview`.
Review new/untracked files as well as the Git diff. Verify ignored `.env` files and safe examples.
No automated test suite is required for the static foundation. Do not claim test coverage.

Later: prioritize backend behavior with Vitest/Supertest and relevant integration tests.
SQL integration tests must use a separate test database; doubles do not validate actual SQL.
Test candidate validation, creation/queries, missing resources and PDF success/failure cases.
Add frontend tests where behavior warrants them. No E2E in the current project scope.
Record actual commands and results; report failures or unavailable checks explicitly.
