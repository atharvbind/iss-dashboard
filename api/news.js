'use strict'

export default async function handler(req, res) {
  const apiKey = process.env.GNEWS_API_KEY || process.env.VITE_GNEWS_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing GNEWS_API_KEY environment variable.' })
  }

  const params = new URLSearchParams({
    category: req.query.category || 'general',
    lang: req.query.lang || 'en',
    max: req.query.max || '10',
    apikey: apiKey,
  })

  const url = `https://gnews.io/api/v4/top-headlines?${params}`

  try {
    const response = await fetch(url)
    const text = await response.text()

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'GNews request failed',
        status: response.status,
        body: text,
      })
    }

    const data = JSON.parse(text)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600')
    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch GNews',
      message: error.message,
    })
  }
}
