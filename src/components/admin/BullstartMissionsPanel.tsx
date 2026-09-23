import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DEFAULT_BULLSTART_SEASON_ID,
  eligibleStatusLabel,
  type BullstartSeasonId,
  type EligibleStatus,
} from '../../data/bullstartAdminMock'
import {
  downloadEligibleCsv,
  formatBullstartBRL,
  formatBullstartDateTime,
  getBullstartEligible,
  getBullstartOverview,
  listBullstartSeasons,
  type BullstartEligibleRow,
  type EligibleSortKey,
} from '../../services/bullstartAdmin'
import { whatsappHref } from '../../utils/whatsapp'
import { AdminEmptyState } from './AdminEmptyState'
import { AdminKpiCard } from './AdminKpiCard'
import { BullstartEligibleDetailModal } from './BullstartEligibleDetailModal'
import { StatusBadge } from './StatusBadge'

type StatusFilter = EligibleStatus | 'all'

type SortOptionValue = `${EligibleSortKey}:${'asc' | 'desc'}`

type FilterOption<T extends string> = {
  value: T
  label: string
  hint: string
  tone?: 'all' | 'eligible' | 'sort' | 'season'
}

const STATUS_OPTIONS: FilterOption<StatusFilter>[] = [
  {
    value: 'all',
    label: 'Todos status',
    hint: 'Todos os elegíveis listados',
    tone: 'all',
  },
  {
    value: 'eligible',
    label: 'Elegível',
    hint: 'Prontos para o sorteio',
    tone: 'eligible',
  },
]

const SORT_OPTIONS: FilterOption<SortOptionValue>[] = [
  {
    value: 'totalDeposited:desc',
    label: 'Maior depósito',
    hint: 'Do maior para o menor',
    tone: 'sort',
  },
  {
    value: 'totalDeposited:asc',
    label: 'Menor depósito',
    hint: 'Do menor para o maior',
    tone: 'sort',
  },
  {
    value: 'traderId:asc',
    label: 'ID (A→Z)',
    hint: 'Ordenar trader ID crescente',
    tone: 'sort',
  },
  {
    value: 'traderId:desc',
    label: 'ID (Z→A)',
    hint: 'Ordenar trader ID decrescente',
    tone: 'sort',
  },
  {
    value: 'completedAt:desc',
    label: 'Conclusão recente',
    hint: 'Quem finalizou por último',
    tone: 'sort',
  },
  {
    value: 'completedAt:asc',
    label: 'Conclusão antiga',
    hint: 'Quem finalizou primeiro',
    tone: 'sort',
  },
]

export function BullstartMissionsPanel() {
  const seasons = listBullstartSeasons()
  const [seasonId, setSeasonId] = useState<BullstartSeasonId>(DEFAULT_BULLSTART_SEASON_ID)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<EligibleSortKey>('totalDeposited')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [showRewardBreakdown, setShowRewardBreakdown] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const season = seasons.find((item) => item.id === seasonId) ?? seasons[0]

  const seasonOptions = useMemo<FilterOption<BullstartSeasonId>[]>(
    () =>
      seasons.map((item) => ({
        value: item.id,
        label: item.label,
        hint: `${formatSeasonDate(item.startsAt)} → ${formatSeasonDate(item.endsAt)}`,
        tone: 'season' as const,
      })),
    [seasons],
  )

  const overview = useMemo(
    () =>
      getBullstartOverview({
        seasonId,
        periodStart: season?.startsAt,
        periodEnd: season?.endsAt,
      }),
    [seasonId, season?.startsAt, season?.endsAt],
  )

  const eligible = useMemo(
    () =>
      getBullstartEligible({
        seasonId,
        periodStart: season?.startsAt,
        periodEnd: season?.endsAt,
        search,
        status: statusFilter,
        sortBy,
        sortDir,
      }),
    [seasonId, season?.startsAt, season?.endsAt, search, statusFilter, sortBy, sortDir],
  )

  const funnelMax = Math.max(
    ...overview.funnel.map((item) => item.uniqueCompletions),
    overview.missions.allCompleted,
    1,
  )

  const funnelColumns = useMemo(() => {
    const stages = [
      ...overview.funnel.map((item) => ({
        key: item.code,
        label: item.code,
        title: item.title,
        value: item.uniqueCompletions,
        tone: 'mission' as const,
      })),
      {
        key: 'all-completed',
        label: 'Todas concluídas',
        title: 'Elegíveis ao sorteio',
        value: overview.missions.allCompleted,
        tone: 'eligible' as const,
      },
    ]

    return stages.map((stage, index) => {
      const previous = index === 0 ? funnelMax : stages[index - 1]!.value
      const conversion = previous > 0 ? Math.round((stage.value / previous) * 100) : 0
      const ofFunnel = funnelMax > 0 ? Math.round((stage.value / funnelMax) * 100) : 0
      return {
        ...stage,
        heightPct: funnelMax > 0 ? Math.max((stage.value / funnelMax) * 100, stage.value > 0 ? 4 : 0) : 0,
        conversion,
        ofFunnel,
        conversionLabel:
          index === 0
            ? 'Base do funil'
            : stage.tone === 'eligible'
              ? `${ofFunnel}% do funil`
              : `${conversion}% da etapa anterior`,
      }
    })
  }, [overview.funnel, overview.missions.allCompleted, funnelMax])

  const [activeFunnelKey, setActiveFunnelKey] = useState<string | null>(null)
  const activeFunnel = funnelColumns.find((column) => column.key === activeFunnelKey) ?? null

  const seasonDaysLeft = useMemo(() => {
    if (!season?.endsAt) return null
    const end = new Date(`${season.endsAt}T23:59:59`)
    const diff = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return Number.isFinite(diff) ? Math.max(0, diff) : null
  }, [season?.endsAt])

  const seasonIsActive =
    seasonDaysLeft !== null &&
    !!season?.startsAt &&
    new Date(`${season.startsAt}T00:00:00`).getTime() <= Date.now() &&
    seasonDaysLeft >= 0

  function toggleSort(key: EligibleSortKey) {
    if (sortBy === key) {
      setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortBy(key)
    setSortDir(key === 'totalDeposited' ? 'desc' : 'asc')
  }

  function handleExport() {
    downloadEligibleCsv(eligible)
  }

  function openTraderDetail(row: BullstartEligibleRow) {
    setSelectedUserId(row.userId)
  }

  return (
    <section className="bx-bullstart" aria-labelledby="bx-bullstart-title">
      <div className="bx-bullstart__head">
        <div>
          <p className="bx-bullstart__eyebrow">BullStart</p>
          <h2 id="bx-bullstart-title">Desempenho das Missões</h2>
          <p>Acompanhe a evolução dos traders durante a temporada.</p>
        </div>

        <div className="bx-bullstart__season">
          <EligibleMenuSelect
            className="bx-bullstart__filter bx-bullstart__filter--season"
            label="Temporada"
            ariaLabel="Filtrar por temporada"
            value={seasonId}
            options={seasonOptions}
            onChange={setSeasonId}
          />
          <div className="bx-bullstart__season-meta">
            <StatusBadge
              label={seasonIsActive ? 'Ativa' : 'Encerrada'}
              tone={seasonIsActive ? 'active' : 'expired'}
            />
            {seasonDaysLeft !== null && seasonIsActive ? (
              <span className="bx-bullstart__season-days">
                {seasonDaysLeft} dia{seasonDaysLeft === 1 ? '' : 's'} restantes
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="bx-bullstart__kpis bx-bullstart__kpis--redesign" aria-label="Indicadores BullStart">
        <AdminKpiCard
          label="Participantes"
          value={overview.participants.toLocaleString('pt-BR')}
          hint="Na temporada selecionada"
        />
        {overview.funnel.map((item) => (
          <AdminKpiCard
            key={item.code}
            label={item.code}
            value={item.uniqueCompletions.toLocaleString('pt-BR')}
            hint={item.title}
          />
        ))}
        <AdminKpiCard
          label="3/3 concluídas"
          value={overview.missions.allCompleted.toLocaleString('pt-BR')}
          hint="Elegíveis ao sorteio"
          tone="premium"
        />
        <AdminKpiCard
          label="Prêmios entregues"
          value={overview.deliveredRewards.toLocaleString('pt-BR')}
          hint="Itens do sorteio"
        />
      </div>

      <div className="bx-bullstart__reward-toggle">
        <button
          type="button"
          className="bx-btn bx-btn--ghost"
          onClick={() => setShowRewardBreakdown((current) => !current)}
        >
          {showRewardBreakdown ? 'Ocultar itens entregues' : 'Ver itens entregues'}
        </button>
      </div>

      {showRewardBreakdown ? (
        <div className="bx-bullstart__kinds" aria-label="Prêmios do sorteio entregues">
          {overview.deliveredDrawPrizes.length === 0 ? (
            <AdminEmptyState title="Nenhum item do sorteio entregue nesta temporada." />
          ) : (
            overview.deliveredDrawPrizes.map((item) => (
              <span key={`${item.traderId}-${item.prizeTitle}`} className="bx-bullstart__kind-chip">
                <strong>{item.prizeTitle}</strong>
                <em>
                  #{item.traderId} · {item.name}
                </em>
              </span>
            ))
          )}
        </div>
      ) : null}

      <section className="bx-admin-panel bx-bullstart__funnel" aria-labelledby="bx-bullstart-funnel-title">
        <div className="bx-admin-panel__head bx-bullstart__funnel-head">
          <div>
            <h3 id="bx-bullstart-funnel-title">Funil de missões</h3>
            <p>Queda de traders ao longo das missões da temporada.</p>
          </div>
          <span className="bx-bullstart__funnel-chip">
            {overview.participants.toLocaleString('pt-BR')} participantes
          </span>
        </div>

        <div
          className="bx-bullstart-funnel-chart"
          role="img"
          aria-label={`Funil de missões: ${funnelColumns
            .map((column) => `${column.label} ${column.value}`)
            .join(', ')}`}
          onMouseLeave={() => setActiveFunnelKey(null)}
        >
          <div className="bx-bullstart-funnel-chart__plot" aria-hidden="true">
            <div className="bx-bullstart-funnel-chart__grid">
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="bx-bullstart-funnel-chart__y">
              <em>{funnelMax.toLocaleString('pt-BR')}</em>
              <em>{Math.round(funnelMax / 2).toLocaleString('pt-BR')}</em>
              <em>0</em>
            </div>

            <ul className="bx-bullstart-funnel-chart__cols">
              {funnelColumns.map((column, index) => {
                const isActive = activeFunnelKey === column.key
                return (
                  <li key={column.key} className={column.tone === 'eligible' ? 'is-eligible' : undefined}>
                    <button
                      type="button"
                      className={`bx-bullstart-funnel-chart__col${isActive ? ' is-active' : ''}`}
                      style={{ ['--bx-funnel-h' as string]: `${column.heightPct}%` }}
                      aria-pressed={isActive}
                      aria-label={`${column.label}: ${column.value} traders. ${column.conversionLabel}. ${column.title}`}
                      onMouseEnter={() => setActiveFunnelKey(column.key)}
                      onFocus={() => setActiveFunnelKey(column.key)}
                      onBlur={() => setActiveFunnelKey(null)}
                      onClick={() =>
                        setActiveFunnelKey((current) => (current === column.key ? null : column.key))
                      }
                    >
                      <span className="bx-bullstart-funnel-chart__col-plot">
                        <strong className="bx-bullstart-funnel-chart__value">
                          {column.value.toLocaleString('pt-BR')}
                        </strong>
                        <span className="bx-bullstart-funnel-chart__bar-track">
                          <span
                            className="bx-bullstart-funnel-chart__bar"
                            style={{ animationDelay: `${index * 70}ms` }}
                          />
                        </span>
                      </span>
                      <span className="bx-bullstart-funnel-chart__label">
                        <b>{column.label}</b>
                        <i>{column.title}</i>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          {activeFunnel ? (
            <div className="bx-bullstart-funnel-chart__tooltip" role="status">
              <strong>{activeFunnel.label}</strong>
              <p>{activeFunnel.title}</p>
              <dl>
                <div>
                  <dt>Traders</dt>
                  <dd>{activeFunnel.value.toLocaleString('pt-BR')}</dd>
                </div>
                <div>
                  <dt>Conversão</dt>
                  <dd>{activeFunnel.conversionLabel}</dd>
                </div>
                <div>
                  <dt>Do funil</dt>
                  <dd>{activeFunnel.ofFunnel}%</dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="bx-bullstart-funnel-chart__hint">Passe o mouse ou foque uma coluna para detalhes.</p>
          )}
        </div>
      </section>

      <section className="bx-admin-panel bx-bullstart__eligible" aria-labelledby="bx-bullstart-eligible-title">
        <div className="bx-admin-panel__head bx-bullstart__eligible-head">
          <div>
            <h3 id="bx-bullstart-eligible-title">Elegíveis para o sorteio</h3>
            <p>
              {eligible.length.toLocaleString('pt-BR')} trader
              {eligible.length === 1 ? '' : 's'} · chances iguais
            </p>
          </div>
          <div className="bx-page-header__actions">
            <button
              type="button"
              className="bx-btn bx-btn--secondary"
              onClick={handleExport}
              disabled={eligible.length === 0}
            >
              Exportar elegíveis
            </button>
            <Link className="bx-btn bx-btn--primary" to="/administrador?section=draw">
              Abrir novo sorteio →
            </Link>
          </div>
        </div>

        <div className="bx-bullstart__tools">
          <label className="bx-admin-search bx-bullstart__search">
            <span className="sr-only">Buscar elegível</span>
            <SearchIcon />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por ID ou trader..."
              autoComplete="off"
            />
          </label>
          <EligibleMenuSelect
            className="bx-bullstart__filter bx-bullstart__filter--status"
            label="Status"
            ariaLabel="Filtrar por status de elegibilidade"
            value={statusFilter}
            options={STATUS_OPTIONS}
            onChange={setStatusFilter}
          />
          <EligibleMenuSelect
            className="bx-bullstart__filter bx-bullstart__filter--sort"
            label="Ordenar"
            ariaLabel="Ordenar elegíveis"
            value={`${sortBy}:${sortDir}` as SortOptionValue}
            options={SORT_OPTIONS}
            onChange={(next) => {
              const [key, dir] = next.split(':') as [EligibleSortKey, 'asc' | 'desc']
              setSortBy(key)
              setSortDir(dir)
            }}
          />
        </div>

        {eligible.length === 0 ? (
          <AdminEmptyState
            title="Nenhum trader elegível nesta campanha."
            description="Os traders precisam concluir as 3 missões da temporada."
          />
        ) : (
          <>
            <div className="bx-admin-table bx-bullstart-table" role="table" aria-label="Elegíveis ao sorteio">
              <div className="bx-admin-table__head" role="row">
                <button type="button" role="columnheader" onClick={() => toggleSort('traderId')}>
                  Trader ID
                </button>
                <span role="columnheader">Trader</span>
                <span role="columnheader">M01</span>
                <span role="columnheader">M02</span>
                <span role="columnheader">M03</span>
                <button type="button" role="columnheader" onClick={() => toggleSort('totalDeposited')}>
                  Total depositado
                </button>
                <button type="button" role="columnheader" onClick={() => toggleSort('completedAt')}>
                  Conclusão
                </button>
                <span role="columnheader">Chance</span>
                <span role="columnheader">Status</span>
              </div>
              {eligible.map((row) => (
                <div key={row.userId} className="bx-admin-table__row" role="row">
                  <span role="cell">
                    <button
                      type="button"
                      className="bx-bullstart-link"
                      onClick={() => openTraderDetail(row)}
                    >
                      #{row.traderId}
                    </button>
                  </span>
                  <span role="cell" className="bx-bullstart-trader">
                    <button
                      type="button"
                      className="bx-bullstart-link bx-bullstart-link--name"
                      onClick={() => openTraderDetail(row)}
                    >
                      {row.name}
                    </button>
                    <em>{row.email}</em>
                    {row.whatsapp ? (
                      <a
                        className="bx-bullstart-wa"
                        href={whatsappHref(row.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {row.whatsapp}
                      </a>
                    ) : null}
                  </span>
                  <span role="cell" className="bx-bullstart-check" aria-label="Missão 01">
                    {row.mission1 ? '✓' : '—'}
                  </span>
                  <span role="cell" className="bx-bullstart-check" aria-label="Missão 02">
                    {row.mission2 ? '✓' : '—'}
                  </span>
                  <span role="cell" className="bx-bullstart-check" aria-label="Missão 03">
                    {row.mission3 ? '✓' : '—'}
                  </span>
                  <span role="cell">{formatBullstartBRL(row.totalDeposited)}</span>
                  <span role="cell">{formatBullstartDateTime(row.completedAt)}</span>
                  <span role="cell">1 chance</span>
                  <span role="cell">
                    <StatusBadge
                      label={eligibleStatusLabel[row.status]}
                      tone={row.status === 'eligible' ? 'eligible' : 'pending'}
                    />
                  </span>
                </div>
              ))}
            </div>

            <ul className="bx-bullstart-cards" aria-label="Elegíveis em cards">
              {eligible.map((row) => (
                <li key={`card-${row.userId}`} className="bx-bullstart-card">
                  <div className="bx-bullstart-card__top">
                    <button
                      type="button"
                      className="bx-bullstart-link"
                      onClick={() => openTraderDetail(row)}
                    >
                      #{row.traderId}
                    </button>
                    <StatusBadge
                      label={eligibleStatusLabel[row.status]}
                      tone={row.status === 'eligible' ? 'eligible' : 'pending'}
                    />
                  </div>
                  <button
                    type="button"
                    className="bx-bullstart-link bx-bullstart-link--name"
                    onClick={() => openTraderDetail(row)}
                  >
                    {row.name}
                  </button>
                  {row.whatsapp ? (
                    <a
                      className="bx-bullstart-wa bx-bullstart-wa--card"
                      href={whatsappHref(row.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {row.whatsapp}
                    </a>
                  ) : null}
                  <span className="bx-bullstart-card__deposit">
                    {formatBullstartBRL(row.totalDeposited)}
                  </span>
                  <span className="bx-bullstart-card__date">
                    {formatBullstartDateTime(row.completedAt)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {selectedUserId ? (
        <BullstartEligibleDetailModal
          seasonId={seasonId}
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      ) : null}
    </section>
  )
}

function formatSeasonDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim())
  if (!match) return isoDate
  return `${match[3]}/${match[2]}/${match[1]}`
}

function EligibleMenuSelect<T extends string>({
  value,
  options,
  onChange,
  label,
  ariaLabel,
  className = '',
}: {
  value: T
  options: FilterOption<T>[]
  onChange: (value: T) => void
  label: string
  ariaLabel: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const selected = options.find((option) => option.value === value) ?? options[0]

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div
      className={`bx-admin-filter bx-bullstart-menu${open ? ' is-open' : ''} ${className}`.trim()}
      ref={rootRef}
    >
      <button
        type="button"
        className="bx-admin-filter__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)}
      >
        <span
          className={`bx-admin-filter__dot bx-admin-filter__dot--${selected.tone ?? 'all'}`}
          aria-hidden="true"
        />
        <span className="bx-admin-filter__label">{selected.label}</span>
        <span className="bx-admin-filter__chevron" aria-hidden="true">
          <FilterChevronIcon />
        </span>
      </button>

      {open ? (
        <div className="bx-admin-filter__menu bx-bullstart-menu__panel" role="listbox" id={listId} aria-label={label}>
          <p className="bx-admin-filter__menu-title">{label}</p>
          <div className="bx-admin-filter__options">
            {options.map((option) => {
              const isActive = option.value === value
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={`bx-admin-filter__option${isActive ? ' is-active' : ''}`}
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                >
                  <span
                    className={`bx-admin-filter__dot bx-admin-filter__dot--${option.tone ?? 'all'}`}
                    aria-hidden="true"
                  />
                  <span className="bx-admin-filter__option-copy">
                    <strong>{option.label}</strong>
                    <em>{option.hint}</em>
                  </span>
                  {isActive ? (
                    <span className="bx-admin-filter__check" aria-hidden="true">
                      <FilterCheckIcon />
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16.2 16.2 3.3 3.3" strokeLinecap="round" />
    </svg>
  )
}

function FilterChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="m7 10 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FilterCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="m5.5 12.5 4 4 9-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
