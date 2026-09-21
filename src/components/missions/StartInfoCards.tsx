const INFO_CARDS = [
  {
    id: 'account',
    text: 'Entre na sua conta e descubra suas missões.',
    icon: 'account' as const,
  },
  {
    id: 'progress',
    text: 'Depósitos, negociações e dias ativos aumentam seu progresso.',
    icon: 'progress' as const,
  },
  {
    id: 'rewards',
    text: 'Complete os desafios e resgate suas recompensas.',
    icon: 'rewards' as const,
  },
] as const

export function StartInfoCards() {
  return (
    <section className="bs-info-cards" aria-label="Como funciona o BullStart">
      {INFO_CARDS.map((card) => (
        <article key={card.id} className="bs-info-card">
          <span className="bs-info-card__icon" aria-hidden="true">
            <CardIcon kind={card.icon} />
          </span>
          <p>{card.text}</p>
        </article>
      ))}
    </section>
  )
}

function CardIcon({ kind }: { kind: (typeof INFO_CARDS)[number]['icon'] }) {
  const props = {
    viewBox: '0 0 24 24',
    width: 28,
    height: 28,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (kind) {
    case 'account':
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="3.4" />
          <path d="M5.5 19.2c1.4-3.2 3.7-4.8 6.5-4.8s5.1 1.6 6.5 4.8" />
        </svg>
      )
    case 'progress':
      return (
        <svg {...props}>
          <path d="M4 20h16" />
          <rect x="5.5" y="12" width="3.2" height="6" rx="0.8" fill="currentColor" stroke="none" />
          <rect x="10.4" y="8" width="3.2" height="10" rx="0.8" fill="currentColor" stroke="none" />
          <rect x="15.3" y="4" width="3.2" height="14" rx="0.8" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'rewards':
      return (
        <svg {...props}>
          <rect x="4" y="10" width="16" height="10" rx="1.5" />
          <path d="M12 10v10" />
          <path d="M4 14h16" />
          <path d="M12 10c-2.2 0-4-1.4-4-3.2S10.2 4 12 5.5C13.8 4 16 4.6 16 6.8S14.2 10 12 10Z" />
        </svg>
      )
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}
