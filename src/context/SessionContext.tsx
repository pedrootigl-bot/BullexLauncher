import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { configureApiClient } from '../api/client'
import {
  ensureSession,
  getCurrentToken,
  login as authLogin,
  logout as authLogout,
} from '../services/auth'
import { clearSession, getStoredUser } from '../services/sessionStore'
import type { AuthUser, LoginInput } from '../types/auth'

type SessionContextValue = {
  user: AuthUser | null
  token: string | null
  ready: boolean
  isAdmin: boolean
  login: (input: LoginInput) => Promise<AuthUser>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser())
  const [token, setToken] = useState<string | null>(() => getCurrentToken())
  const [ready, setReady] = useState(false)

  const syncFromStore = useCallback(() => {
    setUser(getStoredUser())
    setToken(getCurrentToken())
  }, [])

  useEffect(() => {
    configureApiClient({
      getAccessToken: getCurrentToken,
      onUnauthorized: () => {
        clearSession()
        setUser(null)
        setToken(null)
      },
    })

    void ensureSession().then((sessionUser) => {
      setUser(sessionUser)
      setToken(getCurrentToken())
      setReady(true)
    })
  }, [])

  const login = useCallback(async (input: LoginInput) => {
    const session = await authLogin(input)
    setUser(session.user)
    setToken(session.token)
    return session.user
  }, [])

  const logout = useCallback(async () => {
    await authLogout()
    setUser(null)
    setToken(null)
  }, [])

  const refresh = useCallback(async () => {
    const sessionUser = await ensureSession()
    setUser(sessionUser)
    setToken(getCurrentToken())
  }, [])

  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      token,
      ready,
      isAdmin: user?.role === 'admin',
      login,
      logout,
      refresh: async () => {
        await refresh()
        syncFromStore()
      },
    }),
    [user, token, ready, login, logout, refresh, syncFromStore],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext)
  if (!ctx) {
    throw new Error('useSession deve ser usado dentro de SessionProvider')
  }
  return ctx
}
