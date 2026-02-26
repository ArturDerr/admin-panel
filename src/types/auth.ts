export interface LoginRequest {
  phone: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export interface AuthUser {
  id: string
  phone: string
  fullname: string
  role: 'admin' | 'moderator'
}

export interface JwtPayload {
  sub: string
  phone: string
  role: 'admin' | 'moderator'
  exp: number
  iat: number
}
