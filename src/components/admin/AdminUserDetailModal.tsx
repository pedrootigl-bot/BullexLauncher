import { useEffect } from 'react'
import {
  adminAccountStatusLabel,
  type AdminRecentUser,
} from '../../data/adminMock'

type AdminUserDetailModalProps = {
  user: AdminRecentUser
  onClose: () => void
}

export function AdminUserDetailModal({ user, onClose }: AdminUserDetailModalProps) {
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
    <div className="bs-admin-modal" role="presentation" onClick={onClose}>
      <div
        className="bs-admin-modal__dialog bx-admin-user-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bx-admin-user-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="bs-admin-modal__close"
          aria-label="Fechar"
          onClick={onClose}
        >
          <CloseIcon />
        </button>

        <p className="bs-admin-modal__eyebrow">Usuário</p>

        <div className="bx-admin-user-modal__hero">
          <span className="bx-admin-user-modal__avatar" aria-hidden="true">
            {user.initials}
          </span>
          <div>
            <h2 id="bx-admin-user-title">{user.name}</h2>
            <p>{user.email}</p>
            <em className={`bx-admin-badge bx-admin-badge--${user.accountStatus}`}>
              {adminAccountStatusLabel[user.accountStatus]}
            </em>
          </div>
        </div>

        <dl className="bx-admin-user-modal__grid">
          <div>
            <dt>ID</dt>
            <dd>{user.id}</dd>
          </div>
          <div>
            <dt>Cadastro</dt>
            <dd>{user.registeredAt}</dd>
          </div>
          <div>
            <dt>Telefone</dt>
            <dd>{user.phone}</dd>
          </div>
          <div>
            <dt>Documento</dt>
            <dd>{user.document}</dd>
          </div>
          <div>
            <dt>País</dt>
            <dd>{user.country}</dd>
          </div>
          <div>
            <dt>Plano</dt>
            <dd>{user.plan}</dd>
          </div>
          <div>
            <dt>Saldo</dt>
            <dd>{user.balance}</dd>
          </div>
          <div>
            <dt>Total depositado</dt>
            <dd>{user.depositsTotal}</dd>
          </div>
          <div className="bx-admin-user-modal__full">
            <dt>Último acesso</dt>
            <dd>{user.lastLogin}</dd>
          </div>
          <div className="bx-admin-user-modal__full">
            <dt>Última ação</dt>
            <dd>{user.lastAction}</dd>
          </div>
          <div className="bx-admin-user-modal__full">
            <dt>Notas internas</dt>
            <dd>{user.notes.trim() ? user.notes : 'Sem notas internas.'}</dd>
          </div>
        </dl>

        <div className="bs-admin-modal__actions">
          <div className="bs-admin-modal__actions-end">
            <button type="button" className="bs-admin-modal__cta" onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  )
}
