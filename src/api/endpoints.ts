/**
 * Contratos HTTP alinhados a `documents/schema-banco-bullverse.md`
 * e `documents/api-contrato-frontend.md`.
 * O backend só precisa implementar estas rotas e ligar ao banco.
 */

export const endpoints = {
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
    refresh: '/api/auth/refresh',
  },
  me: {
    profile: '/api/me',
    missions: '/api/me/missions',
    journey: '/api/me/journey',
    pass: '/api/me/pass',
    passClaim: (level: number) => `/api/me/pass/levels/${level}/claim`,
    missionClaim: (missionId: string | number) => `/api/me/missions/${missionId}/claim`,
    rewards: '/api/me/rewards',
    rewardRedeem: (couponId: string) => `/api/me/rewards/${couponId}/redeem`,
    history: '/api/me/history',
    banners: '/api/me/banners',
    notifications: '/api/me/notifications',
    drawWinPending: '/api/me/draws/pending-win',
    drawWinAck: (drawId: string) => `/api/me/draws/${drawId}/ack`,
  },
  support: {
    overview: '/api/support',
    faqs: '/api/support/faqs',
    tickets: '/api/support/tickets',
    ticket: (id: string) => `/api/support/tickets/${id}`,
    chatMessages: '/api/support/chat/messages',
    chatSend: '/api/support/chat/messages',
  },
  admin: {
    overview: '/api/admin/overview',
    users: '/api/admin/users',
    user: (id: string) => `/api/admin/users/${id}`,
    missions: '/api/admin/missions',
    mission: (id: string) => `/api/admin/missions/${id}`,
    rewards: '/api/admin/rewards',
    reward: (id: string) => `/api/admin/rewards/${id}`,
    coupons: '/api/admin/coupons',
    coupon: (id: string) => `/api/admin/coupons/${id}`,
    campaigns: '/api/admin/campaigns',
    campaign: (id: string) => `/api/admin/campaigns/${id}`,
    bullstart: {
      seasons: '/api/admin/bullstart/seasons',
      overview: '/api/admin/bullstart/overview',
      eligible: '/api/admin/bullstart/eligible',
      eligibleDetail: (userId: string) => `/api/admin/bullstart/eligible/${userId}`,
    },
    draws: {
      prizes: '/api/admin/draws/prizes',
      prize: (id: string) => `/api/admin/draws/prizes/${id}`,
      list: '/api/admin/draws',
      one: (id: string) => `/api/admin/draws/${id}`,
      participants: (id: string) => `/api/admin/draws/${id}/participants`,
      prepare: '/api/admin/draws/prepare',
      execute: (id: string) => `/api/admin/draws/${id}/execute`,
      winnerDelivery: (drawId: string, userId: string) =>
        `/api/admin/draws/${drawId}/winners/${userId}/delivery`,
    },
  },
} as const
