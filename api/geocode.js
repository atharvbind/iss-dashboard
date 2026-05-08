"use strict";

export default async function handler(req, res) {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing lat or lon parameters" });
  }

  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ISS-Dashboard/1.0 (https://github.com/atharvbind/iss-dashboard)'
      }
    });

    if (!response.ok) {
      // Return a generic location name if geocoding fails
      return res.json({
        display_name: "Over the ocean",
        address: { country: "International Waters" }
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    // Return fallback location on error
    res.json({
      display_name: "Unknown location",
      address: { country: "Unknown" }
    });
  }
}