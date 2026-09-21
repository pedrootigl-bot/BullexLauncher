import type { UserStats } from '../../data/missionsMock'
import { formatBRL } from '../../data/missionsMock'

type UserStatCardProps = {
  stats: UserStats
}

export function UserStatCards({ stats }: UserStatCardProps) {
  const items = [
    {
      id: 'deposit',
      value: formatBRL(stats.monthlyDeposit),
      label: 'Depositado no mês',
      icon: <DepositIcon />,
    },
    {
      id: 'volume',
      value: formatBRL(stats.tradingVolume),
      label: 'Volume negociado',
      icon: <VolumeIcon />,
    },
    {
      id: 'days',
      value: `${stats.activeDays} dias`,
      label: 'Ativo neste mês',
      icon: <CalendarIcon />,
    },
    {
      id: 'missions',
      value: `${stats.completedMissions}/${stats.totalMissions}`,
      label: 'Missões concluídas',
      icon: <CheckListIcon />,
    },
  ]

  return (
    <section className="bs-stats" aria-label="Resumo do mês">
      {items.map((item) => (
        <article key={item.id} className="bs-stat-card">
          <span className="bs-stat-card__icon" aria-hidden="true">
            {item.icon}
          </span>
          <div className="bs-stat-card__body">
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        </article>
      ))}
    </section>
  )
}

function DepositIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8M9.5 10.5c.6-.8 1.5-1.2 2.5-1.2 1.6 0 2.5.8 2.5 1.9S13.6 13 12 13s-2.5.6-2.5 1.8c0 1.1.9 1.9 2.5 1.9 1 0 1.9-.4 2.5-1.2" />
    </svg>
  )
}

function VolumeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 19V5M4 19h16" />
      <path d="M8 15v-3M12 15V8M16 15v-5" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M8 3.5V7M16 3.5V7M3.5 10h17" />
    </svg>
  )
}

function CheckListIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="m4 6 1.2 1.2L7.5 5M4 12l1.2 1.2L7.5 11M4 18l1.2 1.2L7.5 17" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
