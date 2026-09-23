import type { BullstartSeasonId } from './bullstartAdminMock'

export type DrawPrizeId = string

export type DrawPrize = {
  id: DrawPrizeId
  name: string
  image: string
  category: string
  description: string
  quantityAvailable: number
  /** Quando definido, aparece preferencialmente na temporada. */
  seasonId?: BullstartSeasonId | null
}

export type AdminDrawStatus = 'prepared' | 'completed'

export type AdminDrawWinner = {
  userId: string
  traderId: string
  name: string
  /** Ordem do sorteio (1 = primeiro sorteado). */
  place: number
}

export type AdminDraw = {
  id: string
  code: string
  seasonId: BullstartSeasonId
  seasonLabel: string
  prizeId: DrawPrizeId
  prizeName: string
  prizeImage: string
  status: AdminDrawStatus
  participantCount: number
  participantSnapshotHash: string
  /** Quantidade de unidades deste prêmio neste sorteio. */
  prizeUnits: number
  winners: AdminDrawWinner[]
  /** Compat: primeiro ganhador (ou null se ainda não sorteado). */
  winnerUserId: string | null
  winnerTraderId: string | null
  winnerName: string | null
  createdBy: string
  createdAt: string
  preparedAt: string
  drawnAt: string | null
}

export type AdminDrawParticipant = {
  drawId: string
  userId: string
  traderId: string
  name: string
  email: string
  mission1: boolean
  mission2: boolean
  mission3: boolean
}

/** Catálogo seed — estoque mutável em runtime via serviço + localStorage. */
export const seedDrawPrizes: DrawPrize[] = [
  {
    id: 'PRIZE-018',
    name: 'iPhone 18 Pro Max',
    image: '/media/banners/iphone-18-pro-max.jpg',
    category: 'Eletrônicos',
    description: 'Smartphone premium da temporada BullStart.',
    quantityAvailable: 2,
    seasonId: null,
  },
  {
    id: 'PRIZE-HAV',
    name: 'Haval H6',
    image: '/media/banners/haval-h6.jpg',
    category: 'Automóveis',
    description: 'SUV premium — prêmio principal da campanha.',
    quantityAvailable: 1,
    seasonId: null,
  },
  {
    id: 'PRIZE-PS5',
    name: 'PlayStation 5',
    image: '/media/banners/ps5-pro-gta6.jpg',
    category: 'Eletrônicos',
    description: 'Console + bundle da temporada.',
    quantityAvailable: 3,
    seasonId: null,
  },
  {
    id: 'PRIZE-10K',
    name: 'R$ 10.000',
    image: '/media/hero-missoes.jpg',
    category: 'Saldo promocional',
    description: 'Crédito promocional sujeito a regras da plataforma.',
    quantityAvailable: 5,
    seasonId: null,
  },
  {
    id: 'PRIZE-TRIP',
    name: 'Viagem internacional',
    image: '/media/hero-missoes.jpg',
    category: 'Experiência',
    description: 'Pacote de viagem sujeito às regras da campanha.',
    quantityAvailable: 1,
    seasonId: null,
  },
]

export const DRAW_STORAGE_KEY = 'bx-admin-draws-v2'
export const DRAW_WIN_SEEN_KEY = 'bx-draw-win-seen-v2'
