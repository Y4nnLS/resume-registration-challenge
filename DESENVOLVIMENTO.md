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
A publicação depende da minha autorização. Até esta revisão, não houve commit, push,
abertura de PR ou merge das alterações da Issue #1.

Este documento acompanha o projeto em andamento. A fundação está implementada e verificada;
as funcionalidades principais do desafio ainda serão desenvolvidas nas próximas Issues.

## 2. Principais decisões técnicas

| Decisão                                           | Motivo e aplicação nesta etapa                                                                                                                                                                                 |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dois projetos npm, sem workspaces                 | Optei por separar `frontend/` e `backend/`, cada um com manifesto e lockfile próprios, mantendo instalação e execução compreensíveis.                                                                          |
| React, TypeScript e Vite no frontend              | Mantive a stack definida para o desafio. Configurei, com auxílio do Codex, Router e Tailwind para comprovar navegação e estilos com uma interface mínima.                                                      |
| Node.js, TypeScript e Express no backend          | Mantive uma aplicação HTTP pequena, com `GET /health`, sem antecipar regras de negócio.                                                                                                                        |
| Arquitetura em camadas proporcional ao projeto    | Defini o fluxo futuro Route → Controller → Service → Repository → SQL Server. As camadas serão criadas conforme forem necessárias, sem diretórios vazios ou abstrações genéricas.                              |
| Separação entre `app.ts` e `server.ts`            | A composição do Express ficou separada da abertura da porta, permitindo importar a aplicação em testes futuros sem iniciar o servidor automaticamente.                                                         |
| TypeScript 5.9.3 nos dois projetos                | Solicitei uma versão estável da linha 5.x para reduzir risco. O Codex confirmou a compatibilidade declarada com `typescript-eslint@8.71.0`, cuja faixa é `>=4.8.4 <6.1.0`, e verificou tipos e builds.         |
| ESLint e Prettier com responsabilidades distintas | Adotei lint para análise de código e Prettier para formatação, com uma configuração de formatação compartilhada na raiz.                                                                                       |
| Dependências somente quando necessárias           | Mantive React Hook Form, Zod, `mssql` e bibliotecas de PDF para as respectivas funcionalidades. O carregamento nativo de `.env` evitou adicionar `dotenv`; `tsx` ficou restrito ao desenvolvimento do backend. |

Também defini decisões de domínio e persistência que orientarão as próximas entregas:

- SQL Server local no Windows, com `mssql`, SQL parametrizado e usuário SQL dedicado, sem ORM.
  Essa integração ainda não foi implementada.
- Um único formulário e um único processo final de persistência para cadastro manual e
  cadastro auxiliado por PDF. A extração apenas sugerirá dados para revisão.
- PDF processado em memória e descartado, com limite de `5 * 1024 * 1024` bytes.
  Decidi não criar armazenamento de arquivos ou entidade de currículo, pois não são exigidos.
- E-mail sem unicidade, porque essa regra não faz parte do desafio. Os limites dos campos
  estão registrados em [.ai/domain.md](.ai/domain.md).
- Backend como autoridade final da validação, com validação também no frontend para melhorar
  a experiência. Não acrescentei autenticação, Docker ou estado global sem necessidade.

## 3. Uso de inteligência artificial

### Ferramentas e modelos

- **ChatGPT (OpenAI) — GPT-5.6 Sol:** utilizei para planejamento, discussão arquitetural, organização
  do trabalho, revisão de decisões e elaboração/revisão de prompts.
- **Codex (OpenAI):** utilizei para análise e implementação assistida no repositório.
  O ambiente da sessão identifica o agente como baseado em **GPT-6**; não há identificação
  comprovada de variante ou versão mais específica para registrar.

### Como utilizei a IA

Utilizei as respostas do ChatGPT para organizar requisitos, limites de escopo e critérios
que depois levei ao Codex. Com o Codex, pedi a leitura da Issue no GitHub, a inspeção dos
arquivos existentes e um plano antes de qualquer implementação.

Revisei os planos e aprovei ou solicitei alterações nas propostas. Tratei as sugestões
como material para análise, não como decisões definitivas. Depois da aprovação, utilizei
o Codex para criar os fontes e configurações, executar os checks e registrar os resultados.
Também utilizei seu auxílio para elaborar e revisar a documentação, incluindo este relato.

Minha participação nesta etapa concentrou-se na definição do escopo, revisão e aprovação
dos planos, solicitação de ajustes e verificação visual pessoal descrita na seção 5.
A implementação dos fontes e configurações foi realizada com o Codex; não atribuo a mim
a escrita manual desse código.

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
  da API de candidatos, quando os contratos serão definidos antes das funcionalidades.
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

Também houve uma correção técnica durante as verificações executadas pelo Codex.
Um conflito de porta mostrou que o callback de `listen` do Express recebia o erro,
mas o código ainda emitia uma mensagem de inicialização bem-sucedida. O Codex ajustou
o callback para anunciar sucesso somente quando não houvesse erro, preservando a mensagem
de falha e a saída com código 1. Essa correção foi pontual e não alterou a arquitetura.

## 5. Verificação da solução

### Verificações automatizadas

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
Os testes de regras de negócio, endpoints e integração serão desenvolvidos com as
funcionalidades correspondentes.

### Verificação manual

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

## 6. Dificuldades e limitações

Durante a implementação houve uma interrupção do ambiente de desenvolvimento. Na retomada,
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

A principal limitação atual é o estágio do projeto: a fundação está pronta, mas ainda não
há cadastro ou consulta de candidatos, integração com SQL Server, processamento de PDF
ou telas finais. As verificações desta etapa comprovam a fundação, não o funcionamento
das funcionalidades que ainda serão implementadas. Na extração futura, já aceitei a
limitação de heurísticas simples e ausência de OCR, mantendo o preenchimento manual como alternativa.

## 7. Tempo dedicado

O tempo dedicado será consolidado ao final do desafio.

**[PREENCHER: tempo aproximado por etapa e total, conforme meu controle de horas.]**

## 8. Melhorias com mais tempo

Consolidarei esta seção após implementar e verificar as funcionalidades principais.
Por enquanto, não defini uma lista definitiva de melhorias adicionais.

A cobertura de regras de negócio e a integração real com o banco ainda precisam ser
verificadas nas próximas entregas; são requisitos planejados, não funcionalidades extras
que estou acrescentando ao escopo. Ao final, registrarei as limitações observadas e as
melhorias que considerar justificadas, com seus respectivos motivos.
