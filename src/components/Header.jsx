import { Moon, Radar, Sun } from 'lucide-react'

export function Header({ darkMode, onToggleTheme }) {
  return (
    <header className="flex flex-col gap-5 border-b border-slate-200 bg-white/80 px-4 py-5 backdrop-blur md:flex-row md:items-center md:justify-between md:px-8 dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-cyan-600 text-white shadow-lg shadow-cyan-700/20">
          <Radar size={24} />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-slate-950 md:text-3xl dark:text-white">
            Space & News Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Live orbital telemetry, curated headlines, and a context-bound assistant.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleTheme}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        {darkMode ? 'Light' : 'Dark'}
      </button>
    </header>
  )
}
