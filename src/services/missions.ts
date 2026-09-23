import { api } from '../api/client'
import { shouldUseMocks } from '../api/config'
import { endpoints } from '../api/endpoints'
import {
  mockJourney,
  mockMissions,
  mockNextPassReward,
  mockNextStep,
  mockPassTracks,
  mockPromoBanners,
  mockStats,
  seasonRules,
  type JourneyProgress,
  type Mission,
  type NextPassReward,
  type PassTrack,
  type PromoBanner,
  type UserStats,
} from '../data/missionsMock'

export type MissionsDashboard = {
  missions: Mission[]
  journey: JourneyProgress
  stats: UserStats
  nextStep: typeof mockNextStep
  banners: PromoBanner[]
  seasonRules: typeof seasonRules
  pass: {
    tracks: PassTrack[]
    nextReward: NextPassReward
  }
}

export async function fetchMissionsDashboard(): Promise<MissionsDashboard> {
  if (shouldUseMocks()) {
    return {
      missions: structuredClone(mockMissions),
      journey: structuredClone(mockJourney),
      stats: structuredClone(mockStats),
      nextStep: structuredClone(mockNextStep),
      banners: structuredClone(mockPromoBanners),
      seasonRules: structuredClone(seasonRules),
      pass: {
        tracks: structuredClone(mockPassTracks),
        nextReward: structuredClone(mockNextPassReward),
      },
    }
  }

  return api.get<MissionsDashboard>(endpoints.me.missions)
}

export async function claimMissionReward(missionId: string | number): Promise<{
  mission: Mission
  journey: JourneyProgress
}> {
  if (shouldUseMocks()) {
    const mission = mockMissions.find((item) => item.id === Number(missionId))
    if (!mission) throw new Error('Missão não encontrada')
    return {
      mission: { ...mission, status: 'claimed', remainingLabel: 'Recompensa resgatada.' },
      journey: structuredClone(mockJourney),
    }
  }

  return api.post(endpoints.me.missionClaim(missionId), {})
}

export async function claimPassLevel(level: number): Promise<{
  tracks: PassTrack[]
  journey: JourneyProgress
}> {
  if (shouldUseMocks()) {
    return {
      tracks: structuredClone(mockPassTracks),
      journey: structuredClone(mockJourney),
    }
  }

  return api.post(endpoints.me.passClaim(level), {})
}

export async function fetchPromoBanners(): Promise<PromoBanner[]> {
  if (shouldUseMocks()) return structuredClone(mockPromoBanners)
  return api.get<PromoBanner[]>(endpoints.me.banners)
}
