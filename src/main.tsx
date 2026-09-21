import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/bullstart.css'
import './styles/admin-panel.css'
import './styles/login-bullex.css'
import './styles/pass-battle.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
