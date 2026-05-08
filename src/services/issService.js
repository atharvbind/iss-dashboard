const OPEN_NOTIFY_BASE = "http://api.open-notify.org";
const ISS_FALLBACK_URL = "https://api.wheretheiss.at/v1/satellites/25544";
const OPEN_NOTIFY_PROXY = "https://api.allorigins.win/raw?url=";

// Mock data for when APIs fail
const MOCK_ISS_POSITION = {
  lat: 40.7128,
  lng: -74.0060,
  timestamp: Math.floor(Date.now() / 1000)
};

export async function fetchIssPosition() {
  try {
    let response;
    try {
      response = await fetch(
        `${OPEN_NOTIFY_PROXY}${encodeURIComponent(`${OPEN_NOTIFY_BASE}/iss-now.json`)}`,
        { timeout: 5000 }
      );
    } catch {
      response = await fetch(`${OPEN_NOTIFY_BASE}/iss-now.json`, { timeout: 5000 });
    }

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
    try {
      const response = await fetch(ISS_FALLBACK_URL, { timeout: 5000 });
      if (!response.ok) throw new Error("Unable to fetch ISS position");

      const data = await response.json();
      return {
        lat: Number(data.latitude),
        lng: Number(data.longitude),
        timestamp: Number(data.timestamp),
      };
    } catch {
      // Return mock data if all APIs fail
      console.warn("Using mock ISS data - APIs are unavailable");
      return {
        ...MOCK_ISS_POSITION,
        timestamp: Math.floor(Date.now() / 1000)
      };
    }
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
  { name: "Alexander Grebenkin", craft: "ISS" }
];

export async function fetchAstronauts() {
  try {
    let response;

    try {
      response = await fetch(
        `${OPEN_NOTIFY_PROXY}${encodeURIComponent(`${OPEN_NOTIFY_BASE}/astros.json`)}`,
        { timeout: 5000 }
      );
    } catch {
      response = await fetch(`${OPEN_NOTIFY_BASE}/astros.json`, { timeout: 5000 });
    }

    if (!response.ok) throw new Error("Unable to fetch astronaut roster");

    const data = await response.json();
    return data.people ?? [];
  } catch {
    console.warn("Using mock astronaut data - APIs are unavailable");
    return MOCK_ASTRONAUTS;
  }
}

export async function fetchNearestPlace({ lat, lng }) {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(lat),
    lon: String(lng),
    zoom: "10",
    addressdetails: "1",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${params}`,
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
