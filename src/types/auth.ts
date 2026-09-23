export type UserRole = 'trader' | 'admin'

export type AuthUser = {
  id: string
  traderId: string
  firstName: string
  fullName?: string
  email?: string
  role: UserRole
  avatarSrc: string
}

export type AuthSession = {
  token: string
  user: AuthUser
}

export type LoginInput = {
  bullexId: string
  password: string
  remember?: boolean
}

export type LoginResponse = {
  token: string
  user: AuthUser
}
