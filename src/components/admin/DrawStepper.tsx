export type DrawStepId = 'config' | 'participants' | 'draw'

export type DrawStepState = 'active' | 'done' | 'locked'

export type DrawStep = {
  id: DrawStepId
  index: string
  label: string
  state: DrawStepState
}

type DrawStepperProps = {
  steps: DrawStep[]
}

export function DrawStepper({ steps }: DrawStepperProps) {
  return (
    <ol className="bx-draw-stepper" aria-label="Etapas do sorteio">
      {steps.map((step, index) => (
        <li
          key={step.id}
          className={`bx-draw-stepper__item is-${step.state}`}
          aria-current={step.state === 'active' ? 'step' : undefined}
        >
          <span className="bx-draw-stepper__index">{step.index}</span>
          <span className="bx-draw-stepper__label">{step.label}</span>
          {index < steps.length - 1 ? (
            <span className="bx-draw-stepper__rail" aria-hidden="true" />
          ) : null}
        </li>
      ))}
    </ol>
  )
}
