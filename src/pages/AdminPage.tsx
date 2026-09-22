import { useState, type ReactNode } from 'react'
import { AdminOverview } from '../components/admin/AdminOverview'
import { AppSidebar } from '../components/missions/AppSidebar'
import { DashboardHeader } from '../components/missions/DashboardHeader'
import {
  AdminCreateModal,
  type AdminCreateKind,
  type AdminModalMode,
} from '../components/missions/AdminCreateModal'
import {
  adminCampaignCards,
  adminCouponStatusLabel,
  adminCoupons,
  adminKpis,
  adminMissionStatusLabel,
  adminMissions,
  adminNavGroups,
  adminNavItems,
  adminOverview,
  adminPassRewards,
  adminSectionTitles,
  adminTrackLabel,
  type AdminCampaignCard,
  type AdminCouponRow,
  type AdminMissionRow,
  type AdminNavId,
  type AdminRewardRow,
} from '../data/adminMock'

type AdminModalState = {
  kind: AdminCreateKind
  mode: AdminModalMode
  initialValues?: Record<string, string>
  entityId?: string
}

const MANAGEABLE: AdminNavId[] = ['missions', 'rewards', 'coupons', 'campaigns']

export function AdminPage() {
  const [section, setSection] = useState<AdminNavId>('overview')
  const [modal, setModal] = useState<AdminModalState | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [missions, setMissions] = useState<AdminMissionRow[]>(() => [...adminMissions])
  const [campaigns, setCampaigns] = useState<AdminCampaignCard[]>(() => [...adminCampaignCards])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2400)
  }

  function openCreate(kind: AdminCreateKind) {
    setModal({ kind, mode: 'create' })
  }

  function openEditMission(mission: AdminMissionRow) {
    setModal({
      kind: 'mission',
      mode: 'edit',
      entityId: mission.id,
      initialValues: {
        title: mission.title,
        description: mission.description,
        target: mission.target,
        unit: mission.unit,
        points: String(mission.points),
        status: mission.status,
        startsAt: mission.startsAt === '—' ? '' : mission.startsAt,
        endsAt: mission.endsAt === '—' ? '' : mission.endsAt,
        ctaLabel: mission.ctaLabel,
      },
    })
  }

  function openEditCampaign(campaign: AdminCampaignCard) {
    setModal({
      kind: 'campaign',
      mode: 'edit',
      entityId: campaign.id,
      initialValues: {
        title: campaign.title,
        bannerFile: campaign.image,
        bannerPreview: campaign.image,
        startsAt: campaign.startsAt,
        endsAt: campaign.endsAt,
        placement: 'home',
        priority: String(campaign.priority),
        ctaUrl: campaign.ctaUrl,
        altText: campaign.altText,
      },
    })
  }

  function openEditPass(reward: AdminRewardRow) {
    setModal({
      kind: 'pass',
      mode: 'edit',
      entityId: reward.id,
      initialValues: {
        title: reward.title,
        track: reward.track,
        level: String(reward.level),
        kind: reward.kind,
        amount: reward.amount,
        unitLabel: reward.unitLabel,
        eligibility: reward.eligibility,
      },
    })
  }

  function openEditCoupon(coupon: AdminCouponRow) {
    setModal({
      kind: 'coupon',
      mode: 'edit',
      entityId: coupon.id,
      initialValues: {
        name: coupon.name,
        code: coupon.code,
        type: coupon.type,
        valueLabel: coupon.valueLabel,
        limit: String(coupon.limit),
        expiresAt: coupon.expiresAt,
        terms: coupon.terms,
        minDeposit: coupon.minDeposit,
        onePerUser: coupon.onePerUser ? 'true' : 'false',
        redemptions: String(coupon.redemptions),
      },
    })
  }

  function applyMissionPayload(
    payload: Record<string, string>,
    base?: AdminMissionRow,
  ): AdminMissionRow {
    const unit = payload.unit
    const safeUnit: AdminMissionRow['unit'] =
      unit === 'brl' || unit === 'days' || unit === 'volume' ? unit : 'brl'
    const status = payload.status
    const safeStatus: AdminMissionRow['status'] =
      status === 'active' || status === 'draft' || status === 'ended' ? status : 'draft'

    return {
      id: base?.id ?? `m-${Date.now()}`,
      title: payload.title?.trim() || 'Nova missão',
      description: payload.description?.trim() || '',
      target: payload.target?.trim() || '0',
      unit: safeUnit,
      status: safeStatus,
      completions: base?.completions ?? 0,
      points: Number(payload.points) || 0,
      startsAt: payload.startsAt?.trim() || '—',
      endsAt: payload.endsAt?.trim() || '—',
      ctaLabel: payload.ctaLabel?.trim() || 'Continuar',
    }
  }

  function applyCampaignPayload(
    payload: Record<string, string>,
    base?: AdminCampaignCard,
  ): AdminCampaignCard {
    const banner = payload.bannerPreview?.trim() || payload.bannerFile?.trim()
    const image =
      banner && (banner.startsWith('/') || banner.startsWith('blob:') || banner.startsWith('http'))
        ? banner
        : base?.image ?? '/media/hero-missoes.jpg'

    return {
      id: base?.id ?? `c-${Date.now()}`,
      title: payload.title?.trim() || 'Nova campanha',
      image,
      status: base?.status ?? 'active',
      startsAt: payload.startsAt?.trim() || '—',
      endsAt: payload.endsAt?.trim() || '—',
      placement: 'home',
      progress: base?.progress ?? 0,
      priority: Number(payload.priority) || base?.priority || 1,
      ctaUrl: payload.ctaUrl?.trim() || '/missoes',
      altText: payload.altText?.trim() || payload.title?.trim() || 'Banner de campanha',
    }
  }

  function handleModalSubmit(
    kind: AdminCreateKind,
    payload: Record<string, string>,
    mode: AdminModalMode,
  ) {
    if (kind === 'mission') {
      if (mode === 'edit' && modal?.entityId) {
        setMissions((current) =>
          current.map((mission) =>
            mission.id === modal.entityId ? applyMissionPayload(payload, mission) : mission,
          ),
        )
      } else {
        setMissions((current) => [applyMissionPayload(payload), ...current])
      }
    }

    if (kind === 'campaign') {
      if (mode === 'edit' && modal?.entityId) {
        setCampaigns((current) =>
          current.map((campaign) =>
            campaign.id === modal.entityId ? applyCampaignPayload(payload, campaign) : campaign,
          ),
        )
      } else {
        setCampaigns((current) => [applyCampaignPayload(payload), ...current])
      }
    }

    setModal(null)

    const createMessages: Record<AdminCreateKind, string> = {
      mission: 'Missão criada com sucesso.',
      pass: 'Recompensa adicionada ao passe (mock).',
      coupon: 'Cupom gerado com sucesso (mock).',
      campaign: 'Campanha publicada.',
    }
    const editMessages: Record<AdminCreateKind, string> = {
      mission: 'Missão atualizada.',
      pass: 'Recompensa atualizada (mock).',
      coupon: 'Cupom atualizado (mock).',
      campaign: 'Campanha atualizada.',
    }

    showToast(mode === 'edit' ? editMessages[kind] : createMessages[kind])

    if (kind === 'mission') setSection('missions')
    if (kind === 'pass') setSection('rewards')
    if (kind === 'coupon') setSection('coupons')
    if (kind === 'campaign') setSection('campaigns')
  }

  function handleModalDelete(kind: AdminCreateKind) {
    if (kind !== 'mission' || !modal?.entityId) return

    setMissions((current) => current.filter((mission) => mission.id !== modal.entityId))
    setModal(null)
    showToast('Missão excluída.')
    setSection('missions')
  }

  const header =
    section === 'overview'
      ? { title: adminOverview.title, lead: adminOverview.lead }
      : adminSectionTitles[section]

  return (
    <div className="bs-shell">
      <DashboardHeader />

      <div className="bs-shell__body">
        <AppSidebar />

        <div className="bs-main bx-admin">
          <header className="bx-admin__top">
            <div className="bx-admin__top-copy">
              <p className="bx-admin__eyebrow">Painel Bullex</p>
              <h1>{header.title}</h1>
              <p>{header.lead}</p>
            </div>

            <div className="bx-admin__top-tools">
              <div className="bx-admin__quick-kpis" aria-label="Resumo rápido">
                {adminKpis.slice(0, 2).map((kpi) => (
                  <article key={kpi.id}>
                    <span>{kpi.label}</span>
                    <strong>{kpi.value}</strong>
                  </article>
                ))}
              </div>
              <button type="button" className="bx-admin-date">
                <CalendarIcon />
                {adminOverview.dateRange}
              </button>
            </div>
          </header>

          <div className="bx-admin__body">
            <nav className="bx-admin-sections" aria-label="Seções do painel">
              {adminNavGroups.map((group) => {
                const items = adminNavItems.filter((item) => item.group === group.id)
                return (
                  <div key={group.id} className="bx-admin-sections__group">
                    <p className="bx-admin-sections__label">{group.label}</p>
                    {items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`bx-admin-sections__chip${section === item.id ? ' is-active' : ''}${item.ready ? '' : ' is-soon'}`}
                        aria-pressed={section === item.id}
                        onClick={() => setSection(item.id)}
                      >
                        <span className="bx-admin-sections__icon" aria-hidden="true">
                          <AdminSectionIcon id={item.id} />
                        </span>
                        <span className="bx-admin-sections__text">{item.label}</span>
                        {!item.ready ? <em>Em breve</em> : null}
                      </button>
                    ))}
                  </div>
                )
              })}
            </nav>

            <div className="bx-admin__content">
              {section === 'overview' ? (
                <AdminOverview
                  campaigns={campaigns}
                  onOpenCampaigns={() => setSection('campaigns')}
                />
              ) : null}

              {section === 'missions' ? (
                <ManagePanel
                  title="Missões da temporada"
                  lead="Crie, edite e acompanhe conclusões."
                  onCreate={() => openCreate('mission')}
                  createLabel="+ Nova missão"
                >
                  <MissionsTable missions={missions} onEdit={openEditMission} />
                </ManagePanel>
              ) : null}

              {section === 'rewards' ? (
                <ManagePanel
                  title="Recompensas do passe"
                  lead="Itens das trilhas BullPass e BullPass Premium."
                  onCreate={() => openCreate('pass')}
                  createLabel="+ Nova recompensa"
                >
                  <PassTable onEdit={openEditPass} />
                </ManagePanel>
              ) : null}

              {section === 'coupons' ? (
                <ManagePanel
                  title="Cupons promocionais"
                  lead="Códigos ativos, pausados e expirados."
                  onCreate={() => openCreate('coupon')}
                  createLabel="+ Novo cupom"
                >
                  <CouponsTable onEdit={openEditCoupon} />
                </ManagePanel>
              ) : null}

              {section === 'campaigns' ? (
                <ManagePanel
                  title="Campanhas ativas"
                  lead="Banners, ordem no carrossel e progresso das campanhas da temporada."
                  onCreate={() => openCreate('campaign')}
                  createLabel="+ Nova campanha"
                >
                  <CampaignsManage campaigns={campaigns} onEdit={openEditCampaign} />
                </ManagePanel>
              ) : null}

              {section !== 'overview' && !MANAGEABLE.includes(section) ? (
                <div className="bx-admin-placeholder">
                  <span className="bx-admin-placeholder__icon" aria-hidden="true">
                    <AdminSectionIcon id={section} />
                  </span>
                  <strong>{header.title}</strong>
                  <p>
                    Este módulo ainda está em construção. A estrutura já está pronta para receber
                    dados reais da operação Bullex.
                  </p>
                  <button type="button" className="bx-admin-link" onClick={() => setSection('overview')}>
                    Voltar à visão geral →
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {modal ? (
        <AdminCreateModal
          key={`${modal.mode}-${modal.kind}-${modal.entityId ?? 'new'}`}
          kind={modal.kind}
          mode={modal.mode}
          initialValues={modal.initialValues}
          occupiedKeys={adminPassRewards
            .filter((reward) => reward.id !== modal.entityId)
            .map((reward) => `${reward.track}-${reward.level}`)}
          onClose={() => setModal(null)}
          onSubmit={handleModalSubmit}
          onDelete={modal.mode === 'edit' && modal.kind === 'mission' ? handleModalDelete : undefined}
        />
      ) : null}

      {toast ? (
        <div className="bx-admin-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  )
}

function ManagePanel({
  title,
  lead,
  onCreate,
  createLabel,
  children,
}: {
  title: string
  lead: string
  onCreate: () => void
  createLabel: string
  children: ReactNode
}) {
  return (
    <section className="bx-admin-panel bx-admin-panel--manage">
      <div className="bx-admin-panel__head">
        <div>
          <h2>{title}</h2>
          <p>{lead}</p>
        </div>
        <button type="button" className="bx-admin-add" onClick={onCreate}>
          {createLabel}
        </button>
      </div>
      {children}
    </section>
  )
}

function MissionsTable({
  missions,
  onEdit,
}: {
  missions: AdminMissionRow[]
  onEdit: (mission: AdminMissionRow) => void
}) {
  return (
    <div className="bx-admin-table bx-admin-table--manage" role="table" aria-label="Missões">
      <div className="bx-admin-table__head" role="row">
        <span role="columnheader">Missão</span>
        <span role="columnheader">Status</span>
        <span role="columnheader">Conclusões</span>
        <span role="columnheader">Pontos</span>
        <span role="columnheader">Período</span>
        <span role="columnheader" className="sr-only">
          Ações
        </span>
      </div>
      {missions.length === 0 ? (
        <p className="bx-admin-empty">Nenhuma missão cadastrada. Crie a primeira para começar.</p>
      ) : null}
      {missions.map((mission) => (
        <div key={mission.id} className="bx-admin-table__row" role="row">
          <span role="cell">
            <strong>{mission.title}</strong>
            <em className="bx-admin-table__sub">{mission.ctaLabel}</em>
          </span>
          <span role="cell">
            <em className={`bx-admin-badge bx-admin-badge--${mission.status}`}>
              {adminMissionStatusLabel[mission.status]}
            </em>
          </span>
          <span role="cell">{mission.completions.toLocaleString('pt-BR')}</span>
          <span role="cell">+{mission.points}</span>
          <span role="cell">
            {mission.startsAt} → {mission.endsAt}
          </span>
          <span role="cell" className="bx-admin-table__actions">
            <button type="button" onClick={() => onEdit(mission)}>
              Editar
            </button>
          </span>
        </div>
      ))}
    </div>
  )
}

function PassTable({ onEdit }: { onEdit: (reward: AdminRewardRow) => void }) {
  return (
    <div className="bx-admin-table bx-admin-table--manage" role="table" aria-label="Recompensas">
      <div className="bx-admin-table__head" role="row">
        <span role="columnheader">Recompensa</span>
        <span role="columnheader">Trilha</span>
        <span role="columnheader">Nível</span>
        <span role="columnheader">Resgates</span>
        <span role="columnheader">Elegibilidade</span>
        <span role="columnheader" className="sr-only">
          Ações
        </span>
      </div>
      {adminPassRewards.length === 0 ? (
        <p className="bx-admin-empty">Nenhuma recompensa no passe. Adicione a primeira.</p>
      ) : null}
      {adminPassRewards.map((reward) => (
        <div key={reward.id} className="bx-admin-table__row" role="row">
          <span role="cell">
            <strong>{reward.title}</strong>
            <em className="bx-admin-table__sub">
              {reward.amount} {reward.unitLabel}
            </em>
          </span>
          <span role="cell">
            <span className={`bx-admin-track bx-admin-track--${reward.track}`}>
              {adminTrackLabel[reward.track]}
            </span>
          </span>
          <span role="cell">Nv. {reward.level}</span>
          <span role="cell">{reward.claims.toLocaleString('pt-BR')}</span>
          <span role="cell">{reward.eligibility}</span>
          <span role="cell" className="bx-admin-table__actions">
            <button type="button" onClick={() => onEdit(reward)}>
              Editar
            </button>
          </span>
        </div>
      ))}
    </div>
  )
}

function CouponsTable({ onEdit }: { onEdit: (coupon: AdminCouponRow) => void }) {
  return (
    <div className="bx-admin-table bx-admin-table--manage" role="table" aria-label="Cupons">
      <div className="bx-admin-table__head" role="row">
        <span role="columnheader">Cupom</span>
        <span role="columnheader">Código</span>
        <span role="columnheader">Status</span>
        <span role="columnheader">Usos</span>
        <span role="columnheader">Regras</span>
        <span role="columnheader" className="sr-only">
          Ações
        </span>
      </div>
      {adminCoupons.length === 0 ? (
        <p className="bx-admin-empty">Nenhum cupom cadastrado. Gere o primeiro código.</p>
      ) : null}
      {adminCoupons.map((coupon) => (
        <div key={coupon.id} className="bx-admin-table__row" role="row">
          <strong role="cell">{coupon.name}</strong>
          <span role="cell">
            <code>{coupon.code}</code>
          </span>
          <span role="cell">
            <em className={`bx-admin-badge bx-admin-badge--${coupon.status}`}>
              {adminCouponStatusLabel[coupon.status]}
            </em>
          </span>
          <span role="cell">
            <strong>
              {coupon.redemptions}/{coupon.limit}
            </strong>
            <span className="bx-admin-meter" aria-hidden="true">
              <i style={{ width: `${Math.min(100, (coupon.redemptions / coupon.limit) * 100)}%` }} />
            </span>
          </span>
          <span role="cell">
            <em className="bx-admin-table__sub">
              Mín. R$ {coupon.minDeposit}
              {coupon.onePerUser ? ' · 1/usuário' : ''}
            </em>
          </span>
          <span role="cell" className="bx-admin-table__actions">
            <button type="button" onClick={() => onEdit(coupon)}>
              Editar
            </button>
          </span>
        </div>
      ))}
    </div>
  )
}

function CampaignsManage({
  campaigns,
  onEdit,
}: {
  campaigns: AdminCampaignCard[]
  onEdit: (campaign: AdminCampaignCard) => void
}) {
  const activeCount = campaigns.filter((campaign) => campaign.status === 'active').length
  const pausedCount = campaigns.filter((campaign) => campaign.status === 'paused').length
  const avgProgress =
    campaigns.length > 0
      ? Math.round(
          campaigns.reduce((sum, campaign) => sum + campaign.progress, 0) / campaigns.length,
        )
      : 0
  const leading = campaigns.reduce<AdminCampaignCard | null>((best, campaign) => {
    if (!best || campaign.progress > best.progress) return campaign
    return best
  }, null)

  return (
    <div className="bx-admin-campaigns-manage">
      <div className="bx-admin-campaigns__stats" aria-label="Resumo das campanhas">
        <article>
          <span>Ativas</span>
          <strong>{activeCount}</strong>
        </article>
        <article>
          <span>Pausadas</span>
          <strong>{pausedCount}</strong>
        </article>
        <article>
          <span>Progresso médio</span>
          <strong>{avgProgress}%</strong>
        </article>
        <article>
          <span>Em destaque</span>
          <strong>{leading?.title ?? '—'}</strong>
        </article>
      </div>

      <div className="bx-admin-campaigns__grid bx-admin-campaigns__grid--manage">
        {campaigns.length === 0 ? (
          <p className="bx-admin-empty">Nenhuma campanha cadastrada.</p>
        ) : null}
        {campaigns
          .slice()
          .sort((a, b) => a.priority - b.priority)
          .map((campaign) => (
          <article key={campaign.id} className="bx-admin-campaign bx-admin-campaign--manage">
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
              <p className="bx-admin-campaign__cta">CTA: {campaign.ctaUrl}</p>
              <div className="bx-admin-campaign__progress" aria-hidden="true">
                <span style={{ width: `${campaign.progress}%` }} />
              </div>
              <button
                type="button"
                className="bx-admin-campaign__edit"
                onClick={() => onEdit(campaign)}
              >
                Editar campanha
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
    </svg>
  )
}

function AdminSectionIcon({ id }: { id: AdminNavId }) {
  const props = {
    viewBox: '0 0 24 24',
    width: 15,
    height: 15,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (id) {
    case 'overview':
      return (
        <svg {...props}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
        </svg>
      )
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
          <path d="M12 4v12M8 8l4-4 4 4" />
          <path d="M5 18h14" />
        </svg>
      )
    case 'withdrawals':
      return (
        <svg {...props}>
          <path d="M12 20V8M8 16l4 4 4-4" />
          <path d="M5 6h14" />
        </svg>
      )
    case 'rewards':
      return (
        <svg {...props}>
          <path d="M12 3 14.5 8.5 20.5 9.2 16 13.4 17.2 19.3 12 16.4 6.8 19.3 8 13.4 3.5 9.2 9.5 8.5 12 3Z" />
        </svg>
      )
    case 'campaigns':
      return (
        <svg {...props}>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M3 10h18" />
        </svg>
      )
    case 'missions':
      return (
        <svg {...props}>
          <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
          <path d="M12 13v3M9 20h6" />
        </svg>
      )
    case 'coupons':
      return (
        <svg {...props}>
          <path d="M4 9.5A2.5 2.5 0 0 0 6.5 7h11A2.5 2.5 0 0 0 20 9.5v1a1.5 1.5 0 0 1 0 3v1A2.5 2.5 0 0 0 17.5 17h-11A2.5 2.5 0 0 0 4 14.5v-1a1.5 1.5 0 0 1 0-3v-1Z" />
          <path d="M12 7v10" strokeDasharray="2 2" />
        </svg>
      )
    case 'prizes':
      return (
        <svg {...props}>
          <path d="M8 10h8v10H8z" />
          <path d="M7 10h10l-1-4H8l-1 4Z" />
        </svg>
      )
    case 'contents':
      return (
        <svg {...props}>
          <rect x="5" y="4" width="14" height="16" rx="2" />
          <path d="M9 9h6M9 13h6M9 17h4" />
        </svg>
      )
    case 'notifications':
      return (
        <svg {...props}>
          <path d="M6 16h12l-1.2-2.2a5.5 5.5 0 0 1-.8-2.8V9a4 4 0 1 0-8 0v1.9c0 1-.3 2-.8 2.9L6 16Z" />
          <path d="M10 18a2 2 0 0 0 4 0" />
        </svg>
      )
    case 'reports':
      return (
        <svg {...props}>
          <path d="M4 19V9M10 19V5M16 19v-7M20 19V11" />
        </svg>
      )
    case 'settings':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M5.6 18.4l1.6-1.6M16.8 7.2l1.6-1.6" />
        </svg>
      )
    default: {
      const _exhaustive: never = id
      return _exhaustive
    }
  }
}
