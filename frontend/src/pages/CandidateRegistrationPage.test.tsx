import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import App from '../App';

const candidate = {
  id: 7,
  fullName: 'Marina Ficticia da Silva',
  email: 'marina.ficticia@example.com',
  phone: null,
  desiredPosition: null,
  professionalSummary: null,
  createdAt: '2026-10-02T12:00:00.000Z',
};

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function renderRegistration() {
  return render(
    <MemoryRouter initialEntries={['/candidates/new']}>
      <App />
    </MemoryRouter>,
  );
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Nome completo'), candidate.fullName);
  await user.type(screen.getByLabelText('E-mail'), candidate.email);
}

describe('CandidateRegistrationPage', () => {
  it('exibe validação e não abre a confirmação para formulário inválido', async () => {
    vi.stubGlobal('fetch', vi.fn());
    const user = userEvent.setup();
    renderRegistration();

    await user.click(screen.getByRole('button', { name: 'Revisar cadastro' }));

    expect(await screen.findByText('Informe o nome completo.')).toBeInTheDocument();
    expect(screen.getByText('Informe o e-mail.')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Revise os dados antes de cadastrar' }),
    ).not.toBeInTheDocument();
  });

  it('cria somente após confirmação explícita e navega ao detalhe no sucesso', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response(candidate, 201))
      .mockResolvedValueOnce(response(candidate));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderRegistration();

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: 'Revisar cadastro' }));

    expect(
      await screen.findByRole('heading', { name: 'Revise os dados antes de cadastrar' }),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Confirmar cadastro' }));

    expect(await screen.findByText('Cadastro realizado com sucesso.')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/candidates');
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ method: 'POST' });
  });

  it('apresenta VALIDATION_ERROR sem perder os dados', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      response(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dados inválidos.',
            details: [{ field: 'email', message: 'Informe um e-mail válido.' }],
          },
        },
        400,
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderRegistration();

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: 'Revisar cadastro' }));
    await user.click(await screen.findByRole('button', { name: 'Confirmar cadastro' }));

    expect(await screen.findByText('Dados inválidos.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome completo')).toHaveValue(candidate.fullName);
    expect(screen.getByLabelText('E-mail')).toHaveValue(candidate.email);
    expect(screen.getByText('Informe um e-mail válido.')).toBeInTheDocument();
  });

  it('preenche campos vazios com sugestões de PDF e mantém os valores editáveis', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      response({
        fullName: candidate.fullName,
        email: 'sugestao@example.com',
        phone: '(41) 99999-1234',
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderRegistration();

    await user.type(screen.getByLabelText('E-mail'), 'manual@example.com');
    const file = new File(['%PDF- exemplo'], 'curriculo.pdf', { type: 'application/pdf' });
    await user.upload(screen.getByLabelText('Selecionar PDF'), file);

    await waitFor(() => {
      expect(screen.getByLabelText('Nome completo')).toHaveValue(candidate.fullName);
    });
    expect(screen.getByLabelText('E-mail')).toHaveValue('manual@example.com');
    expect(screen.getByLabelText('Telefone')).toHaveValue('(41) 99999-1234');

    await user.clear(screen.getByLabelText('Telefone'));
    await user.type(screen.getByLabelText('Telefone'), '(41) 98888-1234');
    expect(screen.getByLabelText('Telefone')).toHaveValue('(41) 98888-1234');
  });

  it('apresenta falha de extração e preserva os valores já preenchidos', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        response(
          {
            error: {
              code: 'PDF_TEXT_UNAVAILABLE',
              message: 'O PDF não possui texto utilizável.',
            },
          },
          422,
        ),
      ),
    );
    const user = userEvent.setup();
    renderRegistration();

    await user.type(screen.getByLabelText('Nome completo'), candidate.fullName);
    await user.type(screen.getByLabelText('E-mail'), candidate.email);
    const file = new File(['%PDF- exemplo'], 'curriculo.pdf', { type: 'application/pdf' });
    await user.upload(screen.getByLabelText('Selecionar PDF'), file);

    expect(await screen.findByText('O PDF não possui texto utilizável.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome completo')).toHaveValue(candidate.fullName);
    expect(screen.getByLabelText('E-mail')).toHaveValue(candidate.email);
    expect(screen.getByRole('button', { name: 'Revisar cadastro' })).toBeEnabled();
  });
});
