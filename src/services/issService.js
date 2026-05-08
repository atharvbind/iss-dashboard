const OPEN_NOTIFY_BASE = 'http://api.open-notify.org'
const ISS_FALLBACK_URL = 'https://api.wheretheiss.at/v1/satellites/25544'
const OPEN_NOTIFY_PROXY = 'https://api.allorigins.win/raw?url='

export async function fetchIssPosition() {
  try {
    let response
    try {
      response = await fetch(`${OPEN_NOTIFY_BASE}/iss-now.json`)
    } catch {
      response = await fetch(`${OPEN_NOTIFY_PROXY}${encodeURIComponent(`${OPEN_NOTIFY_BASE}/iss-now.json`)}`)
    }

    if (!response.ok) throw new Error('Unable to fetch ISS position')

    const data = await response.json()
    return {
      lat: Number(data.iss_position.latitude),
      lng: Number(data.iss_position.longitude),
      timestamp: Number(data.timestamp),
    }
  } catch {
    const response = await fetch(ISS_FALLBACK_URL)
    if (!response.ok) throw new Error('Unable to fetch ISS position')

    const data = await response.json()
    return {
      lat: Number(data.latitude),
      lng: Number(data.longitude),
      timestamp: Number(data.timestamp),
    }
  }
}

export async function fetchAstronauts() {
  let response

  try {
    response = await fetch(`${OPEN_NOTIFY_BASE}/astros.json`)
  } catch {
    response = await fetch(`${OPEN_NOTIFY_PROXY}${encodeURIComponent(`${OPEN_NOTIFY_BASE}/astros.json`)}`)
  }

  if (!response.ok) throw new Error('Unable to fetch astronaut roster')

  const data = await response.json()
  return data.people ?? []
}

export async function fetchNearestPlace({ lat, lng }) {
  const params = new URLSearchParams({
    format: 'jsonv2',
    lat: String(lat),
    lon: String(lng),
    zoom: '10',
    addressdetails: '1',
  })

  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`)
  if (!response.ok) throw new Error('Unable to reverse geocode ISS location')

  const data = await response.json()
  const address = data.address ?? {}
  const place =
    address.city ||
    address.town ||
    address.village ||
    address.state ||
    address.country ||
    data.name ||
    data.display_name

  return place || 'Over ocean or remote region'
}
