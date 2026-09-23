import type { ReactNode } from 'react'
import { AdminBreadcrumb, type AdminBreadcrumbItem } from './AdminBreadcrumb'

type AdminPageHeaderProps = {
  eyebrow: string
  title: string
  lead: string
  breadcrumb: AdminBreadcrumbItem[]
  actions?: ReactNode
  compact?: boolean
}

export function AdminPageHeader({
  eyebrow,
  title,
  lead,
  breadcrumb,
  actions,
  compact = false,
}: AdminPageHeaderProps) {
  return (
    <header className={`bx-page-header${compact ? ' is-compact' : ''}`}>
      <AdminBreadcrumb items={breadcrumb} />
      <div className="bx-page-header__row">
        <div className="bx-page-header__copy">
          <p className="bx-page-header__eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="bx-page-header__lead">{lead}</p>
        </div>
        {actions ? <div className="bx-page-header__actions">{actions}</div> : null}
      </div>
    </header>
  )
}
