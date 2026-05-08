const EARTH_RADIUS_KM = 6371

function toRadians(degrees) {
  return (Number(degrees) * Math.PI) / 180
}

export function calculateDistanceKm(start, end) {
  if (!start || !end) return 0

  const deltaLat = toRadians(end.lat - start.lat)
  const deltaLng = toRadians(end.lng - start.lng)
  const lat1 = toRadians(start.lat)
  const lat2 = toRadians(end.lat)

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_KM * c
}

export function calculateSpeedKmh(previousPoint, currentPoint) {
  if (!previousPoint || !currentPoint) return 0

  const elapsedHours = (currentPoint.timestamp - previousPoint.timestamp) / 3600
  if (elapsedHours <= 0) return 0

  const speed = calculateDistanceKm(previousPoint, currentPoint) / elapsedHours
  return Number.isFinite(speed) && speed > 0 ? speed : 0
}
