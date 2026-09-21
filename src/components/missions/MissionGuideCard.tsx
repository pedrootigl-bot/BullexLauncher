import type { Mission } from '../../data/missionsMock'

type MissionGuideCardProps = {
  mission: Mission
  step: number
  onContinue?: (mission: Mission) => void
}

export function MissionGuideCard({ mission, step, onContinue }: MissionGuideCardProps) {
  const pct =
    mission.target > 0
      ? Math.min(100, Math.round((mission.current / mission.target) * 100))
      : 0

  const isComplete = pct >= 100
  const canClaim = isComplete && mission.status !== 'claimed' && mission.status !== 'locked'
  const isLocked = mission.status === 'locked'
  const isClaimed = mission.status === 'claimed'
  const inProgress = !isComplete && !isLocked && !isClaimed

  const statusClass = isClaimed
    ? 'claimed'
    : isLocked
      ? 'locked'
      : canClaim || isComplete
        ? 'done'
        : 'progress'

  const statusLabel = isClaimed
    ? 'RESGATADA'
    : isLocked
      ? 'BLOQUEADA'
      : canClaim || isComplete
        ? 'CONCLUÍDA'
        : 'EM ANDAMENTO'

  const progressLabel =
    mission.unit === 'days'
      ? `${mission.current}/${mission.target}`
      : `${pct}%`

  return (
    <article
      className={[
        'bs-mission-row',
        canClaim || isComplete ? 'is-complete' : '',
        inProgress ? 'is-progress' : '',
        isLocked ? 'is-locked' : '',
        isClaimed ? 'is-claimed' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="bs-mission-row__step" aria-hidden="true">
        {canClaim || isComplete || isClaimed ? <CheckIcon /> : <span>{step}</span>}
      </div>

      <div className="bs-mission-row__body">
        <h3>{mission.title}</h3>
        <p className="bs-mission-row__desc">{mission.description}</p>

        {inProgress ? (
          <div className="bs-mission-row__mini">
            <div
              className="bs-mission-row__mini-track"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span style={{ width: `${pct}%` }} />
            </div>
            <strong>{progressLabel}</strong>
          </div>
        ) : null}
      </div>

      <div className="bs-mission-row__points">+ {mission.points} pontos</div>

      <button
        type="button"
        className={`bs-mission-row__status bs-mission-row__status--${statusClass}`}
        disabled={isLocked || isClaimed}
        onClick={() => onContinue?.(mission)}
      >
        {isLocked ? <LockIcon /> : null}
        {statusLabel}
      </button>
    </article>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6">
      <path d="m6.5 12.5 3.5 3.5 7.5-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="6" y="11" width="12" height="9" rx="2" />
      <path d="M8.5 11V8.5a3.5 3.5 0 0 1 7 0V11" />
    </svg>
  )
}
