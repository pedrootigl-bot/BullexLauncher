import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SessionProvider, useSession } from './context/SessionContext'
import { AdminPage } from './pages/AdminPage'
import { HistoryPage } from './pages/HistoryPage'
import { LoginPage } from './pages/LoginPage'
import { MissionsPage } from './pages/MissionsPage'
import { RewardsPage } from './pages/RewardsPage'
import { SupportPage } from './pages/SupportPage'

function AdminRoute() {
  const { ready, isAdmin } = useSession()
  if (!ready) return null
  if (!isAdmin) return <Navigate to="/missoes" replace />
  return <AdminPage />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/inicio" element={<Navigate to="/missoes" replace />} />
      <Route path="/missoes" element={<MissionsPage />} />
      <Route path="/recompensas" element={<RewardsPage />} />
      <Route path="/historico" element={<HistoryPage />} />
      <Route path="/suporte" element={<SupportPage />} />
      <Route path="/administrador" element={<AdminRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <AppRoutes />
      </SessionProvider>
    </BrowserRouter>
  )
}

export default App
