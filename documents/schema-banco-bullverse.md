# Schema do banco — BullVerse / BullexLauncher

Documento de referência para o backend. Derivado dos tipos e fluxos atuais do frontend (`src/data/*`, `src/services/*`, `documents/admin-bullstart-*`).

**SGBD sugerido:** PostgreSQL  

**Identidade do trader:** o usuário **não nasce no BullVerse**. O site externo (Bullex / broker) envia dados por **postback**. O BullVerse:

1. recebe o postback;
2. faz **upsert** em `users` pela chave externa (`external_user_id` / `trader_id`);
3. gera um `id` interno (UUID) só para FKs locais;
4. registra o evento bruto em `postback_events` (auditoria + idempotência).

Campos `created_at` / `updated_at` (`timestamptz`) em todas as tabelas de negócio, salvo indicação contrária.

---

## Modelo de identidade (postback)

```
Site externo (Bullex)
        │  POST /webhooks/bullex  (ou similar)
        ▼
  postback_events  ──►  valida assinatura + dedupe
        │
        ▼
  users (upsert por trader_id / external_user_id)
        │
        ├── deposits / trades (também podem vir por postback)
        └── demais tabelas do BullVerse usam users.id (UUID interno)
```

| Conceito | Onde fica | Quem manda |
|----------|-----------|------------|
| ID interno BullVerse | `users.id` (uuid) | Gerado aqui no primeiro postback |
| ID do outro site | `users.external_user_id` | Postback |
| ID exibido no app | `users.trader_id` (ex.: `482917`) | Postback (pode ser o mesmo que external) |
| Email, nome, etc. | colunas em `users` | Postback (atualiza no upsert) |

**Regra:** FKs internas (`deposits.user_id`, `draw_winners.user_id`…) apontam sempre para `users.id` (UUID). Nunca use o ID externo como PK das tabelas de negócio — só como chave de upsert.

---

## Enums

| Enum | Valores |
|------|---------|
| `user_role` | `trader`, `admin` |
| `account_status` | `active`, `pending`, `blocked` |
| `deposit_status` | `completed`, `pending`, `cancelled`, `failed`, `refunded` |
| `withdrawal_status` | `pending`, `processing`, `completed`, `rejected`, `cancelled` |
| `mission_unit` | `brl`, `days`, `volume` |
| `mission_status` | `draft`, `active`, `ended` |
| `mission_type` | `deposit_single_day`, `active_days`, `monthly_deposit`, `volume`, `custom` |
| `mission_code` | `MISSÃO 01`, `MISSÃO 02`, `MISSÃO 03` (ou `M01`/`M02`/`M03` + label) |
| `pass_track` | `free`, `premium` |
| `pass_reward_kind` | `cashback`, `points`, `ticket`, `chest`, `report`, `balance`, `badge`, `bonus`, `riskfree`, `xpboost`, `coupon`, `vip`, `multiplier`, `avatar` |
| `claim_state` | `locked`, `claimable`, `claimed` |
| `coupon_type` | `bonus`, `cashback`, `fee`, `ticket`, `riskfree` |
| `coupon_catalog_status` | `active`, `paused`, `expired` |
| `user_coupon_status` | `available`, `used`, `expired` |
| `banner_status` | `active`, `paused` |
| `banner_placement` | `home` |
| `draw_status` | `prepared`, `completed`, `cancelled` |
| `delivery_status` | `pending`, `shipped`, `delivered`, `used` |
| `reward_kind` | `physical`, `balance`, `riskfree`, `ticket`, `cashback`, `bonus`, `other` |
| `support_ticket_status` | `open`, `in_progress`, `resolved`, `closed` |
| `support_channel` | `chat`, `ticket`, `help` |
| `postback_event_type` | `user.created`, `user.updated`, `deposit.created`, `deposit.updated`, `trade.created`, `withdrawal.created`, `other` |
| `postback_process_status` | `received`, `processed`, `ignored`, `failed` |

---

## 1. Auth e usuários

### `users`
Espelho local do trader vindo do site externo (+ admins criados no BullVerse).

| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | uuid PK | **Interno** BullVerse — gerado no 1º postback |
| `external_user_id` | varchar(64) UNIQUE | ID do outro site (chave de upsert do postback) |
| `trader_id` | varchar(32) UNIQUE NOT NULL | ID Bullex exibido (`482917`); muitas vezes = external |
| `email` | varchar(255) | Pode ser null se o postback não mandar |
| `password_hash` | text | Null se login for SSO/postback-only |
| `first_name` | varchar(120) | |
| `last_name` | varchar(120) | |
| `full_name` | varchar(240) | |
| `phone` | varchar(40) | |
| `document` | varchar(40) | |
| `country` | varchar(80) | |
| `avatar_url` | text | |
| `role` | `user_role` NOT NULL DEFAULT `trader` | Admins: criados localmente (`external_user_id` null) |
| `account_status` | `account_status` NOT NULL DEFAULT `pending` | |
| `plan` | varchar(40) | |
| `balance` | numeric(18,2) NOT NULL DEFAULT 0 | |
| `pass_track` | `pass_track` NOT NULL DEFAULT `free` | |
| `pass_level` | int NOT NULL DEFAULT 1 | |
| `pass_points` | int NOT NULL DEFAULT 0 | |
| `pass_points_target` | int NOT NULL DEFAULT 1000 | |
| `source` | varchar(40) DEFAULT `postback` | `postback` \| `manual` \| `admin` |
| `external_payload` | jsonb | Último payload resumido do postback (opcional) |
| `last_synced_at` | timestamptz | Último postback aplicado com sucesso |
| `last_login_at` | timestamptz | |
| `last_action_at` | timestamptz | |
| `last_action_label` | varchar(255) | |
| `notes` | text | |
| `email_verified_at` | timestamptz | |
| `created_at` / `updated_at` | timestamptz | |

Índices: `external_user_id`, `trader_id`, `email`, `role`, `account_status`.

**Upsert típico do postback user:**

```sql
INSERT INTO users (id, external_user_id, trader_id, email, first_name, ..., last_synced_at)
VALUES (...)
ON CONFLICT (external_user_id) DO UPDATE SET
  trader_id = EXCLUDED.trader_id,
  email = COALESCE(EXCLUDED.email, users.email),
  first_name = COALESCE(EXCLUDED.first_name, users.first_name),
  -- ... demais campos permitidos
  last_synced_at = NOW(),
  updated_at = NOW();
```

### `postback_events`
Log de **todas** as chamadas do site externo (obrigatório para não processar duas vezes).

| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | uuid PK | |
| `event_id` | varchar(120) UNIQUE | ID idempotente enviado pelo outro site (ou hash do body) |
| `event_type` | `postback_event_type` NOT NULL | |
| `external_user_id` | varchar(64) | |
| `trader_id` | varchar(32) | |
| `payload` | jsonb NOT NULL | Body bruto |
| `headers` | jsonb | Assinatura, user-agent, etc. |
| `signature_valid` | boolean | |
| `status` | `postback_process_status` NOT NULL DEFAULT `received` | |
| `error_message` | text | |
| `user_id` | uuid FK → `users` | Preenchido após upsert |
| `related_entity_type` | varchar(40) | `deposit`, `trade`, … |
| `related_entity_id` | uuid | |
| `received_at` | timestamptz NOT NULL DEFAULT NOW() | |
| `processed_at` | timestamptz | |

Índices: `event_id` UNIQUE, (`external_user_id`, `received_at`), `status`.

### `oauth_accounts` (opcional — login social)
| Coluna | Tipo |
|--------|------|
| `id` | uuid PK |
| `user_id` | uuid FK → `users` |
| `provider` | varchar(40) (`google`, `discord`, `apple`) |
| `provider_user_id` | varchar(255) |
| `created_at` | timestamptz |

UNIQUE (`provider`, `provider_user_id`).

### `sessions` (ou refresh tokens)
| Coluna | Tipo |
|--------|------|
| `id` | uuid PK |
| `user_id` | uuid FK → `users` |
| `token_hash` | text UNIQUE NOT NULL |
| `expires_at` | timestamptz NOT NULL |
| `ip` | inet |
| `user_agent` | text |
| `revoked_at` | timestamptz |
| `created_at` | timestamptz |

### `password_reset_tokens`
| Coluna | Tipo |
|--------|------|
| `id` | uuid PK |
| `user_id` | uuid FK → `users` |
| `token_hash` | text UNIQUE |
| `expires_at` | timestamptz |
| `used_at` | timestamptz |
| `created_at` | timestamptz |

---

## 2. Financeiro (KPIs admin + missões)

### `deposits`
**Fonte do “Total depositado” e Missão 01.** Só `status = completed` entra nas agregações BullStart.  
Também pode nascer via postback (`deposit.created`).

| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | uuid PK | Interno |
| `external_deposit_id` | varchar(120) UNIQUE | ID do outro site (idempotência) |
| `user_id` | uuid FK → `users` NOT NULL | Resolvido via `trader_id` / `external_user_id` |
| `season_id` | uuid FK → `seasons` | Preferível; ou inferir por `created_at` |
| `amount` | numeric(18,2) NOT NULL | |
| `currency` | char(3) DEFAULT `BRL` | |
| `status` | `deposit_status` NOT NULL | |
| `external_ref` | varchar(120) | Gateway |
| `source` | varchar(40) DEFAULT `postback` | |
| `created_at` | timestamptz NOT NULL | Preferir timestamp do postback |
| `updated_at` | timestamptz | |

Índices: (`user_id`, `status`, `created_at`), (`season_id`, `status`), `external_deposit_id`.

### `withdrawals`
Para KPI “Saques” do admin (também pode vir por postback).

| Coluna | Tipo |
|--------|------|
| `id` | uuid PK |
| `external_withdrawal_id` | varchar(120) UNIQUE |
| `user_id` | uuid FK → `users` |
| `amount` | numeric(18,2) NOT NULL |
| `currency` | char(3) DEFAULT `BRL` |
| `status` | `withdrawal_status` NOT NULL |
| `source` | varchar(40) DEFAULT `postback` |
| `created_at` / `updated_at` | timestamptz |

### `trades` (mínimo para Missão 02/03)
| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | uuid PK | |
| `external_trade_id` | varchar(120) UNIQUE | |
| `user_id` | uuid FK → `users` | |
| `season_id` | uuid FK → `seasons` | |
| `volume` | numeric(18,2) NOT NULL DEFAULT 0 | |
| `traded_on` | date NOT NULL | Dia da operação |
| `source` | varchar(40) DEFAULT `postback` | |
| `created_at` | timestamptz | |

Índice: (`user_id`, `season_id`, `traded_on`).

---

## 3. Temporadas e missões BullStart

### `seasons`
| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | uuid PK | |
| `slug` | varchar(64) UNIQUE | Ex.: `season-09-2026` |
| `label` | varchar(120) NOT NULL | `Temporada 09 · Setembro 2026` |
| `starts_at` | date NOT NULL | |
| `ends_at` | date NOT NULL | |
| `is_active` | boolean DEFAULT false | |
| `created_at` / `updated_at` | timestamptz | |

### `missions`
Catálogo admin (CRUD Missões).

| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | uuid PK | |
| `code` | varchar(40) | Código interno admin |
| `title` | varchar(160) NOT NULL | |
| `description` | text | |
| `type` | `mission_type` | |
| `target_value` | numeric(18,2) NOT NULL | |
| `unit` | `mission_unit` NOT NULL | |
| `points` | int NOT NULL DEFAULT 0 | |
| `status` | `mission_status` NOT NULL | |
| `cta_label` | varchar(80) | |
| `image_url` | text | |
| `reward_label` | varchar(160) | Texto da recompensa na card |
| `starts_at` | date | |
| `ends_at` | date | |
| `created_at` / `updated_at` | timestamptz | |

### `season_missions`
Liga temporada ↔ 3 missões da campanha (ordem 1–3). **Não** usar id fixo 1|2|3.

| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | uuid PK | |
| `season_id` | uuid FK → `seasons` | |
| `mission_id` | uuid FK → `missions` | |
| `mission_code` | `mission_code` NOT NULL | `MISSÃO 01`… |
| `sort_order` | smallint NOT NULL | 1, 2 ou 3 |
| `title_override` | varchar(160) | Opcional |

UNIQUE (`season_id`, `sort_order`), UNIQUE (`season_id`, `mission_code`).

### `mission_completions`
Conclusões. Elegibilidade = DISTINCT user com as 3 codes da temporada.

| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK → `users` | |
| `season_id` | uuid FK → `seasons` | |
| `mission_id` | uuid FK → `missions` | |
| `mission_code` | `mission_code` NOT NULL | |
| `completed_at` | timestamptz NOT NULL | |
| `progress_current` | numeric(18,2) | Snapshot opcional |
| `progress_target` | numeric(18,2) | |

UNIQUE recomendado: (`user_id`, `season_id`, `mission_code`) — 1ª conclusão vale; duplicatas ignoradas no DISTINCT.

### `user_mission_progress` (opcional — progresso parcial na home)
| Coluna | Tipo |
|--------|------|
| `id` | uuid PK |
| `user_id` | uuid FK |
| `season_id` | uuid FK |
| `mission_id` | uuid FK |
| `current_value` | numeric(18,2) |
| `target_value` | numeric(18,2) |
| `status` | varchar(20) (`locked`,`active`,`available`,`claimed`) |
| `updated_at` | timestamptz |

UNIQUE (`user_id`, `mission_id`, `season_id`).

---

## 4. Passe de recompensas (BullPass)

### `pass_rewards`
Catálogo por nível/trilha (admin Recompensas).

| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | uuid PK | |
| `season_id` | uuid FK → `seasons` | Null = global |
| `track` | `pass_track` NOT NULL | |
| `level` | int NOT NULL | |
| `title` | varchar(160) NOT NULL | |
| `subtitle` | varchar(255) | |
| `kind` | `pass_reward_kind` NOT NULL | |
| `amount` | varchar(40) | Ex.: `10`, `250` |
| `unit_label` | varchar(40) | `R$`, `pontos` |
| `eligibility_text` | text | |
| `description` | text | |
| `image_url` | text | |
| `points_bonus` | int DEFAULT 0 | XP ao resgatar |
| `limit_per_user` | int DEFAULT 1 | |
| `validity_days` | int | Dias após resgate |
| `is_active` | boolean DEFAULT true | |
| `created_at` / `updated_at` | timestamptz | |

UNIQUE (`season_id`, `track`, `level`) — ou parcial se `season_id` null.

### `pass_reward_claims`
| Coluna | Tipo |
|--------|------|
| `id` | uuid PK |
| `user_id` | uuid FK → `users` |
| `pass_reward_id` | uuid FK → `pass_rewards` |
| `claimed_at` | timestamptz NOT NULL |
| `state` | `claim_state` | |

UNIQUE (`user_id`, `pass_reward_id`).

---

## 5. Cupons

### `coupons`
Catálogo admin.

| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | uuid PK | |
| `code` | varchar(40) UNIQUE NOT NULL | |
| `name` | varchar(160) NOT NULL | |
| `description` | text | |
| `type` | `coupon_type` NOT NULL | |
| `value_label` | varchar(80) | |
| `status` | `coupon_catalog_status` NOT NULL | |
| `redemption_limit` | int | Estoque global |
| `redemptions_count` | int DEFAULT 0 | Ou COUNT |
| `min_deposit` | numeric(18,2) | |
| `max_discount` | numeric(18,2) | |
| `one_per_user` | boolean DEFAULT true | |
| `terms` | text | |
| `image_url` | text | |
| `tags` | text[] | |
| `starts_at` | timestamptz | |
| `expires_at` | timestamptz | |
| `created_at` / `updated_at` | timestamptz | |

### `user_coupons`
Instância na carteira do trader (`/recompensas`).

| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK → `users` | |
| `coupon_id` | uuid FK → `coupons` | |
| `status` | `user_coupon_status` NOT NULL | |
| `source` | varchar(160) | “Passe Nível 3”, “Missão…” |
| `issued_at` | timestamptz NOT NULL | |
| `expires_at` | timestamptz NOT NULL | |
| `used_at` | timestamptz | |

Índice: (`user_id`, `status`).

---

## 6. Campanhas / banners

### `campaign_banners`
Carrossel home + aba Banners no admin.

| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | uuid PK | |
| `title` | varchar(160) NOT NULL | |
| `image_url` | text NOT NULL | |
| `alt_text` | varchar(255) | |
| `status` | `banner_status` NOT NULL | |
| `placement` | `banner_placement` DEFAULT `home` | |
| `priority` | int NOT NULL DEFAULT 1 | Ordem |
| `cta_url` | text | |
| `starts_at` | date | |
| `ends_at` | date | |
| `created_at` / `updated_at` | timestamptz | |

`progress` % = calculado: `(now - starts) / (ends - starts)`.

---

## 7. Sorteio BullStart (crítico)

### `draw_prizes`
Estoque de prêmios físicos/digitais.

| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | varchar(40) PK | Ex.: `PRIZE-018` (ou uuid + `code`) |
| `name` | varchar(160) NOT NULL | |
| `image_url` | text | |
| `category` | varchar(80) | |
| `description` | text | |
| `quantity_available` | int NOT NULL CHECK (≥ 0) | Decrementa no execute |
| `season_id` | uuid FK → `seasons` NULL | Preferência opcional |
| `is_active` | boolean DEFAULT true | |
| `created_at` / `updated_at` | timestamptz | |

### `draws`
| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | uuid PK | |
| `code` | varchar(20) UNIQUE | `#001`, `#018` |
| `season_id` | uuid FK → `seasons` NOT NULL | |
| `prize_id` | varchar/uuid FK → `draw_prizes` NOT NULL | |
| `prize_units` | int NOT NULL DEFAULT 1 CHECK (> 0) | N ganhadores |
| `status` | `draw_status` NOT NULL | |
| `participant_count` | int NOT NULL | Snapshot |
| `participant_snapshot_hash` | char(64) NOT NULL | SHA-256 |
| `created_by` | uuid FK → `users` | Admin |
| `prepared_at` | timestamptz NOT NULL | |
| `drawn_at` | timestamptz | Null até completed |
| `created_at` / `updated_at` | timestamptz | |

Regra: `status = completed` → **nunca** reexecutar (idempotência).

### `draw_participants`
Snapshot congelado no prepare (imutável).

| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | uuid PK | |
| `draw_id` | uuid FK → `draws` ON DELETE CASCADE | |
| `user_id` | uuid FK → `users` | |
| `trader_id` | varchar(32) NOT NULL | Cópia |
| `name` | varchar(160) NOT NULL | Cópia |
| `email` | varchar(255) | Cópia |
| `mission1` | boolean NOT NULL | |
| `mission2` | boolean NOT NULL | |
| `mission3` | boolean NOT NULL | |
| `snapshot_order` | int | Ordem estável p/ hash |

UNIQUE (`draw_id`, `user_id`).

### `draw_winners`
| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | uuid PK | |
| `draw_id` | uuid FK → `draws` | |
| `user_id` | uuid FK → `users` | |
| `trader_id` | varchar(32) | |
| `name` | varchar(160) | |
| `place` | smallint NOT NULL | 1..N |
| `prize_received` | boolean DEFAULT false | |
| `delivery_status` | `delivery_status` DEFAULT `pending` | |
| `won_at` | timestamptz NOT NULL | |
| `notified_at` | timestamptz | |

UNIQUE (`draw_id`, `place`), UNIQUE (`draw_id`, `user_id`).

### `draw_win_acknowledgements`
Popup “Você ganhou” visto pelo trader.

| Coluna | Tipo |
|--------|------|
| `id` | uuid PK |
| `draw_id` | uuid FK → `draws` |
| `user_id` | uuid FK → `users` |
| `seen_at` | timestamptz NOT NULL |

UNIQUE (`draw_id`, `user_id`).

---

## 8. Histórico de prêmios do trader

### `user_prize_history`
Tela `/historico` + KPI prêmios entregues (quando origem = sorteio).

| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK → `users` | |
| `season_id` | uuid FK → `seasons` | |
| `draw_winner_id` | uuid FK → `draw_winners` NULL | Se veio de sorteio |
| `pass_claim_id` | uuid FK → `pass_reward_claims` NULL | Se veio do passe |
| `title` | varchar(160) NOT NULL | |
| `description` | text | |
| `image_url` | text | |
| `category` | varchar(80) | |
| `subcategory` | varchar(80) | |
| `category_icon` | varchar(40) | console/phone/car/… |
| `kind` | `reward_kind` | |
| `status` | `delivery_status` NOT NULL | |
| `claimed_at` | timestamptz NOT NULL | |
| `value_amount` | numeric(18,2) | Para stats |
| `currency` | char(3) | |

KPI admin “Prêmios entregues” (BullStart): contar linhas ligadas a `draw_winners` com `prize_received` OU `delivery_status = delivered`.

---

## 9. Suporte

### `support_faqs`
| Coluna | Tipo |
|--------|------|
| `id` | uuid PK |
| `question` | text NOT NULL |
| `answer` | text NOT NULL |
| `category` | varchar(80) NOT NULL |
| `sort_order` | int DEFAULT 0 |
| `is_published` | boolean DEFAULT true |
| `created_at` / `updated_at` | timestamptz |

### `support_tickets`
| Coluna | Tipo |
|--------|------|
| `id` | uuid PK |
| `user_id` | uuid FK → `users` |
| `channel` | `support_channel` |
| `subject` | varchar(200) |
| `body` | text |
| `status` | `support_ticket_status` |
| `protocol` | varchar(40) UNIQUE |
| `created_at` / `updated_at` | timestamptz |

### `support_settings` (opcional — tiles)
| Coluna | Tipo |
|--------|------|
| `key` | varchar(60) PK |
| `value` | text |

---

## 10. Conteúdo / config

### `app_settings`
| Coluna | Tipo |
|--------|------|
| `key` | varchar(80) PK |
| `value` | jsonb |
| `updated_at` | timestamptz |

Ex.: textos de jornada, status suporte online, etc.

### `rank_tiers` (ou config estática no código)
| Coluna | Tipo |
|--------|------|
| `id` | varchar(20) PK | bronze…diamond |
| `label` | varchar(40) |
| `min_level` | int |
| `max_level` | int NULL |

---

## Relacionamentos (visão rápida)

```
users ─┬─ deposits / withdrawals / trades
       ├─ mission_completions / user_mission_progress
       ├─ pass_reward_claims → pass_rewards
       ├─ user_coupons → coupons
       ├─ draw_participants / draw_winners
       ├─ draw_win_acknowledgements
       ├─ user_prize_history
       └─ support_tickets

seasons ─┬─ season_missions → missions
         ├─ deposits / trades / completions
         └─ draws → draw_prizes
                  ├─ draw_participants
                  └─ draw_winners
```

---

## Campos calculados (NÃO persistir)

| Dado | Como obter |
|------|------------|
| Elegível ao sorteio | 3 `mission_completions` distintas na temporada |
| Total depositado (elegíveis) | `SUM(deposits.amount)` onde `status=completed` + temporada |
| Funil M01/M02/M03 | `COUNT DISTINCT user_id` por `mission_code` |
| 3/3 concluídas | COUNT users com 3 codes |
| Progresso banner % | datas `starts_at`/`ends_at` |
| KPIs Usuários/Depósitos/Saques | agregações |
| Stats cupons disponível/usado/expirado | COUNT por status |
| Chance “1 / N” | `1 / participant_count` do draw |
| Rank bronze→diamante | `pass_level` + `rank_tiers` |

---

## Regras que o backend deve garantir

1. **Elegibilidade:** só 3/3 missões da temporada; sem peso por depósito.
2. **Prepare draw:** snapshot imutável + hash SHA-256; buscar elegíveis no servidor.
3. **Execute draw:** `crypto.randomInt` no servidor; nunca aceitar `winnerId` do client; transação (lock draw + decrementar estoque + inserir winners).
4. **Idempotência:** draw `completed` não reexecuta.
5. **Auth:** `/api/admin/*` exige `role = admin`; trader só vê os próprios dados.
6. **Depósitos BullStart:** apenas `completed`.

---

## Ordem sugerida de migration

1. `users`, `postback_events`, `sessions`, `oauth_accounts`  
2. `seasons`, `missions`, `season_missions`  
3. `deposits`, `withdrawals`, `trades`  
4. `mission_completions`, `user_mission_progress`  
5. `pass_rewards`, `pass_reward_claims`  
6. `coupons`, `user_coupons`  
7. `campaign_banners`  
8. `draw_prizes`, `draws`, `draw_participants`, `draw_winners`, `draw_win_acknowledgements`  
9. `user_prize_history`  
10. `support_faqs`, `support_tickets`, `app_settings`

---

## Checklist do endpoint de postback

1. Validar assinatura/HMAC (segredo compartilhado com o outro site).  
2. Gravar `postback_events` **antes** de mutar negócio (`status = received`).  
3. Se `event_id` já existe → retornar `200` sem reprocessar (idempotente).  
4. Resolver usuário: `UPSERT users` por `external_user_id` / `trader_id`.  
5. Se for depósito/trade/saque → upsert na tabela correspondente com `external_*_id`.  
6. Marcar evento `processed` + `user_id` / `related_entity_id`.  
7. Nunca confiar no client do BullVerse para criar o trader — só o postback (ou admin manual).

---

## Cobertura por tela

| Tela | Tabelas principais |
|------|-------------------|
| Login | `users`, `sessions`, `oauth_accounts` |
| Missões | `seasons`, `season_missions`, `missions`, `user_mission_progress`, `mission_completions`, `users` (passe) |
| Recompensas (trader) | `user_coupons`, `coupons`, `pass_reward_claims` |
| Histórico | `user_prize_history` |
| Suporte | `support_faqs`, `support_tickets` |
| Admin Visão Geral | `users`, `deposits`, `withdrawals`, agregações BullStart |
| Admin Missões / Recompensas / Cupons / Banners | CRUDs correspondentes |
| Admin Novo sorteio / Sorteios | `draw_*` + elegíveis via completions |

Com este conjunto o frontend atual consegue operar sem mocks, desde que a API exponha os mesmos contratos já usados em `bullstartAdmin.ts` e `bullstartDraw.ts`.
