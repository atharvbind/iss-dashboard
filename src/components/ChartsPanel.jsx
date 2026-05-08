import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Activity, ChartPie } from 'lucide-react'
import { useDashboard } from '../hooks/useDashboard'

const COLORS = ['#0891b2', '#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed']

function categoryDistribution(articles) {
  const counts = articles.reduce((acc, article) => {
    const category = article.category || 'General'
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {})

  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

export function ChartsPanel() {
  const { iss, news, selectedCategory, setSelectedCategory } = useDashboard()
  const pieData = categoryDistribution(news.articles)

  return (
    <section className="grid gap-4 lg:col-span-3 lg:grid-cols-2">
      <div className="dashboard-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Activity size={20} className="text-cyan-600 dark:text-cyan-400" />
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">ISS Speed Trend</h2>
        </div>
        <div className="h-72 min-w-0">
          {iss.speedTrend.length ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={iss.speedTrend}>
                <XAxis dataKey="time" hide />
                <YAxis width={64} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #cbd5e1' }}
                  formatter={(value) => [`${value.toLocaleString()} km/h`, 'Speed']}
                />
                <Line type="monotone" dataKey="speed" stroke="#0891b2" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid h-full place-items-center rounded-lg bg-slate-100 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              Awaiting ISS telemetry
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <ChartPie size={20} className="text-cyan-600 dark:text-cyan-400" />
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">News Distribution</h2>
          {selectedCategory ? (
            <button
              type="button"
              onClick={() => setSelectedCategory('')}
              className="ml-auto rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              Clear filter
            </button>
          ) : null}
        </div>
        <div className="h-72 min-w-0">
          {pieData.length ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={3}
                  onClick={(entry) => setSelectedCategory(entry.name)}
                  className="cursor-pointer"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid h-full place-items-center rounded-lg bg-slate-100 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              Awaiting news articles
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
