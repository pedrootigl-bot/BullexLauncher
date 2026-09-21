import { Link } from 'react-router-dom'
import { mockNextStep } from '../../data/missionsMock'

type StartHeroProps = {
  imageSrc?: string
}

export function StartHero({
  imageSrc = '/media/hero-missoes.jpg',
}: StartHeroProps) {
  const next = mockNextStep

  return (
    <section className="bs-start-hero" aria-label="BullStart — missões mensais">
      <div className="bs-start-hero__media">
        <img
          src={imageSrc}
          alt="BullStart — touro e app de missões mensais no celular"
          className="bs-start-hero__image"
        />
        <div className="bs-start-hero__veil" aria-hidden="true" />
      </div>

      <div className="bs-start-hero__inner">
        <div className="bs-start-hero__spacer" aria-hidden="true" />

        <Link
          to={next.href}
          className="bs-start-hero__next"
          aria-label={`${next.ctaLabel}: ${next.missionTitle}`}
        >
          <div className="bs-start-hero__next-copy">
            <p className="bs-start-hero__next-eyebrow">{next.eyebrow}</p>
            <h2>{next.title}</h2>
            <p className="bs-start-hero__next-hint">
              <strong>{next.missionTitle}</strong> — {next.missionHint}
            </p>
          </div>

          <div className="bs-start-hero__next-progress">
            <div className="bs-start-hero__next-meta">
              <span>
                {next.completed} de {next.total} missões concluídas
              </span>
              <strong>{next.percent}%</strong>
            </div>
            <div
              className="bs-start-hero__next-track"
              role="progressbar"
              aria-valuenow={next.percent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span style={{ width: `${next.percent}%` }} />
            </div>
            <span className="bs-start-hero__next-action">
              {next.ctaLabel}
              <ArrowIcon />
            </span>
          </div>
        </Link>
      </div>
    </section>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
