import { useMemo, useState } from 'react'
import {
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
  const stats = mockHistoryStats

  const prizes = useMemo(() => {
    if (filter === 'all') return mockHistoryPrizes
    return mockHistoryPrizes.filter((item) => item.status === filter)
  }, [filter])

  return (
    <div className="bs-shell">
      <DashboardHeader />

      <div className="bs-shell__body">
        <AppSidebar />

        <div className="bs-main bs-history">
          <section className="bs-history__hero" aria-labelledby="bs-history-title">
            <div className="bs-history__hero-copy">
              <p className="bs-history__eyebrow">HISTÓRICO</p>
              <h1 id="bs-history-title">
                Prêmios já <span>reivindicados</span>
              </h1>
              <p className="bs-history__lead">
                Acompanhe cada resgate, entrega e crédito aplicado na sua jornada BullStart.
              </p>
            </div>

            <div className="bs-history__hero-aside" aria-hidden="true">
              <TrophyArt />
              <div className="bs-history__hero-quote">
                <p>DISCIPLINA TAMBÉM RENDE PRÊMIOS</p>
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
                <p>Status</p>
                <strong>{stats.prizesCount} prêmios</strong>
                <span>{stats.claimedPercent}% REIVINDICADOS</span>
              </div>
              <span className="bs-history-stat__chart" aria-hidden="true">
                <MiniChartIcon />
              </span>
            </article>
          </section>

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

              <div className="bs-filter" role="group" aria-label="Filtrar por status">
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`bs-filter__chip${filter === option.value ? ' is-active' : ''}`}
                    aria-pressed={filter === option.value}
                    onClick={() => setFilter(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
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
                <HistoryRow key={prize.id} prize={prize} />
              ))}

              {prizes.length === 0 ? (
                <p className="bs-history__empty">Nenhum prêmio neste status.</p>
              ) : null}
            </div>
          </section>

          <footer className="bs-history__footer">
            <p>CONQUISTAS HOJE. LIBERDADE SEMPRE.</p>
            <span>//// BULLEX</span>
          </footer>
        </div>
      </div>
    </div>
  )
}

function HistoryRow({ prize }: { prize: HistoryPrize }) {
  return (
    <button type="button" className="bs-history__row" role="row">
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

function TrophyArt() {
  return (
    <svg viewBox="0 0 120 140" className="bs-history__trophy" aria-hidden="true">
      <defs>
        <linearGradient id="hist-trophy" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a3a26" />
          <stop offset="55%" stopColor="#121a11" />
          <stop offset="100%" stopColor="#070a08" />
        </linearGradient>
        <linearGradient id="hist-trophy-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4ff7a" />
          <stop offset="100%" stopColor="#5cad00" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="128" rx="28" ry="6" fill="#9eff00" opacity="0.2" />
      <path d="M38 18h44v34c0 16-10 28-22 28S38 68 38 52V18Z" fill="url(#hist-trophy)" />
      <path d="M38 24H26a16 16 0 0 0 16 22M82 24h12a16 16 0 0 1-16 22" stroke="url(#hist-trophy-metal)" strokeWidth="4" fill="none" />
      <rect x="52" y="80" width="16" height="18" rx="2" fill="url(#hist-trophy-metal)" />
      <rect x="42" y="98" width="36" height="12" rx="3" fill="url(#hist-trophy)" />
      <circle cx="60" cy="48" r="12" fill="#0a1200" stroke="#9eff00" strokeWidth="2" />
      <path d="M54 48c2-4 5-6 6-6s4 2 6 6c-2 1-4 2-6 2s-4-1-6-2Z" fill="#9eff00" />
    </svg>
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
