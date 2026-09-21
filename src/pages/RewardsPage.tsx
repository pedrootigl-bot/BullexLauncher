import { useMemo, useState } from 'react'
import { AppSidebar } from '../components/missions/AppSidebar'
import { DashboardHeader } from '../components/missions/DashboardHeader'
import {
  couponStatusLabel,
  couponTypeLabel,
  mockRewardCoupons,
  mockRewardsStats,
  type CouponStatus,
  type CouponType,
  type RewardCoupon,
} from '../data/rewardsMock'

type StatusFilter = 'all' | CouponStatus

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'available', label: 'Disponível' },
  { value: 'used', label: 'Utilizado' },
  { value: 'expired', label: 'Expirado' },
]

export function RewardsPage() {
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(
    mockRewardCoupons.find((item) => item.status === 'available')?.id ?? mockRewardCoupons[0]?.id ?? null,
  )
  const stats = mockRewardsStats

  const coupons = useMemo(() => {
    if (filter === 'all') return mockRewardCoupons
    return mockRewardCoupons.filter((item) => item.status === filter)
  }, [filter])

  const filterCounts = useMemo(
    () => ({
      all: mockRewardCoupons.length,
      available: mockRewardCoupons.filter((item) => item.status === 'available').length,
      used: mockRewardCoupons.filter((item) => item.status === 'used').length,
      expired: mockRewardCoupons.filter((item) => item.status === 'expired').length,
    }),
    [],
  )

  const selected =
    coupons.find((item) => item.id === selectedId) ??
    coupons[0] ??
    mockRewardCoupons.find((item) => item.id === selectedId) ??
    null

  function handleFilterChange(next: StatusFilter) {
    setFilter(next)
    const list = next === 'all' ? mockRewardCoupons : mockRewardCoupons.filter((item) => item.status === next)
    setSelectedId(list[0]?.id ?? null)
  }

  return (
    <div className="bs-shell">
      <DashboardHeader />

      <div className="bs-shell__body">
        <AppSidebar />

        <div className="bs-main bs-rewards">
          <section className="bs-rewards__hero" aria-labelledby="bs-rewards-title">
            <div className="bs-rewards__hero-copy">
              <p className="bs-rewards__eyebrow">RECOMPENSAS</p>
              <h1 id="bs-rewards-title">
                Seus <span>cupons</span>
              </h1>
              <p className="bs-rewards__lead">
                Consulte validade, regras e status de cada cupom conquistado no BullStart.
              </p>
            </div>

            <div className="bs-rewards__hero-aside" aria-hidden="true">
              <TicketArt />
              <div className="bs-rewards__hero-quote">
                <p>CADA MISSÃO VALE UM PRÊMIO</p>
                <span>USE COM ESTRATÉGIA.</span>
              </div>
            </div>
          </section>

          <section className="bs-rewards__stats" aria-label="Resumo de cupons">
            <button
              type="button"
              className={`bs-rewards-stat${filter === 'available' ? ' is-active' : ''}`}
              onClick={() => handleFilterChange('available')}
            >
              <span className="bs-rewards-stat__icon" aria-hidden="true">
                <TicketIcon />
              </span>
              <div>
                <p>Disponíveis</p>
                <strong>{stats.available}</strong>
              </div>
            </button>
            <button
              type="button"
              className={`bs-rewards-stat${filter === 'used' ? ' is-active' : ''}`}
              onClick={() => handleFilterChange('used')}
            >
              <span className="bs-rewards-stat__icon is-used" aria-hidden="true">
                <CheckIcon />
              </span>
              <div>
                <p>Utilizados</p>
                <strong>{stats.used}</strong>
              </div>
            </button>
            <button
              type="button"
              className={`bs-rewards-stat${filter === 'expired' ? ' is-active' : ''}`}
              onClick={() => handleFilterChange('expired')}
            >
              <span className="bs-rewards-stat__icon is-expired" aria-hidden="true">
                <ClockIcon />
              </span>
              <div>
                <p>Expirados</p>
                <strong>{stats.expired}</strong>
              </div>
            </button>
            <article className="bs-rewards-stat is-static">
              <span className="bs-rewards-stat__icon is-date" aria-hidden="true">
                <CalendarIcon />
              </span>
              <div>
                <p>Próximo vencimento</p>
                <strong>{stats.nextExpiryLabel}</strong>
              </div>
            </article>
          </section>

          <section className="bs-rewards__panel" aria-labelledby="bs-rewards-list-title">
            <div className="bs-rewards__panel-head">
              <div>
                <h2 id="bs-rewards-list-title">Meus cupons</h2>
                <p>
                  {coupons.length}{' '}
                  {coupons.length === 1 ? 'cupom neste filtro' : 'cupons neste filtro'}
                </p>
              </div>

              <div className="bs-filter" role="group" aria-label="Filtrar por status">
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`bs-filter__chip${filter === option.value ? ' is-active' : ''}`}
                    aria-pressed={filter === option.value}
                    onClick={() => handleFilterChange(option.value)}
                  >
                    {option.label}
                    <em>{filterCounts[option.value]}</em>
                  </button>
                ))}
              </div>
            </div>

            <div className="bs-rewards__layout">
              <div className="bs-rewards__list" role="list">
                {coupons.map((coupon) => (
                  <button
                    key={coupon.id}
                    type="button"
                    role="listitem"
                    className={`bs-coupon-card bs-coupon-card--${coupon.type}${selected?.id === coupon.id ? ' is-active' : ''}`}
                    onClick={() => setSelectedId(coupon.id)}
                  >
                    <span className={`bs-coupon-card__badge bs-coupon-card__badge--${coupon.type}`}>
                      <TypeIcon type={coupon.type} />
                    </span>
                    <span className="bs-coupon-card__body">
                      <strong>{coupon.name}</strong>
                      <em>{coupon.valueLabel}</em>
                      <span className="bs-coupon-card__meta">
                        <span>{couponTypeLabel[coupon.type]}</span>
                        <span aria-hidden="true">·</span>
                        <span>Vence {coupon.expiresAt}</span>
                      </span>
                    </span>
                    <span className={`bs-coupon-card__status bs-coupon-card__status--${coupon.status}`}>
                      {couponStatusLabel[coupon.status]}
                    </span>
                  </button>
                ))}

                {coupons.length === 0 ? (
                  <p className="bs-rewards__empty">Nenhum cupom neste filtro.</p>
                ) : null}
              </div>

              <aside className="bs-rewards__detail" aria-live="polite">
                {selected ? (
                  <CouponDetail coupon={selected} />
                ) : (
                  <p className="bs-rewards__empty">Selecione um cupom para ver os detalhes.</p>
                )}
              </aside>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function CouponDetail({ coupon }: { coupon: RewardCoupon }) {
  const [copied, setCopied] = useState(false)

  async function handleUseCoupon() {
    try {
      await navigator.clipboard.writeText(coupon.code)
    } catch {
      const input = document.createElement('textarea')
      input.value = coupon.code
      input.setAttribute('readonly', '')
      input.style.position = 'fixed'
      input.style.opacity = '0'
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }

    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div key={coupon.id} className={`bs-coupon-detail bs-coupon-detail--${coupon.status}`}>
      <div className="bs-coupon-detail__head">
        <span className={`bs-coupon-detail__type bs-coupon-detail__type--${coupon.type}`}>
          <TypeIcon type={coupon.type} />
          {couponTypeLabel[coupon.type]}
        </span>
        <span className={`bs-coupon-detail__status bs-coupon-detail__status--${coupon.status}`}>
          {couponStatusLabel[coupon.status]}
        </span>
      </div>

      <h3>{coupon.name}</h3>
      <p className="bs-coupon-detail__value">{coupon.valueLabel}</p>
      <p className="bs-coupon-detail__desc">{coupon.description}</p>

      <div className={`bs-coupon-detail__code${copied ? ' is-copied' : ''}`}>
        <div>
          <span>Código do cupom</span>
          <strong>{coupon.code}</strong>
        </div>
        {coupon.status === 'available' ? (
          <button
            type="button"
            className="bs-coupon-detail__copy"
            onClick={() => {
              void handleUseCoupon()
            }}
          >
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        ) : null}
      </div>

      <dl className="bs-coupon-detail__grid">
        <div>
          <dt>Data de emissão</dt>
          <dd>{coupon.issuedAt}</dd>
        </div>
        <div>
          <dt>Data de vencimento</dt>
          <dd>{coupon.expiresAt}</dd>
        </div>
        <div>
          <dt>Depósito mínimo</dt>
          <dd>{coupon.minDeposit ?? '—'}</dd>
        </div>
        <div>
          <dt>Limite máximo</dt>
          <dd>{coupon.maxDiscount ?? '—'}</dd>
        </div>
        <div className="bs-coupon-detail__full">
          <dt>Origem</dt>
          <dd>{coupon.source}</dd>
        </div>
        <div className="bs-coupon-detail__full">
          <dt>Condições</dt>
          <dd>{coupon.terms}</dd>
        </div>
      </dl>

      {coupon.status === 'available' ? (
        <button
          type="button"
          className={`bs-coupon-detail__cta${copied ? ' is-copied' : ''}`}
          onClick={() => {
            void handleUseCoupon()
          }}
        >
          {copied ? 'Código copiado' : 'Usar cupom'}
        </button>
      ) : null}
    </div>
  )
}

function TypeIcon({ type }: { type: CouponType }) {
  const props = {
    viewBox: '0 0 24 24',
    width: 16,
    height: 16,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (type) {
    case 'bonus':
      return (
        <svg {...props}>
          <path d="M12 3v18M8 7h5.5a2.5 2.5 0 0 1 0 5H8m0 0h6a2.5 2.5 0 0 1 0 5H8" />
        </svg>
      )
    case 'cashback':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 7v10M9.5 9.5c.8-1 2-1.5 2.5-1.5s2 .7 2 1.8-1 1.7-2.5 2.2-2.5.9-2.5 2.2 1.1 1.8 2.5 1.8 1.8-.5 2.5-1.5" />
        </svg>
      )
    case 'fee':
      return (
        <svg {...props}>
          <path d="m7 17 10-10M8.5 8.5h.01M15.5 15.5h.01" />
        </svg>
      )
    case 'ticket':
      return (
        <svg {...props}>
          <path d="M4 9.5A2.5 2.5 0 0 0 6.5 7h11A2.5 2.5 0 0 0 20 9.5v1a1.5 1.5 0 0 1 0 3v1A2.5 2.5 0 0 0 17.5 17h-11A2.5 2.5 0 0 0 4 14.5v-1a1.5 1.5 0 0 1 0-3v-1Z" />
          <path d="M12 7v10" strokeDasharray="2 2" />
        </svg>
      )
    case 'riskfree':
      return (
        <svg {...props}>
          <path d="M12 3 5 6.5v5.2c0 4.2 2.8 7.8 7 8.8 4.2-1 7-4.6 7-8.8V6.5L12 3Z" />
        </svg>
      )
    default: {
      const _exhaustive: never = type
      return _exhaustive
    }
  }
}

function TicketArt() {
  return (
    <svg viewBox="0 0 140 100" className="bs-rewards__ticket-art" aria-hidden="true">
      <defs>
        <linearGradient id="rew-ticket" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a2618" />
          <stop offset="100%" stopColor="#0a1200" />
        </linearGradient>
      </defs>
      <rect x="12" y="18" width="116" height="64" rx="12" fill="url(#rew-ticket)" stroke="#9eff00" strokeWidth="2" />
      <circle cx="12" cy="50" r="10" fill="#050706" />
      <circle cx="128" cy="50" r="10" fill="#050706" />
      <path d="M52 18v64" stroke="#9eff00" strokeWidth="2" strokeDasharray="4 5" opacity="0.7" />
      <rect x="64" y="34" width="48" height="8" rx="2" fill="#9eff00" opacity="0.85" />
      <rect x="64" y="50" width="36" height="6" rx="2" fill="#9eff00" opacity="0.35" />
      <rect x="64" y="62" width="28" height="6" rx="2" fill="#9eff00" opacity="0.25" />
    </svg>
  )
}

function TicketIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 9.5A2.5 2.5 0 0 0 6.5 7h11A2.5 2.5 0 0 0 20 9.5v1a1.5 1.5 0 0 1 0 3v1A2.5 2.5 0 0 0 17.5 17h-11A2.5 2.5 0 0 0 4 14.5v-1a1.5 1.5 0 0 1 0-3v-1Z" />
      <path d="M12 7v10" strokeDasharray="2 2" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m6 12 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5L15 16" strokeLinecap="round" />
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
