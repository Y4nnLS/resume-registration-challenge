import { describe, expect, it } from 'vitest';
import { createCandidateSchema } from '../../src/validators/candidate.schema.js';

describe('candidate validation', () => {
  it('accepts a valid candidate', () => {
    expect(
      createCandidateSchema.parse({
        fullName: 'Candidata Exemplo',
        email: 'candidata@example.com',
        phone: '41999999999',
        desiredPosition: 'Desenvolvimento backend',
        professionalSummary: 'Resumo profissional fictício.',
      }),
    ).toMatchObject({ fullName: 'Candidata Exemplo', email: 'candidata@example.com' });
  });

  it('rejects required or invalid fields', () => {
    expect(createCandidateSchema.safeParse({ fullName: '', email: 'invalid-email' }).success).toBe(
      false,
    );
  });

  it('trims values and normalizes empty optional fields to null', () => {
    expect(
      createCandidateSchema.parse({
        fullName: '  Candidata Exemplo  ',
        email: '  candidata@example.com ',
        phone: ' ',
        desiredPosition: null,
      }),
    ).toEqual({
      fullName: 'Candidata Exemplo',
      email: 'candidata@example.com',
      phone: null,
      desiredPosition: null,
      professionalSummary: null,
    });
  });
});
