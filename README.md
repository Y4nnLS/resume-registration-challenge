# Cadastro de candidatos — desafio técnico CIEE/PR

Aplicação full-stack em desenvolvimento para cadastro e consulta de candidatos, com
preenchimento manual ou auxílio da leitura de currículo em PDF.

## Estado atual

A Issue #1 prepara a fundação técnica: frontend React com navegação e estilos, backend
Express com `GET /health`, TypeScript, lint, formatação e build nos dois projetos.
A interface atual é apenas uma apresentação de aplicação em desenvolvimento.

Cadastro, consulta, banco de dados, formulários, extração de PDF e Swagger ainda não
estão implementados. O backend não depende de SQL Server para iniciar nesta etapa.

## Stack e versões

| Tecnologia                       | Versão           |
| -------------------------------- | ---------------- |
| Node.js usado na validação       | 24.19.0          |
| npm usado na validação           | 10.2.0           |
| TypeScript — frontend e backend  | 5.9.3            |
| React / React DOM                | 19.3.0           |
| Vite / plugin React              | 8.3.1 / 6.1.1    |
| React Router                     | 8.4.0            |
| Tailwind CSS / plugin Vite       | 4.3.3            |
| Express                          | 5.2.1            |
| tsx — desenvolvimento do backend | 4.23.15          |
| ESLint / typescript-eslint       | 10.11.0 / 8.71.0 |
| Prettier                         | 3.9.9            |

Dependências diretas são fixadas nos respectivos `package.json`; cada aplicação possui
seu próprio `package-lock.json`. O TypeScript 5.9.3 foi escolhido dentro da faixa
de compatibilidade declarada pelo typescript-eslint, atendendo à decisão de manter 5.x.

## Pré-requisitos

- Node.js 24.19.0 ou atualização posterior da linha 24.x, com npm.
- Git e um navegador atualizado.
- VS Code é recomendado, mas não obrigatório.

O ambiente principal é Windows. As ferramentas do projeto são instaladas localmente
em cada aplicação. Docker não é necessário.

## Instalação

Clone o repositório e instale as dependências de cada aplicação:

```powershell
git clone https://github.com/Y4nnLS/resume-registration-challenge.git
cd resume-registration-challenge
cd frontend
npm install
cd ../backend
npm install
cd ..
```

Para reproduzir exatamente as dependências dos lockfiles, use `npm ci` no lugar de
`npm install` dentro de cada projeto. Não há `package.json` ou instalação npm na raiz.

## Executar localmente

Em um terminal, a partir da raiz:

```powershell
cd backend
npm run dev
```

O backend responde em <http://127.0.0.1:3000/health>:

```json
{ "status": "ok" }
```

Essa resposta indica somente que o servidor HTTP está ativo; não verifica banco ou
qualquer serviço externo. Para consultar pelo PowerShell:

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:3000/health
```

Em outro terminal, também a partir da raiz:

```powershell
cd frontend
npm run dev
```

Abra <http://127.0.0.1:5173>. Os dois servidores escutam somente no endereço local.
Encerre cada processo com `Ctrl+C`.

### Variáveis de ambiente

O backend funciona sem `.env`, usando a porta 3000. Para personalizá-la, dentro de `backend/`:

```powershell
Copy-Item .env.example .env
```

Edite `PORT` no arquivo local e reinicie o servidor. Aceita-se um inteiro entre 1 e 65535.
Os scripts `dev` e `start` carregam `.env` pelo recurso nativo do Node.js; variáveis já
definidas no processo têm precedência. O arquivo local é ignorado pelo Git.

Não há credenciais ou variáveis de banco nesta fundação. O frontend ainda não utiliza
variáveis próprias nem faz chamadas ao backend.

## Qualidade e build

Execute dentro de **cada** aplicação (`frontend/` e `backend/`):

```powershell
npm run format:check
npm run lint
npm run typecheck
npm run build
```

Para aplicar a formatação, use `npm run format`. ESLint verifica o código e Prettier
padroniza a formatação; a configuração de Prettier é compartilhada na raiz.

Após o build do backend, execute dentro de `backend/`:

```powershell
npm start
```

Após o build do frontend, execute dentro de `frontend/`:

```powershell
npm run preview
```

O preview está disponível em <http://127.0.0.1:4173> e serve apenas para inspeção local
do build. Encerre o backend em desenvolvimento antes de iniciar sua versão compilada
na mesma porta. Os builds são gerados em `dist/` de cada projeto.

### Verificação funcional básica

- Consultar `/health` e confirmar HTTP 200 com `status: ok`.
- Abrir a página inicial, conferir legibilidade e estilos, inclusive em largura móvel.
- Acessar um endereço inexistente, como `/nao-existe`, e usar “Voltar ao início”.
- Conferir ausência de erros no console do navegador.

Não há suíte de testes automatizados nesta Issue: o comportamento se limita ao
bootstrap e à resposta estática de saúde. Testes de regras, endpoints e integração
serão adicionados com as funcionalidades correspondentes; não há cobertura declarada.

## Estrutura e arquitetura

```text
frontend/
  src/main.tsx       Inicialização do React e BrowserRouter
  src/App.tsx        Rotas e apresentação inicial
  src/index.css     Integração Tailwind
  vite.config.ts    Plugins e servidores locais
backend/
  src/app.ts        Composição do Express e GET /health
  src/server.ts     Porta e inicialização HTTP
  .env.example      Exemplo seguro de configuração
.ai/                Contexto enxuto para agentes
AGENTS.md           Mapa do projeto e das instruções
DESENVOLVIMENTO.md   Registro real do processo e uso de IA
```

Cada aplicação tem configurações próprias de TypeScript e ESLint, manifesto e lockfile.
Não há workspaces. No backend, separar a aplicação da abertura da porta permite
importá-la em testes futuros sem iniciar um servidor automaticamente.

A arquitetura de negócio planejada é:

```text
Route → Controller → Service → Repository → SQL Server
```

Essas camadas serão criadas conforme necessárias. A persistência futura utilizará
`mssql`, SQL parametrizado e SQL Server local com usuário SQL dedicado, sem ORM.
O PDF será processado somente em memória, preenchendo um formulário para revisão;
nenhum arquivo será persistido. Essas funcionalidades não fazem parte da entrega atual.

## Problemas comuns

- **Manifesto não encontrado:** execute npm dentro de `frontend/` ou `backend/`.
- **Porta ocupada:** encerre o outro processo ou configure outra `PORT` para o backend.
  O Vite informa o conflito nas portas 5173/4173, sem escolher outra silenciosamente.
- **Versão de Node incompatível:** confirme `node --version`; o projeto declara suporte à linha 24.x,
  a partir de 24.19.0.
- **Build ausente ao executar `npm start`:** rode `npm run build` primeiro no backend.
- **Falha de rede ao instalar:** confira acesso ao registro npm e eventuais restrições do ambiente.

## Processo e próximos passos

Consulte [DESENVOLVIMENTO.md](DESENVOLVIMENTO.md) para decisões, participação da IA,
ajustes solicitados pelo desenvolvedor e resultados de validação. [AGENTS.md](AGENTS.md)
direciona para os documentos específicos de contexto.

O desenvolvimento avança por Issues e planos aprovados. A próxima entrega funcional
definirá os contratos da API de candidatos e a integração com o banco; não é iniciada
automaticamente ao concluir esta fundação.
