export type HistoryStatus = 'used' | 'shipped' | 'delivered'

export type HistoryPrize = {
  id: string
  title: string
  description: string
  imageSrc: string
  category: string
  subcategory: string
  categoryIcon: 'console' | 'phone' | 'car' | 'coins' | 'shield' | 'ticket'
  date: string
  time: string
  status: HistoryStatus
}

export type HistoryStats = {
  totalClaimedLabel: string
  totalClaimedValue: string
  lastClaimDate: string
  lastClaimItem: string
  prizesCount: number
  claimedPercent: number
}

export const mockHistoryStats: HistoryStats = {
  totalClaimedLabel: 'Total resgatado',
  totalClaimedValue: 'US$ 8.490,00',
  lastClaimDate: '14/09/2026',
  lastClaimItem: 'PS5 PRO BUNDLE GTA 6',
  prizesCount: 6,
  claimedPercent: 100,
}

export const mockHistoryPrizes: HistoryPrize[] = [
  {
    id: 'ps5-gta',
    title: 'PS5 Pro Bundle GTA 6',
    description: 'Console + jogo em edição especial.',
    imageSrc: '/media/banners/ps5-pro-gta6.jpg',
    category: 'Eletrônicos',
    subcategory: 'CONSOLE',
    categoryIcon: 'console',
    date: '14/09/2026',
    time: '18:42',
    status: 'delivered',
  },
  {
    id: 'iphone',
    title: 'iPhone 18 Pro Max',
    description: 'Smartphone premium da campanha especial.',
    imageSrc: '/media/banners/iphone-18-pro-max.jpg',
    category: 'Eletrônicos',
    subcategory: 'SMARTPHONE',
    categoryIcon: 'phone',
    date: '02/09/2026',
    time: '11:15',
    status: 'shipped',
  },
  {
    id: 'haval',
    title: 'Haval H6',
    description: 'SUV premium — campanha Bullcar.',
    imageSrc: '/media/banners/haval-h6.jpg',
    category: 'Automóveis',
    subcategory: 'SUV',
    categoryIcon: 'car',
    date: '18/08/2026',
    time: '09:30',
    status: 'delivered',
  },
  {
    id: 'riskfree-100',
    title: 'R$100 RiskFree',
    description: 'Crédito aplicado na conta de trading.',
    imageSrc: '/media/missions/mission-01.jpg',
    category: 'Bônus',
    subcategory: 'CRÉDITO',
    categoryIcon: 'coins',
    date: '05/08/2026',
    time: '16:05',
    status: 'used',
  },
  {
    id: 'bonus-150',
    title: '150% de Bônus',
    description: 'Bônus de depósito resgatado.',
    imageSrc: '/media/missions/mission-02.jpg',
    category: 'Bônus',
    subcategory: 'DEPÓSITO',
    categoryIcon: 'shield',
    date: '22/07/2026',
    time: '13:20',
    status: 'used',
  },
  {
    id: 'ticket-bullcar',
    title: '1 Ticket Bullcar',
    description: 'Ticket utilizado na campanha mensal.',
    imageSrc: '/media/missions/mission-03.jpg',
    category: 'Campanha',
    subcategory: 'TICKET',
    categoryIcon: 'ticket',
    date: '10/07/2026',
    time: '20:08',
    status: 'used',
  },
]

export const historyStatusLabel: Record<HistoryStatus, string> = {
  used: 'Utilizado',
  shipped: 'Enviado',
  delivered: 'Entregue',
}
