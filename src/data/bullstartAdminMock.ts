/**
 * Dataset normalizado do BullStart Admin.
 * Substitui agregações de backend enquanto não existir API/banco.
 * Missões da campanha são resolvidas por `code` + `order`, nunca por id numérico fixo.
 */

export type BullstartSeasonId = 'season-09-2026' | 'season-08-2026'

export type BullstartMissionCode = 'MISSÃO 01' | 'MISSÃO 02' | 'MISSÃO 03'

export type DepositStatus = 'completed' | 'pending' | 'cancelled' | 'failed' | 'refunded'

/** Alinhado a `HistoryStatus` em historyMock + entrega administrativa. */
export type RewardDeliveryStatus = 'delivered' | 'shipped' | 'used'

export type RewardKind =
  | 'physical'
  | 'balance'
  | 'riskfree'
  | 'ticket'
  | 'cashback'
  | 'bonus'
  | 'other'

export type EligibleStatus = 'eligible'

export type BullstartSeasonMission = {
  code: BullstartMissionCode
  order: 1 | 2 | 3
  title: string
  missionRefId: string
}

export type BullstartSeason = {
  id: BullstartSeasonId
  label: string
  startsAt: string
  endsAt: string
  missions: BullstartSeasonMission[]
}

export type BullstartTrader = {
  userId: string
  traderId: string
  name: string
  email: string
}

export type BullstartDeposit = {
  id: string
  userId: string
  amount: number
  status: DepositStatus
  createdAt: string
  seasonId: BullstartSeasonId
}

export type BullstartMissionCompletion = {
  id: string
  userId: string
  seasonId: BullstartSeasonId
  missionCode: BullstartMissionCode
  completedAt: string
}

export type BullstartDeliveredReward = {
  id: string
  userId: string
  seasonId: BullstartSeasonId
  kind: RewardKind
  status: RewardDeliveryStatus
  title: string
  deliveredAt: string
}

/** Resultado do sorteio da campanha (prêmio principal). */
export type BullstartDrawWinner = {
  id: string
  seasonId: BullstartSeasonId
  userId: string
  prizeTitle: string
  wonAt: string
  /** true quando o ganhador já recebeu o prêmio. */
  prizeReceived: boolean
  deliveryStatus: 'pending' | 'shipped' | 'delivered'
}

export const bullstartSeasons: BullstartSeason[] = [
  {
    id: 'season-09-2026',
    label: 'Temporada 09 · Setembro 2026',
    startsAt: '2026-09-01',
    endsAt: '2026-10-02',
    missions: [
      {
        code: 'MISSÃO 01',
        order: 1,
        title: 'Depositar este mês',
        missionRefId: 'm1',
      },
      {
        code: 'MISSÃO 02',
        order: 2,
        title: 'Operar em dias diferentes',
        missionRefId: 'm2',
      },
      {
        code: 'MISSÃO 03',
        order: 3,
        title: 'Atingir volume de operações',
        missionRefId: 'm3',
      },
    ],
  },
  {
    id: 'season-08-2026',
    label: 'Temporada 08 · Agosto 2026',
    startsAt: '2026-08-01',
    endsAt: '2026-08-31',
    missions: [
      {
        code: 'MISSÃO 01',
        order: 1,
        title: 'Primeiro depósito',
        missionRefId: 'm1-aug',
      },
      {
        code: 'MISSÃO 02',
        order: 2,
        title: 'Consistência semanal',
        missionRefId: 'm2-aug',
      },
      {
        code: 'MISSÃO 03',
        order: 3,
        title: 'Volume da temporada',
        missionRefId: 'm3-aug',
      },
    ],
  },
]

export const DEFAULT_BULLSTART_SEASON_ID: BullstartSeasonId = 'season-09-2026'

export const bullstartTraders: BullstartTrader[] = [
  {
    userId: 'u-gabriel',
    traderId: '482917',
    name: 'Gabriel',
    email: 'gabriel@email.com',
  },
  {
    userId: 'u-ana',
    traderId: '48291',
    name: 'Ana Clara Souza',
    email: 'ana.souza@email.com',
  },
  {
    userId: 'u-bruno',
    traderId: '48290',
    name: 'Bruno Mendes',
    email: 'bruno.m@email.com',
  },
  {
    userId: 'u-carla',
    traderId: '48289',
    name: 'Carla Ribeiro',
    email: 'carla.r@email.com',
  },
  {
    userId: 'u-diego',
    traderId: '48288',
    name: 'Diego Alves',
    email: 'diego.a@email.com',
  },
  {
    userId: 'u-elena',
    traderId: '48287',
    name: 'Elena Costa',
    email: 'elena.c@email.com',
  },
  {
    userId: 'u-felipe',
    traderId: '48102',
    name: 'Felipe Rocha',
    email: 'felipe.r@email.com',
  },
  {
    userId: 'u-helena',
    traderId: '47955',
    name: 'Helena Dias',
    email: 'helena.d@email.com',
  },
  {
    userId: 'u-igor',
    traderId: '47820',
    name: 'Igor Santos',
    email: 'igor.s@email.com',
  },
  {
    userId: 'u-julia',
    traderId: '47710',
    name: 'Júlia Martins',
    email: 'julia.m@email.com',
  },
  {
    userId: 'u-kaique',
    traderId: '47600',
    name: 'Kaique Lopes',
    email: 'kaique.l@email.com',
  },
  {
    userId: 'u-lara',
    traderId: '47550',
    name: 'Lara Nunes',
    email: 'lara.n@email.com',
  },
]

/** Depósitos: vários status e temporadas para validar filtros e anti-duplicidade. */
export const bullstartDeposits: BullstartDeposit[] = [
  // Gabriel — elegível (3 missões) + múltiplos completed
  { id: 'd1', userId: 'u-gabriel', amount: 500, status: 'completed', createdAt: '2026-09-05T10:00:00', seasonId: 'season-09-2026' },
  { id: 'd2', userId: 'u-gabriel', amount: 850, status: 'completed', createdAt: '2026-09-12T14:20:00', seasonId: 'season-09-2026' },
  { id: 'd3', userId: 'u-gabriel', amount: 500, status: 'completed', createdAt: '2026-09-17T11:00:00', seasonId: 'season-09-2026' },
  { id: 'd4', userId: 'u-gabriel', amount: 200, status: 'pending', createdAt: '2026-09-18T09:00:00', seasonId: 'season-09-2026' },
  { id: 'd5', userId: 'u-gabriel', amount: 1000, status: 'completed', createdAt: '2026-08-10T12:00:00', seasonId: 'season-08-2026' },

  // Ana — elegível
  { id: 'd6', userId: 'u-ana', amount: 1000, status: 'completed', createdAt: '2026-09-03T08:00:00', seasonId: 'season-09-2026' },
  { id: 'd7', userId: 'u-ana', amount: 2500, status: 'completed', createdAt: '2026-09-10T16:30:00', seasonId: 'season-09-2026' },
  { id: 'd8', userId: 'u-ana', amount: 500, status: 'cancelled', createdAt: '2026-09-11T10:00:00', seasonId: 'season-09-2026' },

  // Elena — elegível, alto volume
  { id: 'd9', userId: 'u-elena', amount: 5000, status: 'completed', createdAt: '2026-09-02T09:00:00', seasonId: 'season-09-2026' },
  { id: 'd10', userId: 'u-elena', amount: 3200, status: 'completed', createdAt: '2026-09-14T18:00:00', seasonId: 'season-09-2026' },
  { id: 'd11', userId: 'u-elena', amount: 800, status: 'refunded', createdAt: '2026-09-15T12:00:00', seasonId: 'season-09-2026' },

  // Felipe — elegível
  { id: 'd12', userId: 'u-felipe', amount: 1200, status: 'completed', createdAt: '2026-09-08T13:00:00', seasonId: 'season-09-2026' },
  { id: 'd13', userId: 'u-felipe', amount: 650, status: 'completed', createdAt: '2026-09-16T15:00:00', seasonId: 'season-09-2026' },

  // Carla — só M01+M02 (não elegível)
  { id: 'd14', userId: 'u-carla', amount: 800, status: 'completed', createdAt: '2026-09-06T11:00:00', seasonId: 'season-09-2026' },
  { id: 'd15', userId: 'u-carla', amount: 400, status: 'failed', createdAt: '2026-09-07T11:00:00', seasonId: 'season-09-2026' },

  // Helena — só M01
  { id: 'd16', userId: 'u-helena', amount: 300, status: 'completed', createdAt: '2026-09-04T10:00:00', seasonId: 'season-09-2026' },

  // Igor — M01+M02+M03 (elegível)
  { id: 'd17', userId: 'u-igor', amount: 2200, status: 'completed', createdAt: '2026-09-09T12:00:00', seasonId: 'season-09-2026' },
  { id: 'd18', userId: 'u-igor', amount: 900, status: 'completed', createdAt: '2026-09-15T17:00:00', seasonId: 'season-09-2026' },

  // Júlia — só M01+M02
  { id: 'd19', userId: 'u-julia', amount: 450, status: 'completed', createdAt: '2026-09-11T14:00:00', seasonId: 'season-09-2026' },

  // Kaique — participante só M01
  { id: 'd20', userId: 'u-kaique', amount: 150, status: 'completed', createdAt: '2026-09-13T09:00:00', seasonId: 'season-09-2026' },
  { id: 'd21', userId: 'u-kaique', amount: 150, status: 'pending', createdAt: '2026-09-13T09:30:00', seasonId: 'season-09-2026' },

  // Lara — elegível
  { id: 'd22', userId: 'u-lara', amount: 1800, status: 'completed', createdAt: '2026-09-07T16:00:00', seasonId: 'season-09-2026' },
  { id: 'd23', userId: 'u-lara', amount: 700, status: 'completed', createdAt: '2026-09-18T10:00:00', seasonId: 'season-09-2026' },

  // Bruno — sem conclusão relevante, depósito pending
  { id: 'd24', userId: 'u-bruno', amount: 100, status: 'pending', createdAt: '2026-09-17T08:00:00', seasonId: 'season-09-2026' },

  // Diego — bloqueado no admin, mas concluiu M01
  { id: 'd25', userId: 'u-diego', amount: 200, status: 'completed', createdAt: '2026-09-05T20:00:00', seasonId: 'season-09-2026' },

  // Temporada 08 — Elena elegível em agosto
  { id: 'd26', userId: 'u-elena', amount: 1500, status: 'completed', createdAt: '2026-08-12T10:00:00', seasonId: 'season-08-2026' },
  { id: 'd27', userId: 'u-felipe', amount: 800, status: 'completed', createdAt: '2026-08-20T11:00:00', seasonId: 'season-08-2026' },
  { id: 'd28', userId: 'u-ana', amount: 600, status: 'completed', createdAt: '2026-08-15T09:00:00', seasonId: 'season-08-2026' },
]

/**
 * Conclusões por usuário/temporada/código.
 * Inclui duplicata intencional (Gabriel M01) para validar DISTINCT.
 */
export const bullstartMissionCompletions: BullstartMissionCompletion[] = [
  // Gabriel — 3/3 (com duplicata M01)
  { id: 'c1', userId: 'u-gabriel', seasonId: 'season-09-2026', missionCode: 'MISSÃO 01', completedAt: '2026-09-05T12:00:00' },
  { id: 'c1b', userId: 'u-gabriel', seasonId: 'season-09-2026', missionCode: 'MISSÃO 01', completedAt: '2026-09-05T12:05:00' },
  { id: 'c2', userId: 'u-gabriel', seasonId: 'season-09-2026', missionCode: 'MISSÃO 02', completedAt: '2026-09-12T16:00:00' },
  { id: 'c3', userId: 'u-gabriel', seasonId: 'season-09-2026', missionCode: 'MISSÃO 03', completedAt: '2026-09-17T14:32:00' },

  // Ana — 3/3
  { id: 'c4', userId: 'u-ana', seasonId: 'season-09-2026', missionCode: 'MISSÃO 01', completedAt: '2026-09-03T10:00:00' },
  { id: 'c5', userId: 'u-ana', seasonId: 'season-09-2026', missionCode: 'MISSÃO 02', completedAt: '2026-09-08T11:00:00' },
  { id: 'c6', userId: 'u-ana', seasonId: 'season-09-2026', missionCode: 'MISSÃO 03', completedAt: '2026-09-14T09:20:00' },

  // Elena — 3/3
  { id: 'c7', userId: 'u-elena', seasonId: 'season-09-2026', missionCode: 'MISSÃO 01', completedAt: '2026-09-02T11:00:00' },
  { id: 'c8', userId: 'u-elena', seasonId: 'season-09-2026', missionCode: 'MISSÃO 02', completedAt: '2026-09-09T13:00:00' },
  { id: 'c9', userId: 'u-elena', seasonId: 'season-09-2026', missionCode: 'MISSÃO 03', completedAt: '2026-09-15T19:45:00' },

  // Felipe — 3/3
  { id: 'c10', userId: 'u-felipe', seasonId: 'season-09-2026', missionCode: 'MISSÃO 01', completedAt: '2026-09-08T14:00:00' },
  { id: 'c11', userId: 'u-felipe', seasonId: 'season-09-2026', missionCode: 'MISSÃO 02', completedAt: '2026-09-12T10:00:00' },
  { id: 'c12', userId: 'u-felipe', seasonId: 'season-09-2026', missionCode: 'MISSÃO 03', completedAt: '2026-09-16T16:10:00' },

  // Igor — 3/3
  { id: 'c13', userId: 'u-igor', seasonId: 'season-09-2026', missionCode: 'MISSÃO 01', completedAt: '2026-09-09T13:00:00' },
  { id: 'c14', userId: 'u-igor', seasonId: 'season-09-2026', missionCode: 'MISSÃO 02', completedAt: '2026-09-13T15:00:00' },
  { id: 'c15', userId: 'u-igor', seasonId: 'season-09-2026', missionCode: 'MISSÃO 03', completedAt: '2026-09-16T12:00:00' },

  // Lara — 3/3
  { id: 'c16', userId: 'u-lara', seasonId: 'season-09-2026', missionCode: 'MISSÃO 01', completedAt: '2026-09-07T17:00:00' },
  { id: 'c17', userId: 'u-lara', seasonId: 'season-09-2026', missionCode: 'MISSÃO 02', completedAt: '2026-09-12T18:00:00' },
  { id: 'c18', userId: 'u-lara', seasonId: 'season-09-2026', missionCode: 'MISSÃO 03', completedAt: '2026-09-18T11:05:00' },

  // Carla — só 1 e 2
  { id: 'c19', userId: 'u-carla', seasonId: 'season-09-2026', missionCode: 'MISSÃO 01', completedAt: '2026-09-06T12:00:00' },
  { id: 'c20', userId: 'u-carla', seasonId: 'season-09-2026', missionCode: 'MISSÃO 02', completedAt: '2026-09-10T12:00:00' },

  // Júlia — só 1 e 2
  { id: 'c21', userId: 'u-julia', seasonId: 'season-09-2026', missionCode: 'MISSÃO 01', completedAt: '2026-09-11T15:00:00' },
  { id: 'c22', userId: 'u-julia', seasonId: 'season-09-2026', missionCode: 'MISSÃO 02', completedAt: '2026-09-14T16:00:00' },

  // Helena / Kaique / Diego — só M01
  { id: 'c23', userId: 'u-helena', seasonId: 'season-09-2026', missionCode: 'MISSÃO 01', completedAt: '2026-09-04T11:00:00' },
  { id: 'c24', userId: 'u-kaique', seasonId: 'season-09-2026', missionCode: 'MISSÃO 01', completedAt: '2026-09-13T10:00:00' },
  { id: 'c25', userId: 'u-diego', seasonId: 'season-09-2026', missionCode: 'MISSÃO 01', completedAt: '2026-09-05T21:00:00' },

  // Temporada 08
  { id: 'c26', userId: 'u-elena', seasonId: 'season-08-2026', missionCode: 'MISSÃO 01', completedAt: '2026-08-12T12:00:00' },
  { id: 'c27', userId: 'u-elena', seasonId: 'season-08-2026', missionCode: 'MISSÃO 02', completedAt: '2026-08-18T12:00:00' },
  { id: 'c28', userId: 'u-elena', seasonId: 'season-08-2026', missionCode: 'MISSÃO 03', completedAt: '2026-08-25T12:00:00' },
  { id: 'c29', userId: 'u-felipe', seasonId: 'season-08-2026', missionCode: 'MISSÃO 01', completedAt: '2026-08-20T12:00:00' },
  { id: 'c30', userId: 'u-felipe', seasonId: 'season-08-2026', missionCode: 'MISSÃO 02', completedAt: '2026-08-22T12:00:00' },
  { id: 'c31', userId: 'u-ana', seasonId: 'season-08-2026', missionCode: 'MISSÃO 01', completedAt: '2026-08-15T12:00:00' },
]

export const bullstartDeliveredRewards: BullstartDeliveredReward[] = [
  { id: 'rw1', userId: 'u-gabriel', seasonId: 'season-09-2026', kind: 'riskfree', status: 'delivered', title: 'R$25 RiskFree', deliveredAt: '2026-09-05T13:00:00' },
  { id: 'rw2', userId: 'u-gabriel', seasonId: 'season-09-2026', kind: 'bonus', status: 'used', title: '150% Bônus', deliveredAt: '2026-09-12T17:00:00' },
  { id: 'rw3', userId: 'u-ana', seasonId: 'season-09-2026', kind: 'balance', status: 'delivered', title: 'R$ 25 saldo', deliveredAt: '2026-09-03T11:00:00' },
  { id: 'rw4', userId: 'u-ana', seasonId: 'season-09-2026', kind: 'ticket', status: 'delivered', title: '1 Ticket', deliveredAt: '2026-09-08T12:00:00' },
  { id: 'rw5', userId: 'u-elena', seasonId: 'season-09-2026', kind: 'cashback', status: 'delivered', title: 'Cashback R$50', deliveredAt: '2026-09-09T14:00:00' },
  { id: 'rw6', userId: 'u-elena', seasonId: 'season-09-2026', kind: 'physical', status: 'shipped', title: 'iPhone 18 Pro Max', deliveredAt: '2026-09-16T10:00:00' },
  { id: 'rw7', userId: 'u-felipe', seasonId: 'season-09-2026', kind: 'riskfree', status: 'delivered', title: 'R$50 RiskFree', deliveredAt: '2026-09-16T17:00:00' },
  { id: 'rw8', userId: 'u-igor', seasonId: 'season-09-2026', kind: 'ticket', status: 'used', title: 'Ticket Bullcar', deliveredAt: '2026-09-13T16:00:00' },
  { id: 'rw9', userId: 'u-lara', seasonId: 'season-09-2026', kind: 'bonus', status: 'delivered', title: 'Bônus 50%', deliveredAt: '2026-09-12T19:00:00' },
  { id: 'rw10', userId: 'u-carla', seasonId: 'season-09-2026', kind: 'balance', status: 'delivered', title: 'R$ 10 saldo', deliveredAt: '2026-09-06T13:00:00' },
  { id: 'rw11', userId: 'u-helena', seasonId: 'season-09-2026', kind: 'cashback', status: 'delivered', title: 'Cashback R$25', deliveredAt: '2026-09-04T12:00:00' },
  { id: 'rw12', userId: 'u-julia', seasonId: 'season-09-2026', kind: 'other', status: 'delivered', title: 'XP Boost', deliveredAt: '2026-09-11T16:00:00' },
  { id: 'rw13', userId: 'u-kaique', seasonId: 'season-09-2026', kind: 'ticket', status: 'delivered', title: '1 Ticket', deliveredAt: '2026-09-13T11:00:00' },
  { id: 'rw14', userId: 'u-diego', seasonId: 'season-09-2026', kind: 'bonus', status: 'delivered', title: 'Boas-vindas', deliveredAt: '2026-09-05T22:00:00' },
  // Agosto
  { id: 'rw15', userId: 'u-elena', seasonId: 'season-08-2026', kind: 'physical', status: 'delivered', title: 'PS5 Bundle', deliveredAt: '2026-08-26T10:00:00' },
  { id: 'rw16', userId: 'u-felipe', seasonId: 'season-08-2026', kind: 'riskfree', status: 'delivered', title: 'R$100 RiskFree', deliveredAt: '2026-08-21T10:00:00' },
  { id: 'rw17', userId: 'u-ana', seasonId: 'season-08-2026', kind: 'balance', status: 'delivered', title: 'R$ 15 saldo', deliveredAt: '2026-08-16T10:00:00' },
]

/** Ganhadores do prêmio principal do sorteio por temporada. */
export const bullstartDrawWinners: BullstartDrawWinner[] = [
  {
    id: 'dw1',
    seasonId: 'season-09-2026',
    userId: 'u-elena',
    prizeTitle: 'iPhone 18 Pro Max',
    wonAt: '2026-09-16T10:00:00',
    prizeReceived: false,
    deliveryStatus: 'shipped',
  },
  {
    id: 'dw2',
    seasonId: 'season-08-2026',
    userId: 'u-elena',
    prizeTitle: 'PS5 Bundle',
    wonAt: '2026-08-26T10:00:00',
    prizeReceived: true,
    deliveryStatus: 'delivered',
  },
]

export const eligibleStatusLabel: Record<EligibleStatus, string> = {
  eligible: 'Elegível',
}

export const drawDeliveryStatusLabel: Record<BullstartDrawWinner['deliveryStatus'], string> = {
  pending: 'Aguardando envio',
  shipped: 'Enviado',
  delivered: 'Entregue',
}

export const rewardKindLabel: Record<RewardKind, string> = {
  physical: 'Prêmio físico',
  balance: 'Saldo promocional',
  riskfree: 'RiskFree',
  ticket: 'Ticket',
  cashback: 'Cashback',
  bonus: 'Bônus',
  other: 'Outros',
}
