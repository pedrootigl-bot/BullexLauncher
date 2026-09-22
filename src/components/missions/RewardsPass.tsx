import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  formatSeasonEndsLabel,
  getInitiallyClaimedLevels,
  getNextPassReward,
  getPassRewardPoints,
  getSeasonDaysLeft,
  mockPassTracks,
  msUntilNextLocalMidnight,
  resolvePassRewardState,
  seasonMissionCtas,
  type JourneyProgress,
  type Mission,
  type PassReward,
  type PassRewardKind,
  type PassRewardState,
} from '../../data/missionsMock'
import { PremiumUpsellModal } from './PremiumUpsellModal'

type RewardsPassProps = {
  journey: JourneyProgress
  missions: Mission[]
  onContinue?: (mission: Mission) => void
  onGainPoints?: (points: number) => void
}

const freeTrack = mockPassTracks.find((track) => track.id === 'free')
const premiumTrack = mockPassTracks.find((track) => track.id === 'premium')

const PASS_ICON_VERSION = 'v3'

const PASS_KIND_IMAGES: Record<PassRewardKind, string> = {
  balance: `/media/pass-icons/balance.png?${PASS_ICON_VERSION}`,
  ticket: `/media/pass-icons/ticket.png?${PASS_ICON_VERSION}`,
  riskfree: `/media/pass-icons/riskfree.png?${PASS_ICON_VERSION}`,
  cashback: `/media/pass-icons/cashback.png?${PASS_ICON_VERSION}`,
  xpboost: `/media/pass-icons/xpboost.png?${PASS_ICON_VERSION}`,
  bonus: `/media/pass-icons/bonus.png?${PASS_ICON_VERSION}`,
  coupon: `/media/pass-icons/coupon.png?${PASS_ICON_VERSION}`,
  vip: `/media/pass-icons/vip.png?${PASS_ICON_VERSION}`,
  multiplier: `/media/pass-icons/multiplier.png?${PASS_ICON_VERSION}`,
  badge: `/media/pass-icons/badge.png?${PASS_ICON_VERSION}`,
  avatar: `/media/pass-icons/avatar.png?${PASS_ICON_VERSION}`,
  points: `/media/pass-icons/points.png?${PASS_ICON_VERSION}`,
}

export function RewardsPass({
  journey,
  missions,
  onContinue,
  onGainPoints,
}: RewardsPassProps) {
  const [premiumModal, setPremiumModal] = useState<{ rewardTitle?: string } | null>(null)
  const [hasPremium, setHasPremium] = useState(true)
  const [claimedFreeLevels, setClaimedFreeLevels] = useState<number[]>(() =>
    freeTrack ? getInitiallyClaimedLevels(freeTrack) : [],
  )
  const [claimedPremiumLevels, setClaimedPremiumLevels] = useState<number[]>(() =>
    premiumTrack ? getInitiallyClaimedLevels(premiumTrack) : [],
  )
  const [claimingLevel, setClaimingLevel] = useState<number | null>(null)
  const [claimingAll, setClaimingAll] = useState(false)
  const [seasonDaysLeft, setSeasonDaysLeft] = useState(() =>
    getSeasonDaysLeft(journey.seasonEndsAt),
  )

  useEffect(() => {
    let cancelled = false
    let timeoutId = 0

    function refreshDaysLeft() {
      if (!cancelled) setSeasonDaysLeft(getSeasonDaysLeft(journey.seasonEndsAt))
    }

    function scheduleNextDay() {
      timeoutId = window.setTimeout(() => {
        refreshDaysLeft()
        scheduleNextDay()
      }, msUntilNextLocalMidnight())
    }

    refreshDaysLeft()
    scheduleNextDay()

    function onVisibility() {
      if (document.visibilityState === 'visible') refreshDaysLeft()
    }

    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [journey.seasonEndsAt])

  const seasonEndsLabel = formatSeasonEndsLabel(seasonDaysLeft)

  const pointsPercent =
    journey.targetPoints > 0
      ? Math.min(100, Math.round((journey.currentPoints / journey.targetPoints) * 100))
      : 0

  const passLevels = freeTrack?.rewards.map((reward) => reward.level) ?? []
  const nextPassReward = getNextPassReward(journey.level, { hasPremium })
  const nearUnlock = pointsPercent >= 70

  const missionsDone = useMemo(
    () =>
      missions.filter(
        (mission) =>
          mission.status === 'claimed' ||
          (mission.target > 0 && mission.current >= mission.target),
      ).length,
    [missions],
  )

  const rewardsClaimed = claimedFreeLevels.length + claimedPremiumLevels.length

  const claimableRewards = useMemo(() => {
    const freeLevels: number[] = []
    const premiumLevels: number[] = []
    let bonusPoints = 0

    for (const level of passLevels) {
      const freeReward = freeTrack?.rewards.find((reward) => reward.level === level)
      if (
        freeReward &&
        resolvePassRewardState(freeReward, journey.level, claimedFreeLevels) === 'claimable'
      ) {
        freeLevels.push(level)
        bonusPoints += getPassRewardPoints(freeReward)
      }

      if (!hasPremium) continue

      const premiumReward = premiumTrack?.rewards.find((reward) => reward.level === level)
      if (
        premiumReward &&
        resolvePassRewardState(premiumReward, journey.level, claimedPremiumLevels) === 'claimable'
      ) {
        premiumLevels.push(level)
        bonusPoints += getPassRewardPoints(premiumReward)
      }
    }

    return {
      freeLevels,
      premiumLevels,
      bonusPoints,
      total: freeLevels.length + premiumLevels.length,
    }
  }, [passLevels, journey.level, claimedFreeLevels, claimedPremiumLevels, hasPremium])

  function openPremiumUpsell(rewardTitle?: string) {
    setPremiumModal({ rewardTitle })
  }

  function handleActivatePremium() {
    setHasPremium(true)
    setPremiumModal(null)
  }

  function handleClaimAll() {
    if (claimingAll || claimingLevel !== null || claimableRewards.total === 0) return

    const { freeLevels, premiumLevels, bonusPoints } = claimableRewards
    setClaimingAll(true)

    window.setTimeout(() => {
      if (freeLevels.length > 0) {
        setClaimedFreeLevels((current) => [...new Set([...current, ...freeLevels])])
      }
      if (premiumLevels.length > 0) {
        setClaimedPremiumLevels((current) => [...new Set([...current, ...premiumLevels])])
      }
      setClaimingAll(false)
      if (bonusPoints > 0) onGainPoints?.(bonusPoints)
    }, 520)
  }

  function handleClaimAtLevel(level: number, source: 'free' | 'premium') {
    if (claimingAll || claimingLevel === level) return

    if (source === 'premium' && !hasPremium) {
      const premiumReward = premiumTrack?.rewards.find((reward) => reward.level === level)
      openPremiumUpsell(
        premiumReward ? `${premiumReward.title} ${premiumReward.subtitle}` : undefined,
      )
      return
    }

    const freeReward = freeTrack?.rewards.find((reward) => reward.level === level)
    const premiumReward = premiumTrack?.rewards.find((reward) => reward.level === level)

    const canClaimFree =
      !!freeReward &&
      !claimedFreeLevels.includes(level) &&
      resolvePassRewardState(freeReward, journey.level, claimedFreeLevels) === 'claimable'

    const canClaimPremium =
      hasPremium &&
      !!premiumReward &&
      !claimedPremiumLevels.includes(level) &&
      resolvePassRewardState(premiumReward, journey.level, claimedPremiumLevels) === 'claimable'

    if (!canClaimFree && !canClaimPremium) return

    let bonusPoints = 0
    if (canClaimFree && freeReward) bonusPoints += getPassRewardPoints(freeReward)
    if (canClaimPremium && premiumReward) bonusPoints += getPassRewardPoints(premiumReward)

    setClaimingLevel(level)
    window.setTimeout(() => {
      if (canClaimFree) {
        setClaimedFreeLevels((current) =>
          current.includes(level) ? current : [...current, level],
        )
      }
      if (canClaimPremium) {
        setClaimedPremiumLevels((current) =>
          current.includes(level) ? current : [...current, level],
        )
      }
      setClaimingLevel(null)
      if (bonusPoints > 0) onGainPoints?.(bonusPoints)
    }, 480)
  }

  return (
    <section className="bs-bp" aria-labelledby="bs-bp-title">
      <header className="bs-bp__header">
        <div className="bs-bp__header-copy">
          <p className="bs-bp__eyebrow">Evolua · Opere · Conquiste</p>
          <h1 id="bs-bp-title">Passe de Recompensas</h1>
          <p className="bs-bp__lead">
            Complete missões, acumule pontos e desbloqueie benefícios para evoluir sua experiência na
            Bullex.
          </p>
        </div>
      </header>

      <section className="bs-bp-progress" aria-label="Progresso do usuário">
        <div className="bs-bp-progress__main">
          <div className="bs-bp-progress__level">
            <span>Nível atual</span>
            <strong>{String(journey.level).padStart(2, '0')}</strong>
          </div>

          <div className="bs-bp-progress__meter">
            <div className="bs-bp-progress__xp">
              <strong>
                {journey.currentPoints.toLocaleString('pt-BR')} /{' '}
                {journey.targetPoints.toLocaleString('pt-BR')} pontos
              </strong>
              <span>
                Faltam {journey.remainingPoints.toLocaleString('pt-BR')} pontos para o nível{' '}
                {journey.level + 1}
              </span>
            </div>
            <div
              className={`bs-bp-progress__bar${nearUnlock ? ' is-near' : ''}`}
              role="progressbar"
              aria-valuenow={journey.currentPoints}
              aria-valuemin={0}
              aria-valuemax={journey.targetPoints}
            >
              <span style={{ width: `${pointsPercent}%` }} />
            </div>
            {nextPassReward ? (
              <p className="bs-bp-progress__next">
                Próxima: <b>{nextPassReward.title}</b>
                {nextPassReward.subtitle ? ` · ${nextPassReward.subtitle}` : ''}
              </p>
            ) : null}
          </div>
        </div>

        <div className="bs-bp-progress__season" aria-label="Season 1">
          <SeasonClockIcon />
          <strong>Season 1</strong>
          <span aria-hidden="true">·</span>
          <em>{seasonEndsLabel}</em>
        </div>
      </section>

      <div className="bs-bp__layout">
        <div className="bs-bp__tracks-col">
          <section
            className={`bs-bp-grid${hasPremium ? ' is-premium-active' : ''}`}
            aria-label="Níveis BullPass"
          >
          <header className="bs-bp-grid__head">
            <div>
              <h2>Níveis BullPass</h2>
              <p>
                {missionsDone}/{missions.length} missões · {rewardsClaimed} resgates
              </p>
            </div>
            <div className="bs-bp-grid__actions">
              <button
                type="button"
                className="bs-bp-claim-all"
                onClick={handleClaimAll}
                disabled={claimableRewards.total === 0 || claimingAll || claimingLevel !== null}
              >
                {claimingAll
                  ? 'Resgatando…'
                  : claimableRewards.total > 0
                    ? `Resgatar todas (${claimableRewards.total})`
                    : 'Resgatar todas'}
              </button>
              {!hasPremium ? (
                <button type="button" className="bs-bp-track__cta" onClick={() => openPremiumUpsell()}>
                  Ativar Premium
                </button>
              ) : null}
            </div>
          </header>

          <div className="bs-bp-grid__scroll">
            <div className="bs-bp-grid__levels" aria-hidden="true">
              <span className="bs-bp-grid__lane-spacer" />
              {passLevels.map((level, index) => (
                <span key={level} className="bs-bp-grid__level-cell">
                  {index > 0 ? (
                    <i
                      className={`bs-bp-grid__connector${level - 1 <= journey.level ? ' is-filled' : ''}`}
                    />
                  ) : null}
                  <b
                    className={`bs-bp-grid__level${level === journey.level ? ' is-current' : ''}${level <= journey.level ? ' is-reached' : ''}`}
                  >
                    {String(level).padStart(2, '0')}
                  </b>
                </span>
              ))}
            </div>

            <div className="bs-bp-grid__row is-free" role="list" aria-label="BullPass">
              <div className="bs-bp-grid__lane">
                <span className="bs-bp-grid__lane-icon" aria-hidden="true">
                  <TrackLaneIcon premium={false} />
                </span>
                <strong>BullPass</strong>
                <span>Todo trader evolui por aqui.</span>
              </div>
              {passLevels.map((level) => {
                const reward = freeTrack?.rewards.find((item) => item.level === level)
                if (!reward) {
                  return <div key={`free-empty-${level}`} className="bs-bp-node is-empty" />
                }
                const state = resolvePassRewardState(reward, journey.level, claimedFreeLevels)
                return (
                  <RewardCard
                    key={`free-${level}`}
                    reward={{ ...reward, state }}
                    status={state}
                    premium={false}
                    current={level === journey.level}
                    claiming={
                      (claimingAll && state === 'claimable') ||
                      (claimingLevel === level && state !== 'claimed')
                    }
                    onClaim={() => handleClaimAtLevel(level, 'free')}
                  />
                )
              })}
            </div>

            <div className="bs-bp-grid__row is-premium" role="list" aria-label="BullPass Premium">
              <div className="bs-bp-grid__lane is-premium">
                <span className="bs-bp-grid__lane-icon" aria-hidden="true">
                  <TrackLaneIcon premium />
                </span>
                <strong>BullPass Premium</strong>
                <span>Benefícios adicionais.</span>
              </div>
              {passLevels.map((level) => {
                const reward = premiumTrack?.rewards.find((item) => item.level === level)
                if (!reward) {
                  return <div key={`premium-empty-${level}`} className="bs-bp-node is-empty" />
                }
                const state = resolvePassRewardState(reward, journey.level, claimedPremiumLevels)
                return (
                  <RewardCard
                    key={`premium-${level}`}
                    reward={{ ...reward, state }}
                    status={state}
                    premium
                    current={level === journey.level}
                    claiming={
                      (claimingAll && state === 'claimable') ||
                      (claimingLevel === level && state !== 'claimed')
                    }
                    onClaim={() => handleClaimAtLevel(level, 'premium')}
                  />
                )
              })}
            </div>
          </div>
        </section>
        </div>

        <aside className={`bs-bp-next${nearUnlock ? ' is-near' : ''}`} aria-label="Próxima recompensa">
          {nextPassReward ? (
            <>
              <p className="bs-bp-next__label">Próxima recompensa</p>
              <span className="bs-bp-next__level">
                Nível {String(nextPassReward.level).padStart(2, '0')}
              </span>
              <div className={`bs-bp-next__visual bs-bp-next__visual--${nextPassReward.kind}`}>
                <img
                  className="bs-bp-next__stage"
                  src="/media/pass-next/pedestal.jpg"
                  alt=""
                  width={320}
                  height={420}
                  loading="lazy"
                />
                <img
                  className="bs-bp-next__reward"
                  src={
                    nextPassReward.kind === 'riskfree'
                      ? '/media/pass-next/shield-riskfree.png'
                      : PASS_KIND_IMAGES[nextPassReward.kind]
                  }
                  alt=""
                  width={180}
                  height={180}
                  loading="lazy"
                />
              </div>
              <strong className="bs-bp-next__title">{nextPassReward.title}</strong>
              <em className="bs-bp-next__subtitle">{nextPassReward.subtitle}</em>
              <ul className="bs-bp-next__benefits">
                {nextPassReward.benefits.map((benefit) => (
                  <li key={benefit}>
                    <CheckMiniIcon />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <p className="bs-bp-next__meta">
                Faltam <b>{journey.remainingPoints.toLocaleString('pt-BR')} pontos</b>
              </p>
              <div className="bs-bp-next__bar" aria-hidden="true">
                <span style={{ width: `${pointsPercent}%` }} />
              </div>
              <div className="bs-bp-next__tags" aria-label="Tags da recompensa">
                {nextPassReward.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
                {hasPremium && nextPassReward.premiumTitle ? (
                  <span className="is-premium">PREMIUM</span>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <p className="bs-bp-next__label">Passe completo</p>
              <strong className="bs-bp-next__title">Temporada finalizada</strong>
              <em className="bs-bp-next__subtitle">Você alcançou o último nível.</em>
            </>
          )}
        </aside>
      </div>

      <section className="bs-bp-missions" aria-labelledby="bs-bp-missions-title">
        <div className="bs-bp-missions__head">
          <div>
            <h2 id="bs-bp-missions-title">Missões da Temporada</h2>
            <p>Essas missões alimentam os pontos do passe.</p>
          </div>
        </div>

        {missions.length === 0 ? (
          <p className="bs-bp-empty">Nenhuma missão ativa no momento. Volte amanhã para novas metas.</p>
        ) : (
          <div className="bs-bp-missions__grid">
            {missions.map((mission) => (
              <SeasonMissionCard
                key={mission.id}
                mission={mission}
                ctaLabel={seasonMissionCtas[mission.id] ?? 'Continuar'}
                onContinue={onContinue}
              />
            ))}
          </div>
        )}
      </section>

      <footer className="bs-bp-footer">
        <div className="bs-bp-footer__copy">
          <span className="bs-bp-footer__trophy" aria-hidden="true">
            <TrophyIcon />
          </span>
          <div>
            <h3>Como ganhar pontos?</h3>
            <p>
              Complete missões disponíveis durante a temporada para acumular pontos e avançar no Passe de
              Recompensas.
            </p>
          </div>
        </div>
        <div className="bs-bp-footer__links">
          <button type="button" className="bs-bp-footer__link">
            Ver regras da temporada →
          </button>
          <Link to="/historico" className="bs-bp-footer__history">
            Ver histórico de recompensas →
          </Link>
        </div>
      </footer>

      {premiumModal ? (
        <PremiumUpsellModal
          rewardTitle={premiumModal.rewardTitle}
          onClose={() => setPremiumModal(null)}
          onActivate={handleActivatePremium}
        />
      ) : null}
    </section>
  )
}

function RewardCard({
  reward,
  status,
  premium,
  current,
  claiming,
  onClaim,
}: {
  reward: PassReward
  status: PassRewardState
  premium: boolean
  current: boolean
  claiming: boolean
  onClaim: () => void
}) {
  const actionLabel =
    status === 'claimable'
      ? claiming
        ? '…'
        : 'Resgatar'
      : status === 'claimed'
        ? 'Resgatado'
        : 'Bloqueado'

  return (
    <article
      className={`bs-bp-node bs-bp-node--${status}${premium ? ' is-premium' : ''}${current ? ' is-current' : ''}${claiming ? ' is-claiming' : ''}`}
      role="listitem"
      aria-label={`${reward.title} — ${actionLabel}`}
    >
      <div className={`bs-bp-node__icon bs-bp-node__icon--${reward.kind}`} aria-hidden="true">
        <img
          className="bs-bp-node__art"
          src={PASS_KIND_IMAGES[reward.kind]}
          alt=""
          width={88}
          height={88}
          loading="lazy"
        />
        {status === 'locked' ? (
          <span className="bs-bp-node__lock">
            <LockIcon />
          </span>
        ) : null}
        {status === 'claimed' ? (
          <span className="bs-bp-node__check">
            <CheckMiniIcon />
          </span>
        ) : null}
      </div>

      <strong>{reward.title}</strong>
      <p>{reward.subtitle}</p>

      {status === 'claimable' ? (
        <button type="button" onClick={onClaim} disabled={claiming}>
          {actionLabel}
        </button>
      ) : (
        <span className={`bs-bp-node__state is-${status}`}>{actionLabel}</span>
      )}
    </article>
  )
}

function SeasonMissionCard({
  mission,
  ctaLabel,
  onContinue,
}: {
  mission: Mission
  ctaLabel: string
  onContinue?: (mission: Mission) => void
}) {
  const complete = mission.target > 0 && mission.current >= mission.target
  const claimed = mission.status === 'claimed'
  const percent =
    mission.target > 0 ? Math.min(100, Math.round((mission.current / mission.target) * 100)) : 0

  const progressLabel =
    mission.unit === 'currency'
      ? `${mission.current.toLocaleString('pt-BR')} / ${mission.target.toLocaleString('pt-BR')}`
      : `${mission.current}/${mission.target}`

  return (
    <article
      className={`bs-bp-mission${complete || claimed ? ' is-done' : ''}${claimed ? ' is-claimed' : ''}`}
    >
      <div className="bs-bp-mission__media">
        <img
          src={mission.imageSrc}
          alt={mission.title}
          width={800}
          height={300}
          loading="lazy"
        />
      </div>
      <div className="bs-bp-mission__top">
        <span>{mission.code}</span>
        <em>+{mission.points} pontos</em>
      </div>
      <h3>{mission.title}</h3>
      <p>{mission.description}</p>
      <div className="bs-bp-mission__bar" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </div>
      <div className="bs-bp-mission__meta">
        <strong>{claimed || complete ? 'Concluída' : progressLabel}</strong>
        <button
          type="button"
          disabled={claimed}
          onClick={() => onContinue?.(mission)}
        >
          {claimed ? 'Resgatada' : complete ? 'Resgatar' : ctaLabel}
        </button>
      </div>
    </article>
  )
}

function TrackLaneIcon({ premium }: { premium: boolean }) {
  if (premium) {
    return (
      <svg viewBox="0 0 48 48" width="36" height="36" fill="none" aria-hidden="true">
        <path
          d="M24 6 28.8 16.2 40 17.4 31.6 25l2.4 11.4L24 30.8 14 36.4l2.4-11.4L8 17.4l11.2-1.2L24 6Z"
          fill="currentColor"
          fillOpacity="0.18"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M16 40h16v2.2a1.8 1.8 0 0 1-1.8 1.8H17.8A1.8 1.8 0 0 1 16 42.2V40Z"
          fill="currentColor"
          fillOpacity="0.35"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M12 22.5 17 34h14l5-11.5-6.5 3.2L24 16l-5.5 9.7L12 22.5Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 48 48" width="36" height="36" fill="none" aria-hidden="true">
      <path
        d="M24 5 38 11.2v11.4c0 9.4-6.1 16.2-14 19.4-7.9-3.2-14-10-14-19.4V11.2L24 5Z"
        fill="currentColor"
        fillOpacity="0.16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M24 14.5 26.6 20l6 .5-4.6 3.8 1.4 5.8L24 27.2l-5.4 3 1.4-5.9-4.6-3.8 6-.5L24 14.5Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M17 34h14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  )
}

function SeasonClockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.2L15 16" strokeLinecap="round" />
    </svg>
  )
}

function CheckMiniIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
      <path d="m5.5 12.5 4 4 9-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path d="M8 6H5.5A2.5 2.5 0 0 0 5.5 11H8M16 6h2.5A2.5 2.5 0 0 1 18.5 11H16" />
      <path d="M12 13v3M9 20h6M10 17h4" strokeLinecap="round" />
    </svg>
  )
}
