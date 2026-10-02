import type { CreateCandidateInput } from '../api/types';

type CandidateConfirmationProps = {
  candidate: CreateCandidateInput;
  isSubmitting: boolean;
  onBack: () => void;
  onConfirm: () => void;
};

const labels: Array<[keyof CreateCandidateInput, string]> = [
  ['fullName', 'Nome completo'],
  ['email', 'E-mail'],
  ['phone', 'Telefone'],
  ['desiredPosition', 'Área ou posição desejada'],
  ['professionalSummary', 'Resumo profissional'],
];

export function CandidateConfirmation({
  candidate,
  isSubmitting,
  onBack,
  onConfirm,
}: CandidateConfirmationProps) {
  return (
    <section aria-labelledby="confirmation-title" className="space-y-6">
      <div>
        <p className="text-sm font-medium text-teal-700">Confirmação</p>
        <h2 id="confirmation-title" className="mt-1 text-2xl font-semibold tracking-tight">
          Revise os dados antes de cadastrar
        </h2>
      </div>
      <dl className="divide-y divide-slate-200 rounded-xl border border-slate-200">
        {labels.map(([field, label]) => (
          <div key={field} className="px-4 py-3">
            <dt className="text-sm font-medium text-slate-600">{label}</dt>
            <dd className="mt-1 whitespace-pre-wrap text-slate-900">
              {candidate[field] ?? 'Não informado'}
            </dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
          type="button"
          disabled={isSubmitting}
          onClick={onBack}
        >
          Voltar para editar
        </button>
        <button
          className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:bg-teal-500"
          type="button"
          disabled={isSubmitting}
          onClick={onConfirm}
        >
          {isSubmitting ? 'Cadastrando…' : 'Confirmar cadastro'}
        </button>
      </div>
    </section>
  );
}
