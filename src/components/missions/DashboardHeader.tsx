import { useEffect, useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

/** Header logado — dados estáticos no MVP (futuro: API/banco). */
const STATIC_USER = {
  firstName: 'Gabriel',
  id: '482917',
  avatarSrc: '/media/avatar-gabriel.jpg',
} as const

const MENU_ITEMS = [
  { id: 'profile', label: 'Meu perfil', action: 'placeholder' },
  { id: 'account', label: 'Detalhes da conta', action: 'placeholder' },
  { id: 'settings', label: 'Configurações', action: 'placeholder' },
  { id: 'logout', label: 'Sair', action: 'logout' },
] as const

const STATIC_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Missão concluída',
    message: 'Você concluiu uma missão, vá e reivindique sua recompensa.',
    time: 'Agora',
    unread: true,
  },
  {
    id: 'n2',
    title: 'BullStart',
    message: 'Seu progresso do mês avançou. Continue nas missões para liberar novos prêmios.',
    time: 'Há 2 h',
    unread: false,
  },
  {
    id: 'n3',
    title: 'Campanha especial',
    message: 'Novas campanhas estão disponíveis. Confira os destaques na página de missões.',
    time: 'Ontem',
    unread: false,
  },
] as const

type OpenPanel = 'profile' | 'notifications' | null

export function DashboardHeader() {
  const navigate = useNavigate()
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null)
  const profileMenuId = useId()
  const notificationsMenuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const unreadCount = STATIC_NOTIFICATIONS.filter((item) => item.unread).length

  useEffect(() => {
    if (!openPanel) return

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpenPanel(null)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenPanel(null)
    }

    document.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [openPanel])

  function togglePanel(panel: Exclude<OpenPanel, null>) {
    setOpenPanel((current) => (current === panel ? null : panel))
  }

  function handleMenuAction(action: (typeof MENU_ITEMS)[number]['action']) {
    setOpenPanel(null)
    if (action === 'logout') {
      navigate('/')
    }
  }

  function handleNotificationClick() {
    setOpenPanel(null)
    navigate('/missoes')
  }

  return (
    <header className="bs-topbar">
      <Link className="bs-topbar__brand" to="/inicio" aria-label="Bullex">
        <span className="bs-topbar__logo" aria-hidden="true">
          <BullexMark />
        </span>
        <span className="bs-topbar__name">Bullex</span>
      </Link>

      <div className="bs-topbar__actions" ref={rootRef}>
        <a
          className="bs-topbar__icon-btn"
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
        >
          <InstagramIcon />
        </a>

        <div className="bs-topbar__menu">
          <button
            type="button"
            className={`bs-topbar__icon-btn${openPanel === 'notifications' ? ' is-open' : ''}`}
            aria-label="Notificações"
            aria-haspopup="dialog"
            aria-expanded={openPanel === 'notifications'}
            aria-controls={notificationsMenuId}
            onClick={() => togglePanel('notifications')}
          >
            <BellIcon />
            {unreadCount > 0 ? (
              <span className="bs-topbar__badge" aria-hidden="true">
                {unreadCount}
              </span>
            ) : null}
          </button>

          {openPanel === 'notifications' ? (
            <div
              className="bs-topbar__dropdown bs-topbar__dropdown--notifications"
              id={notificationsMenuId}
              role="dialog"
              aria-label="Notificações"
            >
              <div className="bs-topbar__notifications-head">
                <strong>Notificações</strong>
                <span className="bs-topbar__notifications-count">{STATIC_NOTIFICATIONS.length} mensagens</span>
              </div>

              <ul className="bs-topbar__notifications-list">
                {STATIC_NOTIFICATIONS.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`bs-topbar__notification${item.unread ? ' is-unread' : ''}`}
                      onClick={handleNotificationClick}
                    >
                      <span className="bs-topbar__notification-dot" aria-hidden="true" />
                      <span className="bs-topbar__notification-body">
                        <strong>{item.title}</strong>
                        <span>{item.message}</span>
                        <em>{item.time}</em>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="bs-topbar__menu">
          <button
            type="button"
            className={`bs-topbar__profile${openPanel === 'profile' ? ' is-open' : ''}`}
            aria-label="Menu do perfil"
            aria-haspopup="menu"
            aria-expanded={openPanel === 'profile'}
            aria-controls={profileMenuId}
            onClick={() => togglePanel('profile')}
          >
            <img
              className="bs-topbar__avatar"
              src={STATIC_USER.avatarSrc}
              alt=""
              width={36}
              height={36}
            />
            <span className="bs-topbar__meta">
              <strong>{STATIC_USER.firstName}</strong>
              <span>ID: {STATIC_USER.id}</span>
            </span>
            <ChevronIcon />
          </button>

          {openPanel === 'profile' ? (
            <div className="bs-topbar__dropdown" id={profileMenuId} role="menu" aria-label="Opções da conta">
              {MENU_ITEMS.map((item, index) => {
                const isLogout = item.action === 'logout'
                const showDivider = isLogout && index > 0

                return (
                  <div key={item.id}>
                    {showDivider ? <div className="bs-topbar__dropdown-divider" role="separator" /> : null}
                    <button
                      type="button"
                      role="menuitem"
                      className={`bs-topbar__dropdown-item${isLogout ? ' is-danger' : ''}`}
                      onClick={() => handleMenuAction(item.action)}
                    >
                      {item.label}
                    </button>
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}

function BullexMark() {
  return (
    <svg viewBox="0 0 64 64" width="28" height="28" fill="currentColor" aria-hidden="true">
      <path d="M12 22c0-6 4.4-11 10-12.4C24.4 7 28 6 32 6s7.6 1 10 3.6c5.6 1.4 10 6.4 10 12.4 0 2.8-.8 5.4-2.2 7.6L58 34l-6.4 2.4c.4 1.8.4 3.6 0 5.4L58 44l-6.2 2.4C48.4 52.8 41.2 58 32 58s-16.4-5.2-19.8-11.6L6 44l6.4-2.2c-.4-1.8-.4-3.6 0-5.4L6 34l6.2-4.4C12.8 27.4 12 24.8 12 22zm8.4 5.6c1.8 5.2 6.2 9 11.6 9s9.8-3.8 11.6-9c-1.4.8-3 1.4-4.8 1.4-2.6 0-4.8-1.4-6.8-3.2-1.8 1.8-4.2 3.2-6.8 3.2-1.8 0-3.4-.6-4.8-1.4z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M6 16V10a6 6 0 1 1 12 0v6l1.5 2H4.5L6 16Z" strokeLinejoin="round" />
      <path d="M10 19a2 2 0 0 0 4 0" strokeLinecap="round" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg
      className="bs-topbar__chevron"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m7 10 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
