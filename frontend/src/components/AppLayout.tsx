import { Link, NavLink, Outlet } from 'react-router';

const navClassName = ({ isActive }: { isActive: boolean }) =>
  'rounded px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 ' +
  (isActive ? 'bg-teal-50 text-teal-900' : 'text-slate-700 hover:bg-slate-100');

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link
            className="text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
            to="/"
          >
            Cadastro de candidatos
          </Link>
          <nav aria-label="Navegação principal" className="flex gap-1">
            <NavLink className={navClassName} to="/candidates/new">
              Novo cadastro
            </NavLink>
            <NavLink className={navClassName} to="/candidates">
              Candidatos
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <Outlet />
      </main>
    </div>
  );
}
