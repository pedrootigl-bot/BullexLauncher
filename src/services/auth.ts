import { api } from '../api/client'
import { shouldUseMocks } from '../api/config'
import { endpoints } from '../api/endpoints'
import { mockUser } from '../data/missionsMock'
import type { AuthSession, AuthUser, LoginInput, LoginResponse } from '../types/auth'
import { clearSession, getStoredToken, getStoredUser, setSession } from './sessionStore'

function mockAuthUser(): AuthUser {
  return {
    id: mockUser.id,
    traderId: mockUser.id,
    firstName: mockUser.firstName,
    role: mockUser.role,
    avatarSrc: mockUser.avatarSrc,
  }
}

/** Sessão atual (localStorage ou mock). */
export function getCurrentUser(): AuthUser {
  return getStoredUser() ?? mockAuthUser()
}

export function getCurrentToken(): string | null {
  return getStoredToken()
}

export function isCurrentUserAdmin(): boolean {
  return getCurrentUser().role === 'admin'
}

export async function login(input: LoginInput): Promise<AuthSession> {
  if (shouldUseMocks()) {
    const user = mockAuthUser()
    // Demo: qualquer senha; ID digitado vira traderId se informado.
    const traderId = input.bullexId.trim() || user.traderId
    const sessionUser: AuthUser = {
      ...user,
      id: traderId,
      traderId,
    }
    const token = `mock-token-${traderId}`
    setSession(token, sessionUser)
    return { token, user: sessionUser }
  }

  const data = await api.post<LoginResponse>(
    endpoints.auth.login,
    {
      bullexId: input.bullexId,
      password: input.password,
      remember: input.remember ?? true,
    },
    { token: null },
  )

  setSession(data.token, data.user)
  return { token: data.token, user: data.user }
}

export async function logout(): Promise<void> {
  if (!shouldUseMocks()) {
    try {
      await api.post(endpoints.auth.logout, {})
    } catch {
      // limpa local mesmo se o servidor falhar
    }
  }
  clearSession()
}

/** Valida token no backend (ou devolve mock). */
export async function fetchMe(): Promise<AuthUser> {
  if (shouldUseMocks()) {
    const user = getCurrentUser()
    setSession(getStoredToken() ?? `mock-token-${user.traderId}`, user)
    return user
  }

  const user = await api.get<AuthUser>(endpoints.auth.me)
  const token = getStoredToken()
  if (token) setSession(token, user)
  return user
}

export async function ensureSession(): Promise<AuthUser | null> {
  const token = getStoredToken()
  if (!token && shouldUseMocks()) {
    // Dev sem login explícito: hidrata mock para não quebrar rotas existentes.
    const user = mockAuthUser()
    setSession(`mock-token-${user.traderId}`, user)
    return user
  }
  if (!token) return null
  try {
    return await fetchMe()
  } catch {
    clearSession()
    return null
  }
}
