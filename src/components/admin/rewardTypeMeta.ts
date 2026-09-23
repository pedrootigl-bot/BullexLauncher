import type { AdminRewardRow } from '../../data/adminMock'

export type RewardTypeMeta = {
  label: string
  tone: 'cash' | 'points' | 'ticket' | 'boost' | 'badge' | 'balance' | 'bonus' | 'default'
}

export const rewardTypeMeta: Record<AdminRewardRow['kind'], RewardTypeMeta> = {
  cashback: { label: 'Cashback', tone: 'cash' },
  points: { label: 'Impulso de pontos', tone: 'points' },
  ticket: { label: 'Ticket', tone: 'ticket' },
  chest: { label: 'Caixa', tone: 'boost' },
  report: { label: 'Relatório', tone: 'default' },
  balance: { label: 'Saldo promocional', tone: 'balance' },
  badge: { label: 'Badge', tone: 'badge' },
  bonus: { label: 'Bônus depósito', tone: 'bonus' },
}

export function getRewardTypeMeta(kind: AdminRewardRow['kind']): RewardTypeMeta {
  return rewardTypeMeta[kind]
}
