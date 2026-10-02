import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-semibold">Página não encontrada</h1>
      <p className="mt-3 text-slate-600">Este endereço não está disponível.</p>
      <Link
        className="mt-5 inline-block font-medium text-teal-800 underline underline-offset-4"
        to="/"
      >
        Voltar ao início
      </Link>
    </section>
  );
}
