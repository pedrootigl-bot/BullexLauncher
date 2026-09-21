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

export type PassRewardState = 'claimed' | 'claimable' | 'locked'

export type PassRewardKind =
  | 'cashback'
  | 'ticket'
  | 'points'
  | 'report'
  | 'chest'
  | 'badge'
  | 'bonus'
  | 'balance'
  | 'gift'

export type PassReward = {
  level: number
  title: string
  state: PassRewardState
  kind: PassRewardKind
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
  nextRewardTitle: 'Caixa Premium',
  remainingPoints: 380,
  footerTitle: 'GRANDES CONQUISTAS GERAM GRANDES RECOMPENSAS',
  footerSubtitle: 'EVOLUA. OPERE. SEJA LENDÁRIO.',
  footerCta: 'VER TODAS AS RECOMPENSAS',
  seasonLabel: 'Temporada Atual · Outubro 2026',
  daysLeft: 11,
}

export const mockNextPassReward: NextPassReward = {
  level: 4,
  title: 'Caixa Premium',
  subtitle: 'Até R$ 500 em recompensas',
  tags: ['BÔNUS', 'CASHBACK', 'TICKETS', 'E MAIS'],
}

export const mockPassTracks: PassTrack[] = [
  {
    id: 'free',
    label: 'Gratuito',
    description: 'Recompensas liberadas a cada nível da temporada.',
    premium: false,
    rewards: [
      { level: 1, title: 'R$ 10 em cashback', state: 'claimed', kind: 'cashback' },
      { level: 2, title: '1 Ticket sorteio', state: 'claimed', kind: 'ticket' },
      { level: 3, title: '+200 pontos bônus', state: 'claimable', kind: 'points' },
      { level: 4, title: 'Relatório Premium', state: 'locked', kind: 'report' },
      { level: 5, title: 'Caixa Surpresa', state: 'locked', kind: 'chest' },
      { level: 6, title: 'R$ 25 cashback', state: 'locked', kind: 'cashback' },
      { level: 7, title: '2 Tickets', state: 'locked', kind: 'ticket' },
      { level: 8, title: 'Caixa Épica', state: 'locked', kind: 'chest' },
    ],
  },
  {
    id: 'premium',
    label: 'Premium',
    description: 'Benefícios exclusivos com vantagem máxima.',
    premium: true,
    rewards: [
      { level: 1, title: 'R$ 50 cashback', state: 'claimed', kind: 'cashback' },
      { level: 2, title: 'Bônus 50% taxas', state: 'claimed', kind: 'bonus' },
      { level: 3, title: 'R$ 100 em saldo', state: 'claimable', kind: 'balance' },
      { level: 4, title: 'Emblema VIP', state: 'locked', kind: 'badge' },
      { level: 5, title: 'Caixa Premium', state: 'locked', kind: 'chest' },
      { level: 6, title: 'Cupom 30% taxas', state: 'locked', kind: 'bonus' },
      { level: 7, title: 'R$ 200 saldo', state: 'locked', kind: 'balance' },
      { level: 8, title: 'Caixa Lendária', state: 'locked', kind: 'gift' },
    ],
  },
]

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
  { id: 'negociacao', label: 'Negociação', path: '/inicio' },
  { id: 'mercados', label: 'Mercados', path: '/inicio' },
  { id: 'bullstart', label: 'BullStart', path: '/missoes', badge: 'NOVO' },
  { id: 'promocoes', label: 'Promoções', path: '/inicio' },
  { id: 'recompensas', label: 'Recompensas', path: '/recompensas' },
  { id: 'historico', label: 'Histórico', path: '/historico' },
  { id: 'suporte', label: 'Suporte', path: '/inicio' },
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
