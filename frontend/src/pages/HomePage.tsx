import { Link } from 'react-router';

export function HomePage() {
  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
      <p className="text-sm font-medium text-teal-700">Desafio técnico CIEE/PR</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Cadastro de candidatos
      </h1>
      <p className="mt-4 max-w-xl leading-7 text-slate-600">
        Cadastre candidatos manualmente ou use sugestões extraídas de um currículo PDF antes de
        confirmar os dados.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          className="rounded-lg bg-teal-700 px-4 py-3 text-center font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
          to="/candidates/new"
        >
          Cadastrar candidato
        </Link>
        <Link
          className="rounded-lg border border-slate-300 px-4 py-3 text-center font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
          to="/candidates"
        >
          Consultar candidatos
        </Link>
      </div>
    </section>
  );
}
