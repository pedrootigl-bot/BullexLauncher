import { useState, type ReactNode } from 'react'
import { AdminOverview } from '../components/admin/AdminOverview'
import { AdminSidebar } from '../components/admin/AdminSidebar'
import {
  AdminCreateModal,
  type AdminCreateKind,
  type AdminModalMode,
} from '../components/missions/AdminCreateModal'
import {
  adminCampaignCards,
  adminCouponStatusLabel,
  adminCoupons,
  adminMissionStatusLabel,
  adminMissions,
  adminOverview,
  adminPassRewards,
  adminProfile,
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
        endsAt: mission.endsAt === '—' ? '' : mission.endsAt,
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
        subtitle: campaign.subtitle,
        bannerFile: campaign.image,
        bannerPreview: campaign.image,
        startsAt: campaign.startsAt,
        endsAt: campaign.endsAt,
        placement: campaign.placement,
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
        stock: reward.stock,
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

    return {
      id: base?.id ?? `m-${Date.now()}`,
      title: payload.title?.trim() || 'Nova missão',
      description: payload.description?.trim() || '',
      target: payload.target?.trim() || '0',
      unit: safeUnit,
      status: base?.status ?? 'active',
      completions: base?.completions ?? 0,
      points: Number(payload.points) || 0,
      endsAt: payload.endsAt?.trim() || '—',
    }
  }

  function applyCampaignPayload(
    payload: Record<string, string>,
    base?: AdminCampaignCard,
  ): AdminCampaignCard {
    const placement = payload.placement
    const safePlacement: AdminCampaignCard['placement'] =
      placement === 'home' || placement === 'missions' || placement === 'rewards'
        ? placement
        : 'home'

    const banner = payload.bannerPreview?.trim() || payload.bannerFile?.trim()
    const image =
      banner && (banner.startsWith('/') || banner.startsWith('blob:') || banner.startsWith('http'))
        ? banner
        : base?.image ?? '/media/hero-missoes.jpg'

    return {
      id: base?.id ?? `c-${Date.now()}`,
      title: payload.title?.trim() || 'Nova campanha',
      subtitle: payload.subtitle?.trim() || '',
      image,
      status: base?.status ?? 'active',
      startsAt: payload.startsAt?.trim() || '—',
      endsAt: payload.endsAt?.trim() || '—',
      placement: safePlacement,
      progress: base?.progress ?? 0,
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
    <div className="bx-admin">
      <AdminSidebar active={section} onNavigate={setSection} />

      <div className="bx-admin__main">
        <header className="bx-admin__top">
          <div>
            <h1>{header.title}</h1>
            <p>{header.lead}</p>
          </div>

          <div className="bx-admin__top-tools">
            <button type="button" className="bx-admin-date">
              <CalendarIcon />
              {adminOverview.dateRange}
            </button>
            <button type="button" className="bx-admin-bell" aria-label="Notificações">
              <BellIcon />
              <i />
            </button>
            <span className="bx-admin-avatar" aria-hidden="true">
              {adminProfile.initials}
            </span>
          </div>
        </header>

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
              lead="Itens das trilhas gratuita e premium."
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
              lead="Banners e progresso dos sorteios."
              onCreate={() => openCreate('campaign')}
              createLabel="+ Nova campanha"
            >
              <CampaignsManage campaigns={campaigns} onEdit={openEditCampaign} />
            </ManagePanel>
          ) : null}

          {section !== 'overview' && !MANAGEABLE.includes(section) ? (
            <div className="bx-admin-placeholder">
              <strong>{header.title}</strong>
              <p>Módulo em construção — estrutura pronta para dados reais.</p>
            </div>
          ) : null}
        </div>
      </div>

      {modal ? (
        <AdminCreateModal
          key={`${modal.mode}-${modal.kind}-${modal.entityId ?? 'new'}`}
          kind={modal.kind}
          mode={modal.mode}
          initialValues={modal.initialValues}
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
        <span role="columnheader">Fim</span>
        <span role="columnheader" className="sr-only">
          Ações
        </span>
      </div>
      {missions.length === 0 ? (
        <p className="bx-admin-empty">Nenhuma missão cadastrada.</p>
      ) : null}
      {missions.map((mission) => (
        <div key={mission.id} className="bx-admin-table__row" role="row">
          <strong role="cell">{mission.title}</strong>
          <span role="cell">
            <em className={`bx-admin-badge bx-admin-badge--${mission.status}`}>
              {adminMissionStatusLabel[mission.status]}
            </em>
          </span>
          <span role="cell">{mission.completions.toLocaleString('pt-BR')}</span>
          <span role="cell">+{mission.points}</span>
          <span role="cell">{mission.endsAt}</span>
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
        <span role="columnheader">Estoque</span>
        <span role="columnheader" className="sr-only">
          Ações
        </span>
      </div>
      {adminPassRewards.map((reward) => (
        <div key={reward.id} className="bx-admin-table__row" role="row">
          <strong role="cell">{reward.title}</strong>
          <span role="cell">
            <span className={`bx-admin-track bx-admin-track--${reward.track}`}>
              {adminTrackLabel[reward.track]}
            </span>
          </span>
          <span role="cell">Nv. {reward.level}</span>
          <span role="cell">{reward.claims.toLocaleString('pt-BR')}</span>
          <span role="cell">{reward.stock}</span>
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
        <span role="columnheader">Resgates</span>
        <span role="columnheader">Limite</span>
        <span role="columnheader" className="sr-only">
          Ações
        </span>
      </div>
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
            {coupon.redemptions}/{coupon.limit}
          </span>
          <span role="cell">
            <span className="bx-admin-meter" aria-hidden="true">
              <i style={{ width: `${Math.min(100, (coupon.redemptions / coupon.limit) * 100)}%` }} />
            </span>
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
  return (
    <div className="bx-admin-campaigns__grid bx-admin-campaigns__grid--manage">
      {campaigns.length === 0 ? (
        <p className="bx-admin-empty">Nenhuma campanha cadastrada.</p>
      ) : null}
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
            <button
              type="button"
              className="bx-admin-campaign__edit"
              onClick={() => onEdit(campaign)}
            >
              Editar
            </button>
          </div>
        </article>
      ))}
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

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M6 16h12l-1.2-2.2a5.5 5.5 0 0 1-.8-2.8V9a4 4 0 1 0-8 0v1.9c0 1-.3 2-.8 2.9L6 16Z" />
      <path d="M10 18a2 2 0 0 0 4 0" />
    </svg>
  )
}
