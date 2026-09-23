import { getCurrentUser, isCurrentUserAdmin as authIsAdmin } from '../services/auth'

/** Acesso admin — role da sessão (mock ou JWT). */

export function isCurrentUserAdmin(): boolean {
  return authIsAdmin()
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

export function getSessionTraderId(): string {
  return getCurrentUser().traderId
}
