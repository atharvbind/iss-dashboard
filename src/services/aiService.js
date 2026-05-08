const HF_MODEL = "openai/gpt-oss-120b:fastest";
const HF_URL = "https://router.huggingface.co/v1/chat/completions";
const FALLBACK_REPLY = "I only have access to current dashboard data.";

export function buildDashboardContext({ iss, astronauts, articles }) {
  const people = Array.isArray(astronauts)
    ? astronauts
    : (astronauts.people ?? []);

  const dashboardContext = {
    iss: {
      latitude: iss.current?.lat ?? null,
      longitude: iss.current?.lng ?? null,
      speedKmh: Math.round(iss.speed || 0),
      currentLocationName: iss.locationName || null,
      positionsTracked: iss.path?.length ?? 0,
      lastTrackedPositions: (iss.path ?? []).slice(-15).map((point) => ({
        latitude: point.lat,
        longitude: point.lng,
        timestamp: point.timestamp,
      })),
      error: iss.error || null,
    },
    astronauts: {
      totalPeopleInSpace: people.length,
      names: people.map((person) => person.name),
      people: people.map((person) => ({
        name: person.name,
        craft: person.craft,
      })),
    },
    news: {
      totalArticlesLoaded: articles.length,
      articles: articles.slice(0, 10).map((article) => ({
        title: article.title,
        description: article.description || "No description available.",
        source: article.source?.name || "Unknown source",
        publishedAt: article.publishedAt,
        url: article.url,
      })),
    },
  };

  return JSON.stringify(dashboardContext, null, 2);
}

export async function askDashboardAssistant({ question, context }) {
  const token = import.meta.env.VITE_AI_TOKEN;
  if (!token) return FALLBACK_REPLY;

  const messages = [
    {
      role: "system",
      content: `You are a dashboard assistant for a Space & News Dashboard.
You must answer only from the JSON dashboard context below.
Do not invent any information that is not present in the JSON.
If the question cannot be answered from the JSON, respond exactly with: "${FALLBACK_REPLY}".
If a needed value is null, empty, missing, or not represented in the JSON, respond exactly with: "${FALLBACK_REPLY}".`,
    },
    {
      role: "user",
      content: `Dashboard JSON context:\n${context}`,
    },
    {
      role: "user",
      content: question,
    },
  ];

  const response = await fetch(HF_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: HF_MODEL,
      messages,
      max_tokens: 180,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `AI assistant request failed: ${response.status} ${errorText.slice(0, 150)}`,
    );
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || FALLBACK_REPLY;
}
