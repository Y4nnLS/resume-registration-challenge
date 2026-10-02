import { z } from 'zod';
import type { CreateCandidateInput } from '../api/types';

const optionalText = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum, 'Use no máximo ' + maximum + ' caracteres.');

export const candidateFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Informe o nome completo.')
    .max(150, 'Use no máximo 150 caracteres.'),
  email: z
    .string()
    .trim()
    .min(1, 'Informe o e-mail.')
    .max(254, 'Use no máximo 254 caracteres.')
    .email('Informe um e-mail válido.'),
  phone: optionalText(30),
  desiredPosition: optionalText(150),
  professionalSummary: optionalText(2000),
});

export type CandidateFormValues = z.infer<typeof candidateFormSchema>;

export function toCandidateInput(values: CandidateFormValues): CreateCandidateInput {
  const optionalValue = (value: string) => value.trim() || null;

  return {
    fullName: values.fullName.trim(),
    email: values.email.trim(),
    phone: optionalValue(values.phone),
    desiredPosition: optionalValue(values.desiredPosition),
    professionalSummary: optionalValue(values.professionalSummary),
  };
}
