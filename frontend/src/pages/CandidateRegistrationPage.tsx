import { useState } from 'react';
import { useNavigate } from 'react-router';
import { createCandidate, extractResume } from '../api/client';
import { ApiRequestError, type CreateCandidateInput } from '../api/types';
import { CandidateConfirmation } from '../components/CandidateConfirmation';
import { CandidateForm } from '../components/CandidateForm';
import { toCandidateInput, type CandidateFormValues } from '../schemas/candidate';

const candidateFields = [
  'fullName',
  'email',
  'phone',
  'desiredPosition',
  'professionalSummary',
] as const;

function errorMessage(error: unknown) {
  if (error instanceof ApiRequestError) return error.message;
  return 'Não foi possível concluir o cadastro. Tente novamente.';
}

function fieldErrors(error: unknown): Partial<Record<keyof CandidateFormValues, string>> {
  if (!(error instanceof ApiRequestError)) return {};

  return error.details.reduce<Partial<Record<keyof CandidateFormValues, string>>>(
    (result, detail) => {
      if (candidateFields.includes(detail.field as keyof CandidateFormValues)) {
        result[detail.field as keyof CandidateFormValues] = detail.message;
      }
      return result;
    },
    {},
  );
}

export function CandidateRegistrationPage() {
  const navigate = useNavigate();
  const [pendingCandidate, setPendingCandidate] = useState<CreateCandidateInput | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [backendFieldErrors, setBackendFieldErrors] = useState<
    Partial<Record<keyof CandidateFormValues, string>>
  >({});

  function reviewCandidate(values: CandidateFormValues) {
    setCreationError(null);
    setBackendFieldErrors({});
    setPendingCandidate(toCandidateInput(values));
  }

  async function confirmCandidate() {
    if (!pendingCandidate) return;

    setIsSubmitting(true);
    try {
      const candidate = await createCandidate(pendingCandidate);
      navigate('/candidates/' + candidate.id, {
        state: { successMessage: 'Cadastro realizado com sucesso.' },
      });
    } catch (error) {
      setCreationError(errorMessage(error));
      setBackendFieldErrors(fieldErrors(error));
      setPendingCandidate(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-teal-700">Novo cadastro</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Cadastrar candidato</h1>
        <p className="mt-3 leading-6 text-slate-600">
          Preencha os dados manualmente ou use um PDF apenas para sugerir nome, e-mail e telefone.
        </p>
      </div>

      <div hidden={pendingCandidate !== null}>
        <CandidateForm
          backendError={creationError}
          backendFieldErrors={backendFieldErrors}
          onExtractResume={extractResume}
          onValidSubmit={reviewCandidate}
        />
      </div>

      {pendingCandidate && (
        <CandidateConfirmation
          candidate={pendingCandidate}
          isSubmitting={isSubmitting}
          onBack={() => setPendingCandidate(null)}
          onConfirm={() => void confirmCandidate()}
        />
      )}
    </section>
  );
}
