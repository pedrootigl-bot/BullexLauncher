import { useEffect, useMemo, useRef, useState } from 'react'
import {
  adminAccountStatusLabel,
  adminChartSeries,
  adminFeed,
  adminKpis,
  adminOverview,
  adminProfile,
  adminRecentUsers,
  type AdminCampaignCard,
  type AdminFeedAction,
  type AdminKpiId,
  type AdminRecentUser,
} from '../../data/adminMock'
import { AdminUserDetailModal } from './AdminUserDetailModal'

type AdminOverviewProps = {
  campaigns: AdminCampaignCard[]
  onOpenCampaigns: () => void
}

export function AdminOverview({ campaigns, onOpenCampaigns }: AdminOverviewProps) {
  const [selectedUser, setSelectedUser] = useState<AdminRecentUser | null>(null)
  const [userIdQuery, setUserIdQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | AdminRecentUser['accountStatus']>('all')

  const normalizedQuery = userIdQuery.trim().replace(/^#/, '').toLowerCase()
  const filteredUsers = adminRecentUsers.filter((user) => {
    const matchesId =
      !normalizedQuery ||
      user.id.replace(/^#/, '').toLowerCase().includes(normalizedQuery)
    const matchesStatus = statusFilter === 'all' || user.accountStatus === statusFilter
    return matchesId && matchesStatus
  })

  return (
    <div className="bx-admin-overview">
      <section className="bx-admin-kpis" aria-label="Indicadores">
        {adminKpis.map((kpi) => (
          <article key={kpi.id} className="bx-admin-kpi">
            <div className="bx-admin-kpi__top">
              <span className="bx-admin-kpi__icon" aria-hidden="true">
                <KpiIcon id={kpi.id} />
              </span>
              <span className="bx-admin-kpi__trend">{kpi.trend}</span>
            </div>
            <p>{kpi.label}</p>
            <strong>{kpi.value}</strong>
            <em>{kpi.trendHint}</em>
          </article>
        ))}
      </section>

      <div className="bx-admin-mid">
        <section className="bx-admin-chart" aria-labelledby="bx-admin-chart-title">
          <div className="bx-admin-panel__head">
            <div>
              <h2 id="bx-admin-chart-title">Receita e Cadastros</h2>
              <p>Depósitos e novos usuários no período.</p>
            </div>
            <span className="bx-admin-chip">{adminOverview.chartPeriod}</span>
          </div>

          <RevenueChart />

          <div className="bx-admin-chart__legend">
            <span>
              <i className="is-bar" /> Depósitos (R$)
            </span>
            <span>
              <i className="is-line" /> Novos usuários
            </span>
            <span>
              <i className="is-avg" /> Média depósitos
            </span>
          </div>
        </section>

        <aside className="bx-admin-support" aria-label="Suporte Bullex">
          <img src={adminProfile.supportImage} alt="" />
          <div>
            <strong>{adminProfile.supportTitle}</strong>
            <p>{adminProfile.supportLead}</p>
          </div>
        </aside>
      </div>

      <div className="bx-admin-tables">
        <section className="bx-admin-panel" aria-labelledby="bx-admin-users-title">
          <div className="bx-admin-panel__head">
            <div>
              <h2 id="bx-admin-users-title">Usuários Recentes</h2>
              <p>Últimos cadastros na plataforma.</p>
            </div>
            <div className="bx-admin-users-tools">
              <label className="bx-admin-search">
                <span className="sr-only">Buscar usuário por ID</span>
                <SearchIcon />
                <input
                  type="search"
                  value={userIdQuery}
                  onChange={(event) => setUserIdQuery(event.target.value)}
                  placeholder="Buscar por ID"
                  autoComplete="off"
                />
              </label>
              <select
                className="bx-admin-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as 'all' | AdminRecentUser['accountStatus'])
                }
                aria-label="Filtrar por status"
              >
                <option value="all">Todos status</option>
                <option value="active">Ativo</option>
                <option value="pending">Pendente</option>
                <option value="blocked">Bloqueado</option>
              </select>
            </div>
          </div>

          <div className="bx-admin-table bx-admin-table--users" role="table">
            <div className="bx-admin-table__head" role="row">
              <span role="columnheader">ID</span>
              <span role="columnheader">Nome</span>
              <span role="columnheader">Última ação</span>
              <span role="columnheader">Status</span>
            </div>
            {filteredUsers.length === 0 ? (
              <p className="bx-admin-empty">Nenhum usuário encontrado com esses filtros.</p>
            ) : null}
            {filteredUsers.map((user) => (
              <div key={user.id} className="bx-admin-table__row" role="row">
                <span role="cell">{user.id}</span>
                <span role="cell" className="bx-admin-user">
                  <i>{user.initials}</i>
                  <button
                    type="button"
                    className="bx-admin-user__name"
                    onClick={() => setSelectedUser(user)}
                  >
                    {user.name}
                  </button>
                </span>
                <span role="cell">{user.lastAction}</span>
                <span role="cell">
                  <em className={`bx-admin-badge bx-admin-badge--${user.accountStatus}`}>
                    {adminAccountStatusLabel[user.accountStatus]}
                  </em>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="bx-admin-panel" aria-labelledby="bx-admin-feed-title">
          <div className="bx-admin-panel__head">
            <div>
              <h2 id="bx-admin-feed-title">Últimas Atividades</h2>
              <p>Eventos em tempo real.</p>
            </div>
          </div>

          <div className="bx-admin-table bx-admin-table--feed" role="table">
            <div className="bx-admin-table__head" role="row">
              <span role="columnheader">Data</span>
              <span role="columnheader">Ação</span>
              <span role="columnheader">Detalhes</span>
              <span role="columnheader">Usuário</span>
            </div>
            {adminFeed.map((item) => (
              <div key={item.id} className="bx-admin-table__row" role="row">
                <span role="cell">{item.date}</span>
                <span role="cell" className="bx-admin-action-cell">
                  <i aria-hidden="true">
                    <FeedIcon action={item.action} />
                  </i>
                  {item.actionLabel}
                </span>
                <span role="cell">{item.details}</span>
                <span role="cell">{item.userId}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="bx-admin-campaigns" aria-labelledby="bx-admin-campaigns-title">
        <div className="bx-admin-panel__head">
          <div>
            <h2 id="bx-admin-campaigns-title">Campanhas ativas</h2>
            <p>Progresso dos sorteios, banners e ofertas da temporada.</p>
          </div>
          <button type="button" className="bx-admin-link" onClick={onOpenCampaigns}>
            Gerenciar
          </button>
        </div>

        <div className="bx-admin-campaigns__grid">
          {campaigns
            .slice()
            .sort((a, b) => a.priority - b.priority)
            .map((campaign) => (
            <article key={campaign.id} className="bx-admin-campaign">
              <div className="bx-admin-campaign__media">
                <img src={campaign.image} alt={campaign.altText} />
                <span
                  className={`bx-admin-badge bx-admin-badge--${
                    campaign.status === 'active' ? 'active' : 'paused'
                  }`}
                >
                  {campaign.status === 'active' ? 'Ativa' : 'Pausada'}
                </span>
                <span className="bx-admin-campaign__order">#{campaign.priority}</span>
              </div>
              <div className="bx-admin-campaign__body">
                <strong>{campaign.title}</strong>
                <div className="bx-admin-campaign__meta">
                  <span>
                    {campaign.startsAt} → {campaign.endsAt}
                  </span>
                  <b>{campaign.progress}%</b>
                </div>
                <div className="bx-admin-campaign__progress" aria-hidden="true">
                  <span style={{ width: `${campaign.progress}%` }} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {selectedUser ? (
        <AdminUserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      ) : null}
    </div>
  )
}

function RevenueChart() {
  const width = 680
  const height = 248
  const padX = 48
  const padY = 28
  const padBottom = 22

  const totals = useMemo(() => {
    const deposits = adminChartSeries.map((point) => point.deposits)
    const users = adminChartSeries.map((point) => point.users)
    const totalDeposits = deposits.reduce((sum, value) => sum + value, 0)
    const totalUsers = users.reduce((sum, value) => sum + value, 0)
    const avgDeposits = totalDeposits / deposits.length
    const avgUsers = totalUsers / users.length
    const peakDeposit = Math.max(...deposits)
    const peakUsers = Math.max(...users)
    const peakDepositDay = adminChartSeries.find((point) => point.deposits === peakDeposit)?.day ?? '—'
    const first = adminChartSeries[0]
    const last = adminChartSeries[adminChartSeries.length - 1]
    const depositGrowth =
      first && last && first.deposits > 0
        ? ((last.deposits - first.deposits) / first.deposits) * 100
        : 0
    const userGrowth =
      first && last && first.users > 0 ? ((last.users - first.users) / first.users) * 100 : 0

    return {
      totalDeposits,
      totalUsers,
      avgDeposits,
      avgUsers,
      peakDeposit,
      peakUsers,
      peakDepositDay,
      depositGrowth,
      userGrowth,
    }
  }, [])

  const maxDeposit = Math.max(...adminChartSeries.map((p) => p.deposits))
  const maxUsers = Math.max(...adminChartSeries.map((p) => p.users))
  const innerW = width - padX * 2
  const innerH = height - padY - padBottom
  const gap = innerW / adminChartSeries.length
  const barW = gap * 0.48

  const [ready, setReady] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)
  const lineRef = useRef<SVGPolylineElement | null>(null)

  const points = useMemo(
    () =>
      adminChartSeries.map((point, index) => {
        const centerX = padX + gap * index + gap / 2
        const barHeight = (point.deposits / maxDeposit) * innerH
        const barX = padX + gap * index + (gap - barW) / 2
        const barY = padY + innerH - barHeight
        const lineY = padY + innerH - (point.users / maxUsers) * innerH
        return { ...point, index, centerX, barHeight, barX, barY, lineY }
      }),
    [barW, gap, innerH, maxDeposit, maxUsers],
  )

  const peakPoint = points.find((point) => point.deposits === totals.peakDeposit) ?? null
  const avgDepositY = padY + innerH - (totals.avgDeposits / maxDeposit) * innerH
  const yTicks = [0, 0.25, 0.5, 0.75, 1]

  const linePoints = points.map((point) => `${point.centerX},${point.lineY}`).join(' ')
  const active = hovered !== null ? points[hovered] : null

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setReady(true))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const line = lineRef.current
    if (!line) return

    const length = line.getTotalLength()
    line.style.strokeDasharray = `${length}`
    line.style.strokeDashoffset = ready ? '0' : `${length}`
  }, [ready, linePoints])

  const tooltipStyle =
    active != null
      ? {
          left: `${(active.centerX / width) * 100}%`,
          top: `${(Math.min(active.barY, active.lineY) / height) * 100}%`,
        }
      : undefined

  const metrics = [
    {
      id: 'total-deposits',
      label: 'Depósitos totais',
      value: `R$ ${totals.totalDeposits.toLocaleString('pt-BR')} mil`,
      hint: `${adminChartSeries.length} dias`,
    },
    {
      id: 'avg-deposits',
      label: 'Média diária',
      value: `R$ ${totals.avgDeposits.toFixed(0)} mil`,
      hint: `${totals.depositGrowth >= 0 ? '+' : ''}${totals.depositGrowth.toFixed(1)}% no período`,
    },
    {
      id: 'peak',
      label: 'Pico de depósitos',
      value: `R$ ${totals.peakDeposit.toLocaleString('pt-BR')} mil`,
      hint: `Dia ${totals.peakDepositDay}`,
    },
    {
      id: 'users',
      label: 'Novos usuários',
      value: totals.totalUsers.toLocaleString('pt-BR'),
      hint: `Média ${totals.avgUsers.toFixed(0)}/dia · ${totals.userGrowth >= 0 ? '+' : ''}${totals.userGrowth.toFixed(1)}%`,
    },
  ]

  return (
    <div className="bx-admin-chart__body">
      <div className="bx-admin-chart__metrics" aria-label="Métricas do gráfico">
        {metrics.map((metric) => (
          <article key={metric.id} className="bx-admin-chart__metric">
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <em>{metric.hint}</em>
          </article>
        ))}
      </div>

      <div
        className={`bx-admin-chart__canvas${ready ? ' is-ready' : ''}`}
        onMouseLeave={() => setHovered(null)}
      >
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Gráfico de depósitos e cadastros">
          {yTicks.map((ratio) => {
            const y = padY + innerH * (1 - ratio)
            const depositLabel = Math.round(maxDeposit * ratio)
            return (
              <g key={ratio}>
                <line
                  x1={padX}
                  x2={width - padX}
                  y1={y}
                  y2={y}
                  className="bx-admin-chart__grid"
                />
                <text x={padX - 8} y={y + 3} className="bx-admin-chart__axis">
                  {depositLabel}
                </text>
              </g>
            )
          })}

          <line
            x1={padX}
            x2={width - padX}
            y1={avgDepositY}
            y2={avgDepositY}
            className="bx-admin-chart__avg"
          />
          <text x={width - padX + 2} y={avgDepositY + 3} className="bx-admin-chart__avg-label">
            média
          </text>

          {points.map((point) => (
            <rect
              key={`bar-${point.day}`}
              x={point.barX}
              y={point.barY}
              width={barW}
              height={point.barHeight}
              rx={4}
              className={`bx-admin-chart__bar${hovered === point.index ? ' is-active' : ''}${
                peakPoint?.index === point.index ? ' is-peak' : ''
              }`}
              style={{ animationDelay: `${point.index * 35}ms` }}
            />
          ))}

          <polyline ref={lineRef} points={linePoints} className="bx-admin-chart__line" />

          {points.map((point) => (
            <circle
              key={`dot-${point.day}`}
              cx={point.centerX}
              cy={point.lineY}
              r={hovered === point.index ? 4.4 : 3.2}
              className={`bx-admin-chart__dot${hovered === point.index ? ' is-active' : ''}`}
              style={{ animationDelay: `${180 + point.index * 35}ms` }}
            />
          ))}

          {peakPoint ? (
            <g className="bx-admin-chart__peak" aria-hidden="true">
              <line
                x1={peakPoint.centerX}
                x2={peakPoint.centerX}
                y1={peakPoint.barY - 14}
                y2={peakPoint.barY - 4}
                className="bx-admin-chart__peak-stem"
              />
              <circle cx={peakPoint.centerX} cy={peakPoint.barY - 16} r={3} className="bx-admin-chart__peak-dot" />
              <text x={peakPoint.centerX} y={peakPoint.barY - 22} className="bx-admin-chart__peak-label">
                pico
              </text>
            </g>
          ) : null}

          {points.map((point) => (
            <text
              key={`label-${point.day}`}
              x={point.centerX}
              y={height - 6}
              className={`bx-admin-chart__label${hovered === point.index ? ' is-active' : ''}`}
            >
              {point.day}
            </text>
          ))}

          {points.map((point) => (
            <rect
              key={`hit-${point.day}`}
              x={padX + gap * point.index}
              y={padY}
              width={gap}
              height={innerH}
              className="bx-admin-chart__hit"
              onMouseEnter={() => setHovered(point.index)}
            />
          ))}

          {active ? (
            <line
              x1={active.centerX}
              x2={active.centerX}
              y1={padY}
              y2={padY + innerH}
              className="bx-admin-chart__guide"
            />
          ) : null}
        </svg>

        {active ? (
          <div className="bx-admin-chart__tooltip" style={tooltipStyle} role="status">
            <strong>Dia {active.day}</strong>
            <span>
              Depósitos <b>R$ {active.deposits.toLocaleString('pt-BR')} mil</b>
            </span>
            <span>
              vs média{' '}
              <b>
                {active.deposits >= totals.avgDeposits ? '+' : ''}
                {(active.deposits - totals.avgDeposits).toFixed(0)} mil
              </b>
            </span>
            <span>
              Novos usuários <b>{active.users}</b>
            </span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function KpiIcon({ id }: { id: AdminKpiId }) {
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

  switch (id) {
    case 'users':
      return (
        <svg {...props}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 19c1.2-3 3.2-4.5 5.5-4.5S13.3 16 14.5 19" />
          <circle cx="16.5" cy="9" r="2.4" />
          <path d="M15 14.5c1.8.3 3.3 1.5 4.2 3.5" />
        </svg>
      )
    case 'deposits':
      return (
        <svg {...props}>
          <rect x="4" y="6" width="16" height="12" rx="2" />
          <path d="M4 10h16" />
          <path d="M8 15h3" />
        </svg>
      )
    case 'withdrawals':
      return (
        <svg {...props}>
          <path d="M12 4v12" />
          <path d="m7.5 11.5 4.5 4.5 4.5-4.5" />
          <path d="M5 20h14" />
        </svg>
      )
    case 'prizes':
      return (
        <svg {...props}>
          <path d="M8 10h8v10H8z" />
          <path d="M7 10h10l-1-4H8l-1 4Z" />
          <path d="M12 6V4M9 6c0-1.5 1.2-2.5 3-2.5S15 4.5 15 6" />
        </svg>
      )
    default: {
      const _exhaustive: never = id
      return _exhaustive
    }
  }
}

function FeedIcon({ action }: { action: AdminFeedAction }) {
  const props = {
    viewBox: '0 0 24 24',
    width: 14,
    height: 14,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (action) {
    case 'deposit':
      return (
        <svg {...props}>
          <path d="M12 4v12" />
          <path d="m7.5 11.5 4.5 4.5 4.5-4.5" />
        </svg>
      )
    case 'withdraw':
      return (
        <svg {...props}>
          <path d="M12 20V8" />
          <path d="m7.5 12.5 4.5-4.5 4.5 4.5" />
        </svg>
      )
    case 'prize':
      return (
        <svg {...props}>
          <path d="M8 10h8v10H8z" />
          <path d="M7 10h10l-1-4H8l-1 4Z" />
        </svg>
      )
    case 'signup':
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="3" />
          <path d="M5 19c1.4-3.2 3.6-4.8 7-4.8s5.6 1.6 7 4.8" />
        </svg>
      )
    case 'coupon':
      return (
        <svg {...props}>
          <path d="M4 9.5A2.5 2.5 0 0 0 6.5 7h11A2.5 2.5 0 0 0 20 9.5v1a1.5 1.5 0 0 1 0 3v1A2.5 2.5 0 0 0 17.5 17h-11A2.5 2.5 0 0 0 4 14.5v-1a1.5 1.5 0 0 1 0-3v-1Z" />
        </svg>
      )
    case 'mission':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="7" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      )
    default: {
      const _exhaustive: never = action
      return _exhaustive
    }
  }
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16.2 16.2 3.3 3.3" strokeLinecap="round" />
    </svg>
  )
}
