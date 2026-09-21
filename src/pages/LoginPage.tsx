import { useNavigate } from 'react-router-dom'
import { MediaBackground } from '../components/MediaBackground'
import { LoginForm } from '../components/LoginForm'
import { BullMark, ChartIcon, PeopleIcon, TargetIcon } from '../components/Icons'

/** Troque por caminho do vídeo quando estiver pronto, ex: '/media/hero-bg.mp4' */
const HERO_VIDEO: string | undefined = undefined
const HERO_IMAGE = '/media/hero-bg.jpg'

export function LoginPage() {
  const navigate = useNavigate()

  return (
    <main className="login-page">
      <MediaBackground
        imageSrc={HERO_IMAGE}
        videoSrc={HERO_VIDEO}
        alt="BullVerse — cidade neon com o touro da arena"
      />

      <div className="login-page__content">
        <header className="topbar">
          <div className="brand">
            <span className="brand__mark" aria-hidden="true">
              <BullMark size={32} />
            </span>
            <span className="brand__name">BULLVERSE</span>
          </div>
          <p className="topbar__tagline">PLAY &nbsp; COMPETE &nbsp; BELONG</p>
        </header>

        <p className="side-rail">MORE THAN A GAME — A MOVEMENT</p>

        <section className="hero" aria-labelledby="hero-title">
          <p className="hero__eyebrow">DISCIPLINE BUILDS</p>
          <h1 id="hero-title" className="hero__title">
            <span>A BRIGHTER</span>
            <span className="hero__title-accent">TOMORROW</span>
          </h1>
          <p className="hero__subtitle">
            REAL PLAYERS. REAL PROGRESS. STRONGER TOGETHER.
          </p>

          <ul className="features">
            <li>
              <span className="features__icon" aria-hidden="true">
                <TargetIcon size={24} />
              </span>
              <div className="features__text">
                <strong>COMPETE</strong>
                <span className="features__caption">TEST YOUR SKILLS</span>
              </div>
            </li>
            <li>
              <span className="features__icon" aria-hidden="true">
                <ChartIcon size={24} />
              </span>
              <div className="features__text">
                <strong>EVOLVE</strong>
                <span className="features__caption">TRACK PROGRESS</span>
              </div>
            </li>
            <li>
              <span className="features__icon" aria-hidden="true">
                <PeopleIcon size={24} />
              </span>
              <div className="features__text">
                <strong>BELONG</strong>
                <span className="features__caption">A GLOBAL COMMUNITY</span>
              </div>
            </li>
          </ul>
        </section>

        <aside className="login-panel">
          <LoginForm
            onSubmit={() => {
              navigate('/inicio')
            }}
            onCreateAccount={() => {
              navigate('/inicio')
            }}
          />
        </aside>

        <footer className="page-footer">
          <span>PLAY COMPETE BELONG — A BRIGHTER TOMORROW</span>
          <span>BULLVERSE // EST. 2025</span>
        </footer>
      </div>
    </main>
  )
}
