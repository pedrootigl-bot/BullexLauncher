import { api } from '../api/client'
import { shouldUseMocks } from '../api/config'
import { endpoints } from '../api/endpoints'
import {
  supportChannels,
  supportChatAutoReplies,
  supportChatSeed,
  supportFaqCategories,
  supportFaqs,
  supportIntro,
  supportSpecialist,
  supportTiles,
  type SupportChannel,
  type SupportChatMessage,
  type SupportFaq,
  type SupportTile,
} from '../data/supportMock'

export type SupportDashboard = {
  intro: typeof supportIntro
  tiles: SupportTile[]
  channels: SupportChannel[]
  faqCategories: readonly string[]
  faqs: SupportFaq[]
  specialist: typeof supportSpecialist
}

export type SupportTicketInput = {
  subject: string
  category: string
  message: string
}

export type SupportTicket = {
  id: string
  subject: string
  category: string
  status: 'open' | 'pending' | 'closed'
  createdAt: string
}

export async function fetchSupportDashboard(): Promise<SupportDashboard> {
  if (shouldUseMocks()) {
    return {
      intro: structuredClone(supportIntro),
      tiles: structuredClone(supportTiles),
      channels: structuredClone(supportChannels),
      faqCategories: [...supportFaqCategories],
      faqs: structuredClone(supportFaqs),
      specialist: structuredClone(supportSpecialist),
    }
  }

  return api.get<SupportDashboard>(endpoints.support.overview)
}

export async function createSupportTicket(input: SupportTicketInput): Promise<SupportTicket> {
  if (shouldUseMocks()) {
    return {
      id: `TK-${Date.now()}`,
      subject: input.subject,
      category: input.category,
      status: 'open',
      createdAt: new Date().toISOString(),
    }
  }

  return api.post<SupportTicket>(endpoints.support.tickets, input)
}

export async function fetchChatMessages(): Promise<SupportChatMessage[]> {
  if (shouldUseMocks()) return structuredClone(supportChatSeed)
  return api.get<SupportChatMessage[]>(endpoints.support.chatMessages)
}

export async function sendChatMessage(text: string): Promise<SupportChatMessage> {
  if (shouldUseMocks()) {
    return {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      at: 'Agora',
    }
  }

  return api.post<SupportChatMessage>(endpoints.support.chatSend, { text })
}

/** Resposta automática só no mock; em produção o backend/websocket envia. */
export function getMockChatAutoReply(index: number): string {
  return supportChatAutoReplies[index % supportChatAutoReplies.length] ?? ''
}
