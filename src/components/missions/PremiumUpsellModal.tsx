import { useEffect } from 'react'

type PremiumUpsellModalProps = {
  rewardTitle?: string
  onClose: () => void
  onActivate: () => void
}

const BENEFITS = [
  {
    title: 'Trilha Premium completa',
    text: 'Resgate saldo, cupons e caixas exclusivas a cada nível.',
  },
  {
    title: 'Cashback maior',
    text: 'Ganhe mais retorno nas operações elegíveis da temporada.',
  },
  {
    title: 'Prioridade em campanhas',
    text: 'Acesso antecipado a sorteios, tickets e bônus Bullex.',
  },
]

export function PremiumUpsellModal({
  rewardTitle,
  onClose,
  onActivate,
}: PremiumUpsellModalProps) {
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

  return (
    <div className="bs-premium" role="presentation" onClick={onClose}>
      <div
        className="bs-premium__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bs-premium-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="bs-premium__close"
          aria-label="Fechar"
          onClick={onClose}
        >
          <CloseIcon />
        </button>

        <div className="bs-premium__badge" aria-hidden="true">
          <CrownIcon />
        </div>

        <p className="bs-premium__eyebrow">Bullex Premium</p>
        <h2 id="bs-premium-title">Desbloqueie a trilha Premium</h2>
        <p className="bs-premium__lead">
          {rewardTitle
            ? `Para resgatar “${rewardTitle}”, ative o Premium na corretora e libere todos os prêmios exclusivos.`
            : 'Ative o Premium na corretora e libere recompensas exclusivas da temporada.'}
        </p>

        <ul className="bs-premium__benefits">
          {BENEFITS.map((benefit) => (
            <li key={benefit.title}>
              <span aria-hidden="true">
                <CheckIcon />
              </span>
              <div>
                <strong>{benefit.title}</strong>
                <p>{benefit.text}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="bs-premium__price">
          <strong>R$ 29,90</strong>
          <span>/mês</span>
        </div>

        <button type="button" className="bs-premium__cta" onClick={onActivate}>
          Tornar-se Premium na corretora
        </button>
        <button type="button" className="bs-premium__ghost" onClick={onClose}>
          Agora não
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

function CrownIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
      <path d="M3 17 5.5 8l4 4L12 5l2.5 7 4-4L21 17H3Z" />
      <path d="M4 19h16v2H4z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.6">
      <path d="m6.5 12.5 3.5 3.5 7.5-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
