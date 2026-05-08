import { useMemo, useState } from 'react'
import { Bot, Send, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useDashboard } from '../hooks/useDashboard'
import { askDashboardAssistant, buildDashboardContext } from '../services/aiService'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import { storageKeys } from '../utils/storage'

export function Chatbot() {
  const { iss, astronauts, news } = useDashboard()
  const [messages, setMessages] = useLocalStorageState(storageKeys.chat, [])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const context = useMemo(
    () => buildDashboardContext({ iss, astronauts, articles: news.articles }),
    [iss, astronauts, news.articles],
  )

  async function handleSubmit(event) {
    event.preventDefault()
    const question = input.trim()
    if (!question || loading) return

    const userMessage = { role: 'user', content: question, createdAt: Date.now() }
    setMessages((current) => [...current, userMessage].slice(-30))
    setInput('')
    setLoading(true)

    try {
      const answer = await askDashboardAssistant({
        question,
        context,
      })
      const assistantMessage = { role: 'assistant', content: answer, createdAt: Date.now() }
      setMessages((current) => [...current, assistantMessage].slice(-30))
    } catch {
      toast.error('Assistant request failed.')
      setMessages((current) =>
        [
          ...current,
          {
            role: 'assistant',
            content: 'I only have access to current dashboard data.',
            createdAt: Date.now(),
          },
        ].slice(-30),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {open ? (
        <section className="dashboard-card fixed bottom-24 right-4 z-[1000] flex h-[620px] max-h-[calc(100vh-120px)] w-[calc(100vw-32px)] max-w-md flex-col p-5">
          <div className="mb-4 flex items-center gap-2">
            <Bot size={21} className="text-cyan-600 dark:text-cyan-400" />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Dashboard Assistant</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Restricted to current dashboard context.</p>
            </div>
            <button
              type="button"
              onClick={() => setMessages([])}
              className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
              aria-label="Clear chat"
            >
              <Trash2 size={16} />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
              aria-label="Close chat"
            >
              <X size={17} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/70">
            {messages.length ? (
              messages.map((message, index) => (
                <div
                  key={`${message.createdAt}-${index}`}
                  className={`max-w-[90%] rounded-lg px-3 py-2 text-sm leading-6 ${
                    message.role === 'user'
                      ? 'ml-auto bg-cyan-600 text-white'
                      : 'bg-white text-slate-700 shadow-sm dark:bg-slate-950 dark:text-slate-200'
                  }`}
                >
                  {message.content}
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white p-3 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                Ask about the ISS coordinates, speed, astronauts, or loaded news headlines.
              </p>
            )}
            {loading ? (
              <div className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm text-slate-500 shadow-sm dark:bg-slate-950 dark:text-slate-300">
                <span className="skeleton h-2 w-2 rounded-full" />
                <span className="skeleton h-2 w-2 rounded-full" />
                <span className="skeleton h-2 w-2 rounded-full" />
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask from dashboard data"
              className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="grid h-11 w-11 place-items-center rounded-lg bg-cyan-600 text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-6 right-6 z-[1001] grid h-14 w-14 place-items-center rounded-full bg-cyan-600 text-white shadow-xl shadow-cyan-900/30 transition hover:bg-cyan-700"
        aria-label="Open dashboard assistant"
      >
        <Bot size={24} />
      </button>
    </>
  )
}
