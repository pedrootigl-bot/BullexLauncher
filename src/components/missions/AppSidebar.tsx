import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  adminNavGroups,
  adminNavItems,
  adminSectionPath,
  parseAdminSection,
  type AdminNavId,
} from '../../data/adminMock'
import { navItems } from '../../data/missionsMock'
import { AdminNavIcon } from '../admin/AdminSidebar'

const MOBILE_QUERY = '(max-width: 1100px)'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_QUERY).matches : false,
  )

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY)
    function onChange() {
      setIsMobile(media.matches)
    }
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return isMobile
}

function isNavActive(pathname: string, id: (typeof navItems)[number]['id']) {
  switch (id) {
    case 'bullstart':
      return pathname.startsWith('/missoes')
    case 'recompensas':
      return pathname.startsWith('/recompensas')
    case 'historico':
      return pathname.startsWith('/historico')
    case 'suporte':
      return pathname.startsWith('/suporte')
    case 'administrador':
      return pathname.startsWith('/administrador')
    default: {
      const _exhaustive: never = id
      return _exhaustive
    }
  }
}

export function AppSidebar() {
  const location = useLocation()
  const isMobile = useIsMobile()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [burgerSlot, setBurgerSlot] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setBurgerSlot(document.getElementById('bs-topbar-burger-slot'))
  }, [])

  useEffect(() => {
    if (isMobile) {
      document.documentElement.classList.add('bs-sidebar-collapsed')
      return () => document.documentElement.classList.remove('bs-sidebar-collapsed')
    }

    document.documentElement.classList.remove('bs-sidebar-collapsed')
    return undefined
  }, [isMobile])

  useEffect(() => {
    if (!mobileOpen) return undefined

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMobileOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [mobileOpen])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname, location.search])

  if (isMobile) {
    return (
      <>
        {burgerSlot
          ? createPortal(
              <button
                type="button"
                className={`bs-mobile-burger${mobileOpen ? ' is-open' : ''}`}
                aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
                aria-expanded={mobileOpen}
                aria-controls="bs-mobile-nav"
                onClick={() => setMobileOpen((open) => !open)}
              >
                <span />
                <span />
                <span />
              </button>,
              burgerSlot,
            )
          : null}

        <div
          className={`bs-mobile-nav-backdrop${mobileOpen ? ' is-open' : ''}`}
          aria-hidden={!mobileOpen}
          onClick={() => setMobileOpen(false)}
        />

        <aside
          id="bs-mobile-nav"
          className={`bs-mobile-nav${mobileOpen ? ' is-open' : ''}`}
          aria-label="Menu principal"
          aria-hidden={!mobileOpen}
        >
          <div className="bs-mobile-nav__head">
            <strong>Menu</strong>
            <button
              type="button"
              className="bs-mobile-nav__close"
              aria-label="Fechar menu"
              onClick={() => setMobileOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>

          <nav className="bs-sidebar__nav" aria-label="Menu principal">
            <NavLinks pathname={location.pathname} onNavigate={() => setMobileOpen(false)} />
          </nav>

          <div className="bs-sidebar__promo">
            <span className="bs-sidebar__promo-icon" aria-hidden="true">
              <TrophyIcon />
            </span>
            <p>TRADING MAIS INTELIGENTE PARA VOCÊ.</p>
          </div>
        </aside>
      </>
    )
  }

  return (
    <aside className="bs-sidebar">
      <nav className="bs-sidebar__nav" aria-label="Menu principal">
        <NavLinks pathname={location.pathname} />
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

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <>
      {navItems.map((item) => {
        if (item.id === 'administrador') {
          return (
            <AdminMenuDropdown
              key={item.id}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          )
        }

        const isActive = isNavActive(pathname, item.id)

        return (
          <Link
            key={item.id}
            to={item.path}
            className={`bs-sidebar__link${isActive ? ' is-active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={onNavigate}
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
    </>
  )
}

function AdminMenuDropdown({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activeSection = parseAdminSection(searchParams.get('section'))
  const onAdmin = pathname.startsWith('/administrador')
  const [open, setOpen] = useState(onAdmin)
  const menuId = useId()

  useEffect(() => {
    if (onAdmin) setOpen(true)
  }, [onAdmin])

  function handleToggle() {
    setOpen((current) => {
      const next = !current
      if (next && !onAdmin) navigate('/administrador')
      return next
    })
  }

  return (
    <div className={`bs-sidebar__admin${open ? ' is-open' : ''}${onAdmin ? ' is-active' : ''}`}>
      <button
        type="button"
        className={`bs-sidebar__link bs-sidebar__admin-trigger${onAdmin ? ' is-active' : ''}`}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={handleToggle}
      >
        <span className="bs-sidebar__icon" aria-hidden="true">
          <NavIcon id="administrador" />
        </span>
        <span>Administrador</span>
        <span className="bs-sidebar__admin-chevron" aria-hidden="true">
          <AdminChevronIcon />
        </span>
      </button>

      <div
        id={menuId}
        className="bs-sidebar__admin-menu"
        role="group"
        aria-label="Seções administrativas"
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        <div className="bs-sidebar__admin-menu-inner">
          {adminNavGroups.map((group) => {
            const items = adminNavItems.filter((item) => item.group === group.id)
            return (
              <div key={group.id} className="bs-sidebar__admin-group">
                <p className="bs-sidebar__admin-label">{group.label}</p>
                {items.map((item) => {
                  const isActive = onAdmin && activeSection === item.id

                  return (
                    <Link
                      key={item.id}
                      to={adminSectionPath(item.id)}
                      className={`bs-sidebar__admin-item${isActive ? ' is-active' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                      tabIndex={open ? undefined : -1}
                      onClick={onNavigate}
                    >
                      <span className="bs-sidebar__admin-item-icon" aria-hidden="true">
                        <AdminNavIcon id={item.id} />
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            )
          })}
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

function AdminChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m7 10 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
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
    case 'bullstart':
      return (
        <svg {...props}>
          <path d="M12 3 14.5 8.5 20.5 9.2 16 13.4 17.2 19.3 12 16.4 6.8 19.3 8 13.4 3.5 9.2 9.5 8.5 12 3Z" />
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
    case 'administrador':
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5.5 19.5c1.4-3.2 3.8-4.8 6.5-4.8s5.1 1.6 6.5 4.8" />
          <path d="M17.5 4.8 19 6.3l-1.5 1.5M19 6.3h-2.4" />
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
