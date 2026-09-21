import type { ReactNode } from 'react'

type BullStartSectionProps = {
  children: ReactNode
  monthLabel?: string
}

export function BullStartSection({
  children,
  monthLabel = 'outubro',
}: BullStartSectionProps) {
  return (
    <section className="bs-bullstart" aria-labelledby="bs-bullstart-heading">
      <header className="bs-bullstart__bar">
        <div className="bs-bullstart__brand">
          <span className="bs-bullstart__mark" aria-hidden="true">
            <BullStartMark />
          </span>
          <div>
            <p className="bs-bullstart__eyebrow">PROGRAMA DE MISSÕES</p>
            <h2 id="bs-bullstart-heading">BullStart</h2>
          </div>
        </div>
        <p className="bs-bullstart__period">Ciclo de {monthLabel}</p>
      </header>

      <div className="bs-bullstart__body">{children}</div>
    </section>
  )
}

function BullStartMark() {
  return (
    <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden="true">
      <path d="M6 12c0-2.8 1.8-5.2 4.4-6.1L16 4l5.6 1.9C24.2 6.8 26 9.2 26 12v2.2l3 2.2-3 1.4v2.4c0 3.5-2.6 6.5-6.1 7.1L16 28l-3.9-.7C8.6 26.7 6 23.7 6 20.2v-2.4l-3-1.4 3-2.2V12zm5.2 2.4c.9 2.8 3.2 4.7 5.8 4.7s4.9-1.9 5.8-4.7c-.8.4-1.7.6-2.7.6-1.4 0-2.6-.6-3.6-1.5-.9.9-2.1 1.5-3.6 1.5-.9 0-1.8-.2-2.7-.6z" />
    </svg>
  )
}
