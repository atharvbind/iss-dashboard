import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { DashboardProvider } from './context/DashboardContext'
import { Chatbot } from './components/Chatbot'
import { Dashboard } from './components/Dashboard'
import { Header } from './components/Header'
import { useLocalStorageState } from './hooks/useLocalStorageState'
import { storageKeys } from './utils/storage'

function App() {
  const [darkMode, setDarkMode] = useLocalStorageState(storageKeys.theme, false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
        <Header darkMode={darkMode} onToggleTheme={() => setDarkMode((value) => !value)} />
        <Dashboard />
        <Chatbot />
        <Toaster position="top-right" />
      </div>
    </DashboardProvider>
  )
}

export default App
