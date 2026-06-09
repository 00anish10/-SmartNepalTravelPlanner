/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const API_BASE = '/api'

interface User {
  id: number
  username: string
  email: string
  role: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

function getStoredAuth(): { user: User | null; token: string | null } {
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  if (token && userStr) {
    try {
      return { token, user: JSON.parse(userStr) }
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
  return { user: null, token: null }
}

function clearAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [{ user, token }, setAuth] = useState(getStoredAuth)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const stored = getStoredAuth()
    if (!stored.token) return
    fetch(`${API_BASE}/auth/me`, {
      headers: { ...authHeaders() },
    })
      .then((res) => {
        if (!res.ok) {
          clearAuth()
          setAuth({ user: null, token: null })
        }
      })
      .catch(() => {
        clearAuth()
        setAuth({ user: null, token: null })
      })
  }, [])

  const storeAuth = useCallback((token: string, user: User) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setAuth({ token, user })
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.detail || 'Invalid username or password')
      }
      const data = await res.json()
      storeAuth(data.access_token, data.user)
      toast.success(`Welcome back, ${data.user.username}!`)
      navigate('/')
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Login failed'
      toast.error(message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [navigate, storeAuth])

  const register = useCallback(async (username: string, email: string, password: string) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.detail || 'Registration failed')
      }
      toast.success('Account created successfully! Please login to continue.')
      navigate('/login')
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Registration failed'
      toast.error(message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [navigate])

  const logout = useCallback(() => {
    clearAuth()
    setAuth({ user: null, token: null })
    toast.success('Logged out successfully')
    navigate('/')
  }, [navigate])

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
