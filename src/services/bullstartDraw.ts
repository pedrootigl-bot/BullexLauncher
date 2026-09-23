import { api } from '../api/client'
import { shouldUseMocks } from '../api/config'
import { endpoints } from '../api/endpoints'
import { adminProfile } from '../data/adminMock'
import { isCurrentUserAdmin } from '../utils/adminAccess'
import {
  DRAW_STORAGE_KEY,
  DRAW_WIN_SEEN_KEY,
  seedDrawPrizes,
  type AdminDraw,
  type AdminDrawParticipant,
  type AdminDrawWinner,
  type DrawPrize,
  type DrawPrizeId,
} from '../data/drawAdminMock'
import {
  bullstartSeasons,
  type BullstartSeasonId,
} from '../data/bullstartAdminMock'
import { getBullstartEligible, type BullstartEligibleRow } from './bullstartAdmin'
import { getCurrentUser } from './auth'

type DrawStore = {
  prizes: DrawPrize[]
  draws: AdminDraw[]
  participants: AdminDrawParticipant[]
  nextDrawSeq: number
}

const executingDrawIds = new Set<string>()

/** MOCK/TESTES: força o Trader ID como 1º ganhador quando estiver no snapshot. Remover no backend real. */
const FORCE_WINNER_TRADER_ID = '482917'

function cloneSeedPrizes(): DrawPrize[] {
  return seedDrawPrizes.map((prize) => ({ ...prize }))
}

function emptyStore(): DrawStore {
  return {
    prizes: cloneSeedPrizes(),
    draws: [],
    participants: [],
    nextDrawSeq: 1,
  }
}

function normalizeDeliveryStatus(
  value: unknown,
): AdminDrawWinner['deliveryStatus'] {
  if (value === 'shipped' || value === 'delivered' || value === 'pending') return value
  return 'pending'
}

function normalizeWinner(raw: Partial<AdminDrawWinner> & Pick<AdminDrawWinner, 'userId' | 'traderId' | 'name' | 'place'>): AdminDrawWinner {
  const deliveryStatus = normalizeDeliveryStatus(raw.deliveryStatus)
  return {
    userId: raw.userId,
    traderId: raw.traderId,
    name: raw.name,
    whatsapp: typeof raw.whatsapp === 'string' ? raw.whatsapp : '',
    place: raw.place,
    prizeReceived:
      typeof raw.prizeReceived === 'boolean'
        ? raw.prizeReceived
        : deliveryStatus === 'delivered',
    deliveryStatus,
  }
}

function normalizeParticipant(raw: AdminDrawParticipant): AdminDrawParticipant {
  return {
    ...raw,
    whatsapp: typeof raw.whatsapp === 'string' ? raw.whatsapp : '',
  }
}

function normalizeDraw(raw: AdminDraw): AdminDraw {
  const prizeUnits = Math.max(1, Number(raw.prizeUnits) || 1)
  let winners = Array.isArray(raw.winners) ? raw.winners.map((item) => normalizeWinner(item)) : []
  if (winners.length === 0 && raw.winnerUserId && raw.winnerTraderId && raw.winnerName) {
    winners = [
      normalizeWinner({
        userId: raw.winnerUserId,
        traderId: raw.winnerTraderId,
        name: raw.winnerName,
        place: 1,
      }),
    ]
  }
  const first = winners[0] ?? null
  return {
    ...raw,
    prizeUnits,
    winners,
    winnerUserId: first?.userId ?? raw.winnerUserId ?? null,
    winnerTraderId: first?.traderId ?? raw.winnerTraderId ?? null,
    winnerName: first?.name ?? raw.winnerName ?? null,
  }
}

function loadStore(): DrawStore {
  if (typeof window === 'undefined') return emptyStore()
  try {
    const raw = window.localStorage.getItem(DRAW_STORAGE_KEY)
    if (!raw) return emptyStore()
    const parsed = JSON.parse(raw) as Partial<DrawStore>
    const storedPrizes =
      Array.isArray(parsed.prizes) && parsed.prizes.length > 0 ? parsed.prizes : cloneSeedPrizes()
    const byId = new Map(storedPrizes.map((prize) => [prize.id, prize]))
    for (const seed of seedDrawPrizes) {
      if (!byId.has(seed.id)) byId.set(seed.id, { ...seed })
    }
    return {
      prizes: Array.from(byId.values()),
      draws: Array.isArray(parsed.draws)
        ? parsed.draws.map((draw) => normalizeDraw(draw as AdminDraw))
        : [],
      participants: Array.isArray(parsed.participants)
        ? parsed.participants.map((item) => normalizeParticipant(item as AdminDrawParticipant))
        : [],
      nextDrawSeq: typeof parsed.nextDrawSeq === 'number' && parsed.nextDrawSeq > 0 ? parsed.nextDrawSeq : 1,
    }
  } catch {
    return emptyStore()
  }
}

function saveStore(store: DrawStore): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(DRAW_STORAGE_KEY, JSON.stringify(store))
}

let memoryStore: DrawStore | null = null

function getStore(): DrawStore {
  if (!memoryStore) memoryStore = loadStore()
  return memoryStore
}

function persist(): void {
  if (!memoryStore) return
  saveStore(memoryStore)
}

function seasonLabel(seasonId: BullstartSeasonId): string {
  return bullstartSeasons.find((item) => item.id === seasonId)?.label ?? seasonId
}

/** Índice uniforme com Web Crypto — sem Math.random, sem viés modular. */
export function pickUniformIndex(length: number): number {
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error('Quantidade de participantes inválida.')
  }
  if (typeof crypto === 'undefined' || typeof crypto.getRandomValues !== 'function') {
    throw new Error('Web Crypto indisponível para aleatoriedade segura.')
  }

  const max = 0x100000000
  const limit = max - (max % length)
  const buffer = new Uint32Array(1)

  for (;;) {
    crypto.getRandomValues(buffer)
    const value = buffer[0]
    if (value < limit) return value % length
  }
}

/** Seleciona `count` índices distintos com probabilidade igual (sem reposição). */
export function pickUniformDistinctIndices(length: number, count: number): number[] {
  if (!Number.isInteger(count) || count <= 0) {
    throw new Error('Quantidade de prêmios inválida.')
  }
  if (count > length) {
    throw new Error('Não há participantes suficientes para a quantidade de prêmios.')
  }

  const pool = Array.from({ length }, (_, index) => index)
  const selected: number[] = []

  for (let i = 0; i < count; i += 1) {
    const pick = pickUniformIndex(pool.length)
    const [index] = pool.splice(pick, 1)
    if (index === undefined) throw new Error('Falha ao selecionar vencedores.')
    selected.push(index)
  }

  return selected
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function formatDrawCode(seq: number): string {
  return `#${String(seq).padStart(3, '0')}`
}

function nowIso(): string {
  return new Date().toISOString()
}

export function listDrawPrizes(_seasonId?: BullstartSeasonId): DrawPrize[] {
  const store = getStore()
  return store.prizes
    .filter((prize) => prize.quantityAvailable > 0)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    .map((prize) => ({ ...prize }))
}

export function listAllDrawPrizes(): DrawPrize[] {
  return getStore()
    .prizes.slice()
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    .map((prize) => ({ ...prize }))
}

export function getDrawPrize(prizeId: DrawPrizeId): DrawPrize | null {
  const prize = getStore().prizes.find((item) => item.id === prizeId)
  return prize ? { ...prize } : null
}

export type CreateDrawPrizeInput = {
  name: string
  id?: string
  category?: string
  description?: string
  image?: string
  quantityAvailable?: number
  seasonId?: BullstartSeasonId | null
}

export async function createDrawPrizeAsync(input: CreateDrawPrizeInput): Promise<DrawPrize> {
  if (!shouldUseMocks()) {
    return api.post<DrawPrize>(endpoints.admin.draws.prizes, input)
  }
  return createDrawPrize(input)
}

export function createDrawPrize(input: CreateDrawPrizeInput): DrawPrize {
  const store = getStore()
  const name = input.name.trim()
  if (!name) throw new Error('Informe o nome do prêmio.')

  const rawId = (input.id?.trim() || name)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const id = rawId.startsWith('PRIZE-') ? rawId : `PRIZE-${rawId || Date.now()}`

  if (store.prizes.some((prize) => prize.id === id)) {
    throw new Error('Já existe um prêmio com este ID.')
  }

  const quantity = Math.max(1, Math.floor(Number(input.quantityAvailable) || 1))
  const prize: DrawPrize = {
    id,
    name,
    image: input.image?.trim() || '/media/hero-missoes.jpg',
    category: input.category?.trim() || 'Personalizado',
    description: input.description?.trim() || 'Prêmio cadastrado pelo administrador.',
    quantityAvailable: quantity,
    seasonId: input.seasonId ?? null,
  }

  store.prizes.unshift(prize)
  persist()
  return { ...prize }
}

export function listDrawHistory(seasonId?: BullstartSeasonId): AdminDraw[] {
  const store = getStore()
  return store.draws
    .filter((draw) => !seasonId || draw.seasonId === seasonId)
    .slice()
    .sort((a, b) => (b.drawnAt ?? b.preparedAt).localeCompare(a.drawnAt ?? a.preparedAt))
    .map((draw) => ({ ...draw }))
}

export function getDraw(drawId: string): AdminDraw | null {
  const draw = getStore().draws.find((item) => item.id === drawId)
  return draw ? { ...draw } : null
}

export async function updateDrawWinnerDelivery(
  drawId: string,
  userId: string,
  deliveryStatus: AdminDrawWinner['deliveryStatus'],
): Promise<AdminDraw> {
  if (!shouldUseMocks()) {
    return api.patch<AdminDraw>(endpoints.admin.draws.winnerDelivery(drawId, userId), {
      deliveryStatus,
    })
  }

  if (!isCurrentUserAdmin()) {
    throw new Error('Apenas administradores podem atualizar a entrega do prêmio.')
  }

  const store = getStore()
  const draw = store.draws.find((item) => item.id === drawId)
  if (!draw) throw new Error('Sorteio não encontrado.')
  if (draw.status !== 'completed') {
    throw new Error('Só é possível atualizar entrega em sorteios concluídos.')
  }

  const winner = draw.winners.find((item) => item.userId === userId)
  if (!winner) throw new Error('Ganhador não encontrado neste sorteio.')

  winner.deliveryStatus = deliveryStatus
  winner.prizeReceived = deliveryStatus === 'delivered'
  persist()
  return { ...draw, winners: draw.winners.map((item) => ({ ...item })) }
}

export function getDrawParticipants(drawId: string): AdminDrawParticipant[] {
  return getStore()
    .participants.filter((item) => item.drawId === drawId)
    .slice()
    .sort((a, b) => a.traderId.localeCompare(b.traderId, 'pt-BR'))
    .map((item) => ({ ...item }))
}

export function getActivePreparedDraw(seasonId: BullstartSeasonId): AdminDraw | null {
  const draw = getStore().draws.find(
    (item) => item.seasonId === seasonId && item.status === 'prepared',
  )
  return draw ? { ...draw } : null
}

export type PrepareDrawInput = {
  seasonId: BullstartSeasonId
  prizeId: DrawPrizeId
  /** Unidades do prêmio neste sorteio (vários ganhadores no mesmo draw). */
  prizeUnits: number
}

export async function prepareDraw(input: PrepareDrawInput): Promise<AdminDraw> {
  if (!shouldUseMocks()) {
    return api.post<AdminDraw>(endpoints.admin.draws.prepare, input)
  }

  const store = getStore()
  const existingPrepared = store.draws.find(
    (item) => item.seasonId === input.seasonId && item.status === 'prepared',
  )
  if (existingPrepared) {
    throw new Error('Já existe um sorteio preparado nesta campanha. Conclua-o antes de criar outro.')
  }

  const prize = store.prizes.find((item) => item.id === input.prizeId)
  if (!prize) throw new Error('Prêmio inexistente.')
  if (prize.quantityAvailable <= 0) throw new Error('Prêmio sem estoque disponível.')

  const prizeUnits = Math.floor(Number(input.prizeUnits))
  if (!Number.isFinite(prizeUnits) || prizeUnits < 1) {
    throw new Error('Informe uma quantidade válida de itens para o sorteio.')
  }
  if (prizeUnits > prize.quantityAvailable) {
    throw new Error(
      `Estoque insuficiente. Disponível: ${prize.quantityAvailable}. Solicitado: ${prizeUnits}.`,
    )
  }

  const eligible = getBullstartEligible({ seasonId: input.seasonId })
  if (eligible.length === 0) {
    throw new Error('Nenhum trader elegível para esta campanha.')
  }

  const uniqueByUser = new Map<string, BullstartEligibleRow>()
  for (const row of eligible) {
    if (!uniqueByUser.has(row.userId)) uniqueByUser.set(row.userId, row)
  }

  const snapshotRows = Array.from(uniqueByUser.values()).sort((a, b) =>
    a.userId.localeCompare(b.userId, 'en'),
  )

  if (prizeUnits > snapshotRows.length) {
    throw new Error(
      `Há apenas ${snapshotRows.length} elegíveis. Reduza a quantidade de itens do sorteio.`,
    )
  }

  const snapshotPayload = snapshotRows.map((row) => row.userId).join('|')
  const participantSnapshotHash = await sha256Hex(snapshotPayload)

  const seq = store.nextDrawSeq
  const drawId = `draw-${seq}`
  const preparedAt = nowIso()

  const draw: AdminDraw = {
    id: drawId,
    code: formatDrawCode(seq),
    seasonId: input.seasonId,
    seasonLabel: seasonLabel(input.seasonId),
    prizeId: prize.id,
    prizeName: prize.name,
    prizeImage: prize.image,
    status: 'prepared',
    participantCount: snapshotRows.length,
    participantSnapshotHash,
    prizeUnits,
    winners: [],
    winnerUserId: null,
    winnerTraderId: null,
    winnerName: null,
    createdBy: adminProfile.name,
    createdAt: preparedAt,
    preparedAt,
    drawnAt: null,
  }

  const participants: AdminDrawParticipant[] = snapshotRows.map((row) => ({
    drawId,
    userId: row.userId,
    traderId: row.traderId,
    name: row.name,
    email: row.email,
    whatsapp: row.whatsapp,
    mission1: row.mission1,
    mission2: row.mission2,
    mission3: row.mission3,
  }))

  store.draws.unshift(draw)
  store.participants.push(...participants)
  store.nextDrawSeq = seq + 1
  persist()

  return { ...draw }
}

export type ExecuteDrawResult = {
  draw: AdminDraw
  winners: AdminDrawWinner[]
  winner: AdminDrawParticipant
  winnerIndex: number
}

export async function executeDraw(drawId: string): Promise<ExecuteDrawResult> {
  if (!shouldUseMocks()) {
    return api.post<ExecuteDrawResult>(endpoints.admin.draws.execute(drawId), {})
  }

  if (executingDrawIds.has(drawId)) {
    throw new Error('Sorteio já em andamento. Aguarde a conclusão.')
  }

  const store = getStore()
  const draw = store.draws.find((item) => item.id === drawId)
  if (!draw) throw new Error('Sorteio não encontrado.')

  if (draw.status === 'completed') {
    throw new Error('Este sorteio já foi concluído e não pode ser executado novamente.')
  }

  if (draw.status !== 'prepared') {
    throw new Error('Sorteio não está preparado.')
  }

  executingDrawIds.add(drawId)

  try {
    const prize = store.prizes.find((item) => item.id === draw.prizeId)
    if (!prize) throw new Error('Prêmio inexistente.')

    const prizeUnits = Math.max(1, draw.prizeUnits || 1)
    if (prize.quantityAvailable < prizeUnits) {
      throw new Error(
        `Estoque insuficiente no momento da execução. Disponível: ${prize.quantityAvailable}.`,
      )
    }

    const participants = store.participants
      .filter((item) => item.drawId === drawId)
      .slice()
      .sort((a, b) => a.userId.localeCompare(b.userId, 'en'))

    if (participants.length === 0) {
      throw new Error('Snapshot de participantes vazio.')
    }

    if (participants.length !== draw.participantCount) {
      throw new Error('Inconsistência no snapshot de participantes.')
    }

    if (prizeUnits > participants.length) {
      throw new Error('Participantes insuficientes para a quantidade de prêmios.')
    }

    const forcedIndex = participants.findIndex(
      (item) => normalizeTraderId(item.traderId) === normalizeTraderId(FORCE_WINNER_TRADER_ID),
    )

    let winnerIndexes: number[]
    if (forcedIndex >= 0) {
      // Testes: 482917 sempre em 1º; demais unidades sorteadas aleatoriamente entre os outros.
      const remainingPool = participants
        .map((_, index) => index)
        .filter((index) => index !== forcedIndex)
      const extraCount = prizeUnits - 1
      const extraIndexes =
        extraCount > 0
          ? pickUniformDistinctIndices(remainingPool.length, extraCount).map(
              (pick) => remainingPool[pick]!,
            )
          : []
      winnerIndexes = [forcedIndex, ...extraIndexes]
    } else {
      winnerIndexes = pickUniformDistinctIndices(participants.length, prizeUnits)
    }

    const winners: AdminDrawWinner[] = winnerIndexes.map((index, place) => {
      const participant = participants[index]
      if (!participant) throw new Error('Falha ao selecionar vencedor.')
      return {
        userId: participant.userId,
        traderId: participant.traderId,
        name: participant.name,
        whatsapp: participant.whatsapp,
        place: place + 1,
        prizeReceived: false,
        deliveryStatus: 'pending',
      }
    })

    const firstWinner = winners[0]
    const firstParticipant = participants[winnerIndexes[0] ?? -1]
    if (!firstWinner || !firstParticipant) throw new Error('Falha ao selecionar vencedor.')

    const drawnAt = nowIso()
    draw.status = 'completed'
    draw.prizeUnits = prizeUnits
    draw.winners = winners
    draw.winnerUserId = firstWinner.userId
    draw.winnerTraderId = firstWinner.traderId
    draw.winnerName = firstWinner.name
    draw.drawnAt = drawnAt
    prize.quantityAvailable = Math.max(0, prize.quantityAvailable - prizeUnits)

    persist()

    return {
      draw: { ...draw, winners: winners.map((item) => ({ ...item })) },
      winners: winners.map((item) => ({ ...item })),
      winner: { ...firstParticipant },
      winnerIndex: winnerIndexes[0] ?? 0,
    }
  } finally {
    executingDrawIds.delete(drawId)
  }
}

export function resetDrawStoreForTests(): void {
  memoryStore = emptyStore()
  executingDrawIds.clear()
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(DRAW_WIN_SEEN_KEY)
    saveStore(memoryStore)
  }
}

function normalizeTraderId(value: string): string {
  return value.trim().replace(/^#/, '').toLowerCase()
}

function readSeenWinIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(DRAW_WIN_SEEN_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

/** Retorna o sorteio concluído mais recente em que o trader foi ganhador e ainda não viu o popup. */
export function getPendingDrawWinForTrader(traderId: string): AdminDraw | null {
  const normalized = normalizeTraderId(traderId)
  if (!normalized) return null

  const seen = new Set(readSeenWinIds())
  const wins = getStore()
    .draws.filter((draw) => {
      if (draw.status !== 'completed') return false
      const isWinner = draw.winners.some(
        (winner) => normalizeTraderId(winner.traderId) === normalized,
      )
      if (!isWinner) return false
      return !seen.has(seenKey(draw.id, normalized))
    })
    .sort((a, b) => (b.drawnAt ?? '').localeCompare(a.drawnAt ?? ''))

  const latest = wins[0]
  return latest ? { ...latest } : null
}

function seenKey(drawId: string, traderIdNormalized: string): string {
  return `${drawId}:${traderIdNormalized}`
}

export function dismissDrawWinNotification(drawId: string, traderId?: string): void {
  if (typeof window === 'undefined') return
  const seen = new Set(readSeenWinIds())
  const key = traderId ? seenKey(drawId, normalizeTraderId(traderId)) : drawId
  seen.add(key)
  window.localStorage.setItem(DRAW_WIN_SEEN_KEY, JSON.stringify(Array.from(seen)))
}

/** Força releitura do store a partir do localStorage (ex.: outra aba admin sorteou). */
export function reloadDrawStoreFromStorage(): void {
  memoryStore = loadStore()
}

/** ——— Loaders HTTP (API) / mock ——— */

export async function loadDrawPrizes(seasonId?: BullstartSeasonId): Promise<DrawPrize[]> {
  if (shouldUseMocks()) return listDrawPrizes(seasonId)
  return api.get<DrawPrize[]>(endpoints.admin.draws.prizes, {
    query: { seasonId, available: true },
  })
}

export async function loadAllDrawPrizes(): Promise<DrawPrize[]> {
  if (shouldUseMocks()) return listAllDrawPrizes()
  return api.get<DrawPrize[]>(endpoints.admin.draws.prizes)
}

export async function loadDrawHistory(seasonId?: BullstartSeasonId): Promise<AdminDraw[]> {
  if (shouldUseMocks()) return listDrawHistory(seasonId)
  return api.get<AdminDraw[]>(endpoints.admin.draws.list, { query: { seasonId } })
}

export async function loadDraw(drawId: string): Promise<AdminDraw | null> {
  if (shouldUseMocks()) return getDraw(drawId)
  return api.get<AdminDraw | null>(endpoints.admin.draws.one(drawId))
}

export async function loadDrawParticipants(drawId: string): Promise<AdminDrawParticipant[]> {
  if (shouldUseMocks()) return getDrawParticipants(drawId)
  return api.get<AdminDrawParticipant[]>(endpoints.admin.draws.participants(drawId))
}

export async function loadPendingDrawWin(): Promise<AdminDraw | null> {
  if (shouldUseMocks()) {
    return getPendingDrawWinForTrader(getCurrentUser().traderId)
  }
  return api.get<AdminDraw | null>(endpoints.me.drawWinPending)
}

export async function ackDrawWin(drawId: string): Promise<void> {
  if (shouldUseMocks()) {
    dismissDrawWinNotification(drawId, getCurrentUser().traderId)
    return
  }
  await api.post(endpoints.me.drawWinAck(drawId), {})
}
