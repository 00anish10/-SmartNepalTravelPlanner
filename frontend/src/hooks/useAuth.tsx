/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { usePreferencesStore } from './usePreferencesStore'

const API_BASE = '/api'

const APP_STORAGE_KEYS = ['token', 'user']

const SESSION_STORAGE_KEYS = ['recommendations', 'selectedDestination']

const USER_SCOPED_PREFIXES = ['favorites_', 'preferences_draft_', 'packing_checked_']

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
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

function getStoredAuth(): { user: User | null; token: string | null } {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user')
  if (token && userStr) {
    try {
      const parsed = JSON.parse(userStr)
      if (typeof parsed?.username !== 'string') {
        clearAllAppData()
        return { user: null, token: null }
      }
      return { token, user: parsed }
    } catch {
      clearAllAppData()
    }
  }
  return { user: null, token: null }
}

function extractErrorDetail(errData: unknown): string {
  if (errData && typeof errData === 'object' && 'detail' in errData) {
    const detail = (errData as Record<string, unknown>).detail
    if (Array.isArray(detail)) {
      const first = detail[0]
      if (first && typeof first === 'object' && 'msg' in first) {
        return String((first as Record<string, unknown>).msg)
      }
    }
    if (typeof detail === 'string') return detail
  }
  return 'Request failed'
}

function clearAllAppData() {
  APP_STORAGE_KEYS.forEach(k => { localStorage.removeItem(k); sessionStorage.removeItem(k) })
  SESSION_STORAGE_KEYS.forEach(k => { localStorage.removeItem(k); sessionStorage.removeItem(k) })
  const toRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && USER_SCOPED_PREFIXES.some(p => key.startsWith(p))) {
      toRemove.push(key)
    }
  }
  toRemove.forEach(k => { localStorage.removeItem(k); sessionStorage.removeItem(k) })
  usePreferencesStore.getState().reset()
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function getUserId(): number | null {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    return user?.id ?? null
  } catch {
    return null
  }
}

export function userStorageKey(base: string): string {
  const id = getUserId()
  return id ? `${base}_${id}` : base
}

export function getFavorites(): number[] {
  try {
    const key = userStorageKey('favorites')
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch { return [] }
}

export function toggleFavorite(id: number): boolean {
  try {
    const key = userStorageKey('favorites')
    const current: number[] = JSON.parse(localStorage.getItem(key) || '[]')
    const exists = current.includes(id)
    const next = exists ? current.filter(i => i !== id) : [...current, id]
    localStorage.setItem(key, JSON.stringify(next))
    return !exists
  } catch {
    return false
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [{ user, token }, setAuth] = useState(getStoredAuth)
  const [loading, setLoading] = useState(!!getStoredAuth().token)
  const navigate = useNavigate()

  useEffect(() => {
    const stored = getStoredAuth()
    if (!stored.token) {
      setLoading(false)
      return
    }
    fetch(`${API_BASE}/auth/me`, {
      headers: { ...authHeaders() },
    })
      .then((res) => {
        if (!res.ok) {
          clearAllAppData()
          setAuth({ user: null, token: null })
        }
      })
      .catch(() => {
        clearAllAppData()
        setAuth({ user: null, token: null })
      })
      .finally(() => setLoading(false))
  }, [])

  const storeAuth = useCallback((token: string, user: User, persist: boolean = true) => {
    const storage = persist ? localStorage : sessionStorage
    const other = persist ? sessionStorage : localStorage
    storage.setItem('token', token)
    storage.setItem('user', JSON.stringify(user))
    other.removeItem('token')
    other.removeItem('user')
    setAuth({ token, user: { id: user.id, username: String(user.username), email: String(user.email), role: String(user.role), created_at: String(user.created_at) } })
  }, [])

  const login = useCallback(async (username: string, password: string, rememberMe: boolean = true) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(extractErrorDetail(errData) || 'Invalid username or password')
      }
      const data = await res.json()
      clearAllAppData()
      storeAuth(data.access_token, data.user, rememberMe)
      toast.success(`Welcome back, ${data.user.username}!`)
      navigate('/')
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
        throw new Error(extractErrorDetail(errData) || 'Registration failed')
      }
      toast.success('Account created successfully! Please login to continue.')
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  const logout = useCallback(() => {
    clearAllAppData()
    setAuth({ user: null, token: null })
    toast.success('Logged out successfully')
    navigate('/login')
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
