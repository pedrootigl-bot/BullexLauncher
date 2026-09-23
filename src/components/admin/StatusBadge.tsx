export type StatusBadgeTone =
  | 'active'
  | 'inactive'
  | 'eligible'
  | 'completed'
  | 'pending'
  | 'blocked'
  | 'prepared'
  | 'drawn'
  | 'delivered'
  | 'used'
  | 'expired'
  | 'premium'
  | 'draft'
  | 'paused'
  | 'ended'

const TONE_CLASS: Record<StatusBadgeTone, string> = {
  active: 'is-active',
  inactive: 'is-inactive',
  eligible: 'is-eligible',
  completed: 'is-completed',
  pending: 'is-pending',
  blocked: 'is-blocked',
  prepared: 'is-prepared',
  drawn: 'is-drawn',
  delivered: 'is-delivered',
  used: 'is-used',
  expired: 'is-expired',
  premium: 'is-premium',
  draft: 'is-pending',
  paused: 'is-pending',
  ended: 'is-expired',
}

type StatusBadgeProps = {
  label: string
  tone?: StatusBadgeTone
  className?: string
}

export function StatusBadge({ label, tone = 'active', className }: StatusBadgeProps) {
  return (
    <em className={`bx-status-badge ${TONE_CLASS[tone]}${className ? ` ${className}` : ''}`}>
      {label}
    </em>
  )
}
