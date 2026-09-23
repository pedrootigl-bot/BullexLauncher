import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DEFAULT_BULLSTART_SEASON_ID,
  type BullstartSeasonId,
} from '../../data/bullstartAdminMock'
import type { AdminDraw, AdminDrawParticipant, DrawPrize } from '../../data/drawAdminMock'
import { adminSectionPath } from '../../data/adminMock'
import {
  createDrawPrize,
  executeDraw,
  getActivePreparedDraw,
  getDraw,
  getDrawParticipants,
  getDrawPrize,
  listDrawHistory,
  listDrawPrizes,
  prepareDraw,
  resetDrawStoreForTests,
} from '../../services/bullstartDraw'
import {
  formatBullstartDateTime,
  getBullstartEligible,
  listBullstartSeasons,
  type BullstartEligibleRow,
} from '../../services/bullstartAdmin'
import { whatsappHref } from '../../utils/whatsapp'
import { AdminActionMenu } from './AdminActionMenu'
import { AdminEmptyState } from './AdminEmptyState'
import { DrawPrizeDetailModal } from './DrawPrizeDetailModal'
import { DrawStepper, type DrawStep } from './DrawStepper'
import { ImageDropzone } from './ImageDropzone'
import { StatusBadge } from './StatusBadge'

type UiPhase = 'config' | 'prepared' | 'drawing' | 'completed'

function formatDrawDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return formatBullstartDateTime(iso)
  } catch {
    return iso
  }
}

type BullstartDrawPanelProps = {
  onHistoryChange?: () => void
}

export function BullstartDrawPanel({ onHistoryChange }: BullstartDrawPanelProps) {
  const seasons = listBullstartSeasons()
  const [seasonId, setSeasonId] = useState<BullstartSeasonId>(DEFAULT_BULLSTART_SEASON_ID)
  const [prizeId, setPrizeId] = useState('')
  const [prizeUnits, setPrizeUnits] = useState(1)
  const [confirmed, setConfirmed] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [activeDrawId, setActiveDrawId] = useState<string | null>(null)
  const [phase, setPhase] = useState<UiPhase>('config')
  const [reelId, setReelId] = useState('')
  const [historyTick, setHistoryTick] = useState(0)
  const [confirmExecuteOpen, setConfirmExecuteOpen] = useState(false)
  const [showSnapshot, setShowSnapshot] = useState(false)
  const [showCustomPrize, setShowCustomPrize] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customId, setCustomId] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  const [customImage, setCustomImage] = useState('')
  const [customImageName, setCustomImageName] = useState('')
  const [customImageOwned, setCustomImageOwned] = useState(false)
  const [customQty, setCustomQty] = useState('1')
  const [detailDraw, setDetailDraw] = useState<AdminDraw | null>(null)
  const reelTimerRef = useRef<number | null>(null)

  const season = seasons.find((item) => item.id === seasonId) ?? seasons[0]

  const liveEligible = useMemo(
    () => getBullstartEligible({ seasonId }),
    [seasonId],
  )

  const prizes = useMemo(() => listDrawPrizes(), [historyTick])

  const selectedPrize: DrawPrize | null = prizeId ? getDrawPrize(prizeId) : null

  const maxUnits = useMemo(() => {
    if (!selectedPrize) return 1
    return Math.max(1, Math.min(selectedPrize.quantityAvailable, liveEligible.length || 1))
  }, [selectedPrize, liveEligible.length])

  useEffect(() => {
    if (phase !== 'config') return
    setPrizeUnits((current) => Math.min(Math.max(1, current), maxUnits))
  }, [maxUnits, phase, prizeId])

  const activeDraw: AdminDraw | null = useMemo(() => {
    if (activeDrawId) return getDraw(activeDrawId)
    return getActivePreparedDraw(seasonId)
  }, [activeDrawId, seasonId, historyTick, phase])

  const snapshotParticipants = useMemo(() => {
    if (!activeDraw) return [] as AdminDrawParticipant[]
    return getDrawParticipants(activeDraw.id)
  }, [activeDraw, historyTick])

  const history = useMemo(() => listDrawHistory(), [historyTick])

  const displayRows: Array<BullstartEligibleRow | AdminDrawParticipant> =
    activeDraw && (phase === 'prepared' || phase === 'drawing' || phase === 'completed')
      ? snapshotParticipants
      : liveEligible

  const poolCount =
    activeDraw && (phase === 'prepared' || phase === 'drawing' || phase === 'completed')
      ? activeDraw.participantCount
      : liveEligible.length

  const filteredRows = useMemo(() => {
    const q = search.trim().replace(/^#/, '').toLowerCase()
    if (!q) return displayRows
    return displayRows.filter((row) => {
      const traderId = row.traderId.replace(/^#/, '').toLowerCase()
      const name = row.name.toLowerCase()
      const userId = 'userId' in row ? row.userId.toLowerCase() : ''
      const whatsapp = 'whatsapp' in row && typeof row.whatsapp === 'string' ? row.whatsapp : ''
      const whatsappDigits = whatsapp.replace(/\D/g, '')
      const qDigits = q.replace(/\D/g, '')
      return (
        traderId.includes(q) ||
        name.includes(q) ||
        userId.includes(q) ||
        whatsapp.toLowerCase().includes(q) ||
        (qDigits.length > 0 && whatsappDigits.includes(qDigits))
      )
    })
  }, [displayRows, search])

  const locked = phase === 'prepared' || phase === 'drawing' || phase === 'completed'

  useEffect(() => {
    const prepared = getActivePreparedDraw(seasonId)
    if (prepared) {
      setActiveDrawId(prepared.id)
      setPrizeId(prepared.prizeId)
      setPrizeUnits(prepared.prizeUnits || 1)
      setPhase('prepared')
      setConfirmed(true)
      return
    }
    setActiveDrawId(null)
    setPhase('config')
    setConfirmed(false)
    setPrizeId('')
    setPrizeUnits(1)
    setSearch('')
    setError(null)
  }, [seasonId])

  useEffect(() => {
    return () => {
      if (reelTimerRef.current) window.clearInterval(reelTimerRef.current)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (customImageOwned && customImage.startsWith('blob:')) {
        URL.revokeObjectURL(customImage)
      }
    }
  }, [customImage, customImageOwned])

  function handleCustomImageChange(file: File | null) {
    setCustomImage((current) => {
      if (customImageOwned && current.startsWith('blob:')) URL.revokeObjectURL(current)
      return file ? URL.createObjectURL(file) : ''
    })
    setCustomImageOwned(Boolean(file))
    setCustomImageName(file?.name ?? '')
  }

  function clearCustomPrizeForm() {
    if (customImageOwned && customImage.startsWith('blob:')) {
      URL.revokeObjectURL(customImage)
    }
    setCustomName('')
    setCustomId('')
    setCustomCategory('')
    setCustomDescription('')
    setCustomImage('')
    setCustomImageName('')
    setCustomImageOwned(false)
    setCustomQty('1')
  }

  function handleResetTestData() {
    if (reelTimerRef.current) {
      window.clearInterval(reelTimerRef.current)
      reelTimerRef.current = null
    }
    resetDrawStoreForTests()
    setActiveDrawId(null)
    setPhase('config')
    setConfirmed(false)
    setPrizeId('')
    setPrizeUnits(1)
    setSearch('')
    setError(null)
    setBusy(false)
    setReelId('')
    setConfirmExecuteOpen(false)
    setShowSnapshot(false)
    setShowCustomPrize(false)
    setHistoryTick((n) => n + 1)
    onHistoryChange?.()
  }

  function handleCreateCustomPrize() {
    setError(null)
    try {
      const prize = createDrawPrize({
        name: customName,
        id: customId || undefined,
        category: customCategory || undefined,
        description: customDescription || undefined,
        image: customImage || undefined,
        quantityAvailable: Number(customQty) || 1,
        seasonId: null,
      })
      setPrizeId(prize.id)
      setHistoryTick((n) => n + 1)
      setShowCustomPrize(false)
      clearCustomPrizeForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao cadastrar prêmio.')
    }
  }

  async function handlePrepare() {
    setError(null)
    if (!prizeId) {
      setError('Selecione um prêmio antes de continuar.')
      return
    }
    if (prizeUnits < 1) {
      setError('Informe a quantidade de itens deste sorteio.')
      return
    }
    if (!confirmed) {
      setError('Confirme que revisou o prêmio e a lista de participantes.')
      return
    }
    if (liveEligible.length === 0) {
      setError('Nenhum trader elegível para esta campanha.')
      return
    }

    setBusy(true)
    try {
      const draw = await prepareDraw({ seasonId, prizeId, prizeUnits })
      setActiveDrawId(draw.id)
      setPhase('prepared')
      setHistoryTick((n) => n + 1)
      onHistoryChange?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao preparar o sorteio.')
    } finally {
      setBusy(false)
    }
  }

  async function handleExecute() {
    if (!activeDrawId) return
    setConfirmExecuteOpen(false)
    setError(null)
    setBusy(true)
    setPhase('drawing')

    try {
      const result = await executeDraw(activeDrawId)
      setHistoryTick((n) => n + 1)
      onHistoryChange?.()

      const ids = result.draw
        ? getDrawParticipants(result.draw.id).map((p) => p.traderId)
        : []
      const pool = ids.length > 0 ? ids : [result.winner.traderId]
      const started = performance.now()
      const duration = 4200

      if (reelTimerRef.current) window.clearInterval(reelTimerRef.current)
      reelTimerRef.current = window.setInterval(() => {
        const elapsed = performance.now() - started
        const idx = Math.floor(elapsed / 80) % pool.length
        setReelId(pool[idx] ?? result.winner.traderId)
        if (elapsed >= duration) {
          if (reelTimerRef.current) window.clearInterval(reelTimerRef.current)
          reelTimerRef.current = null
          setReelId(result.winner.traderId)
          setPhase('completed')
          setBusy(false)
        }
      }, 70)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao realizar o sorteio.')
      setPhase('prepared')
      setBusy(false)
    }
  }

  function handleNewDraw() {
    setActiveDrawId(null)
    setPhase('config')
    setConfirmed(false)
    setPrizeId('')
    setPrizeUnits(1)
    setSearch('')
    setError(null)
    setShowSnapshot(false)
    setReelId('')
    setHistoryTick((n) => n + 1)
  }

  const emptyEligible = liveEligible.length === 0 && phase === 'config'

  const drawSteps: DrawStep[] = useMemo(() => {
    const configState =
      phase === 'config' ? 'active' : phase === 'prepared' || phase === 'drawing' || phase === 'completed'
        ? 'done'
        : 'locked'
    const participantsState =
      phase === 'config'
        ? prizeId
          ? 'active'
          : 'locked'
        : 'done'
    const drawState =
      phase === 'prepared'
        ? 'active'
        : phase === 'drawing' || phase === 'completed'
          ? phase === 'completed'
            ? 'done'
            : 'active'
          : 'locked'

    return [
      { id: 'config', index: '01', label: 'Configuração', state: configState },
      { id: 'participants', index: '02', label: 'Participantes', state: participantsState },
      { id: 'draw', index: '03', label: 'Sorteio', state: drawState },
    ]
  }, [phase, prizeId])

  return (
    <div className="bx-draw">
      <DrawStepper steps={drawSteps} />

      {error ? (
        <p className="bx-draw__error" role="alert">
          {error}
        </p>
      ) : null}

      <section className="bx-admin-panel bx-draw-section" aria-labelledby="bx-draw-config-title">
        <div className="bx-draw-section__head">
          <div className="bx-draw-section__copy">
            <h2 id="bx-draw-config-title">Configuração do sorteio</h2>
            <p>Campanha, prêmio e status antes de congelar a lista.</p>
          </div>
          <StatusBadge
            label={
              phase === 'completed'
                ? 'Sorteado'
                : phase === 'drawing'
                  ? 'Sorteando'
                  : phase === 'prepared'
                    ? 'Preparado'
                    : 'Aguardando'
            }
            tone={
              phase === 'completed'
                ? 'drawn'
                : phase === 'prepared' || phase === 'drawing'
                  ? 'prepared'
                  : 'pending'
            }
          />
        </div>

        <div className="bx-draw-section__body">
        <div className="bx-draw__config-grid bx-draw__config-grid--season">
          <label className="bx-draw__field">
            <span>Campanha / temporada</span>
            <select
              value={seasonId}
              disabled={locked || busy}
              onChange={(event) => setSeasonId(event.target.value as BullstartSeasonId)}
            >
              {seasons.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <article className="bx-draw-stat">
            <span>Participantes</span>
            <strong>{poolCount}</strong>
            <em>Todos com chances iguais.</em>
          </article>

          <article className="bx-draw-stat bx-draw-stat--status">
            <span>Status</span>
            <strong>
              {phase === 'completed'
                ? 'Concluído'
                : phase === 'drawing'
                  ? 'Sorteando…'
                  : phase === 'prepared'
                    ? 'Preparado'
                    : emptyEligible
                      ? 'Sem elegíveis'
                      : prizeId
                        ? 'Pronto para preparar'
                        : 'Aguardando prêmio'}
            </strong>
            <em>{season?.label}</em>
          </article>
        </div>

        <div className="bx-draw-prize-block">
          <div className="bx-draw-prize-block__head">
            <div>
              <p className="bx-draw__eyebrow">Prêmio do sorteio</p>
              <h3>Escolha o prêmio</h3>
              <p>Defina o prêmio antes de preparar. Após o prepare, a escolha fica bloqueada.</p>
            </div>
            {!locked ? (
              <button
                type="button"
                className="bx-admin-link"
                onClick={() => setShowCustomPrize((open) => !open)}
              >
                {showCustomPrize ? 'Fechar cadastro' : '+ Cadastrar prêmio'}
              </button>
            ) : null}
          </div>

          {showCustomPrize && !locked ? (
            <div className="bx-draw-custom">
              <label className="bx-draw__field">
                <span>Nome do prêmio</span>
                <input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Ex.: iPhone 18 Pro Max" />
              </label>
              <label className="bx-draw__field">
                <span>ID interno (opcional)</span>
                <input value={customId} onChange={(e) => setCustomId(e.target.value)} placeholder="PRIZE-018" />
              </label>
              <label className="bx-draw__field">
                <span>Categoria</span>
                <input value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} placeholder="Eletrônicos" />
              </label>
              <label className="bx-draw__field">
                <span>Quantidade</span>
                <input value={customQty} onChange={(e) => setCustomQty(e.target.value)} inputMode="numeric" placeholder="1" />
              </label>
              <label className="bx-draw__field bx-draw__field--wide">
                <span>Descrição</span>
                <input value={customDescription} onChange={(e) => setCustomDescription(e.target.value)} placeholder="Descrição curta" />
              </label>
              <div className="bx-draw__field bx-draw__field--wide">
                <ImageDropzone
                  label="Imagem do prêmio"
                  fileName={customImageName}
                  previewUrl={customImage || null}
                  optionalHint
                  onChange={handleCustomImageChange}
                />
              </div>
              <button type="button" className="bx-admin-add" onClick={handleCreateCustomPrize} disabled={!customName.trim()}>
                Salvar prêmio no catálogo
              </button>
            </div>
          ) : null}

          {prizes.length === 0 ? (
            <p className="bx-draw__hint">Nenhum prêmio com estoque. Cadastre um prêmio para continuar.</p>
          ) : (
            <div className="bx-draw-prize-grid" role="listbox" aria-label="Selecionar prêmio">
              {prizes.map((prize) => {
                const selected = prize.id === prizeId
                return (
                  <button
                    key={prize.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`bx-draw-prize-card${selected ? ' is-selected' : ''}`}
                    disabled={locked || busy}
                    onClick={() => {
                      setPrizeId(prize.id)
                      setPrizeUnits(1)
                    }}
                  >
                    <span className="bx-draw-prize-card__media">
                      <img src={prize.image} alt="" />
                    </span>
                    <span className="bx-draw-prize-card__body">
                      <strong>{prize.name}</strong>
                      <em>#{prize.id}</em>
                      <span>
                        {prize.category} · estoque {prize.quantityAvailable}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {selectedPrize ? (
            <article className="bx-draw-prize">
              <div className="bx-draw-prize__media">
                <img src={selectedPrize.image} alt={selectedPrize.name} />
              </div>
              <div className="bx-draw-prize__body">
                <p className="bx-draw__eyebrow">Prêmio selecionado</p>
                <h3>{selectedPrize.name}</h3>
                <dl>
                  <div>
                    <dt>ID</dt>
                    <dd>#{selectedPrize.id}</dd>
                  </div>
                  <div>
                    <dt>Categoria</dt>
                    <dd>{selectedPrize.category}</dd>
                  </div>
                  <div>
                    <dt>Estoque</dt>
                    <dd>{selectedPrize.quantityAvailable}</dd>
                  </div>
                </dl>
                <p>{selectedPrize.description}</p>

                {!locked ? (
                  <label className="bx-draw__field bx-draw__units">
                    <span>Quantidade neste sorteio</span>
                    <div className="bx-draw__units-row">
                      <input
                        type="number"
                        min={1}
                        max={maxUnits}
                        value={prizeUnits}
                        disabled={busy}
                        onChange={(event) => {
                          const next = Math.floor(Number(event.target.value) || 1)
                          setPrizeUnits(Math.min(maxUnits, Math.max(1, next)))
                        }}
                      />
                      <em>
                        Máx. {maxUnits} · {prizeUnits > 1 ? `${prizeUnits} ganhadores` : '1 ganhador'}
                      </em>
                    </div>
                    <p className="bx-draw__units-hint">
                      Sorteia {prizeUnits} unidade{prizeUnits > 1 ? 's' : ''} do mesmo prêmio nesta
                      campanha, sem criar outro sorteio. Cada ganhador recebe 1 item.
                    </p>
                  </label>
                ) : (
                  <p className="bx-draw__units-locked">
                    Unidades neste sorteio: <strong>{activeDraw?.prizeUnits ?? prizeUnits}</strong>
                  </p>
                )}
              </div>
            </article>
          ) : (
            <p className="bx-draw__hint">Selecione um prêmio na grade acima antes de continuar.</p>
          )}
        </div>
        </div>
      </section>

      <section className="bx-admin-panel bx-draw-section" aria-labelledby="bx-draw-part-title">
        <div className="bx-draw-section__head">
          <div className="bx-draw-section__copy">
            <h2 id="bx-draw-part-title">Participantes elegíveis</h2>
            <p>
              <strong className="bx-draw-section__count">{poolCount}</strong>
              {locked ? ' traders · lista bloqueada' : ' traders · critério: 3 missões concluídas'}
            </p>
          </div>
          <label className="bx-admin-search bx-draw__search">
            <span className="sr-only">Buscar por ID ou trader</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por ID, trader ou WhatsApp..."
            />
          </label>
        </div>

        <div className="bx-draw-section__body">
        <p className="bx-draw__search-note">
          A busca é só para conferência visual. O sorteio usa sempre a lista completa
          {locked ? ' congelada no snapshot' : ' de elegíveis'}.
        </p>

        {emptyEligible && phase === 'config' ? (
          <p className="bx-admin-empty">Nenhum trader elegível para esta campanha.</p>
        ) : (
          <div className="bx-admin-table bx-draw-table" role="table" aria-label="Participantes elegíveis">
            <div className="bx-admin-table__head" role="row">
              <span role="columnheader">Trader ID</span>
              <span role="columnheader">Nome</span>
              <span role="columnheader">WhatsApp</span>
              <span role="columnheader">Missão 01</span>
              <span role="columnheader">Missão 02</span>
              <span role="columnheader">Missão 03</span>
              <span role="columnheader">Status</span>
            </div>
            {filteredRows.map((row) => {
              const whatsapp = 'whatsapp' in row && typeof row.whatsapp === 'string' ? row.whatsapp : ''
              return (
              <div key={`${row.traderId}-${row.name}`} className="bx-admin-table__row" role="row">
                <span role="cell" className="bx-admin-table__num">
                  {row.traderId}
                </span>
                <span role="cell" className="bx-admin-table__entity">
                  <strong>{row.name}</strong>
                </span>
                <span role="cell">
                  {whatsapp ? (
                    <a
                      className="bx-bullstart-wa"
                      href={whatsappHref(whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {whatsapp}
                    </a>
                  ) : (
                    '—'
                  )}
                </span>
                <span role="cell" className="bx-draw-check" aria-label="Missão 01">
                  ✓
                </span>
                <span role="cell" className="bx-draw-check" aria-label="Missão 02">
                  ✓
                </span>
                <span role="cell" className="bx-draw-check" aria-label="Missão 03">
                  ✓
                </span>
                <span role="cell">
                  <em className="bx-admin-badge bx-admin-badge--active">Elegível</em>
                </span>
              </div>
              )
            })}
          </div>
        )}

        <p className="bx-draw__search-note">
          A busca abaixo é apenas para conferência. O sorteio utilizará todos os elegíveis.
        </p>

        <p className="bx-draw__equal">
          Cada participante possui <strong>1 chance</strong> neste sorteio
          {poolCount > 0 ? ` (1 / ${poolCount})` : ''}.
        </p>
        </div>
      </section>

      {phase === 'config' ? (
        <section className="bx-admin-panel bx-draw-section" aria-labelledby="bx-draw-confirm-title">
          <div className="bx-draw-section__head">
            <div className="bx-draw-section__copy">
              <h2 id="bx-draw-confirm-title">Confirmar sorteio</h2>
              <p>Revise os dados antes de congelar a lista de participantes.</p>
            </div>
          </div>

          <div className="bx-draw-section__body">
          <dl className="bx-draw-summary">
            <div>
              <dt>Campanha</dt>
              <dd>{season?.label}</dd>
            </div>
            <div>
              <dt>Prêmio</dt>
              <dd>{selectedPrize?.name ?? '—'}</dd>
            </div>
            <div>
              <dt>ID do prêmio</dt>
              <dd>{selectedPrize ? `#${selectedPrize.id}` : '—'}</dd>
            </div>
            <div>
              <dt>Participantes</dt>
              <dd>{poolCount}</dd>
            </div>
            <div>
              <dt>Itens neste sorteio</dt>
              <dd>
                {prizeUnits} × {selectedPrize?.name ?? '—'}
              </dd>
            </div>
            <div>
              <dt>Critério</dt>
              <dd>Concluíram as 3 missões</dd>
            </div>
            <div>
              <dt>Chance</dt>
              <dd>Igual para todos · sem reposição</dd>
            </div>
          </dl>

          <label className="bx-draw-checkrow">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              disabled={busy || emptyEligible || !prizeId}
            />
            <span>Confirmo que revisei o prêmio e a lista de participantes.</span>
          </label>

          <button
            type="button"
            className="bx-btn bx-btn--primary bx-draw__prepare"
            onClick={() => void handlePrepare()}
            disabled={busy || emptyEligible || !prizeId || !confirmed}
          >
            Preparar sorteio
          </button>
          </div>
        </section>
      ) : null}

      {phase === 'prepared' || phase === 'drawing' ? (
        <section className="bx-admin-panel bx-draw-section bx-draw-section--ready" aria-labelledby="bx-draw-ready-title">
          <div className="bx-draw-section__head">
            <div className="bx-draw-section__copy">
              <h2 id="bx-draw-ready-title">Sorteio preparado</h2>
              <p>Lista congelada. O próximo passo é definitivo.</p>
            </div>
          </div>

          <div className="bx-draw-section__body">
          <div className="bx-draw-ready-card">
            <p className="bx-draw__eyebrow">Tudo pronto</p>
            <h3>
              {activeDraw?.participantCount} traders estão concorrendo ao{' '}
              <strong>{activeDraw?.prizeName}</strong>
            </h3>
            <p>
              Todos possuem chances iguais · {activeDraw?.prizeUnits ?? 1} unidade
              {(activeDraw?.prizeUnits ?? 1) > 1 ? 's' : ''} · snapshot congelado
            </p>
            <dl className="bx-draw-ready-card__meta">
              <div>
                <dt>Campanha</dt>
                <dd>{activeDraw?.seasonLabel}</dd>
              </div>
              <div>
                <dt>Hash</dt>
                <dd>
                  <code>{activeDraw?.participantSnapshotHash.slice(0, 16)}…</code>
                </dd>
              </div>
            </dl>
          </div>

          <div className="bx-draw-lock-banner" role="status">
            <strong>
              {activeDraw?.participantCount} participantes · {activeDraw?.prizeUnits ?? 1}{' '}
              {activeDraw && (activeDraw.prizeUnits ?? 1) > 1 ? 'itens' : 'item'} · chances iguais ·
              lista bloqueada
            </strong>
            <span>
              Prêmio: {activeDraw?.prizeName} · Hash:{' '}
              <code>{activeDraw?.participantSnapshotHash.slice(0, 12)}…</code>
            </span>
          </div>

          {phase === 'drawing' ? (
            <div className="bx-draw-reel" aria-live="polite">
              <p>Sorteando…</p>
              <strong>{reelId || '—'}</strong>
            </div>
          ) : (
            <button
              type="button"
              className="bx-btn bx-btn--primary bx-draw__execute"
              onClick={() => setConfirmExecuteOpen(true)}
              disabled={busy}
            >
              Realizar sorteio
            </button>
          )}
          </div>
        </section>
      ) : null}

      {phase === 'completed' && activeDraw ? (
        <section className="bx-admin-panel bx-draw-section bx-draw-section--result" aria-labelledby="bx-draw-result-title">
          <div className="bx-draw-section__head">
            <div className="bx-draw-section__copy">
              <p className="bx-draw__eyebrow">Resultado</p>
              <h2 id="bx-draw-result-title">
                {(activeDraw.prizeUnits ?? 1) > 1 ? 'Temos vencedores' : 'Temos um vencedor'}
              </h2>
              <p>
                Sorteio concluído · {activeDraw.prizeUnits} unidade
                {(activeDraw.prizeUnits ?? 1) > 1 ? 's' : ''} de {activeDraw.prizeName}.
              </p>
            </div>
          </div>

          <div className="bx-draw-section__body">
          <ul className="bx-draw-winners">
            {(activeDraw.winners.length > 0
              ? activeDraw.winners
              : activeDraw.winnerName
                ? [
                    {
                      userId: activeDraw.winnerUserId ?? '',
                      traderId: activeDraw.winnerTraderId ?? '',
                      name: activeDraw.winnerName,
                      whatsapp: '',
                      place: 1,
                      prizeReceived: false,
                      deliveryStatus: 'pending',
                    },
                  ]
                : []
            ).map((winner) => (
              <li key={`${winner.traderId}-${winner.place}`} className="bx-draw-winner">
                <div className="bx-draw-winner__avatar" aria-hidden="true">
                  {initials(winner.name)}
                </div>
                <div className="bx-draw-winner__identity">
                  <em className="bx-draw-winner__place">
                    {(activeDraw.prizeUnits ?? 1) > 1 ? `${winner.place}º ganhador` : 'Vencedor'}
                  </em>
                  <strong>{winner.name}</strong>
                  <p>
                    Trader ID <b>{winner.traderId}</b>
                  </p>
                  {winner.whatsapp ? (
                    <p>
                      WhatsApp{' '}
                      <a
                        className="bx-bullstart-wa"
                        href={whatsappHref(winner.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {winner.whatsapp}
                      </a>
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>

          <dl className="bx-draw-result-meta">
            <div>
              <dt>Prêmio</dt>
              <dd>
                {activeDraw.prizeUnits} × {activeDraw.prizeName}
              </dd>
            </div>
            <div>
              <dt>Sorteio</dt>
              <dd>{activeDraw.code}</dd>
            </div>
            <div>
              <dt>Data</dt>
              <dd>{formatDrawDate(activeDraw.drawnAt)}</dd>
            </div>
            <div>
              <dt>Participantes</dt>
              <dd>{activeDraw.participantCount}</dd>
            </div>
          </dl>

          <div className="bx-draw__result-actions">
            <button type="button" className="bx-admin-link" onClick={() => setShowSnapshot((v) => !v)}>
              {showSnapshot ? 'Ocultar participantes' : 'Ver participantes'}
            </button>
            <button type="button" className="bx-admin-add" onClick={handleNewDraw}>
              Novo sorteio
            </button>
          </div>

          {showSnapshot ? (
            <div className="bx-draw-audit">
              <p>
                Hash do snapshot: <code>{activeDraw.participantSnapshotHash}</code>
              </p>
              <p>
                Preparado por {activeDraw.createdBy} em {formatDrawDate(activeDraw.preparedAt)}
              </p>
            </div>
          ) : null}
          </div>
        </section>
      ) : null}

      <section className="bx-admin-panel bx-draw-section" aria-labelledby="bx-draw-hist-title">
        <div className="bx-draw-section__head">
          <div className="bx-draw-section__copy">
            <h2 id="bx-draw-hist-title">Histórico de sorteios</h2>
            <p>Últimos resultados nesta sessão.</p>
          </div>
          <div className="bx-page-header__actions">
            <Link className="bx-btn bx-btn--secondary" to={adminSectionPath('campaigns')}>
              Ver todos →
            </Link>
            <AdminActionMenu
              label="Ações administrativas"
              items={[
                {
                  id: 'reset',
                  label: 'Limpar dados de teste',
                  tone: 'danger',
                  onSelect: handleResetTestData,
                },
              ]}
            />
          </div>
        </div>

        <div className="bx-draw-section__body">
        {history.length === 0 ? (
          <AdminEmptyState title="Nenhum sorteio realizado ainda." />
        ) : (
          <div className="bx-admin-table bx-draw-history-table" role="table" aria-label="Histórico">
            <div className="bx-admin-table__head" role="row">
              <span role="columnheader">Sorteio</span>
              <span role="columnheader">Campanha</span>
              <span role="columnheader">Prêmio</span>
              <span role="columnheader">Qtd.</span>
              <span role="columnheader">Participantes</span>
              <span role="columnheader">Vencedores</span>
              <span role="columnheader">Data</span>
              <span role="columnheader">Status</span>
            </div>
            {history.map((draw) => (
              <div key={draw.id} className="bx-admin-table__row" role="row">
                <span role="cell">
                  <strong>{draw.code}</strong>
                </span>
                <span role="cell">{draw.seasonLabel}</span>
                <span role="cell">
                  <button
                    type="button"
                    className="bx-bullstart-link bx-bullstart-link--name"
                    onClick={() => setDetailDraw(draw)}
                  >
                    {draw.prizeName}
                  </button>
                </span>
                <span role="cell" className="bx-admin-table__num">
                  {draw.prizeUnits ?? 1}
                </span>
                <span role="cell" className="bx-admin-table__num">
                  {draw.participantCount}
                </span>
                <span role="cell">
                  {draw.winners.length > 0
                    ? draw.winners.map((w) => w.name).join(', ')
                    : (draw.winnerName ?? '—')}
                </span>
                <span role="cell">{formatDrawDate(draw.drawnAt ?? draw.preparedAt)}</span>
                <span role="cell">
                  <StatusBadge
                    label={draw.status === 'completed' ? 'Concluído' : 'Preparado'}
                    tone={draw.status === 'completed' ? 'completed' : 'prepared'}
                  />
                </span>
              </div>
            ))}
          </div>
        )}
        </div>
      </section>

      {confirmExecuteOpen ? (
        <div className="bx-draw-modal" role="presentation">
          <div
            className="bx-draw-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bx-draw-exec-title"
          >
            <h3 id="bx-draw-exec-title">O sorteio será definitivo</h3>
            <p>
              Após a escolha do vencedor, não será possível realizar novamente este mesmo sorteio.
            </p>
            <div className="bx-draw-modal__actions">
              <button type="button" className="bx-draw-modal__ghost" onClick={() => setConfirmExecuteOpen(false)}>
                Cancelar
              </button>
              <button type="button" className="bx-draw__execute bx-draw__execute--compact" onClick={() => void handleExecute()}>
                Realizar sorteio
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {detailDraw ? (
        <DrawPrizeDetailModal
          draw={detailDraw}
          onClose={() => setDetailDraw(null)}
          onUpdated={(updated) => {
            setDetailDraw(updated)
            setHistoryTick((n) => n + 1)
            onHistoryChange?.()
          }}
        />
      ) : null}
    </div>
  )
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}
