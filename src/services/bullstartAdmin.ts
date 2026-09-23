import {
  DEFAULT_BULLSTART_SEASON_ID,
  bullstartDeposits,
  bullstartDrawWinners,
  bullstartMissionCompletions,
  bullstartSeasons,
  bullstartTraders,
  type BullstartDrawWinner,
  type BullstartMissionCode,
  type BullstartSeason,
  type BullstartSeasonId,
  type EligibleStatus,
  type RewardKind,
} from '../data/bullstartAdminMock'

export type BullstartOverviewFilters = {
  seasonId: BullstartSeasonId
  /** ISO date YYYY-MM-DD inclusive start (optional date range within season). */
  periodStart?: string
  periodEnd?: string
}

export type MissionFunnelItem = {
  code: BullstartMissionCode
  order: 1 | 2 | 3
  title: string
  uniqueCompletions: number
}

export type BullstartOverview = {
  season: BullstartSeason
  deliveredRewards: number
  deliveredByKind: Record<RewardKind, number>
  deliveredDrawPrizes: {
    prizeTitle: string
    traderId: string
    name: string
  }[]
  participants: number
  missions: {
    mission1: number
    mission2: number
    mission3: number
    allCompleted: number
  }
  funnel: MissionFunnelItem[]
}

export type BullstartEligibleRow = {
  userId: string
  traderId: string
  name: string
  email: string
  /** WhatsApp com DDI — contato da equipe. */
  whatsapp: string
  totalDeposited: number
  mission1: boolean
  mission2: boolean
  mission3: boolean
  completedAt: string
  status: EligibleStatus
}

export type BullstartDrawPrizeInfo = {
  isWinner: boolean
  prizeTitle: string | null
  wonAt: string | null
  prizeReceived: boolean
  deliveryStatus: BullstartDrawWinner['deliveryStatus'] | null
}

export type BullstartEligibleDetail = BullstartEligibleRow & {
  seasonLabel: string
  initials: string
  drawPrize: BullstartDrawPrizeInfo
  missionTitles: {
    mission1: string
    mission2: string
    mission3: string
  }
}

export type EligibleSortKey = 'traderId' | 'totalDeposited' | 'completedAt'

export type EligibleQuery = BullstartOverviewFilters & {
  search?: string
  status?: EligibleStatus | 'all'
  sortBy?: EligibleSortKey
  sortDir?: 'asc' | 'desc'
}

const VALID_DEPOSIT_STATUS = 'completed' as const

function getSeason(seasonId: BullstartSeasonId): BullstartSeason {
  const season = bullstartSeasons.find((item) => item.id === seasonId)
  if (!season) {
    const fallback = bullstartSeasons.find((item) => item.id === DEFAULT_BULLSTART_SEASON_ID)
    if (!fallback) throw new Error('Nenhuma temporada BullStart configurada.')
    return fallback
  }
  return season
}

function missionByOrder(season: BullstartSeason, order: 1 | 2 | 3) {
  const mission = season.missions.find((item) => item.order === order)
  if (!mission) throw new Error(`Missão order=${order} ausente na temporada ${season.id}`)
  return mission
}

function parseIsoDate(value: string): Date {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (dateOnly) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
  }
  return new Date(value)
}

function isWithinPeriod(
  isoTimestamp: string,
  filters: BullstartOverviewFilters,
  season: BullstartSeason,
): boolean {
  const time = parseIsoDate(isoTimestamp).getTime()
  const start = parseIsoDate(filters.periodStart ?? season.startsAt).getTime()
  const endRaw = parseIsoDate(filters.periodEnd ?? season.endsAt)
  const end = new Date(
    endRaw.getFullYear(),
    endRaw.getMonth(),
    endRaw.getDate(),
    23,
    59,
    59,
    999,
  ).getTime()
  return time >= start && time <= end
}

/**
 * Conta usuários únicos que concluíram um código de missão na temporada.
 * Duplicatas de conclusão do mesmo user/code contam uma vez.
 */
function uniqueUsersForMission(
  seasonId: BullstartSeasonId,
  missionCode: BullstartMissionCode,
  filters: BullstartOverviewFilters,
  season: BullstartSeason,
): Set<string> {
  const users = new Set<string>()
  for (const row of bullstartMissionCompletions) {
    if (row.seasonId !== seasonId) continue
    if (row.missionCode !== missionCode) continue
    if (!isWithinPeriod(row.completedAt, filters, season)) continue
    users.add(row.userId)
  }
  return users
}

function completionsByUser(
  seasonId: BullstartSeasonId,
  filters: BullstartOverviewFilters,
  season: BullstartSeason,
): Map<string, Map<BullstartMissionCode, string>> {
  const map = new Map<string, Map<BullstartMissionCode, string>>()
  for (const row of bullstartMissionCompletions) {
    if (row.seasonId !== seasonId) continue
    if (!isWithinPeriod(row.completedAt, filters, season)) continue
    let codes = map.get(row.userId)
    if (!codes) {
      codes = new Map()
      map.set(row.userId, codes)
    }
    const previous = codes.get(row.missionCode)
    if (!previous || parseIsoDate(row.completedAt).getTime() > parseIsoDate(previous).getTime()) {
      codes.set(row.missionCode, row.completedAt)
    }
  }
  return map
}

/**
 * Agrega depósitos válidos por userId ANTES de qualquer join com missões.
 * Evita multiplicação N missões × M depósitos.
 */
function totalDepositedByUser(
  seasonId: BullstartSeasonId,
  filters: BullstartOverviewFilters,
  season: BullstartSeason,
): Map<string, number> {
  const totals = new Map<string, number>()
  for (const deposit of bullstartDeposits) {
    if (deposit.seasonId !== seasonId) continue
    if (deposit.status !== VALID_DEPOSIT_STATUS) continue
    if (!isWithinPeriod(deposit.createdAt, filters, season)) continue
    totals.set(deposit.userId, (totals.get(deposit.userId) ?? 0) + deposit.amount)
  }
  return totals
}

function emptyKindCounts(): Record<RewardKind, number> {
  return {
    physical: 0,
    balance: 0,
    riskfree: 0,
    ticket: 0,
    cashback: 0,
    bonus: 0,
    other: 0,
  }
}

export function listBullstartSeasons(): BullstartSeason[] {
  return bullstartSeasons
}

export function getBullstartOverview(filters: BullstartOverviewFilters): BullstartOverview {
  const season = getSeason(filters.seasonId)
  const m1 = missionByOrder(season, 1)
  const m2 = missionByOrder(season, 2)
  const m3 = missionByOrder(season, 3)

  const set1 = uniqueUsersForMission(season.id, m1.code, filters, season)
  const set2 = uniqueUsersForMission(season.id, m2.code, filters, season)
  const set3 = uniqueUsersForMission(season.id, m3.code, filters, season)

  const byUser = completionsByUser(season.id, filters, season)
  let allCompleted = 0
  for (const codes of byUser.values()) {
    if (codes.has(m1.code) && codes.has(m2.code) && codes.has(m3.code)) {
      allCompleted += 1
    }
  }

  const participants = byUser.size

  /** Conta apenas prêmios do sorteio efetivamente entregues. */
  const deliveredByKind = emptyKindCounts()
  const deliveredDrawPrizes: BullstartOverview['deliveredDrawPrizes'] = []
  let deliveredRewards = 0
  const tradersById = new Map(bullstartTraders.map((trader) => [trader.userId, trader]))

  for (const winner of bullstartDrawWinners) {
    if (winner.seasonId !== season.id) continue
    if (!isWithinPeriod(winner.wonAt, filters, season)) continue
    if (!winner.prizeReceived && winner.deliveryStatus !== 'delivered') continue
    deliveredRewards += 1
    deliveredByKind.physical += 1
    const trader = tradersById.get(winner.userId)
    deliveredDrawPrizes.push({
      prizeTitle: winner.prizeTitle,
      traderId: trader?.traderId ?? '—',
      name: trader?.name ?? 'Trader',
    })
  }

  const funnel: MissionFunnelItem[] = [
    {
      code: m1.code,
      order: 1,
      title: m1.title,
      uniqueCompletions: set1.size,
    },
    {
      code: m2.code,
      order: 2,
      title: m2.title,
      uniqueCompletions: set2.size,
    },
    {
      code: m3.code,
      order: 3,
      title: m3.title,
      uniqueCompletions: set3.size,
    },
  ]

  return {
    season,
    deliveredRewards,
    deliveredByKind,
    deliveredDrawPrizes,
    participants,
    missions: {
      mission1: set1.size,
      mission2: set2.size,
      mission3: set3.size,
      allCompleted,
    },
    funnel,
  }
}

export function getBullstartEligible(query: EligibleQuery): BullstartEligibleRow[] {
  const filters: BullstartOverviewFilters = {
    seasonId: query.seasonId,
    periodStart: query.periodStart,
    periodEnd: query.periodEnd,
  }
  const season = getSeason(filters.seasonId)
  const m1 = missionByOrder(season, 1)
  const m2 = missionByOrder(season, 2)
  const m3 = missionByOrder(season, 3)

  const byUser = completionsByUser(season.id, filters, season)
  const deposits = totalDepositedByUser(season.id, filters, season)
  const tradersById = new Map(bullstartTraders.map((trader) => [trader.userId, trader]))

  const rows: BullstartEligibleRow[] = []

  for (const [userId, codes] of byUser) {
    const has1 = codes.has(m1.code)
    const has2 = codes.has(m2.code)
    const has3 = codes.has(m3.code)
    if (!(has1 && has2 && has3)) continue

    const trader = tradersById.get(userId)
    if (!trader) continue

    const dates = [codes.get(m1.code)!, codes.get(m2.code)!, codes.get(m3.code)!]
    const completedAt = dates.reduce((latest, current) =>
      parseIsoDate(current).getTime() > parseIsoDate(latest).getTime() ? current : latest,
    )

    rows.push({
      userId,
      traderId: trader.traderId,
      name: trader.name,
      email: trader.email,
      whatsapp: trader.whatsapp,
      totalDeposited: deposits.get(userId) ?? 0,
      mission1: true,
      mission2: true,
      mission3: true,
      completedAt,
      status: 'eligible',
    })
  }

  const search = query.search?.trim().toLowerCase().replace(/^#/, '') ?? ''
  const statusFilter = query.status ?? 'all'
  let filtered = rows.filter((row) => {
    if (statusFilter !== 'all' && row.status !== statusFilter) return false
    if (!search) return true
    const whatsappDigits = row.whatsapp.replace(/\D/g, '')
    const searchDigits = search.replace(/\D/g, '')
    return (
      row.traderId.toLowerCase().includes(search) ||
      row.name.toLowerCase().includes(search) ||
      row.email.toLowerCase().includes(search) ||
      row.whatsapp.toLowerCase().includes(search) ||
      (searchDigits.length > 0 && whatsappDigits.includes(searchDigits))
    )
  })

  const sortBy = query.sortBy ?? 'totalDeposited'
  const sortDir = query.sortDir ?? 'desc'
  const dir = sortDir === 'asc' ? 1 : -1

  filtered = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'traderId':
        return a.traderId.localeCompare(b.traderId, 'pt-BR') * dir
      case 'completedAt':
        return (parseIsoDate(a.completedAt).getTime() - parseIsoDate(b.completedAt).getTime()) * dir
      case 'totalDeposited':
        return (a.totalDeposited - b.totalDeposited) * dir
      default: {
        const _exhaustive: never = sortBy
        return _exhaustive
      }
    }
  })

  return filtered
}

function getDrawPrizeInfo(seasonId: BullstartSeasonId, userId: string): BullstartDrawPrizeInfo {
  const winner = bullstartDrawWinners.find(
    (item) => item.seasonId === seasonId && item.userId === userId,
  )
  if (!winner) {
    return {
      isWinner: false,
      prizeTitle: null,
      wonAt: null,
      prizeReceived: false,
      deliveryStatus: null,
    }
  }
  return {
    isWinner: true,
    prizeTitle: winner.prizeTitle,
    wonAt: winner.wonAt,
    prizeReceived: winner.prizeReceived,
    deliveryStatus: winner.deliveryStatus,
  }
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

export function getBullstartEligibleDetail(
  seasonId: BullstartSeasonId,
  userId: string,
): BullstartEligibleDetail | null {
  const season = getSeason(seasonId)
  const row = getBullstartEligible({
    seasonId,
    periodStart: season.startsAt,
    periodEnd: season.endsAt,
  }).find((item) => item.userId === userId)

  if (!row) return null

  const m1 = missionByOrder(season, 1)
  const m2 = missionByOrder(season, 2)
  const m3 = missionByOrder(season, 3)

  return {
    ...row,
    seasonLabel: season.label,
    initials: initialsFromName(row.name),
    drawPrize: getDrawPrizeInfo(seasonId, userId),
    missionTitles: {
      mission1: m1.title,
      mission2: m2.title,
      mission3: m3.title,
    },
  }
}

export function formatBullstartDateTime(iso: string): string {
  const date = parseIsoDate(iso)
  if (Number.isNaN(date.getTime())) return '—'
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

export function formatBullstartBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function exportEligibleCsv(rows: BullstartEligibleRow[]): string {
  const header = [
    'trader_id',
    'name',
    'email',
    'whatsapp',
    'total_deposited',
    'mission_1_completed',
    'mission_2_completed',
    'mission_3_completed',
    'completed_at',
  ].join(',')

  const lines = rows.map((row) =>
    [
      csvEscape(row.traderId),
      csvEscape(row.name),
      csvEscape(row.email),
      csvEscape(row.whatsapp),
      row.totalDeposited.toFixed(2),
      row.mission1 ? 'true' : 'false',
      row.mission2 ? 'true' : 'false',
      row.mission3 ? 'true' : 'false',
      csvEscape(row.completedAt),
    ].join(','),
  )

  return [header, ...lines].join('\n')
}

export function downloadEligibleCsv(rows: BullstartEligibleRow[], filename = 'bullstart-elegiveis-sorteio.csv') {
  const csv = exportEligibleCsv(rows)
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}
