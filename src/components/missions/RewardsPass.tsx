import { useState } from 'react'
import type { CSSProperties } from 'react'
import {
  mockNextPassReward,
  mockPassTracks,
  seasonMissionCtas,
  seasonMissionIcons,
  type JourneyProgress,
  type Mission,
  type PassReward,
  type PassRewardKind,
  type PassTrack,
  type SeasonMissionIcon,
} from '../../data/missionsMock'
import { PremiumUpsellModal } from './PremiumUpsellModal'

type RewardsPassProps = {
  journey: JourneyProgress
  missions: Mission[]
  onContinue?: (mission: Mission) => void
}

export function RewardsPass({ journey, missions, onContinue }: RewardsPassProps) {
  const [premiumModal, setPremiumModal] = useState<{ rewardTitle?: string } | null>(null)
  const [claimedFreeLevels, setClaimedFreeLevels] = useState<number[]>([])
  const [claimingLevel, setClaimingLevel] = useState<number | null>(null)
  const pointsPercent =
    journey.targetPoints > 0
      ? Math.min(100, Math.round((journey.currentPoints / journey.targetPoints) * 100))
      : 0

  const seasonParts = journey.seasonLabel.split('·').map((part) => part.trim())

  function openPremiumUpsell(rewardTitle?: string) {
    setPremiumModal({ rewardTitle })
  }

  function handleActivatePremium() {
    // Layout/mock: aqui seguiria o fluxo Premium da corretora.
    console.log('ativar premium na corretora')
    setPremiumModal(null)
  }

  function handleClaimFree(level: number) {
    if (claimedFreeLevels.includes(level) || claimingLevel === level) return

    setClaimingLevel(level)
    window.setTimeout(() => {
      setClaimedFreeLevels((current) =>
        current.includes(level) ? current : [...current, level],
      )
      setClaimingLevel(null)
    }, 620)
  }

  return (
    <section className="bs-pass" aria-labelledby="bs-pass-title">
      <header className="bs-pass__intro">
        <p className="bs-pass__motto">EVOLUA. OPERE. CONQUISTE.</p>
        <h1 id="bs-pass-title">Passe de Recompensas</h1>
        <p className="bs-pass__lead">
          Seu progresso mensal gera grandes conquistas na Bullex.
        </p>
      </header>

      <div className="bs-pass__board">
        <div className="bs-pass__board-main">
          <div className="bs-pass__status" aria-label="Progresso da temporada">
            <article className="bs-pass-season">
              <p>Temporada Atual</p>
              <strong>{seasonParts[1] ?? seasonParts[0]}</strong>
            </article>

            <article className="bs-pass-level">
              <div className="bs-pass-level__badge" aria-hidden="true">
                <HexBadge />
                <strong>{journey.level}</strong>
              </div>

              <div className="bs-pass-level__body">
                <p className="bs-pass-level__label">
                  Nível atual <span>{journey.level}</span>
                </p>
                <div
                  className="bs-pass-level__bar"
                  role="progressbar"
                  aria-valuenow={journey.currentPoints}
                  aria-valuemin={0}
                  aria-valuemax={journey.targetPoints}
                  aria-label="Progresso de pontos"
                >
                  <span style={{ width: `${pointsPercent}%` }} />
                </div>
                <div className="bs-pass-level__meta">
                  <strong>
                    {journey.currentPoints.toLocaleString('pt-BR')} /{' '}
                    {journey.targetPoints.toLocaleString('pt-BR')} pontos
                  </strong>
                  <span>
                    Faltam {journey.remainingPoints.toLocaleString('pt-BR')} pontos para o nível{' '}
                    {journey.level + 1}
                  </span>
                </div>
              </div>
            </article>

            <article className="bs-pass-timer">
              <span className="bs-pass-timer__icon" aria-hidden="true">
                <ClockIcon />
              </span>
              <div className="bs-pass-timer__copy">
                <p>Tempo restante</p>
                <strong>
                  <em>{journey.daysLeft}</em>
                  <span>dias</span>
                </strong>
                <span>até o fim da temporada</span>
              </div>
            </article>
          </div>

          <div className="bs-pass__tracks">
            {mockPassTracks.map((track) => (
              <RewardTrack
                key={track.id}
                track={track}
                currentLevel={journey.level}
                claimedFreeLevels={claimedFreeLevels}
                claimingLevel={claimingLevel}
                onPremiumAction={openPremiumUpsell}
                onClaimFree={handleClaimFree}
              />
            ))}
          </div>
        </div>

        <aside className="bs-pass-next" aria-label="Próxima recompensa">
          <div className="bs-pass-next__head">
            <p>{journey.nextRewardLabel}</p>
            <span>Nível {mockNextPassReward.level}</span>
          </div>

          <div className="bs-pass-next__visual" aria-hidden="true">
            <ChestArt />
          </div>

          <div className="bs-pass-next__copy">
            <strong>{mockNextPassReward.title}</strong>
            <span>{mockNextPassReward.subtitle}</span>
          </div>

          <div className="bs-pass-next__tags">
            {mockNextPassReward.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <button type="button" className="bs-pass-next__cta">
            Ver detalhes
          </button>
        </aside>
      </div>

      <section className="bs-pass__missions" aria-labelledby="bs-pass-missions-title">
        <div className="bs-pass__missions-head">
          <h2 id="bs-pass-missions-title">Missões da Temporada</h2>
          <button type="button" className="bs-pass__missions-link">
            Ver todas as missões
            <ChevronIcon />
          </button>
        </div>

        <div className="bs-pass__missions-grid">
          {missions.map((mission) => (
            <SeasonMissionCard
              key={mission.id}
              mission={mission}
              icon={seasonMissionIcons[mission.id] ?? 'explore'}
              ctaLabel={seasonMissionCtas[mission.id] ?? 'Continuar'}
              onContinue={onContinue}
            />
          ))}
        </div>
      </section>

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

function RewardTrack({
  track,
  currentLevel,
  claimedFreeLevels,
  claimingLevel,
  onPremiumAction,
  onClaimFree,
}: {
  track: PassTrack
  currentLevel: number
  claimedFreeLevels: number[]
  claimingLevel: number | null
  onPremiumAction: (rewardTitle?: string) => void
  onClaimFree: (level: number) => void
}) {
  return (
    <div className={`bs-pass-track${track.premium ? ' is-premium' : ''}`}>
      <div className="bs-pass-track__side">
        <p className="bs-pass-track__eyebrow">TRILHA</p>
        <div className="bs-pass-track__label">
          {track.premium ? (
            <span className="bs-pass-track__crown" aria-hidden="true">
              <CrownIcon />
            </span>
          ) : null}
          <strong>{track.label}</strong>
        </div>
        <span className="bs-pass-track__desc">{track.description}</span>

        {track.premium ? (
          <div className="bs-pass-track__upsell">
            <button
              type="button"
              className="bs-pass-track__activate"
              onClick={() => onPremiumAction()}
            >
              Ativar Premium
            </button>
            <p>Apenas R$ 29,90/mês</p>
          </div>
        ) : null}
      </div>

      <div className="bs-pass-track__rail-wrap">
        <div className="bs-pass-track__line" aria-hidden="true" />
        <div className="bs-pass-track__rail" role="list">
          {track.rewards.map((reward) => {
            const claimed =
              track.premium
                ? reward.state === 'claimed'
                : reward.state === 'claimed' || claimedFreeLevels.includes(reward.level)
            const claiming = !track.premium && claimingLevel === reward.level
            const resolved: PassReward = claimed
              ? { ...reward, state: 'claimed' }
              : reward

            return (
              <RewardNode
                key={`${track.id}-${reward.level}`}
                reward={resolved}
                premium={track.premium}
                current={reward.level === currentLevel}
                claiming={claiming}
                onClaim={() => {
                  if (track.premium) {
                    onPremiumAction(reward.title)
                    return
                  }
                  onClaimFree(reward.level)
                }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

function RewardNode({
  reward,
  premium,
  current,
  claiming = false,
  onClaim,
}: {
  reward: PassReward
  premium: boolean
  current: boolean
  claiming?: boolean
  onClaim: () => void
}) {
  const stateClass =
    reward.state === 'claimed'
      ? 'is-claimed'
      : reward.state === 'claimable'
        ? 'is-claimable'
        : 'is-locked'

  return (
    <article
      className={`bs-pass-node ${stateClass}${current ? ' is-current' : ''}${premium ? ' is-premium' : ''}${claiming ? ' is-claiming' : ''}`}
      role="listitem"
    >
      {claiming ? (
        <span className="bs-pass-node__burst" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <i key={i} style={{ '--i': i } as CSSProperties} />
          ))}
        </span>
      ) : null}

      <span className="bs-pass-node__level">{reward.level}</span>

      <div className="bs-pass-node__icon" aria-hidden="true">
        <RewardKindIcon kind={reward.kind} />
        {reward.state === 'claimed' || claiming ? (
          <span className={`bs-pass-node__badge is-check${claiming ? ' is-pop' : ''}`}>
            <CheckIcon />
          </span>
        ) : null}
        {reward.state === 'locked' ? (
          <span className="bs-pass-node__badge is-lock">
            <LockIcon />
          </span>
        ) : null}
      </div>

      <p className="bs-pass-node__title">{reward.title}</p>

      {reward.state === 'claimed' && !claiming ? (
        <span className="bs-pass-node__status">Resgatado</span>
      ) : null}

      {reward.state === 'claimable' && !claiming ? (
        <button type="button" className="bs-pass-node__claim" onClick={onClaim}>
          Resgatar
        </button>
      ) : null}

      {claiming ? (
        <span className="bs-pass-node__status is-claiming-label">Resgatando...</span>
      ) : null}

      {reward.state === 'locked' ? (
        <span className="bs-pass-node__status is-muted">Bloqueado</span>
      ) : null}
    </article>
  )
}

function SeasonMissionCard({
  mission,
  icon,
  ctaLabel,
  onContinue,
}: {
  mission: Mission
  icon: SeasonMissionIcon
  ctaLabel: string
  onContinue?: (mission: Mission) => void
}) {
  const pct =
    mission.target > 0
      ? Math.min(100, Math.round((mission.current / mission.target) * 100))
      : 0
  const isComplete = pct >= 100 || mission.status === 'claimed'
  const isClaimed = mission.status === 'claimed'
  const canClaim = isComplete && !isClaimed && mission.status !== 'locked'

  const progressLabel =
    mission.unit === 'days'
      ? `${mission.current}/${mission.target}`
      : `${mission.current.toLocaleString('pt-BR')} / ${mission.target.toLocaleString('pt-BR')}`

  return (
    <article className={`bs-pass-mission${isComplete ? ' is-done' : ''}`}>
      <div className="bs-pass-mission__top">
        <div className="bs-pass-mission__icon" aria-hidden="true">
          <MissionIcon kind={icon} />
        </div>
        <div>
          <h3>{mission.title}</h3>
          <p>{mission.description}</p>
        </div>
      </div>

      <div className="bs-pass-mission__progress">
        <div
          className="bs-pass-mission__bar"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: `${pct}%` }} />
        </div>
        <strong>{progressLabel}</strong>
      </div>

      <div className="bs-pass-mission__foot">
        <span>+{mission.points} pontos</span>
        <button
          type="button"
          className={`bs-pass-mission__cta${isComplete ? ' is-done' : ''}`}
          disabled={isClaimed}
          onClick={() => onContinue?.(mission)}
        >
          {isClaimed ? 'Resgatada' : canClaim || isComplete ? 'Concluída' : ctaLabel}
          {isComplete || canClaim ? <CheckIcon small /> : null}
        </button>
      </div>
    </article>
  )
}

function RewardKindIcon({ kind }: { kind: PassRewardKind }) {
  switch (kind) {
    case 'cashback':
    case 'balance':
      return <CoinsIcon />
    case 'ticket':
      return <TicketIcon />
    case 'points':
      return <BoltIcon />
    case 'report':
      return <DocIcon />
    case 'chest':
    case 'gift':
      return <GiftIcon />
    case 'badge':
      return <BadgeIcon />
    case 'bonus':
      return <PercentIcon />
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}

function MissionIcon({ kind }: { kind: SeasonMissionIcon }) {
  switch (kind) {
    case 'deposit':
      return <CoinsIcon />
    case 'calendar':
      return <CalendarIcon />
    case 'chart':
      return <ChartIcon />
    case 'explore':
      return <EyeIcon />
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}

function HexBadge() {
  return (
    <svg viewBox="0 0 64 72" width="58" height="66" aria-hidden="true">
      <defs>
        <linearGradient id="pass-hex-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c2a14" />
          <stop offset="100%" stopColor="#0a1200" />
        </linearGradient>
      </defs>
      <path
        d="M32 2 58 17v30L32 62 6 47V17L32 2Z"
        fill="url(#pass-hex-fill)"
        stroke="#9eff00"
        strokeWidth="3"
      />
      <path d="M32 12 48 21v22L32 52 16 43V21L32 12Z" fill="rgba(158,255,0,0.1)" />
    </svg>
  )
}

function ChestArt() {
  return (
    <svg viewBox="0 0 160 140" className="bs-pass-next__chest" aria-hidden="true">
      <defs>
        <linearGradient id="pass-chest-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2a12" />
          <stop offset="100%" stopColor="#070c06" />
        </linearGradient>
        <linearGradient id="pass-chest-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4ff7a" />
          <stop offset="100%" stopColor="#9eff00" />
        </linearGradient>
        <filter id="pass-chest-blur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <ellipse
        cx="80"
        cy="118"
        rx="42"
        ry="10"
        fill="#9eff00"
        opacity="0.28"
        filter="url(#pass-chest-blur)"
      />
      <rect
        x="28"
        y="58"
        width="104"
        height="54"
        rx="10"
        fill="url(#pass-chest-body)"
        stroke="#9eff00"
        strokeWidth="2"
      />
      <path d="M28 82h104" stroke="#9eff00" strokeWidth="2" />
      <path
        d="M46 58V46c0-18 15-32 34-32s34 14 34 32v12"
        fill="none"
        stroke="url(#pass-chest-glow)"
        strokeWidth="3"
      />
      <circle cx="80" cy="82" r="8" fill="#0a1200" stroke="#9eff00" strokeWidth="2" />
      <path d="M76 82h8" stroke="#9eff00" strokeWidth="2" />
      <text
        x="80"
        y="42"
        textAnchor="middle"
        fill="#9eff00"
        fontSize="11"
        fontWeight="700"
        letterSpacing="0.12em"
      >
        BULLEX
      </text>
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9">
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 8.2v4.2l2.8 1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CrownIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M3 17 5.5 8l4 4L12 5l2.5 7 4-4L21 17H3Z" />
      <path d="M4 19h16v2H4z" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon({ small = false }: { small?: boolean }) {
  const size = small ? 12 : 11
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.8">
      <path d="m6.5 12.5 3.5 3.5 7.5-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2">
      <rect x="6" y="11" width="12" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

function CoinsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7">
      <ellipse cx="12" cy="7" rx="6.5" ry="2.4" />
      <path d="M5.5 7v3.2c0 1.3 2.9 2.4 6.5 2.4s6.5-1.1 6.5-2.4V7" />
      <path d="M5.5 10.2V13.5c0 1.3 2.9 2.4 6.5 2.4s6.5-1.1 6.5-2.4v-3.3" />
    </svg>
  )
}

function TicketIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 9.5A2.5 2.5 0 0 0 6.5 7h11A2.5 2.5 0 0 0 20 9.5v1a1.5 1.5 0 0 1 0 3v1A2.5 2.5 0 0 0 17.5 17h-11A2.5 2.5 0 0 0 4 14.5v-1a1.5 1.5 0 0 1 0-3v-1Z" />
      <path d="M12 7v10" strokeDasharray="2 2" />
    </svg>
  )
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M13 2 4 14h7l-1 8 10-14h-7l0-6Z" />
    </svg>
  )
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  )
}

function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="4" y="10" width="16" height="10" rx="1.5" />
      <path d="M12 10v10M4 14h16" />
      <path d="M12 10c-2.2 0-4-1.4-4-3.2S10.2 4 12 5.5C13.8 4 16 4.6 16 6.8S14.2 10 12 10Z" />
    </svg>
  )
}

function BadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 3 14.5 8.5 20.5 9.2 16 13.4 17.2 19.3 12 16.4 6.8 19.3 8 13.4 3.5 9.2 9.5 8.5 12 3Z" />
    </svg>
  )
}

function PercentIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m7 17 10-10" />
      <circle cx="8.5" cy="8.5" r="1.8" />
      <circle cx="15.5" cy="15.5" r="1.8" />
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

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 19V5M4 19h16" />
      <path d="M8 15v-4M12 15V8M16 15v-6" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M2.5 12S6.5 6 12 6s9.5 6 9.5 6-4 6-9.5 6S2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  )
}
