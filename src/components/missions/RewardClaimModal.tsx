import { useEffect } from 'react'
import type { CSSProperties } from 'react'
import type { Mission } from '../../data/missionsMock'
import { playRewardChestOpen } from '../../utils/rewardSounds'

type RewardClaimModalProps = {
  mission: Mission
  onClose: () => void
}

const CONFETTI = [
  { x: -18, y: -92, rot: -28, delay: 0.62, shape: 'rect', color: 'a' },
  { x: 22, y: -98, rot: 35, delay: 0.66, shape: 'rect', color: 'b' },
  { x: -42, y: -78, rot: -55, delay: 0.7, shape: 'circle', color: 'c' },
  { x: 48, y: -84, rot: 48, delay: 0.72, shape: 'circle', color: 'a' },
  { x: -8, y: -118, rot: 12, delay: 0.68, shape: 'tri', color: 'd' },
  { x: 12, y: -110, rot: -18, delay: 0.74, shape: 'tri', color: 'b' },
  { x: -58, y: -58, rot: 70, delay: 0.76, shape: 'rect', color: 'c' },
  { x: 62, y: -62, rot: -65, delay: 0.78, shape: 'rect', color: 'a' },
  { x: -72, y: -36, rot: 20, delay: 0.8, shape: 'circle', color: 'd' },
  { x: 76, y: -40, rot: -30, delay: 0.82, shape: 'circle', color: 'b' },
  { x: -34, y: -102, rot: 40, delay: 0.84, shape: 'rect', color: 'a' },
  { x: 38, y: -108, rot: -45, delay: 0.86, shape: 'rect', color: 'c' },
  { x: -88, y: -20, rot: 90, delay: 0.88, shape: 'tri', color: 'b' },
  { x: 90, y: -24, rot: -80, delay: 0.9, shape: 'tri', color: 'd' },
  { x: -24, y: -70, rot: 15, delay: 0.92, shape: 'circle', color: 'a' },
  { x: 28, y: -74, rot: -22, delay: 0.94, shape: 'circle', color: 'c' },
  { x: -50, y: -48, rot: 55, delay: 0.96, shape: 'rect', color: 'd' },
  { x: 54, y: -52, rot: -50, delay: 0.98, shape: 'rect', color: 'b' },
  { x: 0, y: -128, rot: 0, delay: 0.7, shape: 'star', color: 'a' },
  { x: -64, y: -88, rot: 25, delay: 0.75, shape: 'star', color: 'd' },
  { x: 68, y: -90, rot: -20, delay: 0.77, shape: 'star', color: 'b' },
  { x: -96, y: 8, rot: 110, delay: 1.0, shape: 'rect', color: 'c' },
  { x: 98, y: 4, rot: -100, delay: 1.02, shape: 'rect', color: 'a' },
  { x: -40, y: -30, rot: 8, delay: 1.05, shape: 'circle', color: 'd' },
  { x: 44, y: -28, rot: -12, delay: 1.08, shape: 'circle', color: 'b' },
] as const

export function RewardClaimModal({ mission, onClose }: RewardClaimModalProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    const soundId = window.setTimeout(() => {
      void playRewardChestOpen()
    }, 40)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(soundId)
    }
  }, [onClose])

  return (
    <div className="bs-modal" role="presentation" onClick={onClose}>
      <div className="bs-modal__burst" aria-hidden="true">
        {Array.from({ length: 18 }, (_, i) => (
          <span key={i} className={`bs-modal__spark bs-modal__spark--${i + 1}`} />
        ))}
      </div>

      <div
        className="bs-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bs-reward-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="bs-modal__close"
          aria-label="Fechar"
          onClick={onClose}
        >
          <CloseIcon />
        </button>

        <div className="bs-modal__chest-stage" aria-hidden="true">
          <div className="bs-modal__rays" />
          <div className="bs-modal__glow" />
          <div className="bs-modal__shockwave" />

          <div className="bs-modal__chest">
            <div className="bs-modal__chest-lid">
              <ChestLidSvg />
            </div>
            <div className="bs-modal__chest-body">
              <ChestBodySvg />
            </div>
            <div className="bs-modal__chest-light" />

            <div className="bs-modal__confetti">
              {CONFETTI.map((piece, index) => (
                <span
                  key={index}
                  className={`bs-modal__piece bs-modal__piece--${piece.shape} bs-modal__piece--${piece.color}`}
                  style={
                    {
                      '--cx': `${piece.x}px`,
                      '--cy': `${piece.y}px`,
                      '--cr': `${piece.rot}deg`,
                      '--cd': `${piece.delay}s`,
                    } as CSSProperties
                  }
                />
              ))}
            </div>
          </div>

          <div className="bs-modal__check">
            <CheckIcon />
          </div>
        </div>

        <div className="bs-modal__content">
          <p className="bs-modal__eyebrow">BullStart</p>

          <h2 id="bs-reward-modal-title" className="bs-modal__title">
            Recompensa
            <span>resgatada!</span>
          </h2>

          <p className="bs-modal__lead">
            O prêmio <strong>{mission.reward}</strong> foi adicionado à sua conta.
          </p>

          <div
            className="bs-modal__points"
            aria-label={`Você recebeu ${mission.points} pontos`}
          >
            <span className="bs-modal__points-icon" aria-hidden="true">
              <PointsIcon />
            </span>
            <div className="bs-modal__points-copy">
              <span>Pontos ganhos</span>
              <strong>+{mission.points} pontos</strong>
            </div>
          </div>

          <p className="bs-modal__hint">Continue. A próxima recompensa já está mais perto.</p>

          <button type="button" className="bs-modal__ok" onClick={onClose}>
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}

function ChestLidSvg() {
  return (
    <svg viewBox="0 0 160 72" className="bs-modal__chest-svg" aria-hidden="true">
      <defs>
        <linearGradient id="lidGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4ff7a" />
          <stop offset="45%" stopColor="#9eff00" />
          <stop offset="100%" stopColor="#5cad00" />
        </linearGradient>
        <linearGradient id="lidEdge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b8ff33" />
          <stop offset="100%" stopColor="#3d7a00" />
        </linearGradient>
      </defs>
      <path d="M14 54h132l-12-40H26L14 54Z" fill="url(#lidEdge)" />
      <path d="M26 14h108l12 40H14L26 14Z" fill="url(#lidGrad)" />
      <path d="M30 18h100" stroke="#f3ffc2" strokeWidth="3" opacity="0.45" strokeLinecap="round" />
      <rect x="68" y="34" width="24" height="18" rx="4" fill="#0a1200" />
      <circle cx="80" cy="43" r="5" fill="#ffe566" />
      <circle cx="80" cy="43" r="2.2" fill="#0a1200" />
      <path d="M20 54h120" stroke="#0a1200" strokeWidth="4" opacity="0.28" />
    </svg>
  )
}

function ChestBodySvg() {
  return (
    <svg viewBox="0 0 160 90" className="bs-modal__chest-svg" aria-hidden="true">
      <defs>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8fe600" />
          <stop offset="55%" stopColor="#5cad00" />
          <stop offset="100%" stopColor="#3f7a00" />
        </linearGradient>
        <linearGradient id="rimGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4ff7a" />
          <stop offset="100%" stopColor="#7acc00" />
        </linearGradient>
      </defs>
      <rect x="16" y="10" width="128" height="68" rx="12" fill="url(#bodyGrad)" />
      <rect x="16" y="10" width="128" height="20" rx="10" fill="url(#rimGrad)" />
      <rect x="16" y="24" width="128" height="10" fill="#0a1200" opacity="0.22" />
      <rect x="70" y="16" width="20" height="26" rx="4" fill="#0a1200" />
      <circle cx="80" cy="26" r="4.5" fill="#ffe566" />
      <path d="M28 48h104M28 58h104M28 68h104" stroke="#0a1200" strokeWidth="2.5" opacity="0.18" strokeLinecap="round" />
      <rect x="22" y="14" width="8" height="60" rx="3" fill="#0a1200" opacity="0.15" />
      <rect x="130" y="14" width="8" height="60" rx="3" fill="#0a1200" opacity="0.15" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 64 64" width="64" height="64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="currentColor" opacity="0.14" />
      <circle cx="32" cy="32" r="22" fill="currentColor" />
      <path
        d="M22 33.5 29.2 40.5 43 25"
        stroke="#0a1200"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PointsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
      <path d="M12 3.2 14.4 9h6.1l-4.9 3.7 1.9 6.1L12 15.6 6.5 18.8l1.9-6.1L3.5 9h6.1L12 3.2Z" />
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
