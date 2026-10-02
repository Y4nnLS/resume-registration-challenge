# Registro de desenvolvimento

## 1. Organização e execução do trabalho

Organizei o desafio em entregas menores: fundação técnica, API e banco de dados, extração
de currículo, frontend, qualidade e documentação. Meu objetivo foi manter o projeto simples,
com decisões que eu consiga explicar e sem antecipar funcionalidades das próximas etapas.

Utilizei o ChatGPT no planejamento inicial e consolidei as decisões em um Prompt Mestre.
Para cada entrega, defini um fluxo de leitura da Issue, análise do repositório, apresentação
de plano e aprovação antes da implementação. Revisei as propostas e solicitei ajustes quando
não correspondiam ao escopo ou ao nível de complexidade que eu pretendia.

Na Issue #1, trabalhei na branch `feat/project-foundation`. O repositório inicialmente
continha apenas README e `.gitignore`. Após aprovar o plano, utilizei o Codex para implementar
a fundação: duas aplicações npm independentes, configurações de qualidade, ambiente inicial
e documentação. Essa etapa foi desenvolvida em 29 e 30/09/2026.

Mantive `AGENTS.md` como um mapa curto e os arquivos `.ai/` como contexto específico de
arquitetura, convenções, domínio, testes e workflow. Assim, as próximas tarefas podem
consultar as decisões existentes sem depender da releitura de toda a conversa.

Preservei o commit inicial e defini Conventional Commits para os próximos commits.
A publicação depende da minha autorização. Na revisão da fundação, ainda não havia
commit, push, abertura de PR ou merge das alterações da Issue #1; o PR dessa entrega
foi posteriormente identificado como #2.

Este documento acompanha o projeto em andamento. A fundação, a API de candidatos com
persistência SQL e a extração de sugestões de currículo PDF estão implementadas. A interface
de cadastro e consulta fica para as próximas Issues.

Na Issue #3, iniciei a API de candidatos e a persistência na branch `feat/candidate-api`.
Corrigi a referência inicial à Issue #2, que corresponde ao PR da fundação, e aprovei
o plano do Codex após revisar contratos, banco, validação e testes. Solicitei validação
simples, preservação das configurações existentes quando suficientes e testes SQL
exclusivamente com `TEST_DB_*`, sem usar credenciais de desenvolvimento como alternativa.
Solicitei ao Codex a redução da suíte para testes representativos, sem buscar cobertura
exaustiva: 12 testes locais e 2 testes SQL separados. Inicialmente, a integração real
ficou pendente por falta do banco de teste e de `TEST_DB_*`. Depois, configurei manualmente
o SQL Server via Docker Desktop, os bancos e os logins, e realizei as validações manuais
descritas na seção 5. O quality gate final passou, incluindo os 14 testes automatizados.
A Issue #3 está implementada e validada, aguardando apenas revisão, commit e PR.

Na Issue #5, aprovei um plano restrito ao backend para receber um currículo PDF e retornar
sugestões editáveis de nome, e-mail e telefone, sem cadastrar candidatos. Solicitei leitura
em memória, limite exato de 5 MiB, ausência de OCR, sem banco ou filesystem e no máximo dez
testes novos. Antes da instalação, o Codex confirmou as versões estáveis compatíveis com o
Node 24 e TypeScript/ESM do projeto: `pdfjs-dist@6.3.289`, `multer@2.4.0` e
`@types/multer@2.3.0`. O Codex implementou o endpoint, o PDF fictício e dez testes focados;
o quality gate passou, com 22 testes locais e 2 SQL. Também concluí a validação manual pelo
Swagger com o PDF fictício e com um arquivo inválido, conforme registrado na seção 5.

## 2. Principais decisões técnicas

| Decisão                                           | Motivo e aplicação nesta etapa                                                                                                                                                                                                |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dois projetos npm, sem workspaces                 | Optei por separar `frontend/` e `backend/`, cada um com manifesto e lockfile próprios, mantendo instalação e execução compreensíveis.                                                                                         |
| React, TypeScript e Vite no frontend              | Mantive a stack definida para o desafio. Configurei, com auxílio do Codex, Router e Tailwind para comprovar navegação e estilos com uma interface mínima.                                                                     |
| Node.js, TypeScript e Express no backend          | Na fundação, mantive uma aplicação HTTP pequena com `GET /health`. Na Issue #3, o Codex implementou cadastro e consulta de candidatos conforme o plano aprovado.                                                              |
| Arquitetura em camadas proporcional ao projeto    | Defini o fluxo Route → Controller → Service → Repository → SQL Server, implementado na Issue #3 conforme a necessidade, sem abstrações genéricas.                                                                             |
| Separação entre `app.ts` e `server.ts`            | A composição do Express ficou separada da abertura da porta, permitindo importar a aplicação nos testes sem iniciar um servidor automaticamente.                                                                              |
| TypeScript 5.9.3 nos dois projetos                | Solicitei uma versão estável da linha 5.x para reduzir risco. O Codex confirmou a compatibilidade declarada com `typescript-eslint@8.71.0`, cuja faixa é `>=4.8.4 <6.1.0`, e verificou tipos e builds.                        |
| ESLint e Prettier com responsabilidades distintas | Adotei lint para análise de código e Prettier para formatação, com uma configuração de formatação compartilhada na raiz.                                                                                                      |
| Dependências somente quando necessárias           | Adiei bibliotecas até suas funcionalidades: Zod e `mssql` entraram na Issue #3; React Hook Form e PDF continuam para etapas futuras. O carregamento nativo de `.env` evitou `dotenv`; `tsx` é dependência de desenvolvimento. |
| SQL Server 2022 via Docker Desktop                | Optei por fornecer somente o banco em container, evitando uma instalação adicional de SQL Server/SSMS no Windows. Frontend e backend continuam executados pelo npm no host.                                                   |
| Suíte enxuta e banco de teste separado            | Mantive 12 testes locais e 2 SQL representativos. A integração usa exclusivamente `TEST_DB_*`, o banco `ResumeRegistration_test` e o login dedicado `resume_test`.                                                            |
| Extração PDF em memória                           | Na Issue #5, aprovei `pdfjs-dist` para texto de PDF e Multer somente para multipart em memória. O endpoint não persiste arquivos, não usa OCR e não altera SQL/schema.                                                        |
| Formulário único com sugestões não destrutivas    | Na Issue #7, aprovei React Hook Form, Zod e um client `fetch` explícito. Sugestões de PDF só preenchem campos vazios; valores digitados são preservados, e a persistência exige confirmação explícita.                        |

Também defini decisões de domínio e persistência para esta e as próximas entregas:

- SQL Server local via Docker Desktop, com `mssql`, SQL parametrizado e usuários SQL
  dedicados, sem ORM. Essa integração foi implementada e validada na Issue #3.
- Um único formulário e um único processo final de persistência para cadastro manual e
  cadastro auxiliado por PDF. A extração apenas sugerirá dados para revisão.
- PDF processado em memória e descartado, com limite de `5 * 1024 * 1024` bytes.
  Decidi não criar armazenamento de arquivos ou entidade de currículo, pois não são exigidos.
- E-mail sem unicidade, porque essa regra não faz parte do desafio. Os limites dos campos
  estão registrados em [.ai/domain.md](.ai/domain.md).
- Backend como autoridade final da validação, com validação também prevista no frontend
  para melhorar a experiência. Não acrescentei autenticação ou estado global; o uso de
  Docker ficou limitado ao SQL Server local, sem Docker Compose.
- A extração de PDF retorna somente sugestões nulas ou textuais de nome, e-mail e telefone.
  Adotei heurísticas simples e conservadoras: e-mail plausível, telefone brasileiro normalizado
  e nome nas linhas iniciais, sem inventar campos. O PDF sem texto utilizável retorna 422 e
  não afeta o caminho de cadastro manual.

Na configuração manual, utilizei a imagem `mcr.microsoft.com/mssql/server:2022-latest`,
o container `resume-registration-sql`, a porta 1433 do host encaminhada para a porta 1433
do container e um volume Docker persistente em `/var/opt/mssql`. Criei os bancos
`ResumeRegistration` e `ResumeRegistration_test`, com os logins SQL separados `resume_app`
para desenvolvimento e `resume_test` para integração. Fiz o provisionamento administrativo
com o `sqlcmd` do próprio container; não precisei de SSMS. Mantive as credenciais reais
da aplicação somente no `backend/.env`, ignorado pelo Git, e placeholders no `.env.example`.

## 3. Uso de inteligência artificial

### Ferramentas e modelos

- **ChatGPT (OpenAI) — GPT-5.6 Sol:** utilizei para planejamento, explicações, revisão e
  orientação, incluindo discussão arquitetural, organização do trabalho e revisão de prompts.
- **Codex (OpenAI) — GPT-6 Astra com Extra High:** utilizei inicialmente na Issue #3.
  Interrompi a execução após consumo excessivo de tokens e geração de uma suíte de 61 testes.
- **Codex (OpenAI) — GPT-5.6 Terra High:** retomei o trabalho com esse modelo, que reduziu
  a suíte para 14 testes representativos, conforme minha orientação, e concluiu a
  implementação e a revisão.

### Como utilizei a IA

Utilizei as respostas do ChatGPT para organizar requisitos, limites de escopo e critérios
que depois levei ao Codex. Com o Codex, pedi a leitura da Issue no GitHub, a inspeção dos
arquivos existentes e um plano antes de qualquer implementação.

Revisei os planos e aprovei ou solicitei alterações nas propostas. Tratei as sugestões
como material para análise, não como decisões definitivas. Depois da aprovação, utilizei
o Codex para criar os fontes e configurações, executar os checks e registrar os resultados.
Também utilizei seu auxílio para elaborar e revisar a documentação, incluindo este relato.

Minha participação concentrou-se na definição de escopo, decisões técnicas, revisão,
aprovação dos planos e solicitação de ajustes. Configurei manualmente o SQL Server/Docker
e realizei as validações manuais descritas na seção 5, além da verificação visual do frontend.
O código-fonte e as configurações do projeto foram produzidos pelo Codex sob minha revisão
e aprovação; não atribuo a mim a escrita manual desse código. A configuração local dos
bancos, logins e credenciais foi minha.

Na Issue #5, utilizei o Codex para verificar a compatibilidade pública das dependências,
implementar a rota, o serviço, a documentação e os testes após minha aprovação do plano.
Defini o escopo, aprovei a biblioteca e o contrato, determinei o teto de dez testes e revisei
as decisões de processamento em memória, validação de assinatura e limites de tamanho.

### Exemplos de prompts e aproveitamento das respostas

Os exemplos abaixo são trechos curtos dos pedidos que orientaram o trabalho:

| Pedido                                                                                  | Como aproveitei a resposta ou o resultado                                                                                                    |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| “Antes de qualquer alteração, leia a Issue #1 no GitHub”                                | Usei a descrição, o checklist e os critérios de conclusão da Issue para avaliar se o plano estava dentro do escopo.                          |
| “Não implemente ainda funcionalidades de negócio”                                       | Limitei a entrega ao bootstrap das aplicações, endpoint de saúde, qualidade e documentação.                                                  |
| “Utilize uma versão estável e amplamente suportada do TypeScript 5.x”                   | Solicitei a revisão da proposta de TypeScript 6; a implementação utilizou 5.9.3 após conferir compatibilidade.                               |
| “Antes de realizar qualquer alteração, faça uma análise de recuperação do estado atual” | Após a interrupção do ambiente, pedi a inspeção do trabalho existente e aprovei a continuação sem recriar o projeto.                         |
| “Não faça commit nem push automaticamente”                                              | Mantive a revisão e a publicação das alterações sob minha autorização.                                                                       |
| “Reescreva o DESENVOLVIMENTO.md em primeira pessoa”                                     | Solicitei a reorganização deste documento como meu relato técnico, preservando a atribuição das implementações e verificações feitas com IA. |

## 4. Sugestões corrigidas, adaptadas ou descartadas

Durante o planejamento e a revisão, fiz os seguintes ajustes:

- **TypeScript 6:** solicitei a substituição da proposta pela linha 5.x, com confirmação
  de compatibilidade antes da instalação.
- **Contrato da API na fundação:** adiei a criação de `docs/api-contract.md` para a entrega
  da API de candidatos. Na Issue #3, o contrato foi documentado na especificação OpenAPI
  e disponibilizado pelo Swagger.
- **Documentação e estrutura antecipadas:** mantive ADRs condicionados a decisões que
  realmente precisem de registro e descartei a criação de diretórios ou camadas vazias.
- **Teste obrigatório de PORT inválida:** mantive a validação simples da variável, mas
  retirei esse cenário da lista de gates obrigatórios da fundação.
- **Convenção de comandos:** solicitei a padronização de toda a documentação em `npm`.
  O comando funciona normalmente no meu ambiente; uma restrição pontual encontrada na
  execução do agente não deveria se tornar requisito do projeto.
- **Voz deste documento:** pedi a troca do relato em terceira pessoa por uma narrativa
  minha, sem esconder a participação do Codex ou transformar código gerado com IA em
  suposta implementação manual.
- **Suíte excessiva na Issue #3:** interrompi a execução inicial com 61 testes e solicitei
  uma suíte proporcional ao desafio. Na retomada, o Codex a reduziu para 12 testes locais
  e 2 SQL, preservando cenários representativos.
- **Ambiente SQL local:** substituí a orientação inicial de instalar SQL Server e SSMS
  no Windows pelo Docker Desktop, administrando o banco com `sqlcmd` dentro do container.

Também houve uma correção técnica durante as verificações executadas pelo Codex.
Um conflito de porta mostrou que o callback de `listen` do Express recebia o erro,
mas o código ainda emitia uma mensagem de inicialização bem-sucedida. O Codex ajustou
o callback para anunciar sucesso somente quando não houvesse erro, preservando a mensagem
de falha e a saída com código 1. Essa correção foi pontual e não alterou a arquitetura.

## 5. Verificação da solução

### Verificações automatizadas da fundação

Pedi ao Codex que verificasse a instalação reproduzível, a qualidade do código e os builds.
Após a interrupção, solicitei a repetição dos checks em 30/09/2026. Os comandos estão
apresentados na convenção do projeto, com `npm`.

| Verificação executada pelo Codex | Frontend | Backend |
| -------------------------------- | -------- | ------- |
| `npm ci --no-fund`               | Passou   | Passou  |
| `npm run format:check`           | Passou   | Passou  |
| `npm run lint`                   | Passou   | Passou  |
| `npm run typecheck`              | Passou   | Passou  |
| `npm run build`                  | Passou   | Passou  |

A comparação dos hashes confirmou que manifests e lockfiles não foram alterados pela
reprodução da instalação. Os gates do backend foram repetidos com sucesso depois da
correção do log de inicialização.

Além desses checks, solicitei verificações pontuais de execução. O Codex confirmou:

- Backend em desenvolvimento e compilado: `GET /health` retornou HTTP 200 e o corpo
  exatamente `{"status":"ok"}`.
- Frontend em desenvolvimento, na porta 5173, e preview do build, na porta 4173:
  página inicial, rota inexistente e retorno ao início funcionando.
- No Chromium headless já disponível no ambiente: foco por teclado, aplicação dos estilos
  Tailwind e capturas em 1366 × 900 e 375 × 812, sem rolagem horizontal ou erros JavaScript
  capturados durante os fluxos verificados.
- Porta ocupada: erro compreensível, saída 1 e ausência da mensagem incorreta de sucesso
  após a correção.
- Documentação formatada com Prettier, arquivos JSON e UTF-8 válidos, links locais e regras
  de ignore revisados. A revisão também incluiu arquivos novos ainda não rastreados;
  `git diff --check` passou para as alterações rastreadas.

Decidi não criar testes artificiais para o bootstrap e a resposta estática de saúde.
Esses checks e verificações pontuais não constituem uma suíte E2E ou cobertura de testes.
Naquele momento, os testes de regras de negócio, endpoints e integração ficaram para
as funcionalidades correspondentes; a suíte da API foi adicionada e validada na Issue #3.

### Quality gate final da Issue #3

Com o SQL Server e o ambiente de integração configurados, o gate final do backend foi
executado com sucesso:

| Verificação            | Resultado                    |
| ---------------------- | ---------------------------- |
| `npm run format:check` | Passou                       |
| `npm run lint`         | Passou                       |
| `npm run typecheck`    | Passou                       |
| `npm test`             | 12/12 testes locais passaram |
| `npm run test:db`      | 2/2 testes SQL passaram      |
| `npm run build`        | Passou                       |

Mantive a suíte propositalmente enxuta: **14 testes automatizados representativos**,
sendo 12 locais e 2 de integração real com SQL Server. Os testes locais usam substitutos
do repository; a validação do banco é feita pela suíte SQL separada e pelas verificações
manuais abaixo.

### Verificações automatizadas da Issue #5

O Codex executou `npm run typecheck`, que passou, e `npm test`, com **22/22 testes locais**
aprovados: os 12 existentes e 10 novos da extração PDF. Esses novos testes cobrem o PDF
fictício, e-mail, telefone, nome, campos ausentes, PDF sem texto, endpoint, limite exato de
5 MiB, conteúdo não-PDF e arquivo acima do limite. `npm run format:check`, `npm run lint`,
`npm run test:db` (2/2) e `npm run build` também passaram.

Na validação manual, enviei `samples/sample-resume.pdf` pelo Swagger e recebi HTTP 200 com
`Marina Ficticia da Silva`, `marina.ficticia@example.com` e `(41) 99999-1234`. A revisão
posterior conferiu o conteúdo do PDF, o texto extraído pelo PDF.js e a resposta HTTP da
instância em execução; os três confirmaram o número de cinco dígitos antes do hífen. O registro
manual inicial com quatro dígitos foi uma divergência de anotação, não um defeito da extração.
Também enviei um arquivo `.txt` e recebi HTTP 415 `UNSUPPORTED_FILE_TYPE` no formato de erro
padronizado da API.

### Verificação manual da fundação

Em **30/09/2026**, realizei pessoalmente a verificação visual do frontend no navegador,
tanto em **modo de desenvolvimento** quanto no **preview do build**.

Verifiquei:

- A página inicial.
- A responsividade em largura aproximada de um dispositivo móvel.
- A apresentação de uma rota inexistente.
- O foco por teclado no link “Voltar ao início”.
- O retorno à página inicial ao pressionar Enter nesse link.
- O console do navegador durante a navegação.

Não encontrei erros no console nem problemas visuais durante essa verificação.
Essa foi minha verificação manual, separada das checagens e da inspeção em Chromium
realizadas pelo Codex.

### Configuração e validação manual da Issue #3

Após configurar o SQL Server no Docker Desktop, os dois bancos, os logins dedicados e
o `.env` local, confirmei os seguintes resultados:

- Executei `npm run db:setup` duas vezes com sucesso.
- Executei `npm run db:seed`: a primeira execução retornou `Seed: inserted` e a segunda,
  `Seed: skipped: Candidates is not empty`.
- Executei `npm run test:db`, com 2/2 testes SQL aprovados.
- Abri o Swagger em `/api-docs` corretamente.
- Cadastrei um candidato via `POST /api/candidates`, com resposta 201 e header `Location`.
- Consultei a listagem e o candidato por ID; ambos retornaram o candidato cadastrado.
- Enviei um payload inválido e recebi 400 `VALIDATION_ERROR`.
- Consultei um candidato inexistente e recebi 404 `CANDIDATE_NOT_FOUND`.
- Reiniciei o backend e confirmei que o candidato continuava disponível, comprovando
  a persistência no SQL Server.

Esses resultados encerraram a pendência de validação real da integração SQL da Issue #3.

### Implementação automatizada da Issue #7

Aprovei o plano para a interface React com o mesmo formulário para cadastro manual e assistido
por PDF. Mantive o client HTTP pequeno, estado local e o proxy do Vite para `/api`, sem Redux,
React Query, persistência local ou alteração do backend. Determinei que uma sugestão do PDF
somente poderia preencher um campo vazio; ela não pode sobrescrever silenciosamente nome,
e-mail ou telefone já digitados.

O Codex implementou as páginas de início, cadastro, lista e detalhe, os componentes
`AppLayout`, `CandidateForm` e `CandidateConfirmation`, o client HTTP e os dez testes
aprovados. Minha participação nesta etapa foi definir o escopo, aprovar o plano e as
dependências, exigir a preservação dos dados digitados e revisar as decisões. Não afirmo que
escrevi manualmente o código produzido pelo Codex.

As verificações automatizadas do frontend concluídas pelo Codex foram `npm run format:check`,
`npm run lint`, `npm run typecheck`, `npm test` e `npm run build`; os **10/10 testes**
aprovaram. Também foram repetidos os gates do backend, com 22/22 testes locais, 2/2 testes SQL
e build aprovados.

Concluí pessoalmente a validação manual da interface: home e navegação, validação local,
confirmação explícita, retorno para edição preservando dados, criação manual e assistida por PDF
com HTTP 201 e detalhe, lista, detalhe, rota 404, responsividade mobile, foco por Tab e console.
Confirmei que sugestões preenchem somente campos vazios, preservam o e-mail digitado, continuam
editáveis e que um PDF inválido renomeado como `.pdf` retorna 415
`UNSUPPORTED_FILE_TYPE` sem bloquear o cadastro manual.

Durante essa validação, a primeira extração recebia 502 porque `node --watch` observava o
worker do `pdfjs-dist` em `node_modules` e reiniciava o backend, interrompendo a requisição.
Não era falha do proxy ou do frontend. O Codex corrigiu somente o script `dev`, restringindo o
watch com `--watch-path=src`. Após iniciar o backend do zero, a primeira extração retornou 200
sem reinício indevido.

## 6. Dificuldades e limitações

Durante a implementação da fundação houve uma interrupção do ambiente de desenvolvimento. Na retomada,
pedi uma análise somente de leitura do Git, fontes, configurações, dependências e documentação.
Aprovei a continuação após essa inspeção, preservando o trabalho válido sem reconstrução
ou descarte das alterações existentes.

A execução do agente encontrou restrições de acesso, rede e gravação de arquivos.
Os comandos afetados foram repetidos com as permissões necessárias, sem alterar configurações
globais ou introduzir requisitos específicos para executar o projeto. Também houve um ajuste
de codificação no comando usado para verificar texto acentuado no navegador, sem mudança
nos textos da aplicação.

O conflito de porta durante a troca entre desenvolvimento e execução compilada levou à
correção real do log de inicialização descrita na seção 4. Após encerrar o processo anterior,
o backend compilado iniciou normalmente.

Na Issue #3, interrompi a execução inicial do Codex GPT-6 Astra com Extra High pelo
consumo excessivo de tokens e pela suíte de 61 testes. Retomei com Codex GPT-5.6 Terra High,
com a redução e conclusão descritas acima. A falta inicial de um ambiente SQL foi
resolvida com o provisionamento manual via Docker Desktop.

Durante as conexões SQL locais, observei o warning não bloqueante
`[DEP0123] DeprecationWarning: Setting the TLS ServerName to an IP address...`, associado
ao uso de `127.0.0.1` com TLS. Os testes e as validações passaram; nesta tarefa documental,
não foi feita alteração de código para ocultar esse aviso.

A fundação, o cadastro e a consulta pela API, a integração com SQL Server, a extração PDF e
as telas de cadastro, lista e detalhe estão implementados. A extração permanece limitada a PDF
com camada textual: não há OCR e as heurísticas não prometem reconhecer todos os formatos. A
validação manual da interface foi concluída com sucesso.

## 7. Tempo dedicado

O tempo dedicado será consolidado ao final do desafio.

**[PREENCHER: tempo aproximado por etapa e total, conforme meu controle de horas.]**

## 8. Melhorias com mais tempo

Consolidarei esta seção após implementar e verificar as funcionalidades principais.
Por enquanto, não defini uma lista definitiva de melhorias adicionais.

A API de candidatos e a integração real com o banco já foram verificadas na Issue #3.
A extração PDF foi validada automaticamente e manualmente. As próximas entregas terão
validações próprias para a interface. Ao final, registrarei as limitações observadas e as
melhorias que considerar justificadas, com seus respectivos motivos.
