import { useSession } from '../../context/SessionContext'

type WelcomeBannerProps = {
  firstName?: string
}

export function WelcomeBanner({ firstName }: WelcomeBannerProps) {
  const { user } = useSession()
  const name = firstName ?? user?.firstName ?? 'Trader'

  return (
    <section className="bs-welcome" aria-label="Boas-vindas">
      <p className="bs-welcome__eyebrow">BULLSTART</p>
      <h1 className="bs-welcome__title">
        Bem-vindo, <span>{name}</span>
      </h1>
      <p className="bs-welcome__sub">
        Avance nas missões para ganhar recompensas.
      </p>
    </section>
  )
}
