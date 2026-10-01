import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/auth'
import { TOKEN_KEY, USER_KEY } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem(USER_KEY) || 'null'))
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))

  useEffect(() => {
    const clearSession = () => {
      setUser(null)
      setToken(null)
    }
    window.addEventListener('atelier:unauthorized', clearSession)
    return () => window.removeEventListener('atelier:unauthorized', clearSession)
  }, [])

  const establishSession = (data) => {
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  const login = async (payload) => {
    const response = await authService.login(payload)
    return establishSession(response.data)
  }

  const logout = async () => {
    try {
      if (token) await authService.logout()
    } finally {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      setToken(null)
      setUser(null)
    }
  }

  const value = { user, token, isAuthenticated: Boolean(token && user), login, logout, establishSession, setUser }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}