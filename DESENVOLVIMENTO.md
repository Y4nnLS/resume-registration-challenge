# Registro de desenvolvimento

## 1. Organização e execução do trabalho

Organizei o desafio em entregas pequenas: fundação, API e persistência, extração de PDF,
interface, revisão de qualidade e documentação. Para cada entrega, defini o escopo, li os
requisitos e os arquivos relevantes, analisei o plano proposto e aprovei a implementação antes
de qualquer alteração.

Mantive frontend e backend como projetos npm independentes e usei os arquivos de contexto para
registrar arquitetura, domínio, testes e workflow. Revisei o resultado de cada entrega, executei
comandos, configurei o ambiente local e concluí as validações manuais de Swagger, banco e
interface antes da entrega final.

## 2. Principais decisões técnicas

| Decisão | Motivo |
| --- | --- |
| React, TypeScript, Vite e Tailwind no frontend | Mantive a stack do desafio com uma interface pequena, responsiva e sem estado global. |
| Node.js, TypeScript, Express e SQL Server no backend | Mantive uma API direta, com SQL parametrizado por `mssql` e sem ORM. |
| Route → Controller → Service → Repository → SQL Server | Separei responsabilidades sem criar camadas genéricas. A extração PDF termina no service, sem repository. |
| SQL Server 2022 no Docker Desktop | Docker fornece apenas o banco local; frontend e backend continuam executados por npm no host. Há bancos e logins separados para desenvolvimento e integração. |
| Banco de testes isolado | A suíte SQL usa somente `TEST_DB_*`, o banco com sufixo `_test` e o login dedicado `resume_test`, sem usar a configuração de desenvolvimento como alternativa. |
| PDF em memória | O arquivo é validado por MIME, assinatura `%PDF-` e limite exato de 5 MiB; não é persistido, não há OCR nem entidade de currículo. |
| Formulário único para cadastro manual e PDF | O PDF apenas sugere nome, e-mail e telefone. Sugestões preenchem somente campos vazios, permanecem editáveis e a persistência exige confirmação explícita. |
| Sem watcher no backend | Removi `node --watch` do modo de desenvolvimento porque reinícios por dependências carregadas em runtime interrompiam requisições. Após mudanças de código, reinicio o backend manualmente. |

O backend permanece a autoridade final das validações. E-mail duplicado é permitido porque não
há requisito de unicidade. Não incluí autenticação, Docker Compose, estado global, OCR ou
persistência de arquivos por não fazerem parte do escopo.

## 3. Uso de inteligência artificial

- **ChatGPT GPT-5.6 Sol:** utilizei para planejamento, discussão arquitetural, explicações,
  revisão, orientação de debugging, preparação de prompts e documentação.
- **Codex GPT-6 Astra Extra High:** utilizei inicialmente na implementação do backend.
  Interrompi essa execução após consumo excessivo de tokens e uma suíte desproporcional.
- **Codex GPT-5.6 Terra High:** utilizei após essa interrupção para continuar o trabalho com
  escopo e testes proporcionais.

Utilizei o Codex para implementar o projeto conforme o plano aprovado, incluindo código-fonte,
configurações, testes e documentação. Minha participação foi definir escopo e decisões técnicas,
aprovar planos, revisar alterações, configurar Docker e SQL Server, executar comandos, validar
Swagger e a interface, investigar problemas de runtime e tomar as decisões finais. Não afirmo
que escrevi manualmente código produzido pelo Codex, e a IA não trabalhou sem supervisão.

## 4. Exemplos de uso e ajustes da IA

| Pedido resumido | Como aproveitei o resultado |
| --- | --- |
| Planejar a fundação sem antecipar regras de negócio | Mantive duas aplicações independentes, qualidade básica e arquitetura mínima. |
| Implementar API e SQL Server com teste isolado | Restringi a solução a cadastro, consulta, configuração `TEST_DB_*` e integração SQL separada. |
| Extrair PDF em memória, com 5 MiB e sem OCR | Fixei o contrato do endpoint, a validação do arquivo e o orçamento de testes da extração. |
| Usar um formulário para PDF e cadastro manual | Preservei valores digitados, edição das sugestões e confirmação antes do POST. |

Corrigi ou redirecionei sugestões da IA quando necessário. A primeira tentativa do backend gerou
61 testes e foi interrompida; retomei com uma suíte representativa, inicialmente com 12 testes
locais e 2 SQL. Nas etapas seguintes, limitei explicitamente a quantidade de novos testes.

Também investiguei um erro 502 antes de atribuí-lo ao frontend ou ao proxy. Os logs mostraram
que `node --watch` reiniciava o backend ao carregar arquivos de `pdfjs-dist` e, depois,
`iconv-lite` em `node_modules`. A mitigação inicial com `--watch-path=src` parecia funcionar,
mas não foi confiável no smoke final. Como hot reload não era requisito, removi o watcher do
script `dev`; a correção foi validada manualmente com cadastro seguido de GET e primeira
extração PDF sem reinício.

## 5. Verificação da solução

Executei format, lint, typecheck, build e testes nos dois projetos. O resultado final foi:

- Frontend: **10/10 testes** aprovados.
- Backend local: **22/22 testes** aprovados.
- Integração SQL Server: **2/2 testes** aprovados.
- `git diff --check` aprovado.

Também validei manualmente o setup Docker/SQL Server, scripts de schema e seed repetíveis,
Swagger, cadastro manual, confirmação e retorno à edição, lista, detalhe, rota inexistente,
cadastro assistido por PDF, rejeição de PDF inválido, responsividade e foco por teclado.

No smoke final, o cadastro retornou 201 e o GET imediato retornou 200. A primeira extração de
`samples/sample-resume.pdf` após iniciar o backend retornou 200 com nome, e-mail e telefone
corretos. Não houve 502, `ECONNRESET`, nem mensagens de reinício por `node_modules`.

O Console exibiu duas ocorrências de erro em `et.reportAllChanges`, identificadas como código
Web Vitals injetado pelo Chromium DevTools. O frontend não possui `web-vitals` como dependência
e não houve frame apontando para código da aplicação, portanto tratei isso como observação
externa ao projeto.

## 6. Dificuldades e limitações

A configuração inicial do SQL Server exigiu provisionamento local de bancos, logins e permissões
no Docker Desktop. Também enfrentei a suíte excessiva gerada na primeira tentativa e os
reinícios do backend por watcher durante carregamentos de dependências; ambos foram corrigidos
sem ampliar a arquitetura.

A extração depende de PDFs com camada textual e usa heurísticas simples para nome, e-mail e
telefone, portanto não cobre todos os layouts. Não há autenticação, edição ou exclusão de
candidatos, busca, filtros, paginação, OCR ou IA/LLM para parsing. A configuração Docker/SQL
Server documentada é voltada ao ambiente local do desafio. O warning TLS `DEP0123` pode aparecer
ao usar `127.0.0.1` com TLS, mas foi não bloqueante nas validações.

## 7. Tempo dedicado

Os tempos abaixo são estimativas aproximadas baseadas nas sessões de desenvolvimento. Não houve
controle minuto a minuto por cronômetro.

| Etapa | Tempo aproximado |
| --- | ---: |
| Planejamento e fundação | ~3 h |
| Backend e SQL Server | ~4 h |
| Extração de PDF | ~2,5 h |
| Frontend | ~3,5 h |
| Qualidade e integração | ~1,5 h |
| Documentação e preparação da entrega | ~1,5 h |
| Total aproximado | ~16 h |

## 8. Possíveis melhorias futuras

Com mais tempo, eu incluiria OCR e parsing mais robusto de currículos, autenticação, edição e
exclusão de candidatos, busca, filtros, paginação, configuração de deployment produtivo e testes
E2E mais amplos.
