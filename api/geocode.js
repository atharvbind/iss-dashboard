"use strict";

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing lat or lon parameters" });
  }

  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      // Return a generic location name if geocoding fails
      return res.json({
        display_name: "Over the ocean",
        address: { country: "International Waters" }
      });
    }

    const data = await response.json();
    
    // Map BigDataCloud response to the Nominatim format expected by the frontend
    res.json({
      address: {
        city: data.city || data.locality,
        state: data.principalSubdivision,
        country: data.countryName
      },
      display_name: data.locality || data.city || data.principalSubdivision || data.countryName || "Unknown location"
    });
  } catch {
    // Return fallback location on error
    res.json({
      display_name: "Unknown location",
      address: { country: "Unknown" }
    });
  }
}