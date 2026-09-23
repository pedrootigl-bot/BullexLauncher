# Contrato API — Frontend BullVerse ↔ Backend

Documento de ligação: o frontend já consome estes endpoints via `src/api/` + `src/services/`.  
Com `VITE_API_BASE_URL` preenchida e `VITE_USE_MOCKS≠true`, os mocks são desligados e só resta o backend implementar as rotas e o banco (`documents/schema-banco-bullverse.md`).

---

## Como ligar

1. Subir a API (Postgres + migrations do schema).
2. No frontend: `.env.local` com:
   ```
   VITE_API_BASE_URL=https://sua-api.exemplo.com
   VITE_USE_MOCKS=false
   ```
3. Rebuild / restart do Vite.
4. Auth: `Authorization: Bearer <token>` em rotas autenticadas (salvo login).

---

## Convenções

| Item | Valor |
|------|--------|
| Prefixo | `/api` |
| Formato | JSON (`Content-Type: application/json`) |
| Auth | JWT Bearer (ou cookie de sessão se o backend preferir; client envia Bearer) |
| Erros | `{ "message": string, "code"?: string }` + status HTTP |
| Datas | ISO 8601 / `YYYY-MM-DD` conforme campo |
| Role admin | `users.role = admin` — rotas `/api/admin/*` |

---

## Auth

| Método | Rota | Body / query | Resposta |
|--------|------|--------------|----------|
| POST | `/api/auth/login` | `{ bullexId, password, remember? }` | `{ token, user }` |
| POST | `/api/auth/logout` | — | `204` |
| GET | `/api/auth/me` | — | `AuthUser` |
| POST | `/api/auth/refresh` | — | `{ token }` (opcional) |

`AuthUser`: `{ id, traderId, firstName, fullName?, email?, role: 'trader'\|'admin', avatarSrc }`

---

## Trader (`/api/me/*`)

| Método | Rota | Resposta / notas |
|--------|------|------------------|
| GET | `/api/me/missions` | Dashboard missões + journey + banners + pass (ver `MissionsDashboard` em `src/services/missions.ts`) |
| POST | `/api/me/missions/:id/claim` | `{ mission, journey }` |
| POST | `/api/me/pass/levels/:level/claim` | `{ tracks, journey }` |
| GET | `/api/me/rewards` | `{ stats, coupons }` |
| POST | `/api/me/rewards/:couponId/redeem` | cupom atualizado |
| GET | `/api/me/history` | `{ stats, prizes }` |
| GET | `/api/me/banners` | `PromoBanner[]` |
| GET | `/api/me/draws/pending-win` | `AdminDraw \| null` |
| POST | `/api/me/draws/:drawId/ack` | marca popup de ganho como visto |

---

## Suporte

| Método | Rota | Notas |
|--------|------|-------|
| GET | `/api/support` | intro, tiles, channels, faqs, specialist |
| GET | `/api/support/faqs` | opcional (já incluso no overview) |
| POST | `/api/support/tickets` | `{ subject, category, message }` → ticket |
| GET | `/api/support/chat/messages` | mensagens do chat |
| POST | `/api/support/chat/messages` | `{ text }` → mensagem do usuário |

> Chat em tempo real: WebSocket futuro; o POST/GET cobrem o MVP HTTP.

---

## Admin — visão geral e CRUDs

| Método | Rota | Notas |
|--------|------|-------|
| GET | `/api/admin/overview` | KPIs, chart, recentUsers |
| GET | `/api/admin/users` | lista |
| GET | `/api/admin/users/:id` | detalhe |
| GET/POST | `/api/admin/missions` | list / create |
| PUT | `/api/admin/missions/:id` | update |
| GET/POST | `/api/admin/rewards` | passe |
| GET/POST | `/api/admin/coupons` | cupons |
| GET/POST | `/api/admin/campaigns` | banners |
| PUT | `/api/admin/campaigns/:id` | update |

---

## Admin — BullStart

| Método | Rota | Query | Resposta |
|--------|------|-------|----------|
| GET | `/api/admin/bullstart/seasons` | — | seasons |
| GET | `/api/admin/bullstart/overview` | `seasonId`, `periodStart?`, `periodEnd?` | overview + funnel |
| GET | `/api/admin/bullstart/eligible` | season + filtros/sort/search | rows elegíveis |
| GET | `/api/admin/bullstart/eligible/:userId` | `seasonId` | detalhe |

Elegibilidade = 3/3 `mission_completions` na temporada (regra no servidor).

---

## Admin — Sorteios

| Método | Rota | Notas |
|--------|------|-------|
| GET | `/api/admin/draws/prizes` | `?seasonId&available` |
| POST | `/api/admin/draws/prizes` | cria prêmio |
| GET | `/api/admin/draws` | histórico `?seasonId` |
| GET | `/api/admin/draws/:id` | detalhe |
| GET | `/api/admin/draws/:id/participants` | snapshot |
| POST | `/api/admin/draws/prepare` | `{ seasonId, prizeId, prizeUnits }` — snapshot + hash no servidor |
| POST | `/api/admin/draws/:id/execute` | RNG no servidor; **nunca** confiar em `winnerId` do client |
| PATCH | `/api/admin/draws/:drawId/winners/:userId/delivery` | `{ deliveryStatus }` |

---

## Mapeamento código → serviço

| Domínio | Arquivo |
|---------|---------|
| Client HTTP | `src/api/client.ts` |
| Paths | `src/api/endpoints.ts` |
| Auth / sessão | `src/services/auth.ts`, `src/context/SessionContext.tsx` |
| Missões | `src/services/missions.ts` |
| Recompensas | `src/services/rewards.ts` |
| Histórico | `src/services/history.ts` |
| Suporte | `src/services/support.ts` |
| Admin CRUD | `src/services/admin.ts` |
| BullStart | `src/services/bullstartAdmin.ts` (`load*` + mocks sync) |
| Sorteios | `src/services/bullstartDraw.ts` (`prepare`/`execute`/`load*`) |

---

## Checklist backend (só linkagem)

- [ ] Migrations do schema Postgres
- [ ] Implementar rotas acima com os DTOs esperados pelos services
- [ ] JWT + middleware admin
- [ ] Postback Bullex → `users` / depósitos (schema)
- [ ] Configurar `VITE_API_BASE_URL` no deploy do frontend
- [ ] Remover/ignorar mocks (já automático quando API está ligada)
