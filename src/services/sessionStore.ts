import { apiConfig } from '../api/config'
import type { AuthUser } from '../types/auth'

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

let memoryToken: string | null = null
let memoryUser: AuthUser | null = null

export function getStoredToken(): string | null {
  if (memoryToken) return memoryToken
  if (!canUseStorage()) return null
  memoryToken = window.localStorage.getItem(apiConfig.tokenStorageKey)
  return memoryToken
}

export function getStoredUser(): AuthUser | null {
  if (memoryUser) return memoryUser
  if (!canUseStorage()) return null
  const raw = window.localStorage.getItem(apiConfig.userStorageKey)
  if (!raw) return null
  try {
    memoryUser = JSON.parse(raw) as AuthUser
    return memoryUser
  } catch {
    return null
  }
}

export function setSession(token: string, user: AuthUser): void {
  memoryToken = token
  memoryUser = user
  if (!canUseStorage()) return
  window.localStorage.setItem(apiConfig.tokenStorageKey, token)
  window.localStorage.setItem(apiConfig.userStorageKey, JSON.stringify(user))
}

export function clearSession(): void {
  memoryToken = null
  memoryUser = null
  if (!canUseStorage()) return
  window.localStorage.removeItem(apiConfig.tokenStorageKey)
  window.localStorage.removeItem(apiConfig.userStorageKey)
}
