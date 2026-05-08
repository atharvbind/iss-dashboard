import { MapPin, Orbit, RadioTower, Route, UsersRound } from 'lucide-react'
import { useDashboard } from '../hooks/useDashboard'
import { Astronauts } from './Astronauts'
import { ChartsPanel } from './ChartsPanel'
import { IssMap } from './IssMap'
import { MetricCard } from './MetricCard'
import { NewsDashboard } from './NewsDashboard'

export function Dashboard() {
  const { iss, astronauts, news } = useDashboard()

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 md:px-8 lg:grid-cols-3">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5 lg:col-span-3">
        <MetricCard
          icon={Orbit}
          label="Latitude / Longitude"
          value={
            iss.current
              ? `${iss.current.lat.toFixed(3)}, ${iss.current.lng.toFixed(3)}`
              : 'Acquiring'
          }
          detail="Current ISS ground position"
        />
        <MetricCard
          icon={RadioTower}
          label="Computed Speed"
          value={`${Math.round(iss.speed || 0).toLocaleString()} km/h`}
          detail="Haversine distance over elapsed time"
        />
        <MetricCard
          icon={MapPin}
          label="Nearest Place"
          value={iss.locationName || 'Locating'}
          detail="Reverse geocoded map position"
        />
        <MetricCard
          icon={Route}
          label="Positions Tracked"
          value={String(iss.path.length)}
          detail="Last 15 points retained"
        />
        <MetricCard
          icon={UsersRound}
          label="Crew / Articles"
          value={`${astronauts.people.length || '--'} / ${news.articles.length || '--'}`}
          detail="People in space and loaded headlines"
        />
      </section>

      <IssMap />
      <ChartsPanel />
      <NewsDashboard />
      <Astronauts />
    </main>
  )
}
