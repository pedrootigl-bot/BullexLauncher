# Admin BullStart — Desempenho das Missões

## Contexto

O repositório **BullexLauncher / BullVerse** é um frontend Vite + React sem backend, banco ou autenticação real.

A tela `/administrador` já existia com dados mock em `src/data/adminMock.ts`. Não há Prisma, Supabase, `/api/*` nem sessão admin.

## O que foi implementado

Bloco **BullStart — Desempenho das Missões** na Visão Geral administrativa, com:

- KPIs: prêmios entregues, 3/3 concluídas, Missão 01/02/03
- Funil de missões (com taxa de conversão e participantes)
- Tabela de elegíveis ao sorteio (busca, ordenação, filtro de status)
- Exportação CSV `bullstart-elegiveis-sorteio.csv`

## Arquivos

| Arquivo | Papel |
|---------|--------|
| `src/data/bullstartAdminMock.ts` | Dataset normalizado (temporadas, traders, depósitos, conclusões, prêmios) |
| `src/services/bullstartAdmin.ts` | Agregações (overview, elegíveis, CSV) — contrato pronto para API |
| `src/components/admin/BullstartMissionsPanel.tsx` | UI do bloco |
| `src/components/admin/AdminOverview.tsx` | Integração após KPIs gerais |
| `src/styles/admin-panel.css` | Estilos no padrão Bullex |

## Como as 3 missões são resolvidas

**Não** se usa `missionId = 1|2|3` fixo.

Cada temporada em `bullstartSeasons` define missões por:

- `code` (`MISSÃO 01`, `MISSÃO 02`, `MISSÃO 03`)
- `order` (`1 | 2 | 3`)
- `missionRefId` (referência ao cadastro admin, ex.: `m1`)

A agregação busca conclusões pelo `code` da temporada selecionada.

## Elegibilidade

Um trader só entra em “Elegíveis para o sorteio” se tiver concluído **as três** missões da temporada:

```
mission1Completed AND mission2Completed AND mission3Completed
```

Conclusões duplicadas do mesmo usuário/código contam **uma vez** (DISTINCT por `userId` + `missionCode`).

`completedAt` = data mais recente entre as três conclusões.

Cada elegível inclui `whatsapp` (DDI + número) para a equipe entrar em contato — visível na tabela, no modal de detalhe, no CSV e no fluxo de sorteio.

## Total depositado

Calculado **antes** do join com missões:

1. Filtrar depósitos da temporada
2. Status exatamente `completed` (ignora `pending`, `cancelled`, `failed`, `refunded`)
3. `SUM(amount)` agrupado por `userId`
4. Só então associar ao trader elegível

Não usa saldo da conta.

## Prêmios entregues

KPI principal conta apenas **itens do sorteio** com entrega concluída:

- `prizeReceived === true` **ou**
- `deliveryStatus === 'delivered'`

Fonte: `bullstartDrawWinners` (não inclui RiskFree, cashback, tickets de missão etc.).

`shipped` / `pending` **não** entram no total.

## Migration

**Nenhuma.** Não há banco neste projeto.

## Segurança (gap conhecido)

- Rota `/administrador` continua sem guard de sessão
- Não há `role === "admin"` no backend
- Export CSV roda no browser (não há API para proteger com 403)

Quando existir backend, trocar `getBullstartOverview` / `getBullstartEligible` por `GET /api/admin/bullstart/*` e validar sessão no servidor. Não confiar em `localStorage` ou flags do frontend.

## Troca futura por API

Manter a assinatura de:

- `getBullstartOverview(filters)`
- `getBullstartEligible(query)`
- `exportEligibleCsv(rows)` / `downloadEligibleCsv(rows)`

e substituir o corpo das funções por `fetch` autenticado.
