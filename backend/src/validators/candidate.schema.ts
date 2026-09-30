import { z } from 'zod';

const text = () => z.string({ error: 'Informe um texto válido.' }).trim();
const optionalText = (maximum: number) =>
  text()
    .max(maximum, `Use no máximo ${maximum} caracteres.`)
    .nullish()
    .transform((value) => value || null);

export const createCandidateSchema = z.strictObject(
  {
    fullName: text().min(1, 'Informe o nome completo.').max(150, 'Use no máximo 150 caracteres.'),
    email: text()
      .min(1, 'Informe o e-mail.')
      .max(254, 'Use no máximo 254 caracteres.')
      .email('Informe um e-mail válido.'),
    phone: optionalText(30),
    desiredPosition: optionalText(150),
    professionalSummary: optionalText(2000),
  },
  { error: 'Envie um objeto com apenas os campos permitidos.' },
);
export const candidateIdSchema = z
  .string()
  .regex(/^[1-9]\d*$/)
  .transform(Number)
  .pipe(z.int().positive().max(2147483647));
export type CreateCandidateRequest = z.input<typeof createCandidateSchema>;
export type CreateCandidateData = z.output<typeof createCandidateSchema>;
