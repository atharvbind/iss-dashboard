import { readStorage, storageKeys, writeStorage } from "../utils/storage";

const NEWS_CACHE_MS = 15 * 60 * 1000;
const GNEWS_URL = "https://gnews.io/api/v4/top-headlines";
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=80";

function normalizeArticle(article, index) {
  return {
    id: article.url || `${article.title}-${index}`,
    title: article.title || "Untitled headline",
    description:
      article.description || article.content || "No description available.",
    content: article.content || "",
    source: { name: article.source?.name || "Unknown source" },
    author: article.source?.name || "Unknown author",
    imageUrl: article.image || DEFAULT_IMAGE,
    url: article.url || "#",
    publishedAt: article.publishedAt || new Date().toISOString(),
    category: "General",
  };
}

export function getCachedNews() {
  const cache = readStorage(storageKeys.news, null);
  if (!cache?.lastFetched || !Array.isArray(cache.articles)) return null;
  if (Date.now() - cache.lastFetched > NEWS_CACHE_MS) return null;
  return cache.articles;
}

export async function fetchNews({ force = false } = {}) {
  const cached = !force ? getCachedNews() : null;
  if (cached) return { articles: cached, fromCache: true };

  const apiKey = import.meta.env.VITE_GNEWS_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing GNews API key. Add VITE_GNEWS_API_KEY to your .env file.",
    );
  }

  const params = new URLSearchParams({
    category: "general",
    lang: "en",
    max: "10",
    apikey: apiKey,
  });

  const response = await fetch(`${GNEWS_URL}?${params}`);
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        "GNews rejected the API key. Check VITE_GNEWS_API_KEY and retry.",
      );
    }
    if (response.status === 429) {
      throw new Error("GNews API limit reached. Please wait and retry.");
    }
    throw new Error("GNews request failed. Please retry.");
  }

  const data = await response.json();
  if (data.errors) {
    throw new Error(
      "GNews returned an API error. Please check the key or retry later.",
    );
  }

  const articles = (data.articles ?? []).slice(0, 10).map(normalizeArticle);
  writeStorage(storageKeys.news, { lastFetched: Date.now(), articles });
  return { articles, fromCache: false };
}
