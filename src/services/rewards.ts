import { api } from '../api/client'
import { shouldUseMocks } from '../api/config'
import { endpoints } from '../api/endpoints'
import {
  mockRewardCoupons,
  mockRewardsStats,
  type RewardCoupon,
  type RewardsStats,
} from '../data/rewardsMock'

export type RewardsDashboard = {
  stats: RewardsStats
  coupons: RewardCoupon[]
}

export async function fetchRewardsDashboard(): Promise<RewardsDashboard> {
  if (shouldUseMocks()) {
    return {
      stats: structuredClone(mockRewardsStats),
      coupons: structuredClone(mockRewardCoupons),
    }
  }

  return api.get<RewardsDashboard>(endpoints.me.rewards)
}

export async function redeemCoupon(couponId: string): Promise<RewardCoupon> {
  if (shouldUseMocks()) {
    const coupon = mockRewardCoupons.find((item) => item.id === couponId)
    if (!coupon) throw new Error('Cupom não encontrado')
    return { ...coupon, status: 'used', usedAt: new Date().toLocaleDateString('pt-BR') }
  }

  return api.post<RewardCoupon>(endpoints.me.rewardRedeem(couponId), {})
}
