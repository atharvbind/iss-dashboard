const OPEN_NOTIFY_BASE = "http://api.open-notify.org";
const ISS_FALLBACK_URL = "https://api.wheretheiss.at/v1/satellites/25544";
const OPEN_NOTIFY_PROXY = "https://api.allorigins.win/raw?url=";

// Mock data for when APIs fail
function getMockIssPosition() {
  // Simulate ISS movement: roughly 7.66 km/s orbital speed
  // ISS orbits Earth every ~90 minutes, so position changes constantly
  const now = Math.floor(Date.now() / 1000);
  const baseLat = 40.7128;
  const baseLng = -74.006;

  // Create more realistic orbital movement
  // ISS moves ~15 degrees longitude per orbit (every 90 minutes)
  // So in 15 seconds, it moves about 0.069 degrees longitude
  const secondsSinceEpoch = now % (90 * 60); // 90 minutes in seconds
  const orbitProgress = secondsSinceEpoch / (90 * 60); // 0 to 1

  // Simulate orbital path: roughly east-west movement with some north-south variation
  const lng = baseLng + ((orbitProgress * 360) % 360) - 180; // Full circle
  const lat = baseLat + Math.sin(orbitProgress * 2 * Math.PI) * 5; // ±5 degrees variation

  return {
    lat: Math.max(-90, Math.min(90, lat)), // Clamp to valid latitude
    lng: lng,
    timestamp: now,
  };
}

export async function fetchIssPosition() {
  try {
    const response = await fetch("/api/iss", { timeout: 5000 });
    
    if (!response.ok) {
      throw new Error("Unable to fetch ISS position");
    }

    const data = await response.json();
    return {
      lat: Number(data.iss_position.latitude),
      lng: Number(data.iss_position.longitude),
      timestamp: Number(data.timestamp),
    };
  } catch {
    console.warn("Using mock ISS data - API is unavailable");
    return getMockIssPosition();
  }
}

// Mock data for astronauts
const MOCK_ASTRONAUTS = [
  { name: "Oleg Kononenko", craft: "ISS" },
  { name: "Nikolai Chub", craft: "ISS" },
  { name: "Tracy Caldwell Dyson", craft: "ISS" },
  { name: "Matthew Dominick", craft: "ISS" },
  { name: "Michael Barratt", craft: "ISS" },
  { name: "Jeanette Epps", craft: "ISS" },
  { name: "Alexander Grebenkin", craft: "ISS" },
];

export async function fetchAstronauts() {
  try {
    const response = await fetch("/api/astros", {
      timeout: 5000,
    });

    if (!response.ok) throw new Error("Unable to fetch astronaut roster");

    const data = await response.json();
    return data.people ?? [];
  } catch {
    console.warn("Using mock astronaut data - APIs are unavailable");
    return MOCK_ASTRONAUTS;
  }
}

export async function fetchNearestPlace({ lat, lng }) {
  const response = await fetch(
    `/api/geocode?lat=${lat}&lon=${lng}`,
  );
  if (!response.ok) throw new Error("Unable to reverse geocode ISS location");

  const data = await response.json();
  const address = data.address ?? {};
  const place =
    address.city ||
    address.town ||
    address.village ||
    address.state ||
    address.country ||
    data.name ||
    data.display_name;

  return place || "Over ocean or remote region";
}
