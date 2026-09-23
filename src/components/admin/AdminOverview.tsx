import {
  adminKpis,
  type AdminCampaignCard,
  type AdminKpiId,
} from '../../data/adminMock'
import { AdminKpiCard } from './AdminKpiCard'
import { BullstartMissionsPanel } from './BullstartMissionsPanel'
import { StatusBadge } from './StatusBadge'

type AdminOverviewProps = {
  campaigns: AdminCampaignCard[]
  onOpenCampaigns: () => void
}

export function AdminOverview({ campaigns, onOpenCampaigns }: AdminOverviewProps) {
  return (
    <div className="bx-admin-overview">
      <section className="bx-admin-kpis bx-admin-kpis--compact" aria-label="Indicadores">
        {adminKpis.map((kpi) => (
          <AdminKpiCard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
            trend={kpi.trend}
            hint={kpi.trendHint}
            icon={<KpiIcon id={kpi.id} />}
          />
        ))}
      </section>

      <BullstartMissionsPanel />

      <section className="bx-admin-campaigns" aria-labelledby="bx-admin-campaigns-title">
        <div className="bx-admin-panel__head">
          <div>
            <h2 id="bx-admin-campaigns-title">Campanhas ativas</h2>
            <p>Banners e ofertas da temporada.</p>
          </div>
          <button type="button" className="bx-btn bx-btn--secondary" onClick={onOpenCampaigns}>
            Gerenciar campanhas →
          </button>
        </div>

        <div className="bx-admin-campaigns__grid">
          {campaigns.length === 0 ? (
            <p className="bx-admin-empty">Nenhuma campanha ativa.</p>
          ) : null}
          {campaigns
            .slice()
            .sort((a, b) => a.priority - b.priority)
            .map((campaign) => (
              <article key={campaign.id} className="bx-admin-campaign">
                <div className="bx-admin-campaign__media">
                  <img src={campaign.image} alt={campaign.altText} />
                  <StatusBadge
                    label={campaign.status === 'active' ? 'Ativa' : 'Pausada'}
                    tone={campaign.status === 'active' ? 'active' : 'paused'}
                  />
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
