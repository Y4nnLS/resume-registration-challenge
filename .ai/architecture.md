# Architecture

- Two independent npm applications; no workspaces or root npm package.
- Frontend: React, TypeScript, Vite, Tailwind CSS and React Router in declarative mode.
- Backend: Node.js, TypeScript and Express, using ES modules.
- Current backend: `src/app.ts` composes Express; `src/server.ts` configures and starts HTTP.
  Its development script restricts Node watch mode to `src`, preventing dynamic files in
  `node_modules` from restarting active requests.
- `GET /health` is process liveness only; it does not check a database.
- Frontend: `main.tsx` initializes React/Router; `App.tsx` composes the routes, pages use
  local state, and `api/client.ts` isolates the four HTTP calls. The Vite development proxy
  forwards relative `/api` calls to the local backend.

Business request flow: Route → Controller → Service → Repository → SQL Server for candidates.
PDF extraction uses Route → Controller → Resume extraction service, without a repository.
SQL belongs in repositories. Services coordinate use cases; controllers translate HTTP.
Use `mssql` without an ORM, SQL Server on Windows and a dedicated SQL login when introduced.
PDF processing uses memory only and never persists the file or creates a Resume entity.
`POST /api/resumes/extract` accepts one PDF of at most `5 * 1024 * 1024` bytes and returns
nullable suggestions. It uses `pdfjs-dist`; no OCR is involved.

No empty future layers, generic base repositories, speculative interfaces, Docker or authentication.
Local React state, hooks and composition are sufficient for the planned application.
