import { useEffect, useState } from 'react'
import { AppSidebar } from '../components/missions/AppSidebar'
import { DashboardHeader } from '../components/missions/DashboardHeader'
import { LevelUpModal } from '../components/missions/LevelUpModal'
import { PromoCarousel } from '../components/missions/PromoCarousel'
import { RewardClaimModal } from '../components/missions/RewardClaimModal'
import { RewardsPass } from '../components/missions/RewardsPass'
import { WelcomeBanner } from '../components/missions/WelcomeBanner'
import { useResource } from '../hooks/useResource'
import { applyJourneyPoints, type JourneyProgress, type Mission, type PromoBanner } from '../data/missionsMock'
import { claimMissionReward, fetchMissionsDashboard } from '../services/missions'
import { shouldUseMocks } from '../api/config'

function isMissionComplete(mission: Mission) {
  return mission.target > 0 && mission.current >= mission.target
}

type LevelUpState = {
  fromLevel: number
  toLevel: number
}

export function MissionsPage() {
  const { data, loading, error } = useResource(fetchMissionsDashboard, [])
  const [missions, setMissions] = useState<Mission[]>([])
  const [journey, setJourney] = useState<JourneyProgress | null>(null)
  const [banners, setBanners] = useState<PromoBanner[]>([])
  const [claimedMission, setClaimedMission] = useState<Mission | null>(null)
  const [levelUp, setLevelUp] = useState<LevelUpState | null>(null)

  useEffect(() => {
    if (!data) return
    setMissions(data.missions)
    setJourney(data.journey)
    setBanners(data.banners)
  }, [data])

  function handleContinue(mission: Mission) {
    if (isMissionComplete(mission) && mission.status !== 'claimed' && mission.status !== 'locked') {
      setClaimedMission(mission)
      return
    }

    console.log('continuar missão (layout)', mission.id, mission.status)
  }

  async function handleCloseRewardModal() {
    if (!claimedMission || !journey) {
      setClaimedMission(null)
      return
    }

    const previousJourney = journey

    if (!shouldUseMocks()) {
      try {
        const result = await claimMissionReward(claimedMission.id)
        setMissions((current) =>
          current.map((mission) =>
            mission.id === claimedMission.id ? result.mission : mission,
          ),
        )
        setJourney(result.journey)
        setClaimedMission(null)
        if (result.journey.level > previousJourney.level) {
          window.setTimeout(() => {
            setLevelUp({
              fromLevel: previousJourney.level,
              toLevel: result.journey.level,
            })
          }, 280)
        }
        return
      } catch (err) {
        console.error(err)
        setClaimedMission(null)
        return
      }
    }

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
    }
  }

  function handleCloseLevelUp() {
    setLevelUp(null)
  }

  function handleGainTrackPoints(points: number) {
    if (points <= 0 || !journey) return

    const previousJourney = journey
    const nextJourney = applyJourneyPoints(previousJourney, points)
    setJourney(nextJourney)

    if (nextJourney.level > previousJourney.level) {
      window.setTimeout(() => {
        setLevelUp({
          fromLevel: previousJourney.level,
          toLevel: nextJourney.level,
        })
      }, 280)
    }
  }

  return (
    <div className="bs-shell">
      <DashboardHeader />

      <div className="bs-shell__body">
        <AppSidebar />

        <div className="bs-main">
          {loading ? <p className="bs-welcome__sub">Carregando missões…</p> : null}
          {error ? <p className="bs-welcome__sub">Erro: {error}</p> : null}
          {!loading && journey ? (
            <>
              <WelcomeBanner />
              <PromoCarousel banners={banners} />
              <RewardsPass
                journey={journey}
                missions={missions}
                onContinue={handleContinue}
                onGainPoints={handleGainTrackPoints}
              />
            </>
          ) : null}
        </div>
      </div>

      {claimedMission ? (
        <RewardClaimModal mission={claimedMission} onClose={() => void handleCloseRewardModal()} />
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
