import type { ReactNode } from 'react'

type AdminKpiCardProps = {
  label: string
  value: string
  hint?: string
  trend?: string
  icon?: ReactNode
  tone?: 'default' | 'premium' | 'muted'
  className?: string
}

export function AdminKpiCard({
  label,
  value,
  hint,
  trend,
  icon,
  tone = 'default',
  className,
}: AdminKpiCardProps) {
  return (
    <article
      className={`bx-kpi-card bx-kpi-card--${tone}${className ? ` ${className}` : ''}`}
    >
      <div className="bx-kpi-card__top">
        {icon ? (
          <span className="bx-kpi-card__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {trend ? <span className="bx-kpi-card__trend">{trend}</span> : null}
      </div>
      <p className="bx-kpi-card__label">{label}</p>
      <strong className="bx-kpi-card__value">{value}</strong>
      {hint ? <em className="bx-kpi-card__hint">{hint}</em> : null}
    </article>
  )
}
