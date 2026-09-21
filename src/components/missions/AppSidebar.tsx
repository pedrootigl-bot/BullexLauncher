import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { navItems } from '../../data/missionsMock'

const SIDEBAR_STORAGE_KEY = 'bs-sidebar-open'

function readSidebarOpen() {
  try {
    const stored = sessionStorage.getItem(SIDEBAR_STORAGE_KEY)
    return stored === null ? true : stored === '1'
  } catch {
    return true
  }
}

export function AppSidebar() {
  const location = useLocation()
  const [open, setOpen] = useState(readSidebarOpen)

  useEffect(() => {
    try {
      sessionStorage.setItem(SIDEBAR_STORAGE_KEY, open ? '1' : '0')
    } catch {
      // ignore
    }

    document.documentElement.classList.toggle('bs-sidebar-collapsed', !open)

    return () => document.documentElement.classList.remove('bs-sidebar-collapsed')
  }, [open])

  if (!open) {
    return createPortal(
      <button
        type="button"
        className="bs-sidebar-reopen"
        aria-label="Abrir menu"
        onClick={() => setOpen(true)}
      >
        <PanelOpenIcon />
      </button>,
      document.body,
    )
  }

  return (
    <aside className="bs-sidebar">
      <div className="bs-sidebar__top">
        <button
          type="button"
          className="bs-sidebar__close"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
        >
          <PanelCloseIcon />
        </button>
      </div>

      <nav className="bs-sidebar__nav" aria-label="Menu principal">
        {navItems.map((item) => {
          const isActive =
            item.id === 'inicio'
              ? location.pathname === '/inicio'
              : item.id === 'bullstart'
                ? location.pathname.startsWith('/missoes')
                : item.id === 'recompensas'
                  ? location.pathname.startsWith('/recompensas')
                  : item.id === 'historico'
                    ? location.pathname.startsWith('/historico')
                    : false

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`bs-sidebar__link${isActive ? ' is-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="bs-sidebar__icon" aria-hidden="true">
                <NavIcon id={item.id} />
              </span>
              <span>{item.label}</span>
              {'badge' in item && item.badge ? (
                <span className="bs-sidebar__badge">{item.badge}</span>
              ) : null}
            </Link>
          )
        })}
      </nav>

      <div className="bs-sidebar__promo">
        <span className="bs-sidebar__promo-icon" aria-hidden="true">
          <TrophyIcon />
        </span>
        <p>TRADING MAIS INTELIGENTE PARA VOCÊ.</p>
      </div>
    </aside>
  )
}

function PanelCloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M15 6 9 12l6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PanelOpenIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function NavIcon({ id }: { id: (typeof navItems)[number]['id'] }) {
  const props = {
    viewBox: '0 0 24 24',
    width: 18,
    height: 18,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (id) {
    case 'inicio':
      return (
        <svg {...props}>
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
        </svg>
      )
    case 'negociacao':
      return (
        <svg {...props}>
          <path d="M4 16 9 9l4 4 7-9" />
          <path d="M15 4h5v5" />
        </svg>
      )
    case 'mercados':
      return (
        <svg {...props}>
          <path d="M4 19V5M4 19h16" />
          <path d="M8 15v-4M12 15V8M16 15v-6" />
        </svg>
      )
    case 'bullstart':
      return (
        <svg {...props}>
          <path d="M12 3 14.5 8.5 20.5 9.2 16 13.4 17.2 19.3 12 16.4 6.8 19.3 8 13.4 3.5 9.2 9.5 8.5 12 3Z" />
        </svg>
      )
    case 'promocoes':
      return (
        <svg {...props}>
          <path d="M12 3v18M8 7h5.5a2.5 2.5 0 0 1 0 5H8m0 0h6a2.5 2.5 0 0 1 0 5H8" />
        </svg>
      )
    case 'recompensas':
      return (
        <svg {...props}>
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <path d="M3 10h18" />
          <circle cx="16" cy="14.5" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'historico':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4.5L15 16" />
        </svg>
      )
    case 'suporte':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
          <path d="M9.2 9.2a2.8 2.8 0 0 1 5.4 1c0 1.8-2.7 2.2-2.7 4" />
          <circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      )
    default: {
      const _exhaustive: never = id
      return _exhaustive
    }
  }
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path d="M8 6H5.5A2.5 2.5 0 0 0 5.5 11H8M16 6h2.5A2.5 2.5 0 0 1 18.5 11H16" />
      <path d="M12 13v3M9 20h6M10 17h4" strokeLinecap="round" />
    </svg>
  )
}
