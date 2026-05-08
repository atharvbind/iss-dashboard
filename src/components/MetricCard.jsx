export function MetricCard({ icon: Icon, label, value, detail }) {
  return (
    <div className="dashboard-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
          {label}
        </p>
        {Icon ? <Icon size={18} className="text-cyan-600 dark:text-cyan-400" /> : null}
      </div>
      <p className="text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{detail}</p>
    </div>
  )
}
