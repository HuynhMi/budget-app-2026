import { useState } from 'react'
import { StoreProvider, useStore } from './state/store'
import { BottomNav } from './components/BottomNav'
import { HomeScreen } from './screens/HomeScreen'
import { HistoryScreen } from './screens/HistoryScreen'
import { ReportsScreen } from './screens/ReportsScreen'
import { WalletsScreen } from './screens/WalletsScreen'
import { CategoriesScreen } from './screens/CategoriesScreen'
import { ScanScreen } from './screens/ScanScreen'
import { BudgetScreen } from './screens/BudgetScreen'
import { AddTransactionSheet } from './screens/AddTransactionSheet'

export type Screen = 'home' | 'history' | 'reports' | 'wallets' | 'categories' | 'scan' | 'budget'

function Shell() {
  const store = useStore()
  const [screen, setScreen] = useState<Screen>('home')
  const [addOpen, setAddOpen] = useState(false)

  if (!store.ready) {
    return (
      <div className="app-shell flex items-center justify-center min-h-screen">
        <div className="text-brand-400 animate-pulse text-lg font-semibold">Đang tải…</div>
      </div>
    )
  }

  return (
    <div className="app-shell min-h-screen">
      {screen === 'home' && <HomeScreen onNavigate={setScreen} onAdd={() => setAddOpen(true)} />}
      {screen === 'history' && <HistoryScreen />}
      {screen === 'reports' && <ReportsScreen onNavigate={setScreen} />}
      {screen === 'wallets' && <WalletsScreen onNavigate={setScreen} />}
      {screen === 'categories' && <CategoriesScreen onBack={() => setScreen('wallets')} />}
      {screen === 'scan' && <ScanScreen onBack={() => setScreen('home')} />}
      {screen === 'budget' && <BudgetScreen onBack={() => setScreen('home')} />}

      {screen !== 'scan' && screen !== 'categories' && screen !== 'budget' && (
        <BottomNav current={screen} onNavigate={setScreen} onAdd={() => setAddOpen(true)} />
      )}

      <AddTransactionSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
