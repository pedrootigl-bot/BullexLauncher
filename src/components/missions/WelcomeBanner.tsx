import { mockUser } from '../../data/missionsMock'

type WelcomeBannerProps = {
  firstName?: string
}

export function WelcomeBanner({ firstName = mockUser.firstName }: WelcomeBannerProps) {
  return (
    <section className="bs-welcome" aria-label="Boas-vindas">
      <p className="bs-welcome__eyebrow">BULLSTART</p>
      <h1 className="bs-welcome__title">
        Bem-vindo, <span>{firstName}</span>
      </h1>
      <p className="bs-welcome__sub">
        Avance nas missões para ganhar recompensas.
      </p>
    </section>
  )
}
