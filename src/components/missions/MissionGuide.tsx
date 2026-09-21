import { useMemo, useState } from 'react'
import { type JourneyProgress, type Mission } from '../../data/missionsMock'
import { MissionGuideCard } from './MissionGuideCard'

type MissionGuideProps = {
  missions: Mission[]
  journey: JourneyProgress
  onContinue?: (mission: Mission) => void
}

type GuideTab = 'all' | 'progress' | 'done'

function isMissionComplete(mission: Mission) {
  return mission.target > 0 && mission.current >= mission.target
}

export function MissionGuide({ missions, journey, onContinue }: MissionGuideProps) {
  const [tab, setTab] = useState<GuideTab>('all')
  const pointsPercent =
    journey.targetPoints > 0
      ? Math.min(100, Math.round((journey.currentPoints / journey.targetPoints) * 100))
      : 0

  const filtered = useMemo(() => {
    return missions.filter((mission) => {
      const complete = isMissionComplete(mission) || mission.status === 'claimed'
      const inProgress =
        !complete && mission.status !== 'locked' && (mission.status === 'active' || mission.status === 'available')

      switch (tab) {
        case 'all':
          return true
        case 'progress':
          return inProgress
        case 'done':
          return complete
        default: {
          const _exhaustive: never = tab
          return _exhaustive
        }
      }
    })
  }, [missions, tab])

  return (
    <section className="bs-guide" aria-labelledby="bs-guide-title">
      <div className="bs-guide__journey">
        <div className="bs-guide__level">
          <p className="bs-guide__eyebrow">{journey.eyebrow}</p>
          <h2 id="bs-guide-title">NÍVEL {journey.level}</h2>
          <div
            className="bs-guide__points-track"
            role="progressbar"
            aria-valuenow={journey.currentPoints}
            aria-valuemin={0}
            aria-valuemax={journey.targetPoints}
            aria-label="Progresso de pontos"
          >
            <span style={{ width: `${pointsPercent}%` }} />
          </div>
          <p className="bs-guide__points-label">
            {journey.currentPoints.toLocaleString('pt-BR')} /{' '}
            {journey.targetPoints.toLocaleString('pt-BR')} pontos
          </p>
        </div>

        <aside className="bs-guide__next-reward">
          <div className="bs-guide__next-copy">
            <p>{journey.nextRewardLabel}</p>
            <strong>
              <StarIcon />
              {journey.nextRewardTitle}
            </strong>
            <span>Falta {journey.remainingPoints.toLocaleString('pt-BR')} pontos</span>
          </div>
          <div className="bs-guide__chest" aria-hidden="true">
            <ChestArt id="next" />
          </div>
        </aside>
      </div>

      <div className="bs-guide__toolbar">
        <h3 className="bs-guide__section-title">MISSÕES ATIVAS</h3>
        <div className="bs-guide__tabs" role="tablist" aria-label="Filtrar missões">
          <TabButton active={tab === 'all'} onClick={() => setTab('all')}>
            TODAS
          </TabButton>
          <TabButton active={tab === 'progress'} onClick={() => setTab('progress')}>
            EM ANDAMENTO
          </TabButton>
          <TabButton active={tab === 'done'} onClick={() => setTab('done')}>
            CONCLUÍDAS
          </TabButton>
        </div>
      </div>

      <div className="bs-guide__list">
        {filtered.map((mission, index) => (
          <MissionGuideCard
            key={mission.id}
            mission={mission}
            step={missions.findIndex((item) => item.id === mission.id) + 1 || index + 1}
            onContinue={onContinue}
          />
        ))}
        {filtered.length === 0 ? (
          <p className="bs-guide__empty">Nenhuma missão neste filtro.</p>
        ) : null}
      </div>

      <div className="bs-guide__cta">
        <div className="bs-guide__cta-art" aria-hidden="true">
          <ChestArt small id="cta-a" />
          <ChestArt small id="cta-b" />
        </div>
        <div className="bs-guide__cta-copy">
          <p>{journey.footerTitle}</p>
          <span>{journey.footerSubtitle}</span>
        </div>
        <button type="button" className="bs-guide__cta-btn">
          {journey.footerCta}
          <ChevronIcon />
        </button>
      </div>
    </section>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`bs-guide__tab${active ? ' is-active' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M12 3.2 14.4 9h6.1l-4.9 3.7 1.9 6.1L12 15.6 6.5 18.8l1.9-6.1L3.5 9h6.1L12 3.2Z" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChestArt({ small = false, id = 'main' }: { small?: boolean; id?: string }) {
  const bodyId = `guide-chest-body-${id}`
  const metalId = `guide-chest-metal-${id}`

  return (
    <svg
      className={`bs-guide__chest-svg${small ? ' is-small' : ''}`}
      viewBox="0 0 120 110"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={bodyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2618" />
          <stop offset="100%" stopColor="#0a1200" />
        </linearGradient>
        <linearGradient id={metalId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4ff7a" />
          <stop offset="50%" stopColor="#9eff00" />
          <stop offset="100%" stopColor="#5cad00" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="98" rx="34" ry="6" fill="#9eff00" opacity="0.18" />
      <path d="M22 48c0-18 14-32 38-32s38 14 38 32H22Z" fill={`url(#${bodyId})`} />
      <path d="M22 48h76" stroke="#9eff00" strokeWidth="3" opacity="0.7" />
      <rect x="18" y="48" width="84" height="42" rx="8" fill={`url(#${bodyId})`} />
      <rect x="18" y="48" width="84" height="12" rx="4" fill={`url(#${metalId})`} />
      <rect x="28" y="52" width="8" height="32" rx="2" fill={`url(#${metalId})`} />
      <rect x="84" y="52" width="8" height="32" rx="2" fill={`url(#${metalId})`} />
      <rect x="50" y="58" width="20" height="22" rx="4" fill={`url(#${metalId})`} />
      <circle cx="60" cy="68" r="3.5" fill="#0a1200" />
    </svg>
  )
}
