import { useEffect } from 'react'
import type { CSSProperties } from 'react'
import type { Mission, MissionRewardIcon } from '../../data/missionsMock'

type MissionCompleteModalProps = {
  mission: Mission
  onClaim: () => void
  onDismiss: () => void
}

function splitReward(reward: string) {
  const riskFree = reward.match(/^(R\$\s*[\d.,]+)\s*(RiskFree.*)$/i)
  if (riskFree) {
    return { primary: riskFree[1].replace(/\s+/g, ''), secondary: riskFree[2].toUpperCase() }
  }

  const bonus = reward.match(/^([\d.,]+%\s*de\s*B[oô]nus)$/i)
  if (bonus) {
    return { primary: bonus[1].replace(/\s*de\s*/i, ' ').toUpperCase(), secondary: 'BÔNUS' }
  }

  const parts = reward.split(/\s*\+\s*/)
  if (parts.length > 1) {
    return { primary: parts[0], secondary: parts.slice(1).join(' + ').toUpperCase() }
  }

  return { primary: reward, secondary: 'RECOMPENSA' }
}

export function MissionCompleteModal({
  mission,
  onClaim,
  onDismiss,
}: MissionCompleteModalProps) {
  const reward = splitReward(mission.reward)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onDismiss()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onDismiss])

  return (
    <div className="bs-complete" role="presentation" onClick={onDismiss}>
      <div className="bs-complete__burst" aria-hidden="true">
        {Array.from({ length: 16 }, (_, i) => (
          <span
            key={i}
            className={`bs-complete__spark bs-complete__spark--${i + 1}`}
            style={{ '--i': i } as CSSProperties}
          />
        ))}
      </div>

      <div
        className="bs-complete__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bs-complete-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="bs-complete__close"
          aria-label="Fechar"
          onClick={onDismiss}
        >
          <CloseIcon />
        </button>

        <div className="bs-complete__hero">
          <div className="bs-complete__icon" aria-hidden="true">
            <CheckIcon />
          </div>

          <p className="bs-complete__eyebrow">{mission.code}</p>

          <h2 id="bs-complete-title" className="bs-complete__title">
            Missão
            <span>concluída!</span>
          </h2>

          <p className="bs-complete__sub">Você desbloqueou uma nova recompensa.</p>
        </div>

        <div className="bs-complete__mission">
          <span className="bs-complete__mission-label">Desafio</span>
          <strong className="bs-complete__mission-title">{mission.title}</strong>
        </div>

        <div className="bs-complete__reward">
          <span className="bs-complete__reward-icon" aria-hidden="true">
            <RewardIcon kind={mission.rewardIcon} />
          </span>
          <div className="bs-complete__reward-copy">
            <span className="bs-complete__reward-label">Sua recompensa</span>
            <strong>{reward.primary}</strong>
            <span className="bs-complete__reward-tag">{reward.secondary}</span>
          </div>
        </div>

        <div className="bs-complete__actions">
          <button type="button" className="bs-complete__claim" onClick={onClaim}>
            Resgatar agora
          </button>

          <button type="button" className="bs-complete__later" onClick={onDismiss}>
            Talvez depois
          </button>
        </div>
      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 72 72" width="64" height="64" fill="none" aria-hidden="true">
      <circle cx="36" cy="36" r="34" fill="currentColor" opacity="0.14" />
      <circle cx="36" cy="36" r="26" fill="currentColor" />
      <path
        d="M24.5 36.8 32.2 44.4 47.5 28"
        stroke="#0a1200"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  )
}

function RewardIcon({ kind }: { kind: MissionRewardIcon }) {
  const props = {
    viewBox: '0 0 24 24',
    width: 24,
    height: 24,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (kind) {
    case 'shield':
      return (
        <svg {...props}>
          <path d="M12 3 5 6.5v5.2c0 4.2 2.8 7.8 7 8.8 4.2-1 7-4.6 7-8.8V6.5L12 3Z" />
          <path d="m9.2 12 1.9 1.9 3.7-3.8" />
        </svg>
      )
    case 'bonus':
      return (
        <svg {...props}>
          <ellipse cx="12" cy="7" rx="6.5" ry="2.4" />
          <path d="M5.5 7v3.2c0 1.3 2.9 2.4 6.5 2.4s6.5-1.1 6.5-2.4V7" />
          <path d="M5.5 10.2V13.5c0 1.3 2.9 2.4 6.5 2.4s6.5-1.1 6.5-2.4v-3.3" />
          <path d="M5.5 13.5V16.8c0 1.3 2.9 2.4 6.5 2.4s6.5-1.1 6.5-2.4v-3.3" />
        </svg>
      )
    case 'ticket':
      return (
        <svg {...props}>
          <path d="M4 9.5A2.5 2.5 0 0 0 6.5 7h11A2.5 2.5 0 0 0 20 9.5v1a1.5 1.5 0 0 1 0 3v1A2.5 2.5 0 0 0 17.5 17h-11A2.5 2.5 0 0 0 4 14.5v-1a1.5 1.5 0 0 1 0-3v-1Z" />
          <path d="M12 7v10" strokeDasharray="2 2" />
        </svg>
      )
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}
