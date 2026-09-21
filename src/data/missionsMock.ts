export type MissionStatus = 'locked' | 'active' | 'available' | 'claimed'

export type MissionType = 'deposit_single_day' | 'active_days' | 'monthly_deposit'

export type MissionRewardIcon = 'shield' | 'bonus' | 'ticket'

export type Mission = {
  id: number
  code: string
  title: string
  description: string
  type: MissionType
  current: number
  target: number
  status: MissionStatus
  reward: string
  rewardIcon: MissionRewardIcon
  remainingLabel: string
  unit: 'currency' | 'days'
  imageSrc: string
  points: number
}

export type UserStats = {
  monthlyDeposit: number
  tradingVolume: number
  activeDays: number
  completedMissions: number
  totalMissions: number
}

export type MonthProgress = {
  label: string
  percent: number
  caption: string
}

export type JourneyProgress = {
  eyebrow: string
  level: number
  currentPoints: number
  targetPoints: number
  nextRewardLabel: string
  nextRewardTitle: string
  remainingPoints: number
  footerTitle: string
  footerSubtitle: string
  footerCta: string
  seasonLabel: string
  daysLeft: number
}

export type RankId = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'

export type RankTier = {
  id: RankId
  label: string
  minLevel: number
  maxLevel: number | null
}

export const RANK_TIERS: RankTier[] = [
  { id: 'bronze', label: 'Bronze', minLevel: 1, maxLevel: 4 },
  { id: 'silver', label: 'Prata', minLevel: 5, maxLevel: 9 },
  { id: 'gold', label: 'Ouro', minLevel: 10, maxLevel: 14 },
  { id: 'platinum', label: 'Platina', minLevel: 15, maxLevel: 19 },
  { id: 'diamond', label: 'Diamante', minLevel: 20, maxLevel: null },
]

export function getRankByLevel(level: number) {
  const safeLevel = Math.max(1, level)
  const current =
    [...RANK_TIERS].reverse().find((tier) => safeLevel >= tier.minLevel) ?? RANK_TIERS[0]
  const currentIndex = RANK_TIERS.findIndex((tier) => tier.id === current.id)
  const next = currentIndex >= 0 && currentIndex < RANK_TIERS.length - 1
    ? RANK_TIERS[currentIndex + 1]
    : null

  const levelsToNext = next ? Math.max(0, next.minLevel - safeLevel) : 0

  return {
    current,
    next,
    levelsToNext,
    progressInRank:
      current.maxLevel == null
        ? 100
        : Math.min(
            100,
            Math.round(
              ((safeLevel - current.minLevel) /
                (current.maxLevel - current.minLevel + 1)) *
                100,
            ),
          ),
  }
}

export type PassRewardState = 'claimed' | 'claimable' | 'locked'

export type PassRewardKind =
  | 'balance'
  | 'ticket'
  | 'riskfree'
  | 'cashback'
  | 'xpboost'
  | 'bonus'
  | 'coupon'
  | 'vip'
  | 'multiplier'
  | 'badge'
  | 'avatar'
  | 'points'

export type PassReward = {
  level: number
  title: string
  subtitle: string
  state: PassRewardState
  kind: PassRewardKind
  /** Pontos bônus creditados no nível ao resgatar (trilha). */
  points?: number
}

export type PassTrack = {
  id: 'free' | 'premium'
  label: string
  description: string
  premium: boolean
  rewards: PassReward[]
}

export type NextPassReward = {
  level: number
  title: string
  subtitle: string
  tags: string[]
  kind: PassRewardKind
  detail: string
  premiumTitle?: string
}

export type SeasonMissionIcon = 'deposit' | 'calendar' | 'chart' | 'explore'

export type SeasonMission = Mission & {
  icon: SeasonMissionIcon
  ctaLabel: string
}

export const mockUser = {
  id: '482917',
  firstName: 'Gabriel',
}

export const mockStats: UserStats = {
  monthlyDeposit: 420,
  tradingVolume: 1840,
  activeDays: 7,
  completedMissions: 2,
  totalMissions: 3,
}

/** Mock do “próximo passo” até existir API/banco.
 * Futuramente: missão mais próxima de conclusão para o usuário. */
export const mockNextStep = {
  eyebrow: 'PRÓXIMO PASSO',
  title: 'Continue sua jornada no BullStart',
  missionTitle: 'Mostre consistência',
  missionHint: 'Só falta negociar em mais 1 dia.',
  completed: 3,
  total: 4,
  percent: 75,
  ctaLabel: 'Continuar missão',
  href: '/missoes',
}

export const mockMonthProgress: MonthProgress = {
  label: 'BULLSTART · PROGRESSO DO MÊS',
  percent: 68,
  caption: 'Falta pouco para completar todas as missões BullStart de outubro.',
}

export const mockJourney: JourneyProgress = {
  eyebrow: 'NÍVEL ATUAL',
  level: 3,
  currentPoints: 620,
  targetPoints: 1000,
  nextRewardLabel: 'Próxima recompensa',
  nextRewardTitle: 'R$ 25 saldo promocional',
  remainingPoints: 380,
  footerTitle: 'EVOLUA. OPERE. CONQUISTE.',
  footerSubtitle: 'Complete missões para avançar no passe.',
  footerCta: 'Ver regras da temporada',
  seasonLabel: 'Temporada 09 · Setembro 2026',
  daysLeft: 9,
}

export const mockNextPassReward: NextPassReward = {
  level: 4,
  title: 'R$ 25',
  subtitle: 'Saldo promocional',
  tags: ['SALDO', 'PASSE'],
  kind: 'balance',
  detail: 'Saldo promocional creditado na conta para uso em operações elegíveis.',
  premiumTitle: 'VIP por 7 dias',
}

export const mockPassTracks: PassTrack[] = [
  {
    id: 'free',
    label: 'BullPass',
    description: 'Todo trader evolui por aqui.',
    premium: false,
    rewards: [
      {
        level: 1,
        title: 'R$ 5',
        subtitle: 'Saldo promocional',
        state: 'claimed',
        kind: 'balance',
      },
      {
        level: 2,
        title: '+1',
        subtitle: 'Ticket',
        state: 'claimed',
        kind: 'ticket',
      },
      {
        level: 3,
        title: '+200 pontos',
        subtitle: 'Impulso de pontos',
        state: 'claimable',
        kind: 'points',
        points: 200,
      },
      {
        level: 4,
        title: 'RiskFree',
        subtitle: 'Operação protegida',
        state: 'locked',
        kind: 'riskfree',
      },
      {
        level: 5,
        title: 'R$ 10',
        subtitle: 'Cashback',
        state: 'locked',
        kind: 'cashback',
      },
      {
        level: 6,
        title: '+2',
        subtitle: 'Tickets',
        state: 'locked',
        kind: 'ticket',
      },
      {
        level: 7,
        title: '+25% pontos',
        subtitle: 'Boost 24h',
        state: 'locked',
        kind: 'xpboost',
      },
      {
        level: 8,
        title: 'R$ 15',
        subtitle: 'Saldo promocional',
        state: 'locked',
        kind: 'balance',
      },
      {
        level: 9,
        title: '+3',
        subtitle: 'Tickets',
        state: 'locked',
        kind: 'ticket',
      },
      {
        level: 10,
        title: '+400 pontos',
        subtitle: 'Impulso de pontos',
        state: 'locked',
        kind: 'points',
        points: 400,
      },
      {
        level: 11,
        title: 'RiskFree',
        subtitle: 'Operação protegida',
        state: 'locked',
        kind: 'riskfree',
      },
      {
        level: 12,
        title: 'R$ 20',
        subtitle: 'Cashback',
        state: 'locked',
        kind: 'cashback',
      },
      {
        level: 13,
        title: '+50% pontos',
        subtitle: 'Boost 48h',
        state: 'locked',
        kind: 'xpboost',
      },
      {
        level: 14,
        title: '10% OFF',
        subtitle: 'Cupom depósito',
        state: 'locked',
        kind: 'coupon',
      },
      {
        level: 15,
        title: 'Consistente',
        subtitle: 'Badge exclusivo',
        state: 'locked',
        kind: 'badge',
      },
    ],
  },
  {
    id: 'premium',
    label: 'BullPass Premium',
    description: 'Benefícios adicionais para quem quer ir mais longe.',
    premium: true,
    rewards: [
      {
        level: 1,
        title: 'R$ 20',
        subtitle: 'Saldo promocional',
        state: 'claimed',
        kind: 'balance',
      },
      {
        level: 2,
        title: 'US$ 10',
        subtitle: 'RiskFree',
        state: 'claimed',
        kind: 'riskfree',
      },
      {
        level: 3,
        title: '+5',
        subtitle: 'Tickets',
        state: 'claimable',
        kind: 'ticket',
      },
      {
        level: 4,
        title: '7 dias',
        subtitle: 'VIP',
        state: 'locked',
        kind: 'vip',
      },
      {
        level: 5,
        title: 'R$ 50',
        subtitle: 'Cashback',
        state: 'locked',
        kind: 'cashback',
      },
      {
        level: 6,
        title: '2× pontos',
        subtitle: 'Por 24h',
        state: 'locked',
        kind: 'multiplier',
      },
      {
        level: 7,
        title: '+25%',
        subtitle: 'Bônus depósito',
        state: 'locked',
        kind: 'bonus',
      },
      {
        level: 8,
        title: 'R$ 75',
        subtitle: 'Saldo promocional',
        state: 'locked',
        kind: 'balance',
      },
      {
        level: 9,
        title: '+8',
        subtitle: 'Tickets',
        state: 'locked',
        kind: 'ticket',
      },
      {
        level: 10,
        title: '14 dias',
        subtitle: 'VIP',
        state: 'locked',
        kind: 'vip',
      },
      {
        level: 11,
        title: 'US$ 25',
        subtitle: 'RiskFree',
        state: 'locked',
        kind: 'riskfree',
      },
      {
        level: 12,
        title: '3× pontos',
        subtitle: 'Por 48h',
        state: 'locked',
        kind: 'multiplier',
      },
      {
        level: 13,
        title: 'R$ 100',
        subtitle: 'Cashback',
        state: 'locked',
        kind: 'cashback',
      },
      {
        level: 14,
        title: '+40%',
        subtitle: 'Bônus depósito',
        state: 'locked',
        kind: 'bonus',
      },
      {
        level: 15,
        title: 'Elite',
        subtitle: 'Badge Premium',
        state: 'locked',
        kind: 'badge',
      },
    ],
  },
]

export const PASS_KIND_LABELS: Record<PassRewardKind, string> = {
  balance: 'Saldo promocional',
  ticket: 'Tickets',
  riskfree: 'RiskFree',
  cashback: 'Cashback',
  xpboost: 'Impulso de pontos',
  bonus: 'Bônus',
  coupon: 'Cupom',
  vip: 'Status VIP',
  multiplier: 'Multiplicador',
  badge: 'Badge',
  avatar: 'Personalização',
  points: 'Pontos bônus',
}

const PASS_KIND_TAGS: Record<PassRewardKind, string[]> = {
  balance: ['SALDO', 'PASSE'],
  ticket: ['TICKET', 'CAMPANHA'],
  riskfree: ['RISKFREE', 'PROTEÇÃO'],
  cashback: ['CASHBACK', 'PASSE'],
  xpboost: ['PONTOS', 'BOOST'],
  bonus: ['BÔNUS', 'DEPÓSITO'],
  coupon: ['CUPOM', 'EXCLUSIVO'],
  vip: ['VIP', 'STATUS'],
  multiplier: ['MULTIPLICADOR', 'PONTOS'],
  badge: ['BADGE', 'PERFIL'],
  avatar: ['AVATAR', 'PERFIL'],
  points: ['PONTOS', 'BÔNUS'],
}

const PASS_KIND_DETAILS: Record<PassRewardKind, string> = {
  balance: 'Saldo promocional creditado na conta para uso em operações elegíveis.',
  ticket: 'Tickets para participar de campanhas e sorteios digitais da temporada.',
  riskfree: 'Operação protegida: cobertura parcial conforme regras da campanha.',
  cashback: 'Parte do valor operado retorna como cashback na plataforma.',
  xpboost: 'Impulso temporário de pontos para acelerar a progressão no passe.',
  bonus: 'Bônus adicional em depósito elegível, sujeito às regras da campanha.',
  coupon: 'Cupom exclusivo desbloqueado para uso na plataforma.',
  vip: 'Acesso temporário a benefícios VIP dentro da Bullex.',
  multiplier: 'Multiplicador de pontos ou tickets por um período limitado.',
  badge: 'Badge digital exibida no perfil do trader.',
  avatar: 'Item de personalização digital para o perfil.',
  points: 'Pontos bônus creditados imediatamente na jornada da temporada.',
}

/** Próxima recompensa do passe = item do nível atual + 1. */
export function getNextPassReward(
  currentLevel: number,
  options?: { hasPremium?: boolean },
): NextPassReward | null {
  const freeTrackData = mockPassTracks.find((track) => track.id === 'free')
  const premiumTrackData = mockPassTracks.find((track) => track.id === 'premium')
  const nextLevel = currentLevel + 1
  const freeReward = freeTrackData?.rewards.find((reward) => reward.level === nextLevel)

  if (!freeReward) return null

  const premiumReward = premiumTrackData?.rewards.find((reward) => reward.level === nextLevel)
  const detail = PASS_KIND_DETAILS[freeReward.kind] ?? 'Recompensa do próximo nível do Passe.'

  return {
    level: nextLevel,
    title: freeReward.title,
    subtitle: freeReward.subtitle,
    tags: PASS_KIND_TAGS[freeReward.kind] ?? [PASS_KIND_LABELS[freeReward.kind], 'PASSE'],
    kind: freeReward.kind,
    detail,
    premiumTitle:
      options?.hasPremium && premiumReward
        ? `${premiumReward.title} · ${premiumReward.subtitle}`
        : premiumReward
          ? `${premiumReward.title} · ${premiumReward.subtitle}`
          : undefined,
  }
}

export function getPassRewardPoints(reward: PassReward): number {
  if (typeof reward.points === 'number' && Number.isFinite(reward.points)) {
    return Math.max(0, Math.round(reward.points))
  }

  if (reward.kind !== 'points' && reward.kind !== 'xpboost') return 0

  const match = reward.title.match(/\+?\s*([\d.]+)\s*(?:XP|pontos)/i)
  if (!match) return 0

  return Math.max(0, Number(match[1].replace(/\./g, '')))
}

/** Estado dinâmico da trilha: libera tudo até o nível atual. */
export function resolvePassRewardState(
  reward: PassReward,
  currentLevel: number,
  claimedLevels: number[],
): PassRewardState {
  if (claimedLevels.includes(reward.level)) return 'claimed'
  if (reward.level <= currentLevel) return 'claimable'
  return 'locked'
}

export function getInitiallyClaimedLevels(track: PassTrack): number[] {
  return track.rewards.filter((reward) => reward.state === 'claimed').map((reward) => reward.level)
}

export function applyJourneyPoints(
  journey: JourneyProgress,
  gainedPoints: number,
): JourneyProgress {
  let level = journey.level
  let currentPoints = journey.currentPoints + Math.max(0, gainedPoints)
  const targetPoints = journey.targetPoints

  while (currentPoints >= targetPoints) {
    currentPoints -= targetPoints
    level += 1
  }

  return {
    ...journey,
    level,
    currentPoints,
    remainingPoints: Math.max(0, targetPoints - currentPoints),
  }
}

export const mockMissions: Mission[] = [
  {
    id: 1,
    code: 'MISSÃO 01',
    title: 'Depositar este mês',
    description: 'Complete 5 depósitos no ciclo atual.',
    type: 'monthly_deposit',
    current: 5,
    target: 5,
    status: 'active',
    reward: 'R$25 RiskFree',
    rewardIcon: 'shield',
    remainingLabel: 'Missão concluída.',
    unit: 'days',
    imageSrc: '/media/missions/mission-01.jpg',
    points: 300,
  },
  {
    id: 2,
    code: 'MISSÃO 02',
    title: 'Operar em dias diferentes',
    description: 'Negocie em 5 dias distintos da temporada.',
    type: 'active_days',
    current: 3,
    target: 5,
    status: 'active',
    reward: '150% de Bônus',
    rewardIcon: 'bonus',
    remainingLabel: 'Só falta negociar em mais 2 dias.',
    unit: 'days',
    imageSrc: '/media/missions/mission-02.jpg',
    points: 250,
  },
  {
    id: 3,
    code: 'MISSÃO 03',
    title: 'Atingir volume de operações',
    description: 'Alcance R$5.000 em volume negociado.',
    type: 'deposit_single_day',
    current: 1840,
    target: 5000,
    status: 'active',
    reward: 'R$50 RiskFree',
    rewardIcon: 'shield',
    remainingLabel: 'Continue operando para avançar.',
    unit: 'currency',
    imageSrc: '/media/missions/mission-03.jpg',
    points: 400,
  },
  {
    id: 4,
    code: 'MISSÃO 04',
    title: 'Explorar a plataforma',
    description: 'Visite 3 áreas diferentes do dashboard.',
    type: 'active_days',
    current: 1,
    target: 3,
    status: 'available',
    reward: '1 Ticket Bullcar',
    rewardIcon: 'ticket',
    remainingLabel: 'Faltam 2 áreas para explorar.',
    unit: 'days',
    imageSrc: '/media/missions/mission-02.jpg',
    points: 150,
  },
]

export const seasonMissionIcons: Record<number, SeasonMissionIcon> = {
  1: 'deposit',
  2: 'calendar',
  3: 'chart',
  4: 'explore',
}

export const seasonMissionCtas: Record<number, string> = {
  1: 'Concluída',
  2: 'Continuar',
  3: 'Continuar',
  4: 'Ir agora',
}

export const navItems = [
  { id: 'inicio', label: 'Início', path: '/inicio' },
  { id: 'bullstart', label: 'BullStart', path: '/missoes', badge: 'NOVO' },
  { id: 'recompensas', label: 'Recompensas', path: '/recompensas' },
  { id: 'historico', label: 'Histórico', path: '/historico' },
  { id: 'suporte', label: 'Suporte', path: '/suporte' },
  { id: 'administrador', label: 'Administrador', path: '/administrador' },
] as const

export type PromoBanner = {
  id: string
  imageSrc: string
  alt: string
  title: string
}

export const mockPromoBanners: PromoBanner[] = [
  {
    id: 'iphone-18-pro-max',
    imageSrc: '/media/banners/iphone-18-pro-max.jpg',
    alt: 'iPhone 18 Pro Max — campanha especial',
    title: 'iPhone 18 Pro Max',
  },
  {
    id: 'haval-h6',
    imageSrc: '/media/banners/haval-h6.jpg',
    alt: 'Campanha Haval H6 — concorra a um SUV premium',
    title: 'Haval H6',
  },
  {
    id: 'ps5-pro-gta6',
    imageSrc: '/media/banners/ps5-pro-gta6.jpg',
    alt: 'Bundle GTA VI — PS5 Pro edição especial',
    title: 'Bundle GTA VI',
  },
]

export function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function formatMissionValue(value: number, unit: Mission['unit']) {
  if (unit === 'currency') return formatBRL(value)
  return `${value}`
}
