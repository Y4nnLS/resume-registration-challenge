import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import App from '../App';

const candidate = {
  id: 7,
  fullName: 'Marina Ficticia da Silva',
  email: 'marina.ficticia@example.com',
  phone: null,
  desiredPosition: 'Desenvolvedora',
  professionalSummary: null,
  createdAt: '2026-10-02T12:00:00.000Z',
};

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function renderList() {
  return render(
    <MemoryRouter initialEntries={['/candidates']}>
      <App />
    </MemoryRouter>,
  );
}

describe('CandidateListPage', () => {
  it('lista candidatos e links para detalhes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response([candidate])));
    renderList();

    expect(await screen.findByText(candidate.fullName)).toBeInTheDocument();
    expect(screen.getByText(candidate.email)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: new RegExp(candidate.fullName) })).toHaveAttribute(
      'href',
      '/candidates/7',
    );
  });

  it('apresenta estado vazio', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response([])));
    renderList();

    expect(await screen.findByText('Ainda não há candidatos cadastrados.')).toBeInTheDocument();
  });

  it('apresenta erro da API e permite tentar novamente', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        response(
          { error: { code: 'INTERNAL_ERROR', message: 'Não foi possível concluir a operação.' } },
          500,
        ),
      )
      .mockResolvedValueOnce(response([candidate]));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderList();

    expect(await screen.findByText('Não foi possível concluir a operação.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText(candidate.fullName)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
