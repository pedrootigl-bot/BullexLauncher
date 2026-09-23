import { mockUser } from '../data/missionsMock'

/** Acesso admin no MVP (sem auth real). Trocar por JWT/role no backend. */

export function isCurrentUserAdmin(): boolean {
  return mockUser.role === 'admin'
}

export function isAdminArea(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.pathname.startsWith('/administrador')
}

/**
 * Detalhes sensíveis do sorteio (ganhadores, WhatsApp, entrega).
 * Só para conta com role admin — a rota /administrador já é protegida.
 */
export function canViewAdminDrawDetails(): boolean {
  return isCurrentUserAdmin()
}
