import { useEffect, useMemo, useState } from 'react'
import { AppSidebar } from '../components/missions/AppSidebar'
import { DashboardHeader } from '../components/missions/DashboardHeader'
import { useResource } from '../hooks/useResource'
import { fetchRewardsDashboard } from '../services/rewards'
import {
  couponStatusLabel,
  couponTypeLabel,
  formatDaysUntilLabel,
  getCouponValidityPercent,
  getDaysUntilIso,
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
  const { data, loading, error } = useResource(fetchRewardsDashboard, [])
  const allCoupons = data?.coupons ?? []
  const stats = data?.stats

  const [filter, setFilter] = useState<StatusFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (!data) return
    const preferred =
      data.coupons.find((item) => item.status === 'available')?.id ?? data.coupons[0]?.id ?? null
    setSelectedId(preferred)
  }, [data])

  const recommended =
    allCoupons.find((item) => item.status === 'available') ?? allCoupons[0]
  const nextExpiryDays = stats ? getDaysUntilIso(stats.nextExpiryIso) : 0

  const coupons = useMemo(() => {
    if (filter === 'all') return allCoupons
    return allCoupons.filter((item) => item.status === filter)
  }, [filter, allCoupons])

  const filterCounts = useMemo(
    () => ({
      all: allCoupons.length,
      available: allCoupons.filter((item) => item.status === 'available').length,
      used: allCoupons.filter((item) => item.status === 'used').length,
      expired: allCoupons.filter((item) => item.status === 'expired').length,
    }),
    [allCoupons],
  )

  const selected =
    coupons.find((item) => item.id === selectedId) ??
    coupons[0] ??
    allCoupons.find((item) => item.id === selectedId) ??
    null

  function handleFilterChange(next: StatusFilter) {
    setFilter(next)
    const list =
      next === 'all' ? allCoupons : allCoupons.filter((item) => item.status === next)
    setSelectedId(list[0]?.id ?? null)
  }

  function selectRecommended() {
    if (!recommended) return
    setFilter('all')
    setSelectedId(recommended.id)
  }

  if (loading || !stats) {
    return (
      <div className="bs-shell">
        <DashboardHeader />
        <div className="bs-shell__body">
          <AppSidebar />
          <div className="bs-main bs-rewards">
            <p>{error ? `Erro: ${error}` : 'Carregando recompensas…'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bs-shell">
      <DashboardHeader />

      <div className="bs-shell__body">
        <AppSidebar />

        <div className="bs-main bs-rewards">
          <section className="bs-rewards__hero" aria-labelledby="bs-rewards-title">
            <img
              className="bs-rewards__hero-bg"
              src="/media/banners/rewards-hero.jpg"
              alt=""
              width={1600}
              height={520}
            />
            <div className="bs-rewards__hero-copy">
              <p className="bs-rewards__eyebrow">RECOMPENSAS</p>
              <h1 id="bs-rewards-title">
                Seus <span>cupons</span>
              </h1>
              <p className="bs-rewards__lead">
                Consulte validade, regras e status de cada cupom conquistado no BullStart.
              </p>

              {recommended ? (
                <div className="bs-rewards__reco">
                  <div className="bs-rewards__reco-copy">
                    <em>Recomendado para você</em>
                    <strong>{recommended.name}</strong>
                    <span>
                      {recommended.valueLabel} · {formatDaysUntilLabel(getDaysUntilIso(recommended.expiresAtIso))}
                    </span>
                  </div>
                  <button type="button" className="bs-rewards__reco-cta" onClick={selectRecommended}>
                    Usar agora →
                  </button>
                </div>
              ) : null}
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
              <i className="bs-rewards-stat__bar is-green" aria-hidden="true" />
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
              <i className="bs-rewards-stat__bar is-muted" aria-hidden="true" />
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
              <i className="bs-rewards-stat__bar is-red" aria-hidden="true" />
            </button>
            <article className="bs-rewards-stat is-static">
              <span className="bs-rewards-stat__icon is-date" aria-hidden="true">
                <CalendarIcon />
              </span>
              <div>
                <p>Próximo vencimento</p>
                <strong>{stats.nextExpiryLabel}</strong>
                <em className="bs-rewards-stat__countdown">
                  {formatDaysUntilLabel(nextExpiryDays, 'em')}
                </em>
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
                {coupons.map((coupon) => {
                  const days = getDaysUntilIso(coupon.expiresAtIso)
                  const expiryCopy =
                    coupon.status === 'used' && coupon.usedAt
                      ? `Utilizado em ${coupon.usedAt}`
                      : coupon.status === 'expired'
                        ? `Expirou em ${coupon.expiresAt}`
                        : formatDaysUntilLabel(days)

                  return (
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
                        <span className="bs-coupon-card__tags">
                          {coupon.tags.map((tag) => (
                            <span key={tag}>{tag}</span>
                          ))}
                        </span>
                      </span>
                      <span className="bs-coupon-card__aside">
                        <span
                          className={`bs-coupon-card__status bs-coupon-card__status--${coupon.status}`}
                        >
                          <i aria-hidden="true" />
                          {couponStatusLabel[coupon.status]}
                        </span>
                        <span className="bs-coupon-card__expiry">{expiryCopy}</span>
                        <span className="bs-coupon-card__date">{coupon.expiresAt}</span>
                      </span>
                      <span className="bs-coupon-card__chevron" aria-hidden="true">
                        <ChevronIcon />
                      </span>
                    </button>
                  )
                })}

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
  const days = getDaysUntilIso(coupon.expiresAtIso)
  const validityPercent = getCouponValidityPercent(coupon)

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
      <div className="bs-coupon-detail__media">
        <img src={coupon.imageSrc} alt="" width={800} height={300} />
        <div className="bs-coupon-detail__badges">
          <span className={`bs-coupon-detail__type bs-coupon-detail__type--${coupon.type}`}>
            {couponTypeLabel[coupon.type]}
          </span>
          <span className={`bs-coupon-detail__status bs-coupon-detail__status--${coupon.status}`}>
            {couponStatusLabel[coupon.status]}
          </span>
        </div>
      </div>

      <div className="bs-coupon-detail__body">
        <h3>{coupon.name}</h3>
        <p className="bs-coupon-detail__desc">{coupon.description}</p>

        <div className="bs-coupon-detail__minis">
          <article>
            <span className="bs-coupon-detail__mini-icon" aria-hidden="true">
              <TypeIcon type={coupon.type} />
            </span>
            <div>
              <em>Benefício</em>
              <strong>{coupon.valueLabel}</strong>
            </div>
          </article>
          <article>
            <span className="bs-coupon-detail__mini-icon" aria-hidden="true">
              <WalletIcon />
            </span>
            <div>
              <em>Depósito mín.</em>
              <strong>{coupon.minDeposit ?? '—'}</strong>
            </div>
          </article>
          <article>
            <span className="bs-coupon-detail__mini-icon" aria-hidden="true">
              <LimitIcon />
            </span>
            <div>
              <em>Limite máx.</em>
              <strong>{coupon.maxDiscount ?? '—'}</strong>
            </div>
          </article>
        </div>

        <div className="bs-coupon-detail__validity">
          <div className="bs-coupon-detail__validity-head">
            <span>Período de validade</span>
            <strong>{formatDaysUntilLabel(days)}</strong>
          </div>
          <div className="bs-coupon-detail__validity-bar" aria-hidden="true">
            <i style={{ width: `${validityPercent}%` }} />
          </div>
          <div className="bs-coupon-detail__validity-meta">
            <em>Emissão {coupon.issuedAt}</em>
            <em>Até {coupon.expiresAt}</em>
          </div>
        </div>

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

        <div className="bs-coupon-detail__origin">
          <span>Origem</span>
          <strong>{coupon.source}</strong>
          <p>{coupon.terms}</p>
        </div>

        {coupon.status === 'available' ? (
          <button
            type="button"
            className={`bs-coupon-detail__cta${copied ? ' is-copied' : ''}`}
            onClick={() => {
              void handleUseCoupon()
            }}
          >
            {copied ? 'Código copiado' : 'Usar cupom agora →'}
          </button>
        ) : null}
      </div>
    </div>
  )
}

const COUPON_TYPE_ART: Record<CouponType, string | null> = {
  bonus: '/media/pass-icons/bonus.png?v3',
  cashback: '/media/pass-icons/cashback.png?v3',
  fee: null,
  ticket: '/media/pass-icons/ticket.png?v3',
  riskfree: '/media/pass-icons/riskfree.png?v3',
}

function TypeIcon({ type }: { type: CouponType }) {
  const art = COUPON_TYPE_ART[type]
  if (art) {
    return <img src={art} alt="" width={34} height={34} loading="lazy" />
  }

  switch (type) {
    case 'fee':
      return (
        <svg
          viewBox="0 0 24 24"
          width={22}
          height={22}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M7 3.8h7.2L17.8 7.4V20.2H7V3.8Z" />
          <path d="M14.2 3.8v3.6h3.6" />
          <path d="M9.4 15.4 14.6 10.2" />
          <path d="M10.2 10.8h.01M13.8 14.8h.01" strokeWidth="2.6" />
          <path d="M9.2 18h5.6" opacity="0.65" />
        </svg>
      )
    case 'bonus':
    case 'cashback':
    case 'ticket':
    case 'riskfree':
      return null
    default: {
      const _exhaustive: never = type
      return _exhaustive
    }
  }
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18M15 14h2" />
    </svg>
  )
}

function LimitIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="8" />
      <path d="M8 12h8M12 8v8" />
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
