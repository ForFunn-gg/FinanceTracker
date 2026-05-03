import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)  

  useEffect(() => {
    const token = localStorage.getItem('finflow_token')
    if (!token) { setLoading(false); return }

    authService.getMe()
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem('finflow_token'))
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const { token, user } = await authService.login(email, password)
    localStorage.setItem('finflow_token', token)
    setUser(user)
  }

  async function register(username, email, password) {
    const { token, user } = await authService.register(username, email, password)
    localStorage.setItem('finflow_token', token)
    setUser(user)
  }

  function logout() {
    localStorage.removeItem('finflow_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Convenience hook
export function useAuth() {
  return useContext(AuthContext)
}