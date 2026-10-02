# Cadastro de candidatos — desafio técnico CIEE/PR

Aplicação full-stack em desenvolvimento para cadastro e consulta de candidatos, com
preenchimento manual ou auxílio da leitura de currículo em PDF.

## Estado atual

A fundação e as Issues #3, #5 e #7 estão implementadas. O backend oferece cadastro e
consulta de candidatos, extração de sugestões de currículo PDF, repository SQL Server, scripts
de setup/seed, validação Zod, Swagger e testes backend. O frontend oferece cadastro manual e
assistido por PDF, confirmação explícita, listagem e detalhe de candidatos. As validações
automatizadas e manuais da Issue #7 foram concluídas com sucesso. As Issues implementadas
aguardam revisão, commit e PR. O backend
precisa de SQL Server configurado para iniciar.

O SQL Server 2022 foi validado localmente via Docker Desktop, com bancos e logins
separados para desenvolvimento e integração. A extração de PDF é local, inteiramente em
memória, sem OCR, persistência de arquivos ou alteração de SQL/schema.

## Stack e versões

| Tecnologia                           | Versão                 |
| ------------------------------------ | ---------------------- |
| Node.js usado na validação           | 24.19.0                |
| npm usado na validação               | 10.2.0                 |
| TypeScript — frontend e backend      | 5.9.3                  |
| React / React DOM                    | 19.3.0                 |
| Vite / plugin React                  | 8.3.1 / 6.1.1          |
| React Router                         | 8.4.0                  |
| React Hook Form / resolvers / Zod    | 7.89.0 / 5.9.1 / 4.6.5 |
| Tailwind CSS / plugin Vite           | 4.3.3                  |
| Express                              | 5.2.1                  |
| tsx — desenvolvimento do backend     | 4.23.15                |
| ESLint / typescript-eslint           | 10.11.0 / 8.71.0       |
| Prettier                             | 3.9.9                  |
| mssql / Zod                          | 12.7.2 / 4.6.5         |
| pdfjs-dist / Multer                  | 6.3.289 / 2.4.0        |
| swagger-ui-express                   | 5.0.1                  |
| Vitest / Testing Library / Supertest | 5.0.3 / 16.3.3 / 7.3.0 |

Dependências diretas são fixadas nos respectivos `package.json`; cada aplicação possui
seu próprio `package-lock.json`. Na revisão final, `multer@2.4.0`,
`pdfjs-dist@6.3.289` e `@types/multer@2.3.0` foram mantidos com versões exatas no
backend. O TypeScript 5.9.3 foi escolhido dentro da faixa de compatibilidade declarada
pelo typescript-eslint, atendendo à decisão de manter 5.x.

## Pré-requisitos

- Node.js 24.19.0 ou atualização posterior da linha 24.x, com npm.
- Git e um navegador atualizado.
- Docker Desktop instalado e em execução, configurado para containers Linux, com a porta
  local 1433 disponível para o SQL Server 2022.
- VS Code é recomendado, mas não obrigatório.

O ambiente principal é Windows, com comandos em PowerShell. Docker fornece somente o
SQL Server local; frontend e backend executam pelo npm no host. Não é necessário instalar
SQL Server ou SQL Server Management Studio (SSMS) no Windows: o provisionamento usa o
`sqlcmd` incluído no container.

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

Configure o SQL Server e o arquivo `backend/.env` conforme as próximas seções antes
de iniciar o backend. O frontend pode ser executado independentemente.

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
qualquer serviço externo. O script de desenvolvimento observa somente `backend/src`. Esse
limite foi adotado após a validação manual identificar que eventos do worker do `pdfjs-dist` em
`node_modules` reiniciavam indevidamente o backend durante a primeira extração; não era uma
falha do proxy nem do frontend. Para consultar pelo PowerShell:

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:3000/health
```

Em outro terminal, também a partir da raiz:

```powershell
cd frontend
npm run dev
```

Abra <http://127.0.0.1:5173>. Durante o desenvolvimento, o Vite encaminha chamadas
relativas a `/api` para `http://127.0.0.1:3000`; frontend e backend continuam como
processos npm independentes no host. Os dois servidores escutam somente no endereço local.
Encerre cada processo com `Ctrl+C`.

### SQL Server local via Docker

Na primeira configuração, obtenha a imagem e crie um volume persistente. O nome de volume
abaixo é uma sugestão para reproduzir o ambiente:

```powershell
docker pull mcr.microsoft.com/mssql/server:2022-latest
docker volume create resume-registration-sql-data
```

Defina uma senha administrativa forte no prompt e suba o container. O comando passa a
senha por variável de ambiente, sem escrevê-la no comando ou em um arquivo versionado:

```powershell
$sqlAdminCredential = [PSCredential]::new('sa', (Read-Host 'Senha local para sa' -AsSecureString))
try {
    $env:MSSQL_SA_PASSWORD = $sqlAdminCredential.GetNetworkCredential().Password
    docker run --detach --name resume-registration-sql `
        --env ACCEPT_EULA=Y --env MSSQL_PID=Developer --env MSSQL_SA_PASSWORD `
        --publish 127.0.0.1:1433:1433 `
        --volume resume-registration-sql-data:/var/opt/mssql `
        mcr.microsoft.com/mssql/server:2022-latest
} finally {
    Remove-Item Env:MSSQL_SA_PASSWORD -ErrorAction SilentlyContinue
    Remove-Variable sqlAdminCredential
}
```

O comando aceita a licença da imagem e usa a edição Developer. A porta 1433 do host
é encaminhada à porta 1433 do container, e `/var/opt/mssql` fica no volume persistente.
Confira `docker logs --tail 30 resume-registration-sql` e aguarde a mensagem de que o
SQL Server está pronto para conexões. Para iniciar novamente um container já criado,
use `docker start resume-registration-sql`; não repita `docker run`. Preserve o volume
para manter os dados.

### Bancos e logins dedicados

Abra o `sqlcmd` dentro do container. Ele solicitará a senha administrativa; `-C` aceita
o certificado autossinado deste ambiente local:

```powershell
docker exec -it resume-registration-sql /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -C -b
```

No primeiro provisionamento, execute o bloco abaixo nessa sessão. Substitua os dois
placeholders de senha apenas localmente, usando senhas distintas para `resume_app` e
`resume_test`. Não salve o bloco preenchido na documentação ou em scripts versionados.

```sql
USE master;
GO
IF DB_ID(N'ResumeRegistration') IS NULL
    CREATE DATABASE [ResumeRegistration];
GO
IF DB_ID(N'ResumeRegistration_test') IS NULL
    CREATE DATABASE [ResumeRegistration_test];
GO
CREATE LOGIN [resume_app]
    WITH PASSWORD = N'<senha-local-desenvolvimento>',
         DEFAULT_DATABASE = [ResumeRegistration], CHECK_POLICY = OFF;
CREATE LOGIN [resume_test]
    WITH PASSWORD = N'<senha-local-integracao>',
         DEFAULT_DATABASE = [ResumeRegistration_test], CHECK_POLICY = OFF;
GO
USE [ResumeRegistration];
CREATE USER [resume_app] FOR LOGIN [resume_app];
ALTER ROLE db_datareader ADD MEMBER [resume_app];
ALTER ROLE db_datawriter ADD MEMBER [resume_app];
GRANT CREATE TABLE TO [resume_app];
GRANT ALTER ON SCHEMA::dbo TO [resume_app];
GO
USE [ResumeRegistration_test];
CREATE USER [resume_test] FOR LOGIN [resume_test];
ALTER ROLE db_datareader ADD MEMBER [resume_test];
ALTER ROLE db_datawriter ADD MEMBER [resume_test];
GRANT CREATE TABLE TO [resume_test];
GRANT ALTER ON SCHEMA::dbo TO [resume_test];
GO
```

`CHECK_POLICY = OFF` foi escolhido apenas para simplificar as credenciais deste ambiente
local de desafio e não é uma recomendação para produção.

Digite `EXIT` para sair. Cada login fica mapeado somente ao seu banco, sem `sysadmin`.
Leitura/escrita atendem à aplicação e aos testes; `CREATE TABLE` e alteração do schema
`dbo` permitem executar o setup inicial e a preparação da suíte SQL.

O arquivo `backend/database/00-create-database.sql` também contém a criação condicional
do banco de desenvolvimento; para teste, o nome é `ResumeRegistration_test`. A referência
ao SSMS no comentário desse script é histórica: ele pode ser executado com `sqlcmd`.
Os comandos acima já criam os dois bancos, sem exigir edição dos scripts versionados.

### Variáveis de ambiente

Dentro de `backend/`, crie a configuração local somente se `.env` ainda não existir:

```powershell
Copy-Item .env.example .env
```

Se `.env` já existir, preserve seus valores ao ajustar a configuração. Use `DB_SERVER=127.0.0.1`,
`DB_PORT=1433`, `DB_NAME=ResumeRegistration` e `DB_USER=resume_app`; preencha `DB_PASSWORD`
com a senha desse login. Descomente todas as variáveis `TEST_DB_*` do exemplo e configure
o mesmo host/porta, `TEST_DB_NAME=ResumeRegistration_test`, `TEST_DB_USER=resume_test` e
`TEST_DB_PASSWORD` com a senha de integração. Neste ambiente local, mantenha
`DB_ENCRYPT=true`, `DB_TRUST_SERVER_CERTIFICATE=true` e os equivalentes `TEST_DB_*`.

`PORT` aceita um inteiro entre 1 e 65535 e usa 3000 por padrão. Os scripts `dev`, `start`,
`db:setup`, `db:seed` e `test:db` carregam `.env` pelo recurso nativo do Node.js; variáveis
já definidas no processo têm precedência. As credenciais reais da aplicação ficam somente
no `backend/.env`, ignorado pelo Git; `.env.example` mantém placeholders.

| Variável                      | Uso                                                                              |
| ----------------------------- | -------------------------------------------------------------------------------- |
| `DB_SERVER`                   | Host SQL Server, por exemplo `127.0.0.1`.                                        |
| `DB_PORT`                     | Porta TCP fixa, padrão `1433`; use a porta realmente configurada.                |
| `DB_NAME`                     | Banco, por exemplo `ResumeRegistration`.                                         |
| `DB_USER` / `DB_PASSWORD`     | Login SQL dedicado e senha local.                                                |
| `DB_ENCRYPT`                  | `true` ou `false`; padrão `true`.                                                |
| `DB_TRUST_SERVER_CERTIFICATE` | Padrão `false`; o exemplo usa `true` somente para certificado autossinado local. |

Não altere as configurações globais do sistema. Não versionar `.env`, senhas ou dados pessoais.
O frontend usa chamadas relativas a `/api` pelo client explícito e pelo proxy local do Vite.
Não há dependência de `dotenv`: o Node carrega o ambiente.

### Schema e seed

Com os bancos e logins provisionados e o `.env` preenchido, execute dentro de `backend/`:

```powershell
npm run db:setup
npm run db:seed
```

`db:setup` aplica `01-create-candidates.sql` no banco selecionado por `DB_NAME`. O banco deve
existir previamente. O script é idempotente e não apaga dados nem modifica tabelas existentes.
Trata-se de um script inicial versionado, sem mecanismo automático para futuras alterações de schema.

O seed insere três candidatos fictícios, com e-mails `example.com`, somente se `dbo.Candidates`
estiver vazia. Caso já existam registros, informa `skipped` e não altera nada. A transação impede
duplicação por execuções simultâneas. Não existe regra de unicidade de e-mail na aplicação ou tabela.

### API e Swagger

Abra <http://127.0.0.1:3000/api-docs/> após iniciar o backend. A especificação OpenAPI 3.0.3
fica em `backend/src/docs/openapi.ts`; o Swagger permite executar os endpoints abaixo.

| Operação                    | Sucesso                            | Erros principais        |
| --------------------------- | ---------------------------------- | ----------------------- |
| `POST /api/candidates`      | 201, candidato e header `Location` | 400, 500                |
| `GET /api/candidates`       | 200, array (ou `[]`)               | 500                     |
| `GET /api/candidates/:id`   | 200, candidato                     | 400, 404, 500           |
| `POST /api/resumes/extract` | 200, sugestões de currículo        | 400, 413, 415, 422, 500 |

O cadastro recebe `fullName` (150) e `email` válido (254), obrigatórios; `phone` (30),
`desiredPosition` (150) e `professionalSummary` (2000) são opcionais. Texto é aparado nas
extremidades; opcionais omitidos, vazios ou nulos tornam-se `null`. Campos desconhecidos são
rejeitados. E-mail mantém sua capitalização. `id` e `createdAt` são gerados no banco.

As respostas incluem todos os campos, `id` inteiro positivo e `createdAt` ISO 8601 UTC.
A listagem não tem paginação e ordena por `createdAt DESC, id DESC`. Erros seguem
`{ "error": { "code": "...", "message": "...", "details": [...] } }`, com `details` opcional.

`/health` continua sendo apenas liveness. A inicialização conecta um pool SQL antes de
abrir HTTP; o pool é reutilizado e fechado no encerramento. SQL indisponível na inicialização
impede o servidor de iniciar; falhas durante requisições retornam erro sanitizado.

### Extração de currículo PDF

`POST /api/resumes/extract` recebe um único arquivo no campo multipart `file`. O upload é
processado exclusivamente em memória, tem limite exato de 5 MiB (`5 * 1024 * 1024` bytes)
e exige MIME `application/pdf` e a assinatura inicial `%PDF-`. Arquivos acima do limite
retornam 413 `PAYLOAD_TOO_LARGE`; conteúdo não-PDF retorna 415 `UNSUPPORTED_FILE_TYPE`.
O arquivo não é salvo em diretório, banco ou serviço externo.

O endpoint usa `pdfjs-dist`, a distribuição oficial do Mozilla PDF.js, escolhida por suportar
Node 24, TypeScript e ESM e por aceitar bytes em memória. Não há OCR. O texto é usado somente
para sugestões conservadoras de `fullName`, `email` e `phone`, sempre como `string` ou `null`;
texto bruto não é retornado e nenhum candidato é criado. E-mail precisa ser plausível e
compatível com a regra do cadastro; telefone brasileiro é normalizado; nome é procurado nas
linhas iniciais, ignorando títulos e contatos evidentes. Essas heurísticas não prometem
precisão e campos não identificados retornam `null`.

PDF válido sem texto utilizável retorna 422 `PDF_TEXT_UNAVAILABLE`; PDF ilegível retorna
422 `INVALID_PDF`; a ausência do campo `file` retorna 400 `RESUME_FILE_REQUIRED`. O arquivo
[fictício de demonstração](samples/sample-resume.pdf) contém nome, e-mail e telefone de exemplo.

A validação concluída da Issue #5 registrou `npm test` com 22/22 testes aprovados e
`npm run test:db` com 2/2. No Swagger, o PDF fictício retornou HTTP 200 com
`Marina Ficticia da Silva`, `marina.ficticia@example.com` e `(41) 99999-1234`.
Um arquivo `.txt` retornou HTTP 415 `UNSUPPORTED_FILE_TYPE` no formato padronizado da API.

## Qualidade e build

Execute dentro de **cada** aplicação (`frontend/` e `backend/`):

```powershell
npm run format:check
npm run lint
npm run typecheck
npm run build
```

Para aplicar a formatação, use `npm run format`. ESLint verifica o código e Prettier
padroniza a formatação; a configuração de Prettier é compartilhada na raiz. No frontend,
`npm test` executa dez testes focados nos fluxos de cadastro, PDF, lista e detalhe. Na
revisão de qualidade da Issue #9, os gates de ambos os projetos passaram: 10 testes no
frontend, 22 locais no backend e 2 de integração SQL.

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
- Abrir a página inicial, o cadastro, a lista e o detalhe em largura desktop e móvel.
- Cadastrar manualmente, revisar antes de confirmar e conferir o redirecionamento ao detalhe.
- Enviar o PDF fictício, editar as sugestões e confirmar que uma falha de extração mantém o formulário.
- Acessar um endereço inexistente, como `/nao-existe`, e usar “Voltar ao início”.
- Conferir ausência de erros no console do navegador.

A validação manual da Issue #7 foi concluída com sucesso: navegação, cadastro manual,
confirmação e retorno à edição, lista, detalhe, rota 404, fluxo com PDF, preservação de e-mail
digitado, tratamento de PDF inválido e continuidade após falha foram verificados. Também foram
confirmados responsividade em largura mobile, foco visível por teclado e ausência de erros
inesperados no console.

### Testes backend

Dentro de `backend/`:

```powershell
npm test
npm run test:db
```

`npm test` executa 22 testes unitários e HTTP com Vitest/Supertest, sem conectar ao SQL Server.
Eles cobrem validação representativa, normalização de opcionais, criação e candidato ausente
no service, os três endpoints e o isolamento da configuração `TEST_DB_*`. O repository é
substituído nesses testes, portanto eles não representam validação do banco. Dez testes
representativos cobrem a extração PDF: serviço, heurísticas, campos ausentes, PDF sem texto,
sucesso HTTP no limite exato de 5 MiB, arquivo ausente, conteúdo não-PDF e excesso de tamanho.
`typecheck` também verifica testes e scripts; `build` continua emitindo somente `src/`.

`npm run test:db` é separado e **falha**, em vez de aparentar sucesso, se faltar configuração.
Use o banco exclusivo `ResumeRegistration_test` e o login `resume_test`, provisionados
conforme as seções anteriores, com todos os `TEST_DB_*` preenchidos no `.env`.
Nenhum `DB_*` serve como alternativa. A suíte aplica o schema no banco de teste;
esse usuário precisa executar o schema inicial, ler, inserir, atualizar e excluir.

A suíte SQL contém dois cenários: reaplicação do schema/seed sem duplicar dados e persistência
com consulta posterior, incluindo e-mail repetido. Ela valida o sufixo `_test` antes da conexão
e confirma `DB_NAME()` antes de qualquer escrita. A limpeza remove somente IDs criados pela
própria execução; não há `DROP`, `TRUNCATE` ou exclusão global.

A parametrização é verificada pela revisão do repository. Os dois testes SQL não
constituem uma prova de que todas as consultas são parametrizadas.

### Validação concluída da Issue #3

A validação real foi executada com sucesso no SQL Server 2022 via Docker Desktop,
usando o container `resume-registration-sql`, os dois bancos e os logins dedicados:

- `npm run db:setup` executado duas vezes com sucesso.
- `npm run db:seed`: primeira execução com `Seed: inserted`; segunda com
  `Seed: skipped: Candidates is not empty`.
- `npm run test:db`: 2/2 testes SQL passaram.
- Verificação manual: Swagger em `/api-docs` abriu; `POST /api/candidates` retornou
  201 e `Location`; listagem e consulta por ID retornaram o candidato.
- Payload inválido retornou 400 `VALIDATION_ERROR`; candidato inexistente retornou
  404 `CANDIDATE_NOT_FOUND`.
- Após reiniciar o backend, o candidato continuou disponível, confirmando a persistência
  no SQL Server.

O quality gate da Issue #3 passou: `npm run format:check`, `npm run lint`,
`npm run typecheck`, `npm test` (12/12), `npm run test:db` (2/2) e `npm run build`.

## Estrutura e arquitetura

```text
frontend/
  src/main.tsx       Inicialização do React e BrowserRouter
  src/App.tsx        Rotas e apresentação inicial
  src/index.css     Integração Tailwind
  vite.config.ts    Plugins e servidores locais
backend/
  src/app.ts        Composição HTTP e Swagger, sem conexão ao importar
  src/server.ts     Inicialização HTTP, pool e encerramento
  src/config/       Ambiente e pool SQL
  src/routes/       Rotas de candidatos e currículos
  src/controllers/  Adaptação HTTP e validação na fronteira
  src/services/     Casos de uso e extração PDF
  src/repositories/ SQL parametrizado
  src/validators/   Schemas Zod e tipos inferidos de entrada
  src/models/       Contrato de saída
  src/errors/       Erro esperado da aplicação
  src/middlewares/  Tratamento centralizado de erros
  src/docs/         OpenAPI
  database/         Scripts SQL de criação e seed
  scripts/          Execução de setup/seed
  tests/            Testes unitários, HTTP e SQL separados
  .env.example      Configuração de desenvolvimento e testes
.ai/                Contexto enxuto para agentes
AGENTS.md           Mapa do projeto e das instruções
DESENVOLVIMENTO.md   Registro real do processo e uso de IA
```

Cada aplicação tem configurações próprias de TypeScript e ESLint, manifesto e lockfile.
Não há workspaces. No backend, separar a aplicação da abertura da porta permite
importá-la nos testes sem iniciar um servidor automaticamente.

A arquitetura de negócio implementada é:

```text
Route → Controller → Service → Repository → SQL Server
```

O repository usa `mssql` com parâmetros e recebe um pool explícito. Os services recebem
um repository tipado pela implementação, permitindo testes sem framework de injeção ou
interfaces adicionais. Controllers validam entradas com schemas Zod; não há middleware
genérico de validação. A especificação OpenAPI é pequena e mantida manualmente.

Para PDF, a rota delega ao controller e ao serviço de extração; não há repository, entidade
ou persistência. O currículo é descartado depois da requisição.

## Problemas comuns

- **Manifesto não encontrado:** execute npm dentro de `frontend/` ou `backend/`.
- **Porta ocupada:** encerre o outro processo ou configure outra `PORT` para o backend.
  O Vite informa o conflito nas portas 5173/4173, sem escolher outra silenciosamente.
- **Versão de Node incompatível:** confirme `node --version`; o projeto declara suporte à linha 24.x,
  a partir de 24.19.0.
- **Build ausente ao executar `npm start`:** rode `npm run build` primeiro no backend.
- **Falha de rede ao instalar:** confira acesso ao registro npm e eventuais restrições do ambiente.
- **Falha ao iniciar backend:** confira `DB_*`, Docker Desktop, o estado e os logs do container
  `resume-registration-sql`, a publicação da porta 1433, o login e seu mapeamento ao banco.
- **Tabela inexistente:** execute `db:setup` ou o script de schema no banco correto.
- **Erro de permissão no setup:** use a conta de provisionamento; não amplie privilégios de runtime sem necessidade.
- **Testes SQL abortados:** configure todos os `TEST_DB_*` de conexão; o banco deve existir e terminar em `_test`.
- **PDF rejeitado:** envie um único arquivo no campo `file`, com MIME `application/pdf`, assinatura
  inicial `%PDF-` e no máximo 5 MiB. PDFs digitalizados sem camada de texto retornam
  `PDF_TEXT_UNAVAILABLE`, pois OCR não faz parte do projeto.
- **Warning TLS local:** `[DEP0123] DeprecationWarning: Setting the TLS ServerName to an IP address...`
  ocorre nas conexões com `127.0.0.1` e TLS. Foi observado como não bloqueante nas validações;
  nenhuma alteração de código foi feita para ocultá-lo nesta tarefa.

## Processo e próximos passos

Consulte [DESENVOLVIMENTO.md](DESENVOLVIMENTO.md) para decisões, participação da IA,
ajustes solicitados pelo desenvolvedor e resultados de validação. [AGENTS.md](AGENTS.md)
direciona para os documentos específicos de contexto.

O desenvolvimento avança por Issues e planos aprovados. As Issues #3 e #5 estão implementadas
e validadas, aguardando revisão, commit e PR autorizados pelo desenvolvedor. A próxima entrega
tratará da interface de cadastro e consulta.
