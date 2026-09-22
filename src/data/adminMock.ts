export type AdminNavId =
  | 'overview'
  | 'users'
  | 'deposits'
  | 'withdrawals'
  | 'rewards'
  | 'campaigns'
  | 'missions'
  | 'coupons'
  | 'prizes'
  | 'contents'
  | 'notifications'
  | 'reports'
  | 'settings'

export type AdminKpiId = 'users' | 'deposits' | 'withdrawals' | 'prizes'

export type AdminKpi = {
  id: AdminKpiId
  label: string
  value: string
  trend: string
  trendHint: string
}

export type AdminChartPoint = {
  day: string
  deposits: number
  users: number
}

export type AdminRecentUser = {
  id: string
  name: string
  email: string
  initials: string
  registeredAt: string
  phone: string
  document: string
  country: string
  plan: string
  balance: string
  depositsTotal: string
  lastLogin: string
  lastAction: string
  notes: string
  accountStatus: 'active' | 'pending' | 'blocked'
}

export type AdminFeedAction =
  | 'deposit'
  | 'withdraw'
  | 'prize'
  | 'signup'
  | 'coupon'
  | 'mission'

export type AdminFeedItem = {
  id: string
  date: string
  action: AdminFeedAction
  actionLabel: string
  details: string
  userId: string
}

export type AdminCampaignCard = {
  id: string
  title: string
  image: string
  status: 'active' | 'paused'
  startsAt: string
  endsAt: string
  placement: 'home'
  progress: number
  priority: number
  ctaUrl: string
  altText: string
}

export type AdminMissionRow = {
  id: string
  title: string
  description: string
  target: string
  unit: 'brl' | 'days' | 'volume'
  status: 'active' | 'draft' | 'ended'
  completions: number
  points: number
  startsAt: string
  endsAt: string
  ctaLabel: string
}

export type AdminRewardRow = {
  id: string
  title: string
  track: 'free' | 'premium'
  level: number
  kind: 'cashback' | 'points' | 'ticket' | 'chest' | 'report' | 'balance' | 'badge' | 'bonus'
  claims: number
  amount: string
  unitLabel: string
  eligibility: string
}

export type AdminCouponRow = {
  id: string
  code: string
  name: string
  type: 'bonus' | 'cashback' | 'fee' | 'ticket' | 'riskfree'
  valueLabel: string
  status: 'active' | 'paused' | 'expired'
  redemptions: number
  limit: number
  expiresAt: string
  terms: string
  minDeposit: string
  onePerUser: boolean
}

export type AdminNavItem = {
  id: AdminNavId
  label: string
  group: 'geral' | 'operacao' | 'engajamento' | 'sistema'
  ready?: boolean
}

export const adminNavGroups: { id: AdminNavItem['group']; label: string }[] = [
  { id: 'geral', label: 'Geral' },
  { id: 'operacao', label: 'Operação' },
  { id: 'engajamento', label: 'Engajamento' },
  { id: 'sistema', label: 'Sistema' },
]

export const adminNavItems: AdminNavItem[] = [
  { id: 'overview', label: 'Visão Geral', group: 'geral', ready: true },
  { id: 'users', label: 'Usuários', group: 'geral' },
  { id: 'deposits', label: 'Depósitos', group: 'operacao' },
  { id: 'withdrawals', label: 'Saques', group: 'operacao' },
  { id: 'reports', label: 'Relatórios', group: 'operacao' },
  { id: 'rewards', label: 'Recompensas', group: 'engajamento', ready: true },
  { id: 'campaigns', label: 'Campanhas', group: 'engajamento', ready: true },
  { id: 'missions', label: 'Missões', group: 'engajamento', ready: true },
  { id: 'coupons', label: 'Cupons', group: 'engajamento', ready: true },
  { id: 'prizes', label: 'Prêmios', group: 'engajamento' },
  { id: 'contents', label: 'Conteúdos', group: 'sistema' },
  { id: 'notifications', label: 'Notificações', group: 'sistema' },
  { id: 'settings', label: 'Configurações', group: 'sistema' },
]

export const adminProfile = {
  name: 'Pedro Henrique',
  role: 'Administrador',
  initials: 'PH',
  brandCardTitle: 'DISCIPLINA GESTÃO RESULTADOS.',
  supportTitle: 'TRADERS REAIS, SUPORTE REAL.',
  supportLead: 'Equipe dedicada a quem opera de verdade.',
  supportImage: '/images/support-bull.jpg',
}

export const adminOverview = {
  title: 'Visão Geral',
  lead: 'Acompanhe o desempenho da plataforma em tempo real.',
  dateRange: '01/09/2025 → 17/09/2025',
  chartPeriod: 'Últimos 17 dias',
}

export const adminKpis: AdminKpi[] = [
  {
    id: 'users',
    label: 'Usuários Totais',
    value: '128.430',
    trend: '+12,4%',
    trendHint: 'vs. período anterior',
  },
  {
    id: 'deposits',
    label: 'Depósitos',
    value: 'R$ 4.892.320,00',
    trend: '+18,7%',
    trendHint: 'vs. período anterior',
  },
  {
    id: 'withdrawals',
    label: 'Saques',
    value: 'R$ 2.104.560,00',
    trend: '+9,6%',
    trendHint: 'vs. período anterior',
  },
  {
    id: 'prizes',
    label: 'Prêmios Entregues',
    value: '342',
    trend: '+27,1%',
    trendHint: 'vs. período anterior',
  },
]

export const adminChartSeries: AdminChartPoint[] = [
  { day: '01', deposits: 42, users: 28 },
  { day: '02', deposits: 55, users: 34 },
  { day: '03', deposits: 48, users: 31 },
  { day: '04', deposits: 62, users: 40 },
  { day: '05', deposits: 71, users: 45 },
  { day: '06', deposits: 58, users: 38 },
  { day: '07', deposits: 66, users: 42 },
  { day: '08', deposits: 74, users: 48 },
  { day: '09', deposits: 69, users: 44 },
  { day: '10', deposits: 81, users: 52 },
  { day: '11', deposits: 77, users: 49 },
  { day: '12', deposits: 88, users: 56 },
  { day: '13', deposits: 84, users: 53 },
  { day: '14', deposits: 92, users: 60 },
  { day: '15', deposits: 86, users: 55 },
  { day: '16', deposits: 95, users: 63 },
  { day: '17', deposits: 90, users: 58 },
]

export const adminRecentUsers: AdminRecentUser[] = [
  {
    id: '#48291',
    name: 'Ana Clara Souza',
    email: 'ana.souza@email.com',
    initials: 'AS',
    registeredAt: '17/09/2026',
    phone: '+55 11 98877-2211',
    document: '123.456.789-00',
    country: 'Brasil',
    plan: 'Premium',
    balance: 'R$ 4.280,00',
    depositsTotal: 'R$ 12.500,00',
    lastLogin: '17/09/2026 · 14:18',
    lastAction: 'Depósito R$ 1.000',
    notes: 'Usuária Premium engajada. Priorizar suporte VIP.',
    accountStatus: 'active',
  },
  {
    id: '#48290',
    name: 'Bruno Mendes',
    email: 'bruno.m@email.com',
    initials: 'BM',
    registeredAt: '17/09/2026',
    phone: '+55 21 97766-1100',
    document: '987.654.321-00',
    country: 'Brasil',
    plan: 'Free',
    balance: 'R$ 0,00',
    depositsTotal: 'R$ 0,00',
    lastLogin: '17/09/2026 · 11:02',
    lastAction: 'Cadastro concluído',
    notes: 'Aguardando primeiro depósito.',
    accountStatus: 'pending',
  },
  {
    id: '#48289',
    name: 'Carla Ribeiro',
    email: 'carla.r@email.com',
    initials: 'CR',
    registeredAt: '16/09/2026',
    phone: '+55 31 99655-3344',
    document: '456.789.123-00',
    country: 'Brasil',
    plan: 'Premium',
    balance: 'R$ 1.940,50',
    depositsTotal: 'R$ 6.800,00',
    lastLogin: '16/09/2026 · 22:41',
    lastAction: 'Missão concluída',
    notes: '',
    accountStatus: 'active',
  },
  {
    id: '#48288',
    name: 'Diego Alves',
    email: 'diego.a@email.com',
    initials: 'DA',
    registeredAt: '16/09/2026',
    phone: '+55 41 98544-7788',
    document: '321.654.987-00',
    country: 'Brasil',
    plan: 'Free',
    balance: 'R$ 120,00',
    depositsTotal: 'R$ 900,00',
    lastLogin: '14/09/2026 · 09:15',
    lastAction: 'Conta bloqueada',
    notes: 'Bloqueio por revisão de risco. Não liberar sem compliance.',
    accountStatus: 'blocked',
  },
  {
    id: '#48287',
    name: 'Elena Costa',
    email: 'elena.c@email.com',
    initials: 'EC',
    registeredAt: '15/09/2026',
    phone: '+55 51 99122-5566',
    document: '654.321.987-00',
    country: 'Brasil',
    plan: 'Premium',
    balance: 'R$ 8.110,00',
    depositsTotal: 'R$ 21.300,00',
    lastLogin: '17/09/2026 · 08:33',
    lastAction: 'Resgate BullPass',
    notes: 'Alta retenção. Candidata a campanha referral.',
    accountStatus: 'active',
  },
]

export const adminAccountStatusLabel: Record<AdminRecentUser['accountStatus'], string> = {
  active: 'Ativo',
  pending: 'Pendente',
  blocked: 'Bloqueado',
}

export const adminFeed: AdminFeedItem[] = [
  {
    id: 'f1',
    date: '17/09 14:22',
    action: 'deposit',
    actionLabel: 'Depósito',
    details: 'R$ 1.000,00',
    userId: '#48291',
  },
  {
    id: 'f2',
    date: '17/09 13:58',
    action: 'prize',
    actionLabel: 'Prêmio entregue',
    details: 'iPhone 15 Pro Max',
    userId: '#48102',
  },
  {
    id: 'f3',
    date: '17/09 12:41',
    action: 'withdraw',
    actionLabel: 'Saque',
    details: 'R$ 450,00',
    userId: '#47955',
  },
  {
    id: 'f4',
    date: '17/09 11:15',
    action: 'signup',
    actionLabel: 'Novo cadastro',
    details: 'Conta verificada',
    userId: '#48290',
  },
  {
    id: 'f5',
    date: '17/09 10:03',
    action: 'coupon',
    actionLabel: 'Cupom usado',
    details: 'BULL150',
    userId: '#47820',
  },
]

export const adminCampaignCards: AdminCampaignCard[] = [
  {
    id: 'c1',
    title: 'Haval H6',
    image: '/media/banners/haval-h6.jpg',
    status: 'active',
    startsAt: '01/09/2026',
    endsAt: '30/09/2026',
    placement: 'home',
    progress: 68,
    priority: 1,
    ctaUrl: '/missoes',
    altText: 'Banner do sorteio Haval H6 na temporada BullStart',
  },
  {
    id: 'c2',
    title: 'iPhone 15 Pro Max',
    image: '/media/banners/iphone-18-pro-max.jpg',
    status: 'active',
    startsAt: '01/09/2026',
    endsAt: '22/09/2026',
    placement: 'home',
    progress: 52,
    priority: 2,
    ctaUrl: '/missoes',
    altText: 'Banner da campanha iPhone 15 Pro Max',
  },
  {
    id: 'c3',
    title: 'PlayStation 5',
    image: '/media/banners/ps5-pro-gta6.jpg',
    status: 'active',
    startsAt: '05/09/2026',
    endsAt: '15/09/2026',
    placement: 'home',
    progress: 82,
    priority: 3,
    ctaUrl: '/missoes',
    altText: 'Banner PlayStation 5 em destaque no BullStart',
  },
  {
    id: 'c4',
    title: 'Cashback 250%',
    image: '/media/hero-missoes.jpg',
    status: 'paused',
    startsAt: '10/09/2026',
    endsAt: '28/09/2026',
    placement: 'home',
    progress: 41,
    priority: 4,
    ctaUrl: '/missoes',
    altText: 'Banner da oferta de cashback 250%',
  },
]

export const adminCampaignPlacementLabel: Record<AdminCampaignCard['placement'], string> = {
  home: 'Home',
}

export const adminMissions: AdminMissionRow[] = [
  {
    id: 'm1',
    title: 'Depositar este mês',
    description: 'Faça um depósito elegível na conta Bullex.',
    target: '500',
    unit: 'brl',
    status: 'active',
    completions: 1840,
    points: 300,
    startsAt: '01/09/2026',
    endsAt: '30/10/2026',
    ctaLabel: 'Depositar',
  },
  {
    id: 'm2',
    title: 'Mostre consistência',
    description: 'Negocie em dias distintos da temporada.',
    target: '5',
    unit: 'days',
    status: 'active',
    completions: 962,
    points: 250,
    startsAt: '01/09/2026',
    endsAt: '30/10/2026',
    ctaLabel: 'Negociar',
  },
  {
    id: 'm3',
    title: 'Volume em operações',
    description: 'Atinja o volume mínimo negociado no mês.',
    target: '10000',
    unit: 'volume',
    status: 'active',
    completions: 710,
    points: 400,
    startsAt: '01/09/2026',
    endsAt: '30/10/2026',
    ctaLabel: 'Ver operações',
  },
  {
    id: 'm4',
    title: 'Explorar novos ativos',
    description: 'Abra operações em novos ativos elegíveis.',
    target: '3',
    unit: 'days',
    status: 'draft',
    completions: 0,
    points: 180,
    startsAt: '01/11/2026',
    endsAt: '30/11/2026',
    ctaLabel: 'Explorar',
  },
]

export const adminPassRewards: AdminRewardRow[] = [
  {
    id: 'r1',
    title: 'R$ 10 cashback',
    track: 'free',
    level: 1,
    kind: 'cashback',
    claims: 4200,
    amount: '10',
    unitLabel: 'R$',
    eligibility: 'Válido por 7 dias após o resgate',
  },
  {
    id: 'r2',
    title: '250 pontos',
    track: 'premium',
    level: 2,
    kind: 'points',
    claims: 1180,
    amount: '250',
    unitLabel: 'pontos',
    eligibility: 'Creditado imediatamente na jornada',
  },
  {
    id: 'r3',
    title: 'Ticket sorteio',
    track: 'free',
    level: 4,
    kind: 'ticket',
    claims: 860,
    amount: '1',
    unitLabel: 'ticket',
    eligibility: 'Válido na campanha ativa da temporada',
  },
  {
    id: 'r4',
    title: 'Caixa Premium',
    track: 'premium',
    level: 6,
    kind: 'chest',
    claims: 410,
    amount: '1',
    unitLabel: 'caixa',
    eligibility: 'Abertura única por conta',
  },
]

export const adminCoupons: AdminCouponRow[] = [
  {
    id: 'cp1',
    code: 'BULL150',
    name: 'Bônus de Depósito 150%',
    type: 'bonus',
    valueLabel: '150% de bônus',
    status: 'active',
    redemptions: 642,
    limit: 1000,
    expiresAt: '28/09/2026',
    terms: 'Válido para um único depósito. Não cumulativo.',
    minDeposit: '100',
    onePerUser: true,
  },
  {
    id: 'cp2',
    code: 'CASH50',
    name: 'Cashback R$ 50',
    type: 'cashback',
    valueLabel: 'R$ 50,00',
    status: 'active',
    redemptions: 210,
    limit: 500,
    expiresAt: '15/10/2026',
    terms: 'Exige volume mínimo após a ativação.',
    minDeposit: '200',
    onePerUser: true,
  },
  {
    id: 'cp3',
    code: 'FEE30',
    name: 'Desconto em taxas',
    type: 'fee',
    valueLabel: '30% nas taxas',
    status: 'paused',
    redemptions: 88,
    limit: 300,
    expiresAt: '01/11/2026',
    terms: 'Aplicável em operações elegíveis.',
    minDeposit: '0',
    onePerUser: false,
  },
  {
    id: 'cp4',
    code: 'WELCOME',
    name: 'Boas-vindas',
    type: 'bonus',
    valueLabel: '50% de bônus',
    status: 'expired',
    redemptions: 1000,
    limit: 1000,
    expiresAt: '01/08/2026',
    terms: 'Cupom de onboarding esgotado.',
    minDeposit: '50',
    onePerUser: true,
  },
]

export const adminMissionStatusLabel: Record<AdminMissionRow['status'], string> = {
  active: 'Ativa',
  draft: 'Rascunho',
  ended: 'Encerrada',
}

export const adminCouponStatusLabel: Record<AdminCouponRow['status'], string> = {
  active: 'Ativo',
  paused: 'Pausado',
  expired: 'Expirado',
}

export const adminTrackLabel: Record<AdminRewardRow['track'], string> = {
  free: 'BullPass',
  premium: 'Premium',
}

export const adminSectionTitles: Record<
  Exclude<AdminNavId, 'overview'>,
  { title: string; lead: string }
> = {
  users: { title: 'Usuários', lead: 'Gestão de contas e status na plataforma.' },
  deposits: { title: 'Depósitos', lead: 'Movimentações de entrada e conciliação.' },
  withdrawals: { title: 'Saques', lead: 'Solicitações e fluxo de saída.' },
  rewards: { title: 'Recompensas', lead: 'Itens do passe gratuito e premium.' },
  campaigns: { title: 'Campanhas', lead: 'Banners, sorteios e destaques ativos.' },
  missions: { title: 'Missões', lead: 'Desafios da temporada BullStart.' },
  coupons: { title: 'Cupons', lead: 'Códigos promocionais e regras de uso.' },
  prizes: { title: 'Prêmios', lead: 'Entregas e estoque de prêmios físicos.' },
  contents: { title: 'Conteúdos', lead: 'Materiais e publicações do app.' },
  notifications: { title: 'Notificações', lead: 'Push e comunicados em massa.' },
  reports: { title: 'Relatórios', lead: 'Exportações e indicadores avançados.' },
  settings: { title: 'Configurações', lead: 'Preferências do painel administrativo.' },
}
