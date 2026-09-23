import type { ReactNode } from 'react'

type AdminEmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function AdminEmptyState({
  title,
  description,
  action,
  className,
}: AdminEmptyStateProps) {
  return (
    <div className={`bx-empty-state${className ? ` ${className}` : ''}`}>
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
      {action ? <div className="bx-empty-state__action">{action}</div> : null}
    </div>
  )
}
