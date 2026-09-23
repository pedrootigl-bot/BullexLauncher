import { useEffect, useId, useRef, useState } from 'react'

export type AdminActionMenuItem = {
  id: string
  label: string
  onSelect: () => void
  tone?: 'default' | 'danger'
  disabled?: boolean
}

type AdminActionMenuProps = {
  label?: string
  items: AdminActionMenuItem[]
}

export function AdminActionMenu({ label = 'Ações', items }: AdminActionMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const safeItems = items.filter((item) => !item.disabled)
  const primary = safeItems.filter((item) => item.tone !== 'danger')
  const danger = safeItems.filter((item) => item.tone === 'danger')

  return (
    <div className={`bx-action-menu${open ? ' is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="bx-action-menu__trigger"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true">⋯</span>
      </button>
      {open ? (
        <div className="bx-action-menu__panel" role="menu" id={menuId}>
          {primary.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className="bx-action-menu__item"
              onClick={() => {
                setOpen(false)
                item.onSelect()
              }}
            >
              {item.label}
            </button>
          ))}
          {danger.length > 0 && primary.length > 0 ? (
            <div className="bx-action-menu__divider" role="separator" />
          ) : null}
          {danger.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className="bx-action-menu__item is-danger"
              onClick={() => {
                setOpen(false)
                item.onSelect()
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
