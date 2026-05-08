import { RefreshCw, UserRound } from 'lucide-react'
import { useDashboard } from '../hooks/useDashboard'

export function Astronauts() {
  const { astronauts, refreshAstronauts } = useDashboard()

  return (
    <section className="dashboard-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">People in Space</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total: {astronauts.people.length || '--'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refreshAstronauts()}
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
            aria-label="Refresh astronauts"
          >
            <RefreshCw size={16} />
          </button>
          <UserRound className="text-cyan-600 dark:text-cyan-400" size={21} />
        </div>
      </div>

      {astronauts.error ? (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {astronauts.error}
        </div>
      ) : null}

      <div className="space-y-3">
        {astronauts.people.length ? (
          astronauts.people.map((person) => (
            <div
              key={`${person.name}-${person.craft}`}
              className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-sm dark:bg-slate-900"
            >
              <span className="font-medium text-slate-800 dark:text-slate-100">{person.name}</span>
              <span className="text-slate-500 dark:text-slate-400">{person.craft}</span>
            </div>
          ))
        ) : astronauts.loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div className="skeleton h-9" key={index} />
          ))
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">No astronaut data available.</p>
        )}
      </div>
    </section>
  )
}
