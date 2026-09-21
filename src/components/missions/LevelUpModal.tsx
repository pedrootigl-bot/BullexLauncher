import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { getRankByLevel } from '../../data/missionsMock'
import { playLevelUpFanfare } from '../../utils/rewardSounds'

type LevelUpModalProps = {
  fromLevel: number
  toLevel: number
  onClose: () => void
}

const BURST = Array.from({ length: 14 }, (_, i) => i)
const RING_SIZE = 128
const RING_STROKE = 7
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

export function LevelUpModal({ fromLevel, toLevel, onClose }: LevelUpModalProps) {
  const [progress, setProgress] = useState(0)
  const [displayLevel, setDisplayLevel] = useState(fromLevel)
  const [leveled, setLeveled] = useState(false)
  const fromRank = getRankByLevel(fromLevel).current
  const toRank = getRankByLevel(toLevel).current
  const rankUp = fromRank.id !== toRank.id

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

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setProgress(100)
      setDisplayLevel(toLevel)
      setLeveled(true)
      void playLevelUpFanfare()
      return
    }

    const startDelay = window.setTimeout(() => setProgress(100), 180)
    const levelDelay = window.setTimeout(() => {
      setDisplayLevel(toLevel)
      setLeveled(true)
      void playLevelUpFanfare()
    }, 1750)

    return () => {
      window.clearTimeout(startDelay)
      window.clearTimeout(levelDelay)
    }
  }, [toLevel])

  const dashOffset = RING_CIRCUMFERENCE * (1 - progress / 100)

  return (
    <div className="bs-levelup" role="presentation" onClick={onClose}>
      <div className="bs-levelup__burst" aria-hidden="true">
        {BURST.map((i) => (
          <span
            key={i}
            className={`bs-levelup__spark bs-levelup__spark--${i + 1}`}
            style={{ '--i': i } as CSSProperties}
          />
        ))}
      </div>

      <div
        className="bs-levelup__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bs-levelup-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="bs-levelup__close"
          aria-label="Fechar"
          onClick={onClose}
        >
          <CloseIcon />
        </button>

        <div className={`bs-levelup__badge${leveled ? ' is-leveled' : ''}`}>
          <div className="bs-levelup__pulse" aria-hidden="true" />
          <div className="bs-levelup__pulse bs-levelup__pulse--delay" aria-hidden="true" />

          <svg
            className="bs-levelup__progress"
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            width={RING_SIZE}
            height={RING_SIZE}
            aria-hidden="true"
          >
            <circle
              className="bs-levelup__progress-track"
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              strokeWidth={RING_STROKE}
            />
            <circle
              className="bs-levelup__progress-value"
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            />
          </svg>

          <div
            className={`bs-levelup__level-mark${leveled ? ' is-pop' : ''}`}
            aria-live="polite"
            aria-atomic="true"
          >
            <span>NV</span>
            <strong key={displayLevel}>{displayLevel}</strong>
          </div>
        </div>

        <p className="bs-levelup__eyebrow">Sua jornada</p>

        <h2 id="bs-levelup-title" className="bs-levelup__title">
          Parabéns!
          <span>Nível {toLevel} alcançado</span>
        </h2>

        <p className="bs-levelup__sub">
          Você evoluiu do nível <strong>{fromLevel}</strong> para o nível{' '}
          <strong>{toLevel}</strong>
          {rankUp ? (
            <>
              {' '}
              e alcançou o elo <strong>{toRank.label}</strong>
            </>
          ) : (
            <>
              {' '}
              · elo <strong>{toRank.label}</strong>
            </>
          )}
          . Continue completando missões e suba ainda mais.
        </p>

        <div className="bs-levelup__tips">
          <div className="bs-levelup__tip">
            <span aria-hidden="true">
              <MissionIcon />
            </span>
            <p>Complete missões para ganhar mais pontos</p>
          </div>
          <div className="bs-levelup__tip">
            <span aria-hidden="true">
              <ClimbIcon />
            </span>
            <p>Cada nível libera novas recompensas</p>
          </div>
        </div>

        <button type="button" className="bs-levelup__cta" onClick={onClose}>
          Continuar evoluindo
        </button>
      </div>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  )
}

function MissionIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3 14.5 8.5 20.5 9.2 16 13.4 17.2 19.3 12 16.4 6.8 19.3 8 13.4 3.5 9.2 9.5 8.5 12 3Z" />
    </svg>
  )
}

function ClimbIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 18 10 10l4 4 6-8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 6h5v5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
