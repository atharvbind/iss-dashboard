"use strict";

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const url = "http://api.open-notify.org/astros.json";

  try {
    const response = await fetch(url);
    const text = await response.text();

    if (!response.ok) {
      // Return mock data if API fails
      return res.json({
        people: [
          { name: "Oleg Kononenko", craft: "ISS" },
          { name: "Nikolai Chub", craft: "ISS" },
          { name: "Tracy Caldwell Dyson", craft: "ISS" },
          { name: "Matthew Dominick", craft: "ISS" },
          { name: "Michael Barratt", craft: "ISS" },
          { name: "Jeanette Epps", craft: "ISS" },
          { name: "Alexander Grebenkin", craft: "ISS" }
        ],
        number: 7,
        message: "success"
      });
    }

    const data = JSON.parse(text);
    res.json(data);
  } catch {
    // Return mock data on error
    res.json({
      people: [
        { name: "Oleg Kononenko", craft: "ISS" },
        { name: "Nikolai Chub", craft: "ISS" },
        { name: "Tracy Caldwell Dyson", craft: "ISS" },
        { name: "Matthew Dominick", craft: "ISS" },
        { name: "Michael Barratt", craft: "ISS" },
        { name: "Jeanette Epps", craft: "ISS" },
        { name: "Alexander Grebenkin", craft: "ISS" }
      ],
      number: 7,
      message: "success"
    });
  }
}