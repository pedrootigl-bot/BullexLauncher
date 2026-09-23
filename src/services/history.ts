import { api } from '../api/client'
import { shouldUseMocks } from '../api/config'
import { endpoints } from '../api/endpoints'
import {
  mockHistoryPrizes,
  mockHistoryStats,
  type HistoryPrize,
  type HistoryStats,
} from '../data/historyMock'

export type HistoryDashboard = {
  stats: HistoryStats
  prizes: HistoryPrize[]
}

export async function fetchHistoryDashboard(): Promise<HistoryDashboard> {
  if (shouldUseMocks()) {
    return {
      stats: structuredClone(mockHistoryStats),
      prizes: structuredClone(mockHistoryPrizes),
    }
  }

  return api.get<HistoryDashboard>(endpoints.me.history)
}
