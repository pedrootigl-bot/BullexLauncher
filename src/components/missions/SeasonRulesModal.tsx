import { useEffect } from 'react'
import {
  formatSeasonEndsLabel,
  getSeasonDaysLeft,
  seasonRules,
} from '../../data/missionsMock'

type SeasonRulesModalProps = {
  seasonLabel: string
  seasonEndsAt: string
  onClose: () => void
}

export function SeasonRulesModal({
  seasonLabel,
  seasonEndsAt,
  onClose,
}: SeasonRulesModalProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  const daysLeft = getSeasonDaysLeft(seasonEndsAt)
  const endsLabel = formatSeasonEndsLabel(daysLeft)

  return (
    <div className="bs-season-rules" role="presentation" onClick={onClose}>
      <div
        className="bs-season-rules__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bs-season-rules-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="bs-season-rules__close"
          aria-label="Fechar"
          onClick={onClose}
        >
          <CloseIcon />
        </button>

        <p className="bs-season-rules__eyebrow">BullStart</p>
        <h2 id="bs-season-rules-title">{seasonRules.title}</h2>
        <p className="bs-season-rules__season">
          {seasonLabel}
          <span aria-hidden="true"> · </span>
          {endsLabel}
        </p>
        <p className="bs-season-rules__lead">{seasonRules.intro}</p>

        <ol className="bs-season-rules__list">
          {seasonRules.items.map((item, index) => (
            <li key={item.title}>
              <span className="bs-season-rules__index" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="bs-season-rules__note">{seasonRules.note}</p>

        <button type="button" className="bs-season-rules__cta" onClick={onClose}>
          Entendi
        </button>
      </div>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  )
}
