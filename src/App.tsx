import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { HistoryPage } from './pages/HistoryPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { MissionsPage } from './pages/MissionsPage'
import { RewardsPage } from './pages/RewardsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/inicio" element={<HomePage />} />
        <Route path="/missoes" element={<MissionsPage />} />
        <Route path="/recompensas" element={<RewardsPage />} />
        <Route path="/historico" element={<HistoryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
