import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { getCandidate } from '../api/client';
import { ApiRequestError, type Candidate } from '../api/types';
import { formatDateTime } from '../utils/formatDateTime';

function successMessageFromState(state: unknown) {
  if (
    typeof state === 'object' &&
    state !== null &&
    'successMessage' in state &&
    typeof state.successMessage === 'string'
  ) {
    return state.successMessage;
  }
  return null;
}

function errorMessage(error: unknown) {
  if (error instanceof ApiRequestError && error.code === 'INVALID_ID') {
    return 'O identificador do candidato é inválido.';
  }
  if (error instanceof ApiRequestError) return error.message;
  return 'Não foi possível carregar o candidato.';
}

export function CandidateDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getCandidate(id ?? '')
      .then((result) => {
        setCandidate(result);
      })
      .catch((requestError: unknown) => {
        if (
          requestError instanceof ApiRequestError &&
          requestError.code === 'CANDIDATE_NOT_FOUND'
        ) {
          setNotFound(true);
        } else {
          setError(errorMessage(requestError));
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  function retry() {
    setIsLoading(true);
    setNotFound(false);
    setError(null);
    void getCandidate(id ?? '')
      .then((result) => {
        setCandidate(result);
      })
      .catch((requestError: unknown) => {
        if (
          requestError instanceof ApiRequestError &&
          requestError.code === 'CANDIDATE_NOT_FOUND'
        ) {
          setNotFound(true);
        } else {
          setError(errorMessage(requestError));
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  if (isLoading) {
    return <p role="status">Carregando candidato…</p>;
  }

  if (notFound) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">Candidato não encontrado</h1>
        <p className="mt-3 text-slate-600">O cadastro solicitado não está disponível.</p>
        <Link
          className="mt-5 inline-block font-medium text-teal-800 underline underline-offset-4"
          to="/candidates"
        >
          Voltar para candidatos
        </Link>
      </section>
    );
  }

  if (error || !candidate) {
    return (
      <section
        className="rounded-xl border border-red-200 bg-red-50 p-6"
        aria-labelledby="detail-error-title"
      >
        <h1 id="detail-error-title" className="text-2xl font-semibold text-red-900">
          Não foi possível consultar o candidato
        </h1>
        <p className="mt-3 text-red-800" role="alert">
          {error ?? 'Não foi possível carregar o candidato.'}
        </p>
        <button
          className="mt-5 rounded-lg border border-red-300 bg-white px-4 py-2 font-medium text-red-800 hover:bg-red-100"
          type="button"
          onClick={retry}
        >
          Tentar novamente
        </button>
      </section>
    );
  }

  const successMessage = successMessageFromState(location.state);
  const items: Array<[string, string | null]> = [
    ['E-mail', candidate.email],
    ['Telefone', candidate.phone],
    ['Área ou posição desejada', candidate.desiredPosition],
    ['Resumo profissional', candidate.professionalSummary],
    ['Data de cadastro', formatDateTime(candidate.createdAt)],
  ];

  return (
    <section className="mx-auto max-w-3xl">
      {successMessage && (
        <p
          className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-900"
          role="status"
        >
          {successMessage}
        </p>
      )}
      <Link
        className="text-sm font-medium text-teal-800 underline underline-offset-4"
        to="/candidates"
      >
        Voltar para candidatos
      </Link>
      <article className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight">{candidate.fullName}</h1>
        <dl className="mt-6 divide-y divide-slate-200">
          {items.map(([label, value]) => (
            <div key={label} className="py-4 first:pt-0">
              <dt className="text-sm font-medium text-slate-600">{label}</dt>
              <dd className="mt-1 whitespace-pre-wrap text-slate-950">
                {value ?? 'Não informado'}
              </dd>
            </div>
          ))}
        </dl>
      </article>
    </section>
  );
}
