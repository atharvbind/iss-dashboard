import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import { Navigation, RefreshCw } from 'lucide-react'
import { useDashboard } from '../hooks/useDashboard'

const issIcon = new Icon({
  iconUrl:
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" viewBox="0 0 54 54">
        <circle cx="27" cy="27" r="23" fill="#0891b2" stroke="white" stroke-width="3"/>
        <path d="M16 28h22M27 15v24M12 21h10M32 21h10M12 34h10M32 34h10" stroke="white" stroke-width="3" stroke-linecap="round"/>
        <path d="M23 24h8v8h-8z" fill="white"/>
      </svg>`),
  iconSize: [54, 54],
  iconAnchor: [27, 27],
})

function MapFollower({ position }) {
  const map = useMap()

  useEffect(() => {
    if (position) map.flyTo([position.lat, position.lng], map.getZoom(), { duration: 1.2 })
  }, [map, position])

  return null
}

export function IssMap() {
  const { iss, refreshIss } = useDashboard()
  const position = iss.current ?? { lat: 0, lng: 0 }
  const path = iss.path.map((point) => [point.lat, point.lng])

  return (
    <section className="dashboard-card overflow-hidden p-4 lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">ISS Tracker</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Updates every 15 seconds with the latest 15 tracked positions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refreshIss()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-cyan-600 px-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
          <Navigation className="text-cyan-600 dark:text-cyan-400" size={22} />
        </div>
      </div>

      {iss.error ? (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          <span>{iss.error}</span>
          <button type="button" onClick={() => refreshIss()} className="font-semibold">
            Retry
          </button>
        </div>
      ) : null}

      <div className="h-[420px] overflow-hidden rounded-lg">
        <MapContainer center={[position.lat, position.lng]} zoom={3} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapFollower position={iss.current} />
          {iss.current ? (
            <Marker position={[position.lat, position.lng]} icon={issIcon}>
              <Tooltip direction="top" offset={[0, -18]} permanent={false}>
                ISS: {position.lat.toFixed(3)}, {position.lng.toFixed(3)}
              </Tooltip>
              <Popup>
                <strong>International Space Station</strong>
                <br />
                Latitude: {position.lat.toFixed(4)}
                <br />
                Longitude: {position.lng.toFixed(4)}
                <br />
                Nearest: {iss.locationName}
              </Popup>
            </Marker>
          ) : null}
          {path.length > 1 ? (
            <Polyline positions={path} pathOptions={{ color: '#06b6d4', weight: 3 }} />
          ) : null}
        </MapContainer>
      </div>
    </section>
  )
}
