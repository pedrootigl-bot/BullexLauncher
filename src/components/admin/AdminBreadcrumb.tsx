import { Link } from 'react-router-dom'

export type AdminBreadcrumbItem = {
  label: string
  to?: string
}

type AdminBreadcrumbProps = {
  items: AdminBreadcrumbItem[]
}

export function AdminBreadcrumb({ items }: AdminBreadcrumbProps) {
  return (
    <nav className="bx-breadcrumb" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`}>
              {item.to && !isLast ? (
                <Link to={item.to}>{item.label}</Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined}>{item.label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
