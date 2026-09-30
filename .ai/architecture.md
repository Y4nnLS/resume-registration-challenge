# Architecture

- Two independent npm applications; no workspaces or root npm package.
- Frontend: React, TypeScript, Vite, Tailwind CSS and React Router in declarative mode.
- Backend: Node.js, TypeScript and Express, using ES modules.
- Current backend: `src/app.ts` composes Express; `src/server.ts` configures and starts HTTP.
- `GET /health` is process liveness only; it does not check a database.
- Current frontend: `main.tsx` initializes React/Router; `App.tsx` holds bootstrap routes.

Planned business request flow: Route → Controller → Service → Repository → SQL Server.
Introduce these layers only when behavior requires them. SQL belongs in repositories.
Services coordinate use cases; controllers translate HTTP. PDF extraction stays separate.
Use `mssql` without an ORM, SQL Server on Windows and a dedicated SQL login when introduced.
PDF processing uses memory only and never persists the file or creates a Resume entity.

No empty future layers, generic base repositories, speculative interfaces, Docker or authentication.
Local React state, hooks and composition are sufficient for the planned application.
