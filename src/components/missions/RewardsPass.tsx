import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getInitiallyClaimedLevels,
  getNextPassReward,
  getPassRewardPoints,
  mockPassTracks,
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

const STATUS_LABEL: Record<PassRewardState | 'next', string> = {
  claimed: 'Resgatado',
  claimable: 'Desbloqueado',
  locked: 'Bloqueado',
  next: 'Próximo',
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
  }, [
    passLevels,
    journey.level,
    claimedFreeLevels,
    claimedPremiumLevels,
    hasPremium,
  ])

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
                Próxima recompensa: <b>{nextPassReward.title}</b> · {nextPassReward.subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <ul className="bs-bp-stats">
          <li>
            <span>Nível</span>
            <strong>{String(journey.level).padStart(2, '0')}</strong>
          </li>
          <li>
            <span>Pontos</span>
            <strong>{journey.currentPoints.toLocaleString('pt-BR')}</strong>
          </li>
          <li>
            <span>Missões</span>
            <strong>
              {missionsDone}/{missions.length}
            </strong>
          </li>
          <li>
            <span>Recompensas</span>
            <strong>{rewardsClaimed}</strong>
          </li>
        </ul>
      </section>

      <div className="bs-bp__layout">
        <div className="bs-bp__tracks-col">
          <div className="bs-bp__season-mark" aria-label="Season 1">
            <strong className="bs-bp__season-name">Season 1</strong>
            <span className="bs-bp__season-ends">Acaba em 10 dias</span>
          </div>

          <section
            className={`bs-bp-grid${hasPremium ? ' is-premium-active' : ''}`}
            aria-label="Trilhas do passe"
          >
          <header className="bs-bp-grid__head">
            <div>
              <h2>Trilhas do passe</h2>
              <p>Gratuita e Premium no mesmo progresso de níveis.</p>
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
                <strong>BullPass</strong>
                <span>Todo trader evolui por aqui.</span>
              </div>
              {passLevels.map((level) => {
                const reward = freeTrack?.rewards.find((item) => item.level === level)
                if (!reward) {
                  return <div key={`free-empty-${level}`} className="bs-bp-node is-empty" />
                }
                const state = resolvePassRewardState(reward, journey.level, claimedFreeLevels)
                const uiStatus: PassRewardState | 'next' =
                  level === journey.level + 1 && state === 'locked' ? 'next' : state
                return (
                  <RewardCard
                    key={`free-${level}`}
                    reward={{ ...reward, state }}
                    status={uiStatus}
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
                <strong>BullPass Premium</strong>
                <span>Benefícios adicionais.</span>
              </div>
              {passLevels.map((level) => {
                const reward = premiumTrack?.rewards.find((item) => item.level === level)
                if (!reward) {
                  return <div key={`premium-empty-${level}`} className="bs-bp-node is-empty" />
                }
                const state = resolvePassRewardState(reward, journey.level, claimedPremiumLevels)
                const uiStatus: PassRewardState | 'next' =
                  level === journey.level + 1 && state === 'locked' ? 'next' : state
                return (
                  <RewardCard
                    key={`premium-${level}`}
                    reward={{ ...reward, state }}
                    status={uiStatus}
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
              <span className="bs-bp-next__level">Nível {String(nextPassReward.level).padStart(2, '0')}</span>
              <div className={`bs-bp-next__icon bs-bp-next__icon--${nextPassReward.kind}`}>
                <PassIcon kind={nextPassReward.kind} />
              </div>
              <strong className="bs-bp-next__title">{nextPassReward.title}</strong>
              <em className="bs-bp-next__subtitle">{nextPassReward.subtitle}</em>
              <p className="bs-bp-next__meta">
                Faltam <b>{journey.remainingPoints.toLocaleString('pt-BR')} pontos</b>
              </p>
              <div className="bs-bp-next__bar" aria-hidden="true">
                <span style={{ width: `${pointsPercent}%` }} />
              </div>
              {hasPremium && nextPassReward.premiumTitle ? (
                <small className="bs-bp-next__premium">Premium · {nextPassReward.premiumTitle}</small>
              ) : null}
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
      </section>

      <footer className="bs-bp-footer">
        <div>
          <h3>Como ganhar pontos?</h3>
          <p>
            Complete missões disponíveis durante a temporada para acumular pontos e avançar no Passe de
            Recompensas.
          </p>
          <button type="button" className="bs-bp-footer__link">
            Ver regras da temporada →
          </button>
        </div>
        <Link to="/historico" className="bs-bp-footer__history">
          Ver histórico de recompensas
        </Link>
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
  status: PassRewardState | 'next'
  premium: boolean
  current: boolean
  claiming: boolean
  onClaim: () => void
}) {
  return (
    <article
      className={`bs-bp-node bs-bp-node--${status}${premium ? ' is-premium' : ''}${current ? ' is-current' : ''}${claiming ? ' is-claiming' : ''}`}
      role="listitem"
    >
      <header>
        <em>{STATUS_LABEL[status]}</em>
      </header>

      <div className={`bs-bp-node__icon bs-bp-node__icon--${reward.kind}`} aria-hidden="true">
        <PassIcon kind={reward.kind} />
      </div>

      <strong>{reward.title}</strong>
      <p>{reward.subtitle}</p>

      {reward.state === 'claimable' ? (
        <button type="button" onClick={onClaim} disabled={claiming}>
          {claiming ? '…' : 'Resgatar'}
        </button>
      ) : null}

      {reward.state === 'claimed' ? <span className="bs-bp-node__done">Resgatado ✓</span> : null}
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

function PassIcon({ kind }: { kind: PassRewardKind }) {
  const props = {
    viewBox: '0 0 24 24',
    width: 22,
    height: 22,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (kind) {
    case 'balance':
      return (
        <svg {...props}>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M3 10h18" />
          <path d="M8 15h3" />
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
          <path d="M12 3 19 6.5v5.2c0 4.4-2.9 7.5-7 8.8-4.1-1.3-7-4.4-7-8.8V6.5L12 3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )
    case 'cashback':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v8M9.5 10.5c.5-1 1.4-1.5 2.5-1.5s2 .6 2 1.7c0 2.3-4.5 1.2-4.5 3.6 0 1 .9 1.7 2.5 1.7s2-.5 2.4-1.3" />
        </svg>
      )
    case 'xpboost':
    case 'points':
      return (
        <svg {...props}>
          <path d="M12 3 14.5 9.5 21.5 10.2 16 14.4 17.4 21.3 12 17.8 6.6 21.3 8 14.4 2.5 10.2 9.5 9.5 12 3Z" />
        </svg>
      )
    case 'bonus':
      return (
        <svg {...props}>
          <path d="M8 10h8v10H8z" />
          <path d="M7 10h10l-1-4H8l-1 4Z" />
          <path d="M12 6V4" />
        </svg>
      )
    case 'coupon':
      return (
        <svg {...props}>
          <path d="M4 9.5A2.5 2.5 0 0 0 6.5 7h11A2.5 2.5 0 0 0 20 9.5v1a1.5 1.5 0 0 1 0 3v1A2.5 2.5 0 0 0 17.5 17h-11A2.5 2.5 0 0 0 4 14.5v-1a1.5 1.5 0 0 1 0-3v-1Z" />
        </svg>
      )
    case 'vip':
      return (
        <svg {...props}>
          <path d="M4 9 7.5 16h9L20 9l-4 2-4-5-4 5-4-2Z" />
          <path d="M7.5 16h9v2.5a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V16Z" />
        </svg>
      )
    case 'multiplier':
      return (
        <svg {...props}>
          <path d="M13 2 6 14h5l-1 8 8-12h-5l1-8Z" />
        </svg>
      )
    case 'badge':
      return (
        <svg {...props}>
          <circle cx="12" cy="10" r="5.5" />
          <path d="m9.5 15 1 6 1.5-2.5L13.5 21l1-6" />
        </svg>
      )
    case 'avatar':
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5.5 19.5c1.4-3.2 3.8-4.8 6.5-4.8s5.1 1.6 6.5 4.8" />
        </svg>
      )
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}
