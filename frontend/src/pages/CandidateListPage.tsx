import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { listCandidates } from '../api/client';
import { ApiRequestError, type Candidate } from '../api/types';
import { formatDateTime } from '../utils/formatDateTime';

function errorMessage(error: unknown) {
  if (error instanceof ApiRequestError) return error.message;
  return 'Não foi possível carregar os candidatos.';
}

export function CandidateListPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void listCandidates()
      .then((result) => {
        setCandidates(result);
      })
      .catch((requestError: unknown) => {
        setError(errorMessage(requestError));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  function retry() {
    setIsLoading(true);
    setError(null);
    void listCandidates()
      .then((result) => {
        setCandidates(result);
      })
      .catch((requestError: unknown) => {
        setError(errorMessage(requestError));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  if (isLoading) {
    return <p role="status">Carregando candidatos…</p>;
  }

  if (error) {
    return (
      <section
        className="rounded-xl border border-red-200 bg-red-50 p-5"
        aria-labelledby="list-error-title"
      >
        <h1 id="list-error-title" className="text-xl font-semibold text-red-900">
          Não foi possível carregar a lista
        </h1>
        <p className="mt-2 text-red-800" role="alert">
          {error}
        </p>
        <button
          className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 font-medium text-red-800 hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
          type="button"
          onClick={retry}
        >
          Tentar novamente
        </button>
      </section>
    );
  }

  if (candidates.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">Candidatos</h1>
        <p className="mt-3 text-slate-600">Ainda não há candidatos cadastrados.</p>
        <Link
          className="mt-5 inline-block font-medium text-teal-800 underline underline-offset-4"
          to="/candidates/new"
        >
          Cadastrar o primeiro candidato
        </Link>
      </section>
    );
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-teal-700">Consulta</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Candidatos</h1>
        </div>
        <Link
          className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
          to="/candidates/new"
        >
          Novo cadastro
        </Link>
      </div>
      <ul className="mt-6 grid gap-4">
        {candidates.map((candidate) => (
          <li key={candidate.id}>
            <Link
              className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-teal-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
              to={'/candidates/' + candidate.id}
            >
              <h2 className="font-semibold text-slate-950">{candidate.fullName}</h2>
              <p className="mt-1 text-sm text-slate-600">{candidate.email}</p>
              {candidate.desiredPosition && (
                <p className="mt-3 text-sm text-slate-700">{candidate.desiredPosition}</p>
              )}
              <p className="mt-3 text-xs text-slate-500">
                Cadastrado em {formatDateTime(candidate.createdAt)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
