import { zodResolver } from '@hookform/resolvers/zod';
import { useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { ApiRequestError, type ResumeExtraction } from '../api/types';
import { candidateFormSchema, type CandidateFormValues } from '../schemas/candidate';

type CandidateFormProps = {
  backendError: string | null;
  backendFieldErrors: Partial<Record<keyof CandidateFormValues, string>>;
  onExtractResume: (file: File) => Promise<ResumeExtraction>;
  onValidSubmit: (values: CandidateFormValues) => void;
};

const defaultValues: CandidateFormValues = {
  fullName: '',
  email: '',
  phone: '',
  desiredPosition: '',
  professionalSummary: '',
};

function uploadErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError) return error.message;
  return 'Não foi possível extrair as sugestões do currículo. Tente novamente ou preencha manualmente.';
}

export function CandidateForm({
  backendError,
  backendFieldErrors,
  onExtractResume,
  onValidSubmit,
}: CandidateFormProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<CandidateFormValues>({
    defaultValues,
    mode: 'onBlur',
    resolver: zodResolver(candidateFormSchema),
  });

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;

    setIsExtracting(true);
    setExtractionError(null);

    try {
      const suggestions = await onExtractResume(file);
      (['fullName', 'email', 'phone'] as const).forEach((field) => {
        const suggestion = suggestions[field];
        if (suggestion !== null && getValues(field).trim() === '') {
          setValue(field, suggestion, { shouldDirty: true, shouldValidate: true });
        }
      });
    } catch (error) {
      setExtractionError(uploadErrorMessage(error));
    } finally {
      setIsExtracting(false);
    }
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit(onValidSubmit)} noValidate>
      <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-lg font-semibold">Preencher com currículo PDF</h2>
        <p id="pdf-help" className="mt-2 text-sm leading-6 text-slate-600">
          Envie um PDF de até 5 MiB. As sugestões não registram o candidato e podem ser editadas.
        </p>
        <label className="mt-4 inline-flex cursor-pointer items-center rounded-lg border border-teal-700 bg-white px-4 py-2 font-medium text-teal-800 hover:bg-teal-50 focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-teal-700">
          <span>{isExtracting ? 'Extraindo sugestões…' : 'Selecionar PDF'}</span>
          <input
            className="sr-only"
            type="file"
            accept="application/pdf,.pdf"
            aria-describedby={extractionError ? 'pdf-help pdf-error' : 'pdf-help'}
            disabled={isExtracting}
            onChange={handleFileChange}
          />
        </label>
        {isExtracting && (
          <p className="mt-3 text-sm text-slate-600" role="status">
            Lendo o currículo em memória…
          </p>
        )}
        {extractionError && (
          <p id="pdf-error" className="mt-3 text-sm text-red-700" role="alert">
            {extractionError}
          </p>
        )}
      </section>

      {backendError && (
        <p
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          {backendError}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium" htmlFor="fullName">
            Nome completo
          </label>
          <input
            id="fullName"
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            maxLength={150}
            aria-invalid={Boolean(errors.fullName || backendFieldErrors.fullName)}
            aria-describedby={
              errors.fullName || backendFieldErrors.fullName ? 'fullName-error' : undefined
            }
            {...register('fullName')}
          />
          {(errors.fullName?.message || backendFieldErrors.fullName) && (
            <p id="fullName-error" className="mt-1 text-sm text-red-700" role="alert">
              {errors.fullName?.message || backendFieldErrors.fullName}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            maxLength={254}
            aria-invalid={Boolean(errors.email || backendFieldErrors.email)}
            aria-describedby={errors.email || backendFieldErrors.email ? 'email-error' : undefined}
            {...register('email')}
          />
          {(errors.email?.message || backendFieldErrors.email) && (
            <p id="email-error" className="mt-1 text-sm text-red-700" role="alert">
              {errors.email?.message || backendFieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="phone">
            Telefone
          </label>
          <input
            id="phone"
            type="tel"
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            maxLength={30}
            aria-invalid={Boolean(errors.phone || backendFieldErrors.phone)}
            aria-describedby={errors.phone || backendFieldErrors.phone ? 'phone-error' : undefined}
            {...register('phone')}
          />
          {(errors.phone?.message || backendFieldErrors.phone) && (
            <p id="phone-error" className="mt-1 text-sm text-red-700" role="alert">
              {errors.phone?.message || backendFieldErrors.phone}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="desiredPosition">
            Área ou posição desejada
          </label>
          <input
            id="desiredPosition"
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            maxLength={150}
            aria-invalid={Boolean(errors.desiredPosition || backendFieldErrors.desiredPosition)}
            aria-describedby={
              errors.desiredPosition || backendFieldErrors.desiredPosition
                ? 'desiredPosition-error'
                : undefined
            }
            {...register('desiredPosition')}
          />
          {(errors.desiredPosition?.message || backendFieldErrors.desiredPosition) && (
            <p id="desiredPosition-error" className="mt-1 text-sm text-red-700" role="alert">
              {errors.desiredPosition?.message || backendFieldErrors.desiredPosition}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium" htmlFor="professionalSummary">
            Resumo profissional
          </label>
          <textarea
            id="professionalSummary"
            className="mt-2 min-h-32 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            maxLength={2000}
            aria-invalid={Boolean(
              errors.professionalSummary || backendFieldErrors.professionalSummary,
            )}
            aria-describedby={
              errors.professionalSummary || backendFieldErrors.professionalSummary
                ? 'professionalSummary-error'
                : undefined
            }
            {...register('professionalSummary')}
          />
          {(errors.professionalSummary?.message || backendFieldErrors.professionalSummary) && (
            <p id="professionalSummary-error" className="mt-1 text-sm text-red-700" role="alert">
              {errors.professionalSummary?.message || backendFieldErrors.professionalSummary}
            </p>
          )}
        </div>
      </div>

      <button
        className="w-full rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
        type="submit"
      >
        Revisar cadastro
      </button>
    </form>
  );
}
