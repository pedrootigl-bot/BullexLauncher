import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  adminNavItems,
  adminProfile,
  type AdminNavId,
} from '../../data/adminMock'

type AdminSidebarProps = {
  active: AdminNavId
  onNavigate: (id: AdminNavId) => void
}

export function AdminSidebar({ active, onNavigate }: AdminSidebarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    if (!menuOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  function handleNavigate(id: AdminNavId) {
    onNavigate(id)
    setMenuOpen(false)
  }

  return (
    <aside className="bx-admin-sidebar" aria-label="Navegação administrativa">
      <div className="bx-admin-sidebar__top">
        <div className="bx-admin-sidebar__brand">
          <span className="bx-admin-sidebar__logo" aria-hidden="true">
            <BullMark />
          </span>
          <div>
            <strong>BULLEX</strong>
            <em>ADMIN</em>
          </div>
        </div>

        <button
          type="button"
          className={`bx-admin-sidebar__burger${menuOpen ? ' is-open' : ''}`}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          aria-controls="bx-admin-mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className="bx-admin-sidebar__desktop">
        <SidebarBody active={active} onNavigate={handleNavigate} />
      </div>

      <div
        className={`bx-admin-drawer-backdrop${menuOpen ? ' is-open' : ''}`}
        aria-hidden={!menuOpen}
        onClick={() => setMenuOpen(false)}
      />

      <div
        id="bx-admin-mobile-menu"
        className={`bx-admin-drawer${menuOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu administrativo"
        aria-hidden={!menuOpen}
      >
        <div className="bx-admin-drawer__head">
          <div className="bx-admin-sidebar__brand">
            <span className="bx-admin-sidebar__logo" aria-hidden="true">
              <BullMark />
            </span>
            <div>
              <strong>BULLEX</strong>
              <em>ADMIN</em>
            </div>
          </div>
          <button
            type="button"
            className="bx-admin-drawer__close"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>

        <SidebarBody active={active} onNavigate={handleNavigate} />
      </div>
    </aside>
  )
}

function SidebarBody({
  active,
  onNavigate,
}: {
  active: AdminNavId
  onNavigate: (id: AdminNavId) => void
}) {
  return (
    <>
      <nav className="bx-admin-sidebar__nav">
        {adminNavItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={active === item.id ? 'is-active' : undefined}
            onClick={() => onNavigate(item.id)}
          >
            <span className="bx-admin-sidebar__icon" aria-hidden="true">
              <NavIcon id={item.id} />
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="bx-admin-sidebar__foot">
        <div className="bx-admin-sidebar__promo" aria-hidden="true">
          <img src={adminProfile.supportImage} alt="" />
          <p>{adminProfile.brandCardTitle}</p>
        </div>

        <div className="bx-admin-sidebar__user">
          <span className="bx-admin-sidebar__avatar">{adminProfile.initials}</span>
          <div>
            <strong>{adminProfile.name}</strong>
            <em>{adminProfile.role}</em>
          </div>
        </div>

        <Link to="/missoes" className="bx-admin-sidebar__exit">
          Sair
        </Link>
      </div>
    </>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  )
}

function BullMark() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4.5 8.2c1.4-2.2 3.3-3.6 5.3-4.1.4 1.1 1.2 2 2.2 2.4 1-.4 1.8-1.3 2.2-2.4 2 .5 3.9 1.9 5.3 4.1-.7 1.1-1.1 2.4-1.1 3.8 0 1.2.3 2.3.8 3.3-.9 1.6-2.2 2.8-3.8 3.5-.4-.9-1.2-1.6-2.2-1.9-1 .3-1.8 1-2.2 1.9-1.6-.7-2.9-1.9-3.8-3.5.5-1 .8-2.1.8-3.3 0-1.4-.4-2.7-1.1-3.8Z"
      />
    </svg>
  )
}

function NavIcon({ id }: { id: AdminNavId }) {
  const props = {
    viewBox: '0 0 24 24',
    width: 16,
    height: 16,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (id) {
    case 'overview':
      return (
        <svg {...props}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
        </svg>
      )
    case 'users':
      return (
        <svg {...props}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 19c1.2-3 3.2-4.5 5.5-4.5S13.3 16 14.5 19" />
          <circle cx="16.5" cy="9" r="2.4" />
          <path d="M15 14.5c1.8.3 3.3 1.5 4.2 3.5" />
        </svg>
      )
    case 'deposits':
      return (
        <svg {...props}>
          <path d="M12 4v12" />
          <path d="m7.5 11.5 4.5 4.5 4.5-4.5" />
          <path d="M5 20h14" />
        </svg>
      )
    case 'withdrawals':
      return (
        <svg {...props}>
          <path d="M12 20V8" />
          <path d="m7.5 12.5 4.5-4.5 4.5 4.5" />
          <path d="M5 4h14" />
        </svg>
      )
    case 'rewards':
      return (
        <svg {...props}>
          <path d="M12 3 14.5 8.5 20.5 9.2 16 13.4 17.2 19.3 12 16.4 6.8 19.3 8 13.4 3.5 9.2 9.5 8.5 12 3Z" />
        </svg>
      )
    case 'campaigns':
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 9h18" />
          <path d="M8 5v4" />
        </svg>
      )
    case 'missions':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 4v2M12 18v2M4 12h2M18 12h2" />
        </svg>
      )
    case 'coupons':
      return (
        <svg {...props}>
          <path d="M4 9.5A2.5 2.5 0 0 0 6.5 7h11A2.5 2.5 0 0 0 20 9.5v1a1.5 1.5 0 0 1 0 3v1A2.5 2.5 0 0 0 17.5 17h-11A2.5 2.5 0 0 0 4 14.5v-1a1.5 1.5 0 0 1 0-3v-1Z" />
          <path d="M12 7v10" strokeDasharray="2 2" />
        </svg>
      )
    case 'prizes':
      return (
        <svg {...props}>
          <path d="M8 10h8v10H8z" />
          <path d="M7 10h10l-1-4H8l-1 4Z" />
          <path d="M12 6V4M9 6c0-1.5 1.2-2.5 3-2.5S15 4.5 15 6" />
        </svg>
      )
    case 'contents':
      return (
        <svg {...props}>
          <path d="M8 4h7l4 4v12a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 20V5.5A1.5 1.5 0 0 1 8 4Z" />
          <path d="M15 4v4h4M9.5 12h5M9.5 15.5h5" />
        </svg>
      )
    case 'notifications':
      return (
        <svg {...props}>
          <path d="M6 16h12l-1.2-2.2a5.5 5.5 0 0 1-.8-2.8V9a4 4 0 1 0-8 0v1.9c0 1-.3 2-.8 2.9L6 16Z" />
          <path d="M10 18a2 2 0 0 0 4 0" />
        </svg>
      )
    case 'reports':
      return (
        <svg {...props}>
          <path d="M5 19V9M10 19V5M15 19v-7M20 19V8" />
        </svg>
      )
    case 'settings':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3.5v2.2M12 18.3v2.2M4.8 6.8l1.6 1.6M17.6 15.6l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.8 17.2l1.6-1.6M17.6 8.4l1.6-1.6" />
        </svg>
      )
    default: {
      const _exhaustive: never = id
      return _exhaustive
    }
  }
}
