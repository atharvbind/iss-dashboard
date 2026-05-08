import { useMemo, useState } from 'react'
import { ArrowDownAZ, RefreshCw, Search } from 'lucide-react'
import { useDashboard } from '../hooks/useDashboard'

export function NewsDashboard() {
  const { news, refreshNews, selectedCategory, setSelectedCategory } = useDashboard()
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('publishedAt')

  const articles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return news.articles
      .filter((article) =>
        [article.title, article.description]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery),
      )
      .filter((article) => !selectedCategory || article.category === selectedCategory)
      .sort((a, b) => {
        if (sortBy === 'source') return a.source.name.localeCompare(b.source.name)
        if (sortBy === 'title') return a.title.localeCompare(b.title)
        return new Date(b.publishedAt) - new Date(a.publishedAt)
      })
  }, [news.articles, query, selectedCategory, sortBy])

  const categories = useMemo(
    () => [...new Set(news.articles.map((article) => article.category || 'General'))],
    [news.articles],
  )

  return (
    <section className="dashboard-card p-5 lg:col-span-2">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Space News</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {news.fromCache ? 'Using 15-minute GNews cache.' : 'Latest GNews top headlines.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              onClick={() => setSelectedCategory(selectedCategory === category ? '' : category)}
              className={`inline-flex h-10 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition ${
                selectedCategory === category
                  ? 'border-cyan-600 bg-cyan-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {category}
            </button>
          ))}
          <button
            type="button"
            onClick={() => refreshNews({ query, force: true })}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 text-sm font-semibold text-white transition hover:bg-cyan-700"
          >
            <RefreshCw size={17} />
            Refresh all
          </button>
        </div>
      </div>

      {news.error ? (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          <span>{news.error}</span>
          <button type="button" onClick={() => refreshNews({ query, force: true })} className="font-semibold">
            Retry
          </button>
        </div>
      ) : null}

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px]">
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search headlines"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </label>
        <label className="relative block">
          <ArrowDownAZ className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          >
            <option value="publishedAt">Newest</option>
            <option value="source">Source</option>
            <option value="title">Title</option>
          </select>
        </label>
      </div>

      <div className="space-y-3">
        {news.loading
          ? Array.from({ length: 5 }).map((_, index) => (
              <div className="space-y-2 rounded-lg border border-slate-200 p-4 dark:border-slate-800" key={index}>
                <div className="skeleton h-5 w-4/5" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-1/2" />
              </div>
            ))
          : articles.map((article) => (
              <article key={article.id} className="grid gap-4 rounded-lg border border-slate-200 p-4 transition hover:border-cyan-300 md:grid-cols-[180px_1fr] dark:border-slate-800 dark:hover:border-cyan-700">
                <img
                  src={article.imageUrl}
                  alt=""
                  className="h-36 w-full rounded-lg object-cover md:h-full"
                  loading="lazy"
                />
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-900">{article.category}</span>
                    <span className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-900">{article.source.name}</span>
                    <span>{article.author}</span>
                    <span>{new Date(article.publishedAt).toLocaleString()}</span>
                  </div>
                  <h3 className="font-semibold text-slate-950 dark:text-white">{article.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{article.description}</p>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                  >
                    Read More
                  </a>
                </div>
              </article>
            ))}
        {!news.loading && !articles.length ? (
          <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
            No articles match the current search or category filter.
          </div>
        ) : null}
      </div>
    </section>
  )
}
