import { api } from '../api/client'
import { shouldUseMocks } from '../api/config'
import { endpoints } from '../api/endpoints'
import {
  adminCampaignCards,
  adminChartSeries,
  adminCoupons,
  adminKpis,
  adminMissions,
  adminOverview,
  adminPassRewards,
  adminRecentUsers,
  type AdminCampaignCard,
  type AdminChartPoint,
  type AdminCouponRow,
  type AdminKpi,
  type AdminMissionRow,
  type AdminRecentUser,
  type AdminRewardRow,
} from '../data/adminMock'

export type AdminOverviewDashboard = {
  meta: typeof adminOverview
  kpis: AdminKpi[]
  chart: AdminChartPoint[]
  recentUsers: AdminRecentUser[]
}

export async function fetchAdminOverview(): Promise<AdminOverviewDashboard> {
  if (shouldUseMocks()) {
    return {
      meta: structuredClone(adminOverview),
      kpis: structuredClone(adminKpis),
      chart: structuredClone(adminChartSeries),
      recentUsers: structuredClone(adminRecentUsers),
    }
  }

  return api.get<AdminOverviewDashboard>(endpoints.admin.overview)
}

export async function fetchAdminUsers(): Promise<AdminRecentUser[]> {
  if (shouldUseMocks()) return structuredClone(adminRecentUsers)
  return api.get<AdminRecentUser[]>(endpoints.admin.users)
}

export async function fetchAdminMissions(): Promise<AdminMissionRow[]> {
  if (shouldUseMocks()) return structuredClone(adminMissions)
  return api.get<AdminMissionRow[]>(endpoints.admin.missions)
}

export async function saveAdminMission(
  input: Partial<AdminMissionRow> & { id?: string },
): Promise<AdminMissionRow> {
  if (shouldUseMocks()) {
    return {
      id: input.id ?? `mission-${Date.now()}`,
      title: input.title ?? 'Nova missão',
      description: input.description ?? '',
      target: input.target ?? '0',
      unit: input.unit ?? 'brl',
      status: input.status ?? 'draft',
      completions: input.completions ?? 0,
      points: input.points ?? 0,
      startsAt: input.startsAt ?? '',
      endsAt: input.endsAt ?? '',
      ctaLabel: input.ctaLabel ?? 'Continuar',
    }
  }

  if (input.id) {
    return api.put<AdminMissionRow>(endpoints.admin.mission(input.id), input)
  }
  return api.post<AdminMissionRow>(endpoints.admin.missions, input)
}

export async function fetchAdminPassRewards(): Promise<AdminRewardRow[]> {
  if (shouldUseMocks()) return structuredClone(adminPassRewards)
  return api.get<AdminRewardRow[]>(endpoints.admin.rewards)
}

export async function fetchAdminCoupons(): Promise<AdminCouponRow[]> {
  if (shouldUseMocks()) return structuredClone(adminCoupons)
  return api.get<AdminCouponRow[]>(endpoints.admin.coupons)
}

export async function fetchAdminCampaigns(): Promise<AdminCampaignCard[]> {
  if (shouldUseMocks()) return structuredClone(adminCampaignCards)
  return api.get<AdminCampaignCard[]>(endpoints.admin.campaigns)
}

export async function saveAdminCampaign(
  input: Partial<AdminCampaignCard> & { id?: string },
): Promise<AdminCampaignCard> {
  if (shouldUseMocks()) {
    return {
      id: input.id ?? `campaign-${Date.now()}`,
      title: input.title ?? 'Nova campanha',
      image: input.image ?? '',
      status: input.status ?? 'paused',
      startsAt: input.startsAt ?? '',
      endsAt: input.endsAt ?? '',
      placement: input.placement ?? 'home',
      progress: input.progress ?? 0,
      priority: input.priority ?? 0,
      ctaUrl: input.ctaUrl ?? '',
      altText: input.altText ?? '',
    }
  }

  if (input.id) {
    return api.put<AdminCampaignCard>(endpoints.admin.campaign(input.id), input)
  }
  return api.post<AdminCampaignCard>(endpoints.admin.campaigns, input)
}
