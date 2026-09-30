import { Link, Route, Routes } from 'react-router';

export default function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-900">
      <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <p className="text-sm font-medium text-teal-700">Desafio técnico CIEE/PR</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                  Cadastro de candidatos
                </h1>
                <p className="mt-4 leading-relaxed text-slate-600">
                  Aplicação em desenvolvimento. As funcionalidades de cadastro e consulta serão
                  disponibilizadas nas próximas etapas.
                </p>
              </>
            }
          />
          <Route
            path="*"
            element={
              <>
                <h1 className="text-2xl font-semibold">Página não encontrada</h1>
                <p className="mt-4 text-slate-600">Este endereço não está disponível.</p>
                <Link
                  className="mt-6 inline-block rounded text-teal-700 underline underline-offset-4 hover:text-teal-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
                  to="/"
                >
                  Voltar ao início
                </Link>
              </>
            }
          />
        </Routes>
      </section>
    </main>
  );
}
