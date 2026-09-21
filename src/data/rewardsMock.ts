export type CouponStatus = 'available' | 'used' | 'expired'

export type CouponType = 'bonus' | 'cashback' | 'fee' | 'ticket' | 'riskfree'

export type RewardCoupon = {
  id: string
  name: string
  code: string
  description: string
  valueLabel: string
  type: CouponType
  status: CouponStatus
  issuedAt: string
  expiresAt: string
  minDeposit?: string
  maxDiscount?: string
  source: string
  terms: string
}

export type RewardsStats = {
  available: number
  used: number
  expired: number
  nextExpiryLabel: string
}

export const couponStatusLabel: Record<CouponStatus, string> = {
  available: 'Disponível',
  used: 'Utilizado',
  expired: 'Expirado',
}

export const couponTypeLabel: Record<CouponType, string> = {
  bonus: 'Bônus',
  cashback: 'Cashback',
  fee: 'Taxas',
  ticket: 'Ticket',
  riskfree: 'RiskFree',
}

export const mockRewardsStats: RewardsStats = {
  available: 4,
  used: 2,
  expired: 1,
  nextExpiryLabel: '28/09/2026',
}

export const mockRewardCoupons: RewardCoupon[] = [
  {
    id: 'c-bonus-150',
    name: 'Bônus de Depósito 150%',
    code: 'BULL150',
    description: 'Multiplique o valor do próximo depósito elegível.',
    valueLabel: '150% de bônus',
    type: 'bonus',
    status: 'available',
    issuedAt: '10/09/2026',
    expiresAt: '28/09/2026',
    minDeposit: 'R$ 100,00',
    maxDiscount: 'R$ 500,00',
    source: 'Passe de Recompensas · Nível 3',
    terms: 'Válido para um único depósito. Não cumulativo com outros bônus ativos.',
  },
  {
    id: 'c-cashback-50',
    name: 'Cashback R$ 50',
    code: 'CASH50',
    description: 'Crédito de cashback aplicado após volume mínimo negociado.',
    valueLabel: 'R$ 50,00',
    type: 'cashback',
    status: 'available',
    issuedAt: '05/09/2026',
    expiresAt: '05/10/2026',
    minDeposit: '—',
    maxDiscount: 'R$ 50,00',
    source: 'Missão · Depositar este mês',
    terms: 'Exige R$ 2.000 em volume negociado após a ativação.',
  },
  {
    id: 'c-fee-30',
    name: 'Cupom 30% em taxas',
    code: 'FEE30',
    description: 'Redução de 30% nas taxas de operação por 7 dias.',
    valueLabel: '30% off taxas',
    type: 'fee',
    status: 'available',
    issuedAt: '12/09/2026',
    expiresAt: '30/09/2026',
    minDeposit: '—',
    maxDiscount: 'R$ 200,00',
    source: 'Trilha Premium · Nível 6',
    terms: 'Ativação manual. Válido apenas em contas verificadas.',
  },
  {
    id: 'c-riskfree-100',
    name: 'R$ 100 RiskFree',
    code: 'RF100',
    description: 'Operação protegida com limite de perda coberto.',
    valueLabel: 'R$ 100 RiskFree',
    type: 'riskfree',
    status: 'available',
    issuedAt: '01/09/2026',
    expiresAt: '15/10/2026',
    minDeposit: 'R$ 50,00',
    maxDiscount: 'R$ 100,00',
    source: 'Missão · Primeiro passo',
    terms: 'Uma operação RiskFree por cupom. Valor residual não é creditado.',
  },
  {
    id: 'c-ticket-bullcar',
    name: '1 Ticket Bullcar',
    code: 'TICKET-BC',
    description: 'Ticket para o sorteio mensal da campanha Bullcar.',
    valueLabel: '1 ticket',
    type: 'ticket',
    status: 'used',
    issuedAt: '20/08/2026',
    expiresAt: '31/08/2026',
    minDeposit: '—',
    maxDiscount: '—',
    source: 'Missão · Evolução real',
    terms: 'Ticket já utilizado no sorteio de agosto.',
  },
  {
    id: 'c-bonus-50',
    name: 'Bônus de Boas-vindas 50%',
    code: 'WELCOME50',
    description: 'Bônus introdutório para o primeiro depósito.',
    valueLabel: '50% de bônus',
    type: 'bonus',
    status: 'used',
    issuedAt: '02/07/2026',
    expiresAt: '31/07/2026',
    minDeposit: 'R$ 50,00',
    maxDiscount: 'R$ 250,00',
    source: 'Onboarding BullStart',
    terms: 'Cupom já utilizado no depósito de boas-vindas.',
  },
  {
    id: 'c-cashback-25',
    name: 'Cashback R$ 25',
    code: 'CASH25',
    description: 'Cashback promocional da temporada anterior.',
    valueLabel: 'R$ 25,00',
    type: 'cashback',
    status: 'expired',
    issuedAt: '01/06/2026',
    expiresAt: '30/06/2026',
    minDeposit: '—',
    maxDiscount: 'R$ 25,00',
    source: 'Passe · Temporada Junho',
    terms: 'Prazo encerrado. Cupom não pode ser reativado.',
  },
]
