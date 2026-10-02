import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import App from '../App';

const candidate = {
  id: 7,
  fullName: 'Marina Ficticia da Silva',
  email: 'marina.ficticia@example.com',
  phone: '(41) 99999-1234',
  desiredPosition: 'Desenvolvedora',
  professionalSummary: 'Resumo profissional fictício.',
  createdAt: '2026-10-02T12:00:00.000Z',
};

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/candidates/7']}>
      <App />
    </MemoryRouter>,
  );
}

describe('CandidateDetailPage', () => {
  it('apresenta os dados retornados do candidato', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(candidate)));
    renderDetail();

    expect(await screen.findByRole('heading', { name: candidate.fullName })).toBeInTheDocument();
    expect(screen.getByText(candidate.email)).toBeInTheDocument();
    expect(screen.getByText(candidate.phone)).toBeInTheDocument();
    expect(screen.getByText(candidate.professionalSummary)).toBeInTheDocument();
  });

  it('apresenta estado de candidato não encontrado', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          response(
            { error: { code: 'CANDIDATE_NOT_FOUND', message: 'Candidato não encontrado.' } },
            404,
          ),
        ),
    );
    renderDetail();

    expect(
      await screen.findByRole('heading', { name: 'Candidato não encontrado' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para candidatos' })).toHaveAttribute(
      'href',
      '/candidates',
    );
  });
});
