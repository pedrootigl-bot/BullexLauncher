import { AppSidebar } from '../components/missions/AppSidebar'
import { DashboardHeader } from '../components/missions/DashboardHeader'
import { StartHero } from '../components/missions/StartHero'
import { StartInfoCards } from '../components/missions/StartInfoCards'

export function HomePage() {
  return (
    <div className="bs-shell">
      <DashboardHeader />

      <div className="bs-shell__body">
        <AppSidebar />

        <div className="bs-main">
          <StartHero />
          <StartInfoCards />
        </div>
      </div>
    </div>
  )
}
