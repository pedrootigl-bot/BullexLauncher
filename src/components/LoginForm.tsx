import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  AppleIcon,
  ArrowIcon,
  BullMark,
  DiscordIcon,
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,
  LockIcon,
  MailIcon,
} from './Icons'

type LoginFormProps = {
  onSubmit?: (data: { identifier: string; password: string; remember: boolean }) => void
  onCreateAccount?: () => void
}

export function LoginForm({ onSubmit, onCreateAccount }: LoginFormProps) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit?.({ identifier, password, remember })
  }

  return (
    <form className="login-card" onSubmit={handleSubmit} noValidate>
      <header className="login-card__header">
        <p className="login-card__eyebrow">Bem-vindo(a) ao</p>
        <h2 className="login-card__brand">
          <BullMark size={26} className="bull-mark" />
          BULLVERSE
        </h2>
        <p className="login-card__lead">Acesse sua conta e entre na arena.</p>
        <p className="login-card__sub">Conecte-se para continuar sua jornada.</p>
      </header>

      <div className="login-card__fields">
        <label className="field">
          <span className="sr-only">E-mail ou nome de usuário</span>
          <span className="field__icon" aria-hidden="true">
            <MailIcon />
          </span>
          <input
            type="text"
            name="identifier"
            autoComplete="username"
            placeholder="E-mail ou nome de usuário"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span className="sr-only">Senha</span>
          <span className="field__icon" aria-hidden="true">
            <LockIcon />
          </span>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete="current-password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="field__toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </label>
      </div>

      <div className="login-card__meta">
        <label className="remember">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <span>Lembrar de mim</span>
        </label>
        <a className="link" href="#recuperar-senha">
          Esqueceu sua senha?
        </a>
      </div>

      <div className="login-card__actions">
        <button type="submit" className="btn btn--primary">
          ENTRAR
          <ArrowIcon />
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => onCreateAccount?.()}>
          CRIAR CONTA
        </button>
      </div>

      <div className="login-card__divider">
        <span>OU CONTINUE COM</span>
      </div>

      <div className="social">
        <button type="button" className="social__btn" aria-label="Continuar com Google">
          <GoogleIcon size={22} />
        </button>
        <button type="button" className="social__btn" aria-label="Continuar com Discord">
          <DiscordIcon size={22} />
        </button>
        <button type="button" className="social__btn" aria-label="Continuar com Apple">
          <AppleIcon size={22} />
        </button>
      </div>

      <p className="login-card__legal">
        Ao continuar, você concorda com nossos{' '}
        <a className="link" href="#termos">
          Termos de Uso
        </a>{' '}
        e{' '}
        <a className="link" href="#privacidade">
          Política de Privacidade
        </a>
        .
      </p>
    </form>
  )
}
