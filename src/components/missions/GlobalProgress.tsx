import type { MonthProgress } from '../../data/missionsMock'

type GlobalProgressProps = {
  progress: MonthProgress
}

export function GlobalProgress({ progress }: GlobalProgressProps) {
  return (
    <section className="bs-global" aria-labelledby="bs-global-title">
      <div className="bs-global__head">
        <h2 id="bs-global-title">{progress.label}</h2>
        <span className="bs-global__percent">{progress.percent}%</span>
      </div>
      <div
        className="bs-global__track"
        role="progressbar"
        aria-valuenow={progress.percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span className="bs-global__fill" style={{ width: `${progress.percent}%` }} />
      </div>
      <p className="bs-global__caption">{progress.caption}</p>
    </section>
  )
}
