import { useMemo, useState } from 'react'
import {
  historyQuote,
  historyStatusLabel,
  mockHistoryPrizes,
  mockHistoryStats,
  type HistoryPrize,
  type HistoryStatus,
} from '../data/historyMock'
import { AppSidebar } from '../components/missions/AppSidebar'
import { DashboardHeader } from '../components/missions/DashboardHeader'

type StatusFilter = 'all' | HistoryStatus

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'used', label: 'Utilizado' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregue' },
]

export function HistoryPage() {
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [selectedId, setSelectedId] = useState(
    mockHistoryPrizes.find((item) => item.status === 'delivered')?.id ?? mockHistoryPrizes[0]?.id ?? '',
  )
  const [toast, setToast] = useState<string | null>(null)
  const stats = mockHistoryStats

  const prizes = useMemo(() => {
    if (filter === 'all') return mockHistoryPrizes
    return mockHistoryPrizes.filter((item) => item.status === filter)
  }, [filter])

  const filterCounts = useMemo(
    () => ({
      all: mockHistoryPrizes.length,
      used: mockHistoryPrizes.filter((item) => item.status === 'used').length,
      shipped: mockHistoryPrizes.filter((item) => item.status === 'shipped').length,
      delivered: mockHistoryPrizes.filter((item) => item.status === 'delivered').length,
    }),
    [],
  )

  const selected =
    prizes.find((item) => item.id === selectedId) ??
    mockHistoryPrizes.find((item) => item.id === selectedId) ??
    prizes[0] ??
    null

  function handleExport() {
    setToast('Histórico exportado (mock).')
    window.setTimeout(() => setToast(null), 2200)
  }

  return (
    <div className="bs-shell">
      <DashboardHeader />

      <div className="bs-shell__body">
        <AppSidebar />

        <div className="bs-main bs-history">
          <section className="bs-history__hero" aria-labelledby="bs-history-title">
            <img
              className="bs-history__hero-bg"
              src="/media/banners/history-hero.jpg"
              alt=""
              width={1600}
              height={520}
            />
            <div className="bs-history__hero-copy">
              <p className="bs-history__eyebrow">HISTÓRICO</p>
              <h1 id="bs-history-title">
                Prêmios já <span>reivindicados</span>
              </h1>
              <p className="bs-history__lead">
                Acompanhe cada resgate, entrega e crédito aplicado na sua jornada BullStart.
              </p>
              <div className="bs-history__hero-quote">
                <p>DISCIPLINA TAMBÉM RENDE PRÊMIOS.</p>
                <span>BULLEX TRADERS VENCEM MAIS.</span>
              </div>
            </div>
          </section>

          <section className="bs-history__stats" aria-label="Resumo do histórico">
            <article className="bs-history-stat">
              <span className="bs-history-stat__icon" aria-hidden="true">
                <GiftIcon />
              </span>
              <div>
                <p>{stats.totalClaimedLabel}</p>
                <strong>{stats.totalClaimedValue}</strong>
              </div>
              <span className="bs-history-stat__chart" aria-hidden="true">
                <MiniChartIcon />
              </span>
            </article>

            <article className="bs-history-stat">
              <span className="bs-history-stat__icon" aria-hidden="true">
                <CalendarIcon />
              </span>
              <div>
                <p>Último resgate</p>
                <strong>{stats.lastClaimDate}</strong>
                <span>{stats.lastClaimItem}</span>
              </div>
              <span className="bs-history-stat__chart" aria-hidden="true">
                <MiniChartIcon />
              </span>
            </article>

            <article className="bs-history-stat">
              <span className="bs-history-stat__icon" aria-hidden="true">
                <BadgeIcon />
              </span>
              <div>
                <p>Status geral</p>
                <strong>{stats.prizesCount} prêmios</strong>
                <span>{stats.claimedPercent}% REIVINDICADOS</span>
              </div>
              <span className="bs-history-stat__chart" aria-hidden="true">
                <MiniChartIcon />
              </span>
            </article>

            <article className="bs-history-stat">
              <span className="bs-history-stat__icon" aria-hidden="true">
                <MedalIcon />
              </span>
              <div>
                <p>Maior prêmio</p>
                <strong>{stats.topPrizeLabel}</strong>
              </div>
              <span className="bs-history-stat__chart" aria-hidden="true">
                <MiniChartIcon />
              </span>
            </article>
          </section>

          <div className="bs-history__body">
            <section className="bs-history__panel" aria-labelledby="bs-history-list-title">
              <div className="bs-history__panel-head">
                <div className="bs-history__panel-title">
                  <span className="bs-history__panel-icon" aria-hidden="true">
                    <StackIcon />
                  </span>
                  <div>
                    <h2 id="bs-history-list-title">Meu histórico de prêmios</h2>
                    <p>Todos os itens resgatados, enviados e creditados na sua conta.</p>
                  </div>
                </div>

                <button type="button" className="bs-history__export" onClick={handleExport}>
                  Exportar histórico
                </button>
              </div>

              <div className="bs-filter" role="group" aria-label="Filtrar por status">
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`bs-filter__chip${filter === option.value ? ' is-active' : ''}`}
                    aria-pressed={filter === option.value}
                    onClick={() => {
                      setFilter(option.value)
                      const list =
                        option.value === 'all'
                          ? mockHistoryPrizes
                          : mockHistoryPrizes.filter((item) => item.status === option.value)
                      setSelectedId(list[0]?.id ?? '')
                    }}
                  >
                    {option.label}
                    <em>{filterCounts[option.value]}</em>
                  </button>
                ))}
              </div>

              <div className="bs-history__table" role="table" aria-label="Lista de prêmios">
                <div className="bs-history__thead" role="row">
                  <span role="columnheader">PRÊMIO</span>
                  <span role="columnheader">CATEGORIA</span>
                  <span role="columnheader">DATA</span>
                  <span role="columnheader">STATUS</span>
                  <span role="columnheader" className="sr-only">
                    Detalhes
                  </span>
                </div>

                {prizes.map((prize) => (
                  <HistoryRow
                    key={prize.id}
                    prize={prize}
                    active={selected?.id === prize.id}
                    onSelect={() => setSelectedId(prize.id)}
                  />
                ))}

                {prizes.length === 0 ? (
                  <p className="bs-history__empty">Nenhum prêmio neste status.</p>
                ) : null}
              </div>
            </section>

            <aside className="bs-history__rail" aria-label="Resumo lateral">
              {selected ? (
                <article className="bs-history-feature">
                  <div className="bs-history-feature__media">
                    <img src={selected.imageSrc} alt="" />
                    <span
                      className={`bs-history-feature__badge bs-history-feature__badge--${selected.status}`}
                    >
                      {historyStatusLabel[selected.status]}
                    </span>
                  </div>
                  <div className="bs-history-feature__body">
                    <p>Último resgate</p>
                    <strong>{selected.title}</strong>
                    <em>
                      {selected.date} · {selected.time}
                    </em>
                    <button type="button" className="bs-history-feature__link">
                      Ver detalhes →
                    </button>
                  </div>
                </article>
              ) : null}

              <article className="bs-history-numbers">
                <h3>Seus números</h3>
                <ul>
                  <li>
                    <GiftIcon />
                    <span>Total</span>
                    <strong>{stats.numbers.totalValue}</strong>
                  </li>
                  <li>
                    <StackIcon />
                    <span>Prêmios</span>
                    <strong>{stats.numbers.prizesLabel}</strong>
                  </li>
                  <li>
                    <BadgeIcon />
                    <span>Taxa</span>
                    <strong>{stats.numbers.claimRate}</strong>
                  </li>
                  <li>
                    <MedalIcon />
                    <span>Destaque</span>
                    <strong>{stats.numbers.highlight}</strong>
                  </li>
                </ul>
                <div className="bs-history-numbers__chart" aria-hidden="true">
                  <MiniChartIcon />
                </div>
              </article>

              <blockquote className="bs-history-quote">
                <span aria-hidden="true">“</span>
                <p>{historyQuote.text}</p>
                <strong>{historyQuote.brand}</strong>
              </blockquote>
            </aside>
          </div>

          {toast ? (
            <div className="bs-history__toast" role="status">
              {toast}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function HistoryRow({
  prize,
  active,
  onSelect,
}: {
  prize: HistoryPrize
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      className={`bs-history__row${active ? ' is-active' : ''}`}
      role="row"
      onClick={onSelect}
    >
      <span className="bs-history__prize" role="cell">
        <img src={prize.imageSrc} alt="" />
        <span>
          <strong>{prize.title}</strong>
          <em>{prize.description}</em>
        </span>
      </span>

      <span className="bs-history__category" role="cell">
        <span className="bs-history__category-icon" aria-hidden="true">
          <CategoryIcon kind={prize.categoryIcon} />
        </span>
        <span>
          <strong>{prize.category}</strong>
          <em>{prize.subcategory}</em>
        </span>
      </span>

      <span className="bs-history__date" role="cell">
        <CalendarIcon />
        <span>
          <strong>{prize.date}</strong>
          <em>{prize.time}</em>
        </span>
      </span>

      <span className="bs-history__status-wrap" role="cell">
        <span className={`bs-history__status bs-history__status--${prize.status}`}>
          <StatusIcon status={prize.status} />
          {historyStatusLabel[prize.status]}
        </span>
      </span>

      <span className="bs-history__chevron" aria-hidden="true">
        <ChevronIcon />
      </span>
    </button>
  )
}

function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="4" y="10" width="16" height="10" rx="1.5" />
      <path d="M12 10v10M4 14h16" />
      <path d="M12 10c-2.2 0-4-1.4-4-3.2S10.2 4 12 5.5C13.8 4 16 4.6 16 6.8S14.2 10 12 10Z" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </svg>
  )
}

function BadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 3 14.5 8.5 20.5 9.2 16 13.4 17.2 19.3 12 16.4 6.8 19.3 8 13.4 3.5 9.2 9.5 8.5 12 3Z" />
    </svg>
  )
}

function MedalIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="14" r="5" />
      <path d="M9 4h6l-1.5 5h-3L9 4Z" />
    </svg>
  )
}

function MiniChartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <rect x="4" y="12" width="3" height="8" rx="1" />
      <rect x="10.5" y="8" width="3" height="12" rx="1" />
      <rect x="17" y="4" width="3" height="16" rx="1" />
    </svg>
  )
}

function StackIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="m4 8 8-4 8 4-8 4-8-4Z" />
      <path d="m4 12 8 4 8-4" />
      <path d="m4 16 8 4 8-4" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CategoryIcon({ kind }: { kind: HistoryPrize['categoryIcon'] }) {
  const props = {
    viewBox: '0 0 24 24',
    width: 18,
    height: 18,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (kind) {
    case 'console':
      return (
        <svg {...props}>
          <rect x="3" y="7" width="18" height="11" rx="3" />
          <path d="M8 12h2M9 11v2M15 12.5h.01M17.5 11.5h.01" />
        </svg>
      )
    case 'phone':
      return (
        <svg {...props}>
          <rect x="7" y="3" width="10" height="18" rx="2" />
          <path d="M11 17h2" />
        </svg>
      )
    case 'car':
      return (
        <svg {...props}>
          <path d="M4 14h16l-1.5-5.5A2 2 0 0 0 16.6 7H7.4a2 2 0 0 0-1.9 1.5L4 14Z" />
          <path d="M6 17h1M17 17h1M5 14v3a1 1 0 0 0 1 1h1M17 18h1a1 1 0 0 0 1-1v-3" />
        </svg>
      )
    case 'coins':
      return (
        <svg {...props}>
          <ellipse cx="12" cy="7" rx="6.5" ry="2.4" />
          <path d="M5.5 7v3.2c0 1.3 2.9 2.4 6.5 2.4s6.5-1.1 6.5-2.4V7" />
          <path d="M5.5 10.2V13.5c0 1.3 2.9 2.4 6.5 2.4s6.5-1.1 6.5-2.4v-3.3" />
          <path d="M5.5 13.5V16.8c0 1.3 2.9 2.4 6.5 2.4s6.5-1.1 6.5-2.4v-3.3" />
        </svg>
      )
    case 'shield':
      return (
        <svg {...props}>
          <path d="M12 3 5 6.5v5.2c0 4.2 2.8 7.8 7 8.8 4.2-1 7-4.6 7-8.8V6.5L12 3Z" />
        </svg>
      )
    case 'ticket':
      return (
        <svg {...props}>
          <path d="M4 9.5A2.5 2.5 0 0 0 6.5 7h11A2.5 2.5 0 0 0 20 9.5v1a1.5 1.5 0 0 1 0 3v1A2.5 2.5 0 0 0 17.5 17h-11A2.5 2.5 0 0 0 4 14.5v-1a1.5 1.5 0 0 1 0-3v-1Z" />
          <path d="M12 7v10" strokeDasharray="2 2" />
        </svg>
      )
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}

function StatusIcon({ status }: { status: HistoryStatus }) {
  const props = {
    viewBox: '0 0 24 24',
    width: 12,
    height: 12,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (status) {
    case 'shipped':
      return (
        <svg {...props}>
          <path d="M3 8h11v9H3zM14 11h4l3 3v3h-7v-6Z" />
          <circle cx="7" cy="18" r="1.5" />
          <circle cx="17" cy="18" r="1.5" />
        </svg>
      )
    case 'used':
      return (
        <svg {...props}>
          <path d="M5 12h14" />
        </svg>
      )
    case 'delivered':
      return (
        <svg {...props}>
          <path d="m6 12 4 4 8-8" />
        </svg>
      )
    default: {
      const _exhaustive: never = status
      return _exhaustive
    }
  }
}
