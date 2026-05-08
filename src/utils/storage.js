export const storageKeys = {
  theme: 'space-news-theme',
  chat: 'space-news-chat-history',
  news: 'space-news-cache',
}

export function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be unavailable in private browsing or strict test contexts.
  }
}
