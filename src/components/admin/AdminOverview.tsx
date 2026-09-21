import { useState } from 'react'
import {
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

  const normalizedQuery = userIdQuery.trim().replace(/^#/, '').toLowerCase()
  const filteredUsers = normalizedQuery
    ? adminRecentUsers.filter((user) =>
        user.id.replace(/^#/, '').toLowerCase().includes(normalizedQuery),
      )
    : adminRecentUsers

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
          </div>

          <div className="bx-admin-table bx-admin-table--users" role="table">
            <div className="bx-admin-table__head" role="row">
              <span role="columnheader">ID</span>
              <span role="columnheader">Nome</span>
              <span role="columnheader">E-mail</span>
              <span role="columnheader">Cadastro</span>
            </div>
            {filteredUsers.length === 0 ? (
              <p className="bx-admin-empty">Nenhum usuário encontrado para este ID.</p>
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
                <span role="cell">{user.email}</span>
                <span role="cell">{user.registeredAt}</span>
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
            <h2 id="bx-admin-campaigns-title">Campanhas em Andamento</h2>
            <p>Progresso dos sorteios e ofertas ativas.</p>
          </div>
          <button type="button" className="bx-admin-link" onClick={onOpenCampaigns}>
            Ver todas
          </button>
        </div>

        <div className="bx-admin-campaigns__grid">
          {campaigns.map((campaign) => (
            <article key={campaign.id} className="bx-admin-campaign">
              <div className="bx-admin-campaign__media">
                <img src={campaign.image} alt="" />
                <span
                  className={`bx-admin-badge bx-admin-badge--${
                    campaign.status === 'active' ? 'active' : 'paused'
                  }`}
                >
                  {campaign.status === 'active' ? 'Ativa' : 'Pausada'}
                </span>
              </div>
              <div className="bx-admin-campaign__body">
                <strong>{campaign.title}</strong>
                <em>até {campaign.endsAt}</em>
                <div className="bx-admin-campaign__progress">
                  <span style={{ width: `${campaign.progress}%` }} />
                </div>
                <p>{campaign.progress}% concluída</p>
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
  const width = 640
  const height = 220
  const padX = 28
  const padY = 24
  const maxDeposit = Math.max(...adminChartSeries.map((p) => p.deposits))
  const maxUsers = Math.max(...adminChartSeries.map((p) => p.users))
  const innerW = width - padX * 2
  const innerH = height - padY * 2
  const gap = innerW / adminChartSeries.length
  const barW = gap * 0.48

  const linePoints = adminChartSeries
    .map((point, index) => {
      const x = padX + gap * index + gap / 2
      const y = padY + innerH - (point.users / maxUsers) * innerH
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="bx-admin-chart__canvas">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Gráfico de depósitos e cadastros">
        {[0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padY + innerH * (1 - ratio)
          return (
            <line
              key={ratio}
              x1={padX}
              x2={width - padX}
              y1={y}
              y2={y}
              className="bx-admin-chart__grid"
            />
          )
        })}

        {adminChartSeries.map((point, index) => {
          const x = padX + gap * index + (gap - barW) / 2
          const h = (point.deposits / maxDeposit) * innerH
          const y = padY + innerH - h
          return (
            <rect
              key={point.day}
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={4}
              className="bx-admin-chart__bar"
            />
          )
        })}

        <polyline points={linePoints} className="bx-admin-chart__line" />

        {adminChartSeries.map((point, index) => {
          const x = padX + gap * index + gap / 2
          const y = padY + innerH - (point.users / maxUsers) * innerH
          return <circle key={`dot-${point.day}`} cx={x} cy={y} r={3.2} className="bx-admin-chart__dot" />
        })}

        {adminChartSeries.map((point, index) => {
          const x = padX + gap * index + gap / 2
          return (
            <text key={`label-${point.day}`} x={x} y={height - 6} className="bx-admin-chart__label">
              {point.day}
            </text>
          )
        })}
      </svg>
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
