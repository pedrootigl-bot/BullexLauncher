import { useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AdminActionMenu } from '../components/admin/AdminActionMenu'
import { AdminEmptyState } from '../components/admin/AdminEmptyState'
import { AdminKpiCard } from '../components/admin/AdminKpiCard'
import { AdminOverview } from '../components/admin/AdminOverview'
import { AdminPageHeader } from '../components/admin/AdminPageHeader'
import { BullstartDrawPanel } from '../components/admin/BullstartDrawPanel'
import { DrawPrizeDetailModal } from '../components/admin/DrawPrizeDetailModal'
import { getRewardTypeMeta } from '../components/admin/rewardTypeMeta'
import { StatusBadge } from '../components/admin/StatusBadge'
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
  adminMissionStatusLabel,
  adminMissions,
  adminOverview,
  adminPassRewards,
  adminSectionPath,
  adminSectionTitles,
  adminTrackLabel,
  parseAdminSection,
  type AdminCampaignCard,
  type AdminCouponRow,
  type AdminMissionRow,
  type AdminNavId,
  type AdminRewardRow,
} from '../data/adminMock'
import { formatBullstartDateTime } from '../services/bullstartAdmin'
import { listDrawHistory } from '../services/bullstartDraw'
import type { AdminDraw } from '../data/drawAdminMock'

type DrawHistoryStatusFilter = 'all' | 'prepared' | 'completed'

const DRAW_STATUS_FILTERS: {
  value: DrawHistoryStatusFilter
  label: string
}[] = [
  { value: 'all', label: 'Todos' },
  { value: 'prepared', label: 'Preparados' },
  { value: 'completed', label: 'Concluídos' },
]

type AdminModalState = {
  kind: AdminCreateKind
  mode: AdminModalMode
  initialValues?: Record<string, string>
  entityId?: string
}

export function AdminPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const section = parseAdminSection(searchParams.get('section'))
  const [modal, setModal] = useState<AdminModalState | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [missions, setMissions] = useState<AdminMissionRow[]>(() => [...adminMissions])
  const [campaigns, setCampaigns] = useState<AdminCampaignCard[]>(() => [...adminCampaignCards])
  const [rewards, setRewards] = useState<AdminRewardRow[]>(() => [...adminPassRewards])
  const [campaignsTab, setCampaignsTab] = useState<'history' | 'banners'>('history')
  const [historyTick, setHistoryTick] = useState(0)

  function setSection(id: AdminNavId) {
    navigate(adminSectionPath(id))
  }

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
      title: payload.title?.trim() || 'Novo sorteio',
      image,
      status: base?.status ?? 'active',
      startsAt: payload.startsAt?.trim() || '—',
      endsAt: payload.endsAt?.trim() || '—',
      placement: 'home',
      progress: base?.progress ?? 0,
      priority: Number(payload.priority) || base?.priority || 1,
      ctaUrl: payload.ctaUrl?.trim() || '/missoes',
      altText: payload.altText?.trim() || payload.title?.trim() || 'Banner de sorteio',
    }
  }

  function applyPassPayload(
    payload: Record<string, string>,
    base?: AdminRewardRow,
  ): AdminRewardRow {
    const track = payload.track === 'premium' ? 'premium' : 'free'
    const kind = (
      [
        'cashback',
        'points',
        'ticket',
        'chest',
        'report',
        'balance',
        'badge',
        'bonus',
      ] as AdminRewardRow['kind'][]
    ).includes(payload.kind as AdminRewardRow['kind'])
      ? (payload.kind as AdminRewardRow['kind'])
      : 'cashback'

    return {
      id: base?.id ?? `r-${Date.now()}`,
      title: payload.title?.trim() || 'Nova recompensa',
      track,
      level: Number(payload.level) || base?.level || 1,
      kind,
      claims: base?.claims ?? 0,
      amount: payload.amount?.trim() || '0',
      unitLabel: payload.unitLabel?.trim() || 'R$',
      eligibility: payload.eligibility?.trim() || 'Benefício digital do passe',
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

    if (kind === 'pass') {
      const nextReward = applyPassPayload(
        payload,
        mode === 'edit' && modal?.entityId
          ? rewards.find((reward) => reward.id === modal.entityId)
          : undefined,
      )
      if (mode === 'edit' && modal?.entityId) {
        setRewards((current) =>
          current.map((reward) => (reward.id === modal.entityId ? nextReward : reward)),
        )
      } else {
        setRewards((current) => [nextReward, ...current])
      }
    }

    setModal(null)

    const createMessages: Record<AdminCreateKind, string> = {
      mission: 'Missão criada com sucesso.',
      pass: 'Recompensa adicionada ao passe (mock).',
      coupon: 'Cupom gerado com sucesso (mock).',
      campaign: 'Sorteio publicado.',
    }
    const editMessages: Record<AdminCreateKind, string> = {
      mission: 'Missão atualizada.',
      pass: 'Recompensa atualizada (mock).',
      coupon: 'Cupom atualizado (mock).',
      campaign: 'Sorteio atualizado.',
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

  const isEngage =
    section === 'missions' ||
    section === 'rewards' ||
    section === 'coupons' ||
    section === 'campaigns' ||
    section === 'draw'

  const headerMeta =
    section === 'overview'
      ? {
          title: adminOverview.title,
          lead: adminOverview.lead,
          eyebrow: adminOverview.eyebrow,
        }
      : adminSectionTitles[section]

  const breadcrumb =
    section === 'overview'
      ? [
          { label: 'Admin', to: '/administrador' },
          { label: 'Visão Geral' },
        ]
      : [
          { label: 'Admin', to: '/administrador' },
          { label: 'Engajamento', to: adminSectionPath(section) },
          { label: headerMeta.title },
        ]

  void historyTick
  const drawHistory = listDrawHistory()

  const headerActions =
    section === 'rewards' ? (
      <button type="button" className="bx-btn bx-btn--primary" onClick={() => openCreate('pass')}>
        + Nova recompensa
      </button>
    ) : section === 'draw' ? (
      <Link className="bx-btn bx-btn--secondary" to={adminSectionPath('campaigns')}>
        Ver histórico →
      </Link>
    ) : section === 'campaigns' && campaignsTab === 'banners' ? (
      <button type="button" className="bx-btn bx-btn--primary" onClick={() => openCreate('campaign')}>
        + Novo banner
      </button>
    ) : section === 'campaigns' ? (
      <Link className="bx-btn bx-btn--primary" to={adminSectionPath('draw')}>
        Novo sorteio →
      </Link>
    ) : section === 'missions' ? (
      <button type="button" className="bx-btn bx-btn--primary" onClick={() => openCreate('mission')}>
        + Nova missão
      </button>
    ) : section === 'coupons' ? (
      <button type="button" className="bx-btn bx-btn--primary" onClick={() => openCreate('coupon')}>
        + Novo cupom
      </button>
    ) : null

  return (
    <div className="bs-shell">
      <DashboardHeader />

      <div className="bs-shell__body">
        <AppSidebar />

        <div className={`bs-main bx-admin${isEngage ? ' bx-admin--engage' : ''}`}>
          <AdminPageHeader
            compact
            eyebrow={headerMeta.eyebrow}
            title={headerMeta.title}
            lead={headerMeta.lead}
            breadcrumb={breadcrumb}
            actions={headerActions}
          />

          <div className="bx-admin__body">
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
                  lead="Crie, edite e acompanhe as conclusões dos traders."
                >
                  <MissionsTable missions={missions} onEdit={openEditMission} />
                </ManagePanel>
              ) : null}

              {section === 'rewards' ? (
                <RewardsHub
                  rewards={rewards}
                  onEdit={openEditPass}
                  onCreate={() => openCreate('pass')}
                  onDuplicate={(reward) => {
                    setRewards((current) => [
                      {
                        ...reward,
                        id: `r-${Date.now()}`,
                        title: `${reward.title} (cópia)`,
                        claims: 0,
                        level: reward.level + 1,
                      },
                      ...current,
                    ])
                    showToast('Recompensa duplicada (mock).')
                  }}
                  onDeactivate={(reward) => {
                    showToast(`Recompensa “${reward.title}” marcada para desativação (mock).`)
                  }}
                  onDelete={(reward) => {
                    setRewards((current) => current.filter((item) => item.id !== reward.id))
                    showToast('Recompensa removida (mock).')
                  }}
                />
              ) : null}

              {section === 'coupons' ? (
                <ManagePanel
                  title="Cupons promocionais"
                  lead="Códigos ativos, pausados e expirados."
                >
                  <CouponsTable onEdit={openEditCoupon} />
                </ManagePanel>
              ) : null}

              {section === 'campaigns' ? (
                <div className="bx-sorteios-hub">
                  <div className="bx-admin-tabs" role="tablist" aria-label="Áreas de sorteios">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={campaignsTab === 'history'}
                      className={campaignsTab === 'history' ? 'is-active' : undefined}
                      onClick={() => setCampaignsTab('history')}
                    >
                      Histórico de sorteios
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={campaignsTab === 'banners'}
                      className={campaignsTab === 'banners' ? 'is-active' : undefined}
                      onClick={() => setCampaignsTab('banners')}
                    >
                      Banners
                    </button>
                  </div>

                  {campaignsTab === 'history' ? (
                    <DrawHistoryPanel
                      draws={drawHistory}
                      onRefresh={() => setHistoryTick((n) => n + 1)}
                    />
                  ) : (
                    <ManagePanel
                      title="Banners ativos"
                      lead="Ordem no carrossel e progresso visual da temporada."
                    >
                      <CampaignsManage campaigns={campaigns} onEdit={openEditCampaign} />
                    </ManagePanel>
                  )}
                </div>
              ) : null}

              {section === 'draw' ? (
                <BullstartDrawPanel onHistoryChange={() => setHistoryTick((n) => n + 1)} />
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
          occupiedKeys={rewards
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
  children,
}: {
  title: string
  lead: string
  children: ReactNode
}) {
  return (
    <section className="bx-admin-panel bx-admin-panel--manage bx-admin-engage">
      <div className="bx-admin-engage__head">
        <div className="bx-admin-engage__copy">
          <h2>{title}</h2>
          <p>{lead}</p>
        </div>
      </div>
      <div className="bx-admin-engage__body">{children}</div>
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
    <div
      className="bx-admin-table bx-admin-table--manage bx-admin-table--missions"
      role="table"
      aria-label="Missões"
    >
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
          <span role="cell" className="bx-admin-table__entity">
            <strong>{mission.title}</strong>
            <em className="bx-admin-table__sub">{mission.ctaLabel}</em>
          </span>
          <span role="cell">
            <em className={`bx-admin-badge bx-admin-badge--${mission.status}`}>
              {adminMissionStatusLabel[mission.status]}
            </em>
          </span>
          <span role="cell" className="bx-admin-table__num">
            {mission.completions.toLocaleString('pt-BR')}
          </span>
          <span role="cell" className="bx-admin-table__points">
            +{mission.points}
          </span>
          <span role="cell" className="bx-admin-table__period">
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

function RewardsHub({
  rewards,
  onEdit,
  onCreate,
  onDuplicate,
  onDeactivate,
  onDelete,
}: {
  rewards: AdminRewardRow[]
  onEdit: (reward: AdminRewardRow) => void
  onCreate: () => void
  onDuplicate: (reward: AdminRewardRow) => void
  onDeactivate: (reward: AdminRewardRow) => void
  onDelete: (reward: AdminRewardRow) => void
}) {
  const [query, setQuery] = useState('')
  const [track, setTrack] = useState<'all' | AdminRewardRow['track']>('all')
  const [kind, setKind] = useState<'all' | AdminRewardRow['kind']>('all')

  const kpis = useMemo(() => {
    const free = rewards.filter((item) => item.track === 'free').length
    const premium = rewards.filter((item) => item.track === 'premium').length
    const claims = rewards.reduce((sum, item) => sum + item.claims, 0)
    const top = rewards.slice().sort((a, b) => b.claims - a.claims)[0]
    return {
      active: rewards.length,
      free,
      premium,
      claims,
      topTitle: top?.title ?? '—',
    }
  }, [rewards])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rewards.filter((reward) => {
      const matchesTrack = track === 'all' || reward.track === track
      const matchesKind = kind === 'all' || reward.kind === kind
      const matchesQuery =
        !q ||
        reward.title.toLowerCase().includes(q) ||
        reward.kind.toLowerCase().includes(q) ||
        reward.eligibility.toLowerCase().includes(q)
      return matchesTrack && matchesKind && matchesQuery
    })
  }, [rewards, query, track, kind])

  const kinds = useMemo(
    () => Array.from(new Set(rewards.map((reward) => reward.kind))),
    [rewards],
  )

  return (
    <section className="bx-admin-panel bx-admin-panel--manage bx-rewards-hub">
      <div className="bx-rewards-hub__kpis" aria-label="Resumo de recompensas">
        <AdminKpiCard label="Recompensas ativas" value={String(kpis.active)} />
        <AdminKpiCard label="BullPass" value={String(kpis.free)} />
        <AdminKpiCard label="Premium" value={String(kpis.premium)} tone="premium" />
        <AdminKpiCard label="Resgates" value={kpis.claims.toLocaleString('pt-BR')} />
        <AdminKpiCard label="Mais resgatada" value={kpis.topTitle} hint="Por volume de resgates" />
      </div>

      <div className="bx-admin-engage__head">
        <div className="bx-admin-engage__copy">
          <h2>Recompensas do Passe</h2>
          <p>Gerencie os benefícios das trilhas BullPass e Premium.</p>
        </div>
      </div>

      <div className="bx-rewards-hub__tools">
        <label className="bx-admin-search">
          <span className="sr-only">Buscar recompensa</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar recompensa..."
          />
        </label>
        <label>
          <span className="sr-only">Trilha</span>
          <select value={track} onChange={(event) => setTrack(event.target.value as typeof track)}>
            <option value="all">Todas as trilhas</option>
            <option value="free">BullPass</option>
            <option value="premium">Premium</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Tipo</span>
          <select value={kind} onChange={(event) => setKind(event.target.value as typeof kind)}>
            <option value="all">Todos os tipos</option>
            {kinds.map((item) => (
              <option key={item} value={item}>
                {getRewardTypeMeta(item).label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <AdminEmptyState
          title="Nenhuma recompensa encontrada."
          description="Crie um benefício para começar a montar o BullPass."
          action={
            <button type="button" className="bx-btn bx-btn--primary" onClick={onCreate}>
              + Criar recompensa
            </button>
          }
        />
      ) : (
        <div
          className="bx-admin-table bx-admin-table--manage bx-admin-table--rewards"
          role="table"
          aria-label="Recompensas"
        >
          <div className="bx-admin-table__head" role="row">
            <span role="columnheader">Recompensa</span>
            <span role="columnheader">Tipo</span>
            <span role="columnheader">Trilha</span>
            <span role="columnheader">Nível</span>
            <span role="columnheader">Resgates</span>
            <span role="columnheader">Validade</span>
            <span role="columnheader">Status</span>
            <span role="columnheader" className="sr-only">
              Ações
            </span>
          </div>
          {filtered.map((reward) => {
            const typeMeta = getRewardTypeMeta(reward.kind)
            return (
              <div key={reward.id} className="bx-admin-table__row" role="row">
                <span role="cell" className="bx-admin-table__entity">
                  <strong>{reward.title}</strong>
                  <em className="bx-admin-table__sub">
                    {reward.amount} {reward.unitLabel}
                  </em>
                </span>
                <span role="cell">
                  <span className={`bx-reward-type is-${typeMeta.tone}`}>{typeMeta.label}</span>
                </span>
                <span role="cell">
                  <span className={`bx-admin-track bx-admin-track--${reward.track}`}>
                    {adminTrackLabel[reward.track]}
                  </span>
                </span>
                <span role="cell" className="bx-admin-table__level">
                  Nv. {reward.level}
                </span>
                <span role="cell" className="bx-admin-table__num">
                  {reward.claims.toLocaleString('pt-BR')}
                </span>
                <span role="cell" className="bx-admin-table__eligibility">
                  {reward.eligibility}
                </span>
                <span role="cell">
                  <StatusBadge label="Ativa" tone="active" />
                </span>
                <span role="cell" className="bx-admin-table__actions">
                  <AdminActionMenu
                    items={[
                      { id: 'edit', label: 'Editar', onSelect: () => onEdit(reward) },
                      { id: 'dup', label: 'Duplicar', onSelect: () => onDuplicate(reward) },
                      {
                        id: 'view',
                        label: 'Visualizar',
                        onSelect: () => onEdit(reward),
                      },
                      {
                        id: 'off',
                        label: 'Desativar',
                        onSelect: () => onDeactivate(reward),
                      },
                      {
                        id: 'del',
                        label: 'Excluir',
                        tone: 'danger',
                        onSelect: () => onDelete(reward),
                      },
                    ]}
                  />
                </span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function DrawHistoryPanel({
  draws,
  onRefresh,
}: {
  draws: AdminDraw[]
  onRefresh: () => void
}) {
  const [statusFilter, setStatusFilter] = useState<DrawHistoryStatusFilter>('all')
  const [detailDraw, setDetailDraw] = useState<AdminDraw | null>(null)

  const counts = useMemo(
    () => ({
      all: draws.length,
      prepared: draws.filter((draw) => draw.status === 'prepared').length,
      completed: draws.filter((draw) => draw.status === 'completed').length,
    }),
    [draws],
  )

  const filtered = draws.filter(
    (draw) => statusFilter === 'all' || draw.status === statusFilter,
  )

  return (
    <section className="bx-admin-panel bx-admin-panel--manage">
      <div className="bx-admin-engage__head bx-draw-history-head">
        <div className="bx-admin-engage__copy">
          <h2>Histórico de sorteios</h2>
          <p>Resultados permanentes e sorteios preparados.</p>
        </div>
        <div className="bx-page-header__actions bx-draw-history-actions">
          <div
            className="bx-draw-status-filter"
            role="group"
            aria-label="Filtrar por status"
          >
            {DRAW_STATUS_FILTERS.map((option) => {
              const active = statusFilter === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`bx-draw-status-filter__btn is-${option.value}${active ? ' is-active' : ''}`}
                  aria-pressed={active}
                  onClick={() => setStatusFilter(option.value)}
                >
                  <span
                    className={`bx-draw-status-filter__dot is-${option.value}`}
                    aria-hidden="true"
                  />
                  <span className="bx-draw-status-filter__label">{option.label}</span>
                  <span className="bx-draw-status-filter__count">{counts[option.value]}</span>
                </button>
              )
            })}
          </div>
          <button type="button" className="bx-btn bx-btn--ghost" onClick={onRefresh}>
            Atualizar
          </button>
          <Link className="bx-btn bx-btn--secondary" to={adminSectionPath('draw')}>
            Novo sorteio →
          </Link>
        </div>
      </div>

      {filtered.length === 0 ? (
        <AdminEmptyState
          title="Nenhum sorteio realizado ainda."
          description="Prepare um sorteio na seção Novo sorteio para registrar o histórico."
          action={
            <Link className="bx-btn bx-btn--primary" to={adminSectionPath('draw')}>
              Abrir novo sorteio
            </Link>
          }
        />
      ) : (
        <div className="bx-admin-table bx-draw-history-table" role="table" aria-label="Histórico">
          <div className="bx-admin-table__head" role="row">
            <span role="columnheader">Sorteio</span>
            <span role="columnheader">Campanha</span>
            <span role="columnheader">Prêmio</span>
            <span role="columnheader">Participantes</span>
            <span role="columnheader">Vencedor</span>
            <span role="columnheader">Data</span>
            <span role="columnheader">Status</span>
          </div>
          {filtered.map((draw) => (
            <div key={draw.id} className="bx-admin-table__row" role="row">
              <span role="cell">
                <strong>{draw.code}</strong>
              </span>
              <span role="cell">{draw.seasonLabel}</span>
              <span role="cell">
                <button
                  type="button"
                  className="bx-bullstart-link bx-bullstart-link--name"
                  onClick={() => setDetailDraw(draw)}
                >
                  {draw.prizeUnits > 1 ? `${draw.prizeUnits}× ` : ''}
                  {draw.prizeName}
                </button>
              </span>
              <span role="cell">{draw.participantCount}</span>
              <span role="cell">
                {draw.winners.length > 0
                  ? draw.winners.map((winner) => winner.name).join(', ')
                  : draw.winnerName ?? '—'}
              </span>
              <span role="cell">
                {draw.drawnAt
                  ? formatBullstartDateTime(draw.drawnAt)
                  : draw.preparedAt
                    ? formatBullstartDateTime(draw.preparedAt)
                    : '—'}
              </span>
              <span role="cell">
                <StatusBadge
                  label={draw.status === 'completed' ? 'Concluído' : 'Preparado'}
                  tone={draw.status === 'completed' ? 'completed' : 'prepared'}
                />
              </span>
            </div>
          ))}
        </div>
      )}

      {detailDraw ? (
        <DrawPrizeDetailModal
          draw={detailDraw}
          onClose={() => setDetailDraw(null)}
          onUpdated={(updated) => {
            setDetailDraw(updated)
            onRefresh()
          }}
        />
      ) : null}
    </section>
  )
}

function CouponsTable({ onEdit }: { onEdit: (coupon: AdminCouponRow) => void }) {
  return (
    <div
      className="bx-admin-table bx-admin-table--manage bx-admin-table--coupons"
      role="table"
      aria-label="Cupons"
    >
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
          <span role="cell" className="bx-admin-table__entity">
            <strong>{coupon.name}</strong>
            <em className="bx-admin-table__sub">{coupon.valueLabel}</em>
          </span>
          <span role="cell">
            <code>{coupon.code}</code>
          </span>
          <span role="cell">
            <em className={`bx-admin-badge bx-admin-badge--${coupon.status}`}>
              {adminCouponStatusLabel[coupon.status]}
            </em>
          </span>
          <span role="cell" className="bx-admin-table__usage">
            <strong>
              {coupon.redemptions}/{coupon.limit}
            </strong>
            <span className="bx-admin-meter" aria-hidden="true">
              <i style={{ width: `${Math.min(100, (coupon.redemptions / coupon.limit) * 100)}%` }} />
            </span>
          </span>
          <span role="cell" className="bx-admin-table__rules">
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
      <div className="bx-admin-campaigns__stats" aria-label="Resumo dos sorteios">
        <article>
          <span>Ativos</span>
          <strong>{activeCount}</strong>
        </article>
        <article>
          <span>Pausados</span>
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
          <p className="bx-admin-empty">Nenhum sorteio cadastrado.</p>
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
                  {campaign.status === 'active' ? 'Ativo' : 'Pausado'}
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
                <p className="bx-admin-campaign__cta">CTA · {campaign.ctaUrl}</p>
                <div className="bx-admin-campaign__progress" aria-hidden="true">
                  <span style={{ width: `${campaign.progress}%` }} />
                </div>
                <button
                  type="button"
                  className="bx-admin-campaign__edit"
                  onClick={() => onEdit(campaign)}
                >
                  Editar sorteio
                </button>
              </div>
            </article>
          ))}
      </div>
    </div>
  )
}

