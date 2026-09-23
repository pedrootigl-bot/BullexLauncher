# Admin BullStart — Sorteio (mock auditável)

## Premissa

O BullVerse ainda **não possui backend**. Esta feature implementa o fluxo completo de sorteio no frontend, com contrato pronto para migrar para API + `crypto.randomInt` no servidor.

Rota: `/administrador?section=draw` (item **Novo sorteio** no menu Engajamento).

A seção **Sorteios** (`campaigns`) tem abas: **Histórico de sorteios** (`listDrawHistory`) e **Banners** (CRUD de campanhas).

Persistência: `localStorage` chaves `bx-admin-draws-v2` / `bx-draw-win-seen-v2`.
## Fonte de elegibilidade

**Única:** `getBullstartEligible` em `src/services/bullstartAdmin.ts`.

Critério: trader concluiu as 3 missões da temporada. Sem segunda lógica, sem seleção manual de participantes, sem peso por depósito/volume/nível.

## Contato WhatsApp

Cada trader/elegível/participante/vencedor carrega `whatsapp` (DDI + número). A equipe usa o link `wa.me` no detalhe, na lista de elegíveis, no CSV e no card do ganhador.

No schema (`documents/schema-banco-bullverse.md`): `users.whatsapp`, cópia em `draw_participants` e `draw_winners`.

## Arquivos

| Arquivo | Papel |
|---------|--------|
| `src/data/drawAdminMock.ts` | Tipos + catálogo seed de prêmios com estoque |
| `src/services/bullstartDraw.ts` | prepare / execute / hash / Web Crypto / localStorage |
| `src/components/admin/BullstartDrawPanel.tsx` | UI completa |
| `src/data/adminMock.ts` | Nav `draw` |
| `src/pages/AdminPage.tsx` | Integração da seção |
| `src/styles/admin-panel.css` | Estilos `.bx-draw*` |

Persistência: `localStorage` chave `bx-admin-draws-v2`.

## Fluxo UX (redesign)

Stepper: Configuração → Participantes → Sorteio.

1. Admin escolhe temporada e prêmio (estoque > 0) + quantidade de unidades.
2. Vê lista de elegíveis (busca só filtra a UI; aviso explícito na tela).
3. Confirma checkbox → **Preparar sorteio** → snapshot + SHA-256 + status `prepared`.
4. Card “Tudo pronto” + lista bloqueada.
5. **Realizar sorteio** → serviço escolhe índice com Web Crypto → UI anima → card do(s) vencedor(es).
6. Histórico local + hub em Sorteios. Sem reroll no mesmo `drawId`.

## Fluxo

1. Admin escolhe temporada e prêmio (estoque > 0).
2. Vê lista de elegíveis (busca só filtra a UI).
3. Confirma checkbox → **Preparar sorteio** → snapshot + SHA-256 + status `prepared`.
4. Banner evidente: `N participantes · chances iguais · lista bloqueada`.
5. **Realizar sorteio** → serviço escolhe índice com Web Crypto → persiste winner → UI anima 3–5s → card do vencedor.
6. Histórico listado abaixo. Sem reroll no mesmo `drawId` (use **Novo sorteio**).

## Gaps backend (permanecem)

- Persistência real (Postgres) e `crypto.randomInt` no servidor.
- Auth/autorização admin na rota `/administrador`.
- Idempotência HTTP e auditoria server-side.
- Remover `FORCE_WINNER_TRADER_ID` antes de produção.
## Aleatoriedade

- `pickUniformIndex(n)` usa `crypto.getRandomValues` + rejeição de viés modular.
- **Proibido** `Math.random()` para escolher vencedor.
- Frontend chama `executeDraw(drawId)` — **nunca** envia `winnerId` / `winnerIndex`.

## Idempotência

- `status === 'completed'` bloqueia nova execução.
- Mutex in-process (`executingDrawIds`) evita corrida por duplo clique.
- Refresh após prepare/complete restaura estado a partir do `localStorage`.

## Escolha do prêmio

O admin escolhe livremente o prêmio **antes** de preparar o sorteio:

- grade visual com todos os prêmios com estoque > 0 (sem filtro por temporada);
- preview do prêmio selecionado (imagem, ID, categoria, quantidade);
- cadastro de prêmio customizado (nome, ID, categoria, descrição, imagem, estoque);
- após **Preparar sorteio**, o prêmio fica bloqueado no registro.

Funções: `listDrawPrizes()`, `createDrawPrize()`, `getDrawPrize()`.

## Quantidade de itens por sorteio

No prepare, o admin define `prizeUnits` (ex.: 3 PS5 no mesmo sorteio):

- limitado pelo estoque do prêmio e pelo número de elegíveis;
- um único snapshot/campanha;
- execução escolhe N ganhadores distintos (sem reposição, Web Crypto);
- estoque decrementa em N;
- cada ganhador recebe popup individual.

## Forçar ganhador (somente testes mock)

Em `bullstartDraw.ts`, `FORCE_WINNER_TRADER_ID = '482917'` faz Gabriel ser sempre o **1º ganhador** quando estiver no snapshot. As demais unidades (se `prizeUnits > 1`) continuam aleatórias. Remover antes do backend real.

Para reiniciar testes: botão **Limpar dados de teste** no histórico (ou storage `bx-admin-draws-v2` / `bx-draw-win-seen-v2`).

## Popup do ganhador (lado do trader)

Após um sorteio `completed`, se o Trader ID do vencedor coincidir com o usuário logado (`mockUser` / header = `482917` · Gabriel), um popup aparece nas rotas do app (`/missoes`, `/recompensas`, `/historico`, `/suporte`).

- Só o ganhador vê o aviso.
- Ao clicar em **Entendi**, o `drawId` é marcado em `bx-draw-win-seen-v1` e não reaparece.
- Escuta `storage`/`focus` para detectar sorteio feito em outra aba do admin.

Arquivos: `DrawWinnerCelebration.tsx`, helpers em `bullstartDraw.ts`, integração em `DashboardHeader.tsx`.

## Gaps para o backend futuro

- Auth admin real + 403 em endpoints.
- `crypto.randomInt` (Node) no servidor.
- Tabelas `draws` / `draw_participants` + transaction/lock.
- Authorship real do admin autenticado.
- Espelhar winner em banco / fila de entrega.

## Verificação manual sugerida

- 1 elegível → sempre vence.
- Busca não altera o pool do snapshot.
- Elegível após prepare não entra.
- Duplo clique / refresh mantém um único winner.
- Estoque 0 bloqueia prepare/execute.
- Completed não reexecuta.
