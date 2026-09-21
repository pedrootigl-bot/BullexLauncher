import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowIcon, EyeIcon, EyeOffIcon } from '../components/Icons'

const FEATURES = [
  { id: 'skills', label: 'Desenvolva suas habilidades' },
  { id: 'missions', label: 'Cumpra missões e receba recompensas' },
  { id: 'results', label: 'Evolua com resultados reais' },
] as const

const BENEFITS = [
  {
    id: 'rewards',
    title: 'Recompensas reais',
    lead: 'Cashback, tickets e prêmios por desempenho.',
  },
  {
    id: 'missions',
    title: 'Missões mensais',
    lead: 'Desafios claros para manter a disciplina.',
  },
  {
    id: 'growth',
    title: 'Evolução constante',
    lead: 'Acompanhe progresso e suba de nível.',
  },
] as const

export function LoginPage() {
  const navigate = useNavigate()
  const [bullexId, setBullexId] = useState('482917')
  const [password, setPassword] = useState('password')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate('/missoes')
  }

  function goCreateAccount() {
    navigate('/inicio')
  }

  return (
    <div className="bx-login" id="topo">
      <div className="bx-login__bg" aria-hidden="true">
        <div className="bx-login__veil" />
      </div>

      <header className="bx-login__header">
        <div className="bx-login__brand">
          <span className="bx-login__logo" aria-hidden="true">
            <BullLogo />
          </span>
          <strong>Bullex</strong>
          <em>Trading mais inteligente para você</em>
        </div>
      </header>

      <main className="bx-login__main">
        <section className="bx-login__hero" aria-labelledby="bx-login-title">
          <p className="bx-login__pill">Trading × Disciplina × Liberdade</p>
          <h1 id="bx-login-title">
            Mais que <span>trades</span>, uma <span>evolução real.</span>
          </h1>
          <p className="bx-login__lead">
            Entre no BullStart e transforme disciplina em progresso. Missões,
            recompensas e evolução contínua para quem opera de verdade.
          </p>

          <ul className="bx-login__features">
            {FEATURES.map((feature) => (
              <li key={feature.id}>
                <i aria-hidden="true">
                  <FeatureIcon id={feature.id} />
                </i>
                {feature.label}
              </li>
            ))}
          </ul>

          <p className="bx-login__footer-line">— Traders hoje. Conquistas amanhã.</p>
        </section>

        <aside className="bx-login__panel" aria-labelledby="bx-login-form-title">
          <form className="bx-login-card" onSubmit={handleSubmit}>
            <h2 id="bx-login-form-title">Acesse sua conta</h2>
            <p>Entre agora e continue sua jornada em direção a novas conquistas.</p>

            <label className="bx-login-field">
              <span>ID Bullex</span>
              <span className="bx-login-field__control">
                <UserFieldIcon />
                <input
                  type="text"
                  name="bullexId"
                  autoComplete="username"
                  placeholder="Ex.: 482917"
                  value={bullexId}
                  onChange={(event) => setBullexId(event.target.value)}
                  required
                />
              </span>
            </label>

            <label className="bx-login-field">
              <span>Senha</span>
              <span className="bx-login-field__control">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="bx-login-field__toggle"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </span>
            </label>

            <div className="bx-login-card__meta">
              <label className="bx-login-check">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
                <span>Lembrar de mim</span>
              </label>
              <a href="#recuperar">Esqueceu sua senha?</a>
            </div>

            <button type="submit" className="bx-login-card__submit">
              Acessar minhas missões
              <ArrowIcon />
            </button>

            <p className="bx-login-card__signup">
              Ainda não tem uma conta?{' '}
              <button type="button" onClick={goCreateAccount}>
                Criar conta
              </button>
            </p>
          </form>
        </aside>
      </main>

      <section className="bx-login__benefits" id="beneficios" aria-label="Benefícios">
        {BENEFITS.map((benefit) => (
          <article key={benefit.id}>
            <span aria-hidden="true">
              <BenefitIcon id={benefit.id} />
            </span>
            <div>
              <strong>{benefit.title}</strong>
              <p>{benefit.lead}</p>
            </div>
          </article>
        ))}
        <p className="bx-login__script">Disciplina hoje, liberdade amanhã.</p>
      </section>

      <p className="bx-login__skip">
        <Link to="/inicio">Continuar sem login</Link>
      </p>
    </div>
  )
}

function BullLogo() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4.5 8.2c1.4-2.2 3.3-3.6 5.3-4.1.4 1.1 1.2 2 2.2 2.4 1-.4 1.8-1.3 2.2-2.4 2 .5 3.9 1.9 5.3 4.1-.7 1.1-1.1 2.4-1.1 3.8 0 1.2.3 2.3.8 3.3-.9 1.6-2.2 2.8-3.8 3.5-.4-.9-1.2-1.6-2.2-1.9-1 .3-1.8 1-2.2 1.9-1.6-.7-2.9-1.9-3.8-3.5.5-1 .8-2.1.8-3.3 0-1.4-.4-2.7-1.1-3.8Z"
      />
    </svg>
  )
}

function UserFieldIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19.5c1.4-3.2 3.8-4.8 6.5-4.8s5.1 1.6 6.5 4.8" />
    </svg>
  )
}

function FeatureIcon({ id }: { id: (typeof FEATURES)[number]['id'] }) {
  const props = {
    viewBox: '0 0 24 24',
    width: 14,
    height: 14,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
  }

  switch (id) {
    case 'skills':
      return (
        <svg {...props}>
          <path d="M4 19V9M10 19V5M16 19v-7M20 19V11" />
        </svg>
      )
    case 'missions':
      return (
        <svg {...props}>
          <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
          <path d="M12 13v3M9 20h6" />
        </svg>
      )
    case 'results':
      return (
        <svg {...props}>
          <path d="M4 16 10 10l4 4 6-7" />
          <path d="M14 7h6v6" />
        </svg>
      )
    default: {
      const _exhaustive: never = id
      return _exhaustive
    }
  }
}

function BenefitIcon({ id }: { id: (typeof BENEFITS)[number]['id'] }) {
  const props = {
    viewBox: '0 0 24 24',
    width: 18,
    height: 18,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
  }

  switch (id) {
    case 'rewards':
      return (
        <svg {...props}>
          <path d="M8 10h8v10H8z" />
          <path d="M7 10h10l-1-4H8l-1 4Z" />
          <path d="M12 6V4" />
        </svg>
      )
    case 'missions':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    case 'growth':
      return (
        <svg {...props}>
          <path d="M4 16 10 10l4 4 6-7" />
          <path d="M14 7h6v6" />
        </svg>
      )
    default: {
      const _exhaustive: never = id
      return _exhaustive
    }
  }
}
