import { useEffect, useState } from 'react'
import { AppSidebar } from '../components/missions/AppSidebar'
import { DashboardHeader } from '../components/missions/DashboardHeader'
import { LevelUpModal } from '../components/missions/LevelUpModal'
import { MissionCompleteModal } from '../components/missions/MissionCompleteModal'
import { PromoCarousel } from '../components/missions/PromoCarousel'
import { RewardClaimModal } from '../components/missions/RewardClaimModal'
import { RewardsPass } from '../components/missions/RewardsPass'
import { WelcomeBanner } from '../components/missions/WelcomeBanner'
import {
  applyJourneyPoints,
  mockJourney,
  mockMissions,
  mockPromoBanners,
  type JourneyProgress,
  type Mission,
} from '../data/missionsMock'

function isMissionComplete(mission: Mission) {
  return mission.target > 0 && mission.current >= mission.target
}

function findClaimableMission(missions: Mission[]) {
  return (
    missions.find(
      (mission) =>
        isMissionComplete(mission) &&
        mission.status !== 'claimed' &&
        mission.status !== 'locked',
    ) ?? null
  )
}

type LevelUpState = {
  fromLevel: number
  toLevel: number
}

export function MissionsPage() {
  const [missions, setMissions] = useState(mockMissions)
  const [journey, setJourney] = useState<JourneyProgress>(mockJourney)
  const [completedMission, setCompletedMission] = useState<Mission | null>(null)
  const [claimedMission, setClaimedMission] = useState<Mission | null>(null)
  const [levelUp, setLevelUp] = useState<LevelUpState | null>(null)

  useEffect(() => {
    const ready = findClaimableMission(missions)
    if (!ready || claimedMission || levelUp) return

    const id = window.setTimeout(() => {
      setCompletedMission((current) => current ?? ready)
    }, 450)

    return () => window.clearTimeout(id)
  }, [missions, claimedMission, levelUp])

  function handleContinue(mission: Mission) {
    if (isMissionComplete(mission) && mission.status !== 'claimed' && mission.status !== 'locked') {
      setCompletedMission(mission)
      return
    }

    console.log('continuar missão (layout)', mission.id, mission.status)
  }

  function handleDismissComplete() {
    setCompletedMission(null)
  }

  function handleClaimNow() {
    if (!completedMission) return
    setClaimedMission(completedMission)
    setCompletedMission(null)
  }

  function handleCloseRewardModal() {
    if (claimedMission) {
      const previousJourney = journey
      const nextJourney = applyJourneyPoints(previousJourney, claimedMission.points)

      setMissions((current) =>
        current.map((mission) =>
          mission.id === claimedMission.id
            ? { ...mission, status: 'claimed', remainingLabel: 'Recompensa resgatada.' }
            : mission,
        ),
      )
      setJourney(nextJourney)
      setClaimedMission(null)

      if (nextJourney.level > previousJourney.level) {
        window.setTimeout(() => {
          setLevelUp({
            fromLevel: previousJourney.level,
            toLevel: nextJourney.level,
          })
        }, 280)
        return
      }
    }

    setClaimedMission(null)
  }

  function handleCloseLevelUp() {
    setLevelUp(null)
  }

  return (
    <div className="bs-shell">
      <DashboardHeader />

      <div className="bs-shell__body">
        <AppSidebar />

        <div className="bs-main">
          <WelcomeBanner />
          <PromoCarousel banners={mockPromoBanners} />
          <RewardsPass journey={journey} missions={missions} onContinue={handleContinue} />
        </div>
      </div>

      {completedMission ? (
        <MissionCompleteModal
          mission={completedMission}
          onClaim={handleClaimNow}
          onDismiss={handleDismissComplete}
        />
      ) : null}

      {claimedMission ? (
        <RewardClaimModal mission={claimedMission} onClose={handleCloseRewardModal} />
      ) : null}

      {levelUp ? (
        <LevelUpModal
          fromLevel={levelUp.fromLevel}
          toLevel={levelUp.toLevel}
          onClose={handleCloseLevelUp}
        />
      ) : null}
    </div>
  )
}
