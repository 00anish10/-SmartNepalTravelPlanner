/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { adminGetUserHistory } from '../services/api'
import type { TripHistoryItem } from '../services/api'
import type { Destination } from '../types'

const API_BASE = '/api'

interface AdminUser {
  id: number
  username: string
  email: string
  role: string
  created_at: string
}

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
  bgColor: string
}

function StatCard({ label, value, icon, color, bgColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-saffron/10 shadow-sm shadow-saffron/5 hover:shadow-md hover:shadow-saffron/10 transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-stone/70 mb-1">{label}</p>
          <p className="text-2xl font-bold text-snow">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl ${bgColor} ${color} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function Admin({ initialTab }: { initialTab?: 'destinations' | 'users' }) {
  const { token } = useAuth()
  const [tab, setTab] = useState<'destinations' | 'users'>(initialTab || 'destinations')
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deletingUser, setDeletingUser] = useState<number | null>(null)
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<number | null>(null)
  const [form, setForm] = useState({
    name: '', cluster: '', region: '', terrain: '', difficulty: '',
    altitude_min: '', altitude_max: '', duration_min: '', duration_max: '',
    cost_per_day_npr: '', description: '', image_url: '',
    requires_guide: false, ams_risk: '', fitness_level: '',
  })

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  const fetchDestinations = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/destinations`, { headers })
      if (res.ok) {
        const data = await res.json()
        setDestinations(data)
      }
    } catch {
      toast.error('Failed to load destinations')
    }
  }, [token])

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/users`, { headers })
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch {
      toast.error('Failed to load users')
    }
  }, [token])

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchDestinations(), fetchUsers()])
      setLoading(false)
    }
    load()
  }, [fetchDestinations, fetchUsers])

  useEffect(() => {
    if (initialTab) setTab(initialTab)
  }, [initialTab])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this destination?')) return
    try {
      const res = await fetch(`${API_BASE}/admin/destinations/${id}`, {
        method: 'DELETE',
        headers,
      })
      if (res.ok) {
        toast.success('Destination deleted')
        fetchDestinations()
      } else {
        toast.error('Failed to delete')
      }
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    setDeletingUser(userId)
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'DELETE',
        headers,
      })
      if (res.ok) {
        toast.success('User deleted')
        setUsers(prev => prev.filter(u => u.id !== userId))
      } else {
        const err = await res.json().catch(() => null)
        const detail = err && typeof err === 'object' && 'detail' in err ? (Array.isArray(err.detail) ? err.detail[0]?.msg : err.detail) : null
        toast.error(detail || 'Failed to delete user')
      }
    } catch {
      toast.error('Failed to delete user')
    } finally {
      setDeletingUser(null)
      setConfirmDeleteUser(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...form,
      altitude_min: form.altitude_min ? Number(form.altitude_min) : null,
      altitude_max: form.altitude_max ? Number(form.altitude_max) : null,
      duration_min: form.duration_min ? Number(form.duration_min) : null,
      duration_max: form.duration_max ? Number(form.duration_max) : null,
      cost_per_day_npr: form.cost_per_day_npr ? Number(form.cost_per_day_npr) : null,
    }
    try {
      const res = await fetch(`${API_BASE}/admin/destinations`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast.success('Destination added')
        setShowForm(false)
        setForm({ name: '', cluster: '', region: '', terrain: '', difficulty: '', altitude_min: '', altitude_max: '', duration_min: '', duration_max: '', cost_per_day_npr: '', description: '', image_url: '', requires_guide: false, ams_risk: '', fitness_level: '' })
        fetchDestinations()
      } else {
        const err = await res.text()
        toast.error(err || 'Failed to add')
      }
    } catch {
      toast.error('Failed to add destination')
    }
  }

  const [expandedUserId, setExpandedUserId] = useState<number | null>(null)
  const [userHistory, setUserHistory] = useState<Record<number, TripHistoryItem[]>>({})
  const [loadingHistory, setLoadingHistory] = useState<number | null>(null)

  const toggleUserHistory = async (userId: number) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null)
      return
    }
    setExpandedUserId(userId)
    if (!userHistory[userId]) {
      setLoadingHistory(userId)
      try {
        const data = await adminGetUserHistory(userId)
        setUserHistory(prev => ({ ...prev, [userId]: data }))
      } catch {
        toast.error('Failed to load user history')
      } finally {
        setLoadingHistory(null)
      }
    }
  }

  const adminCount = users.filter(u => u.role === 'admin').length
  const userCount = users.filter(u => u.role === 'user').length

  return (
    <div>
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-snow tracking-tight">
          {tab === 'destinations' ? 'Destinations' : 'Users'}
        </h1>
        <p className="text-sm text-stone mt-1">
          {tab === 'destinations'
            ? `${destinations.length} destinations across the platform`
            : `${users.length} registered users`}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Destinations"
          value={destinations.length}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Total Users"
          value={users.length}
          color="text-blue-600"
          bgColor="bg-blue-50"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        <StatCard
          label="Admin Users"
          value={adminCount}
          color="text-amber-600"
          bgColor="bg-amber-50"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
          }
        />
        <StatCard
          label="Regular Users"
          value={userCount}
          color="text-purple-600"
          bgColor="bg-purple-50"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-saffron/10 w-fit">
        <button
          onClick={() => setTab('destinations')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'destinations'
              ? 'bg-saffron text-white shadow-sm'
              : 'text-stone hover:text-saffron'
          }`}
        >
          Destinations
        </button>
        <button
          onClick={() => setTab('users')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'users'
              ? 'bg-saffron text-white shadow-sm'
              : 'text-stone hover:text-saffron'
          }`}
        >
          Users
        </button>
      </div>

      {tab === 'destinations' ? (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-saffron/10 text-saffron border border-saffron/20 hover:bg-saffron/20 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {showForm ? 'Cancel' : 'Add Destination'}
            </button>
          </div>

          {showForm && (
            <motion.form
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl p-6 mb-8 border border-saffron/10 shadow-sm space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input className="w-full bg-white border border-saffron/15 rounded-xl px-4 py-2.5 text-sm text-snow placeholder:text-stone/50 focus:border-saffron/40 focus:outline-none focus:ring-1 focus:ring-saffron/20 transition-colors" placeholder="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                <input className="w-full bg-white border border-saffron/15 rounded-xl px-4 py-2.5 text-sm text-snow placeholder:text-stone/50 focus:border-saffron/40 focus:outline-none focus:ring-1 focus:ring-saffron/20 transition-colors" placeholder="Cluster *" value={form.cluster} onChange={e => setForm({ ...form, cluster: e.target.value })} required />
                <input className="w-full bg-white border border-saffron/15 rounded-xl px-4 py-2.5 text-sm text-snow placeholder:text-stone/50 focus:border-saffron/40 focus:outline-none focus:ring-1 focus:ring-saffron/20 transition-colors" placeholder="Region" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} />
                <input className="w-full bg-white border border-saffron/15 rounded-xl px-4 py-2.5 text-sm text-snow placeholder:text-stone/50 focus:border-saffron/40 focus:outline-none focus:ring-1 focus:ring-saffron/20 transition-colors" placeholder="Terrain" value={form.terrain} onChange={e => setForm({ ...form, terrain: e.target.value })} />
                <input className="w-full bg-white border border-saffron/15 rounded-xl px-4 py-2.5 text-sm text-snow placeholder:text-stone/50 focus:border-saffron/40 focus:outline-none focus:ring-1 focus:ring-saffron/20 transition-colors" placeholder="Difficulty" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} />
                <input className="w-full bg-white border border-saffron/15 rounded-xl px-4 py-2.5 text-sm text-snow placeholder:text-stone/50 focus:border-saffron/40 focus:outline-none focus:ring-1 focus:ring-saffron/20 transition-colors" placeholder="AMS Risk" value={form.ams_risk} onChange={e => setForm({ ...form, ams_risk: e.target.value })} />
                <input className="w-full bg-white border border-saffron/15 rounded-xl px-4 py-2.5 text-sm text-snow placeholder:text-stone/50 focus:border-saffron/40 focus:outline-none focus:ring-1 focus:ring-saffron/20 transition-colors" placeholder="Fitness Level" value={form.fitness_level} onChange={e => setForm({ ...form, fitness_level: e.target.value })} />
                <input className="w-full bg-white border border-saffron/15 rounded-xl px-4 py-2.5 text-sm text-snow placeholder:text-stone/50 focus:border-saffron/40 focus:outline-none focus:ring-1 focus:ring-saffron/20 transition-colors" type="number" placeholder="Cost per day (NPR)" value={form.cost_per_day_npr} onChange={e => setForm({ ...form, cost_per_day_npr: e.target.value })} />
                <input className="w-full bg-white border border-saffron/15 rounded-xl px-4 py-2.5 text-sm text-snow placeholder:text-stone/50 focus:border-saffron/40 focus:outline-none focus:ring-1 focus:ring-saffron/20 transition-colors" type="number" placeholder="Altitude Min (m)" value={form.altitude_min} onChange={e => setForm({ ...form, altitude_min: e.target.value })} />
                <input className="w-full bg-white border border-saffron/15 rounded-xl px-4 py-2.5 text-sm text-snow placeholder:text-stone/50 focus:border-saffron/40 focus:outline-none focus:ring-1 focus:ring-saffron/20 transition-colors" type="number" placeholder="Altitude Max (m)" value={form.altitude_max} onChange={e => setForm({ ...form, altitude_max: e.target.value })} />
                <input className="w-full bg-white border border-saffron/15 rounded-xl px-4 py-2.5 text-sm text-snow placeholder:text-stone/50 focus:border-saffron/40 focus:outline-none focus:ring-1 focus:ring-saffron/20 transition-colors" type="number" placeholder="Duration Min (days)" value={form.duration_min} onChange={e => setForm({ ...form, duration_min: e.target.value })} />
                <input className="w-full bg-white border border-saffron/15 rounded-xl px-4 py-2.5 text-sm text-snow placeholder:text-stone/50 focus:border-saffron/40 focus:outline-none focus:ring-1 focus:ring-saffron/20 transition-colors" type="number" placeholder="Duration Max (days)" value={form.duration_max} onChange={e => setForm({ ...form, duration_max: e.target.value })} />
                <input className="w-full bg-white border border-saffron/15 rounded-xl px-4 py-2.5 text-sm text-snow placeholder:text-stone/50 focus:border-saffron/40 focus:outline-none focus:ring-1 focus:ring-saffron/20 transition-colors" placeholder="Image URL" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
                <label className="flex items-center gap-2.5 text-sm text-stone cursor-pointer">
                  <input type="checkbox" checked={form.requires_guide} onChange={e => setForm({ ...form, requires_guide: e.target.checked })} className="rounded border-saffron/30 text-saffron focus:ring-saffron/30" />
                  Requires Guide
                </label>
              </div>
              <textarea className="w-full bg-white border border-saffron/15 rounded-xl px-4 py-2.5 text-sm text-snow placeholder:text-stone/50 focus:border-saffron/40 focus:outline-none focus:ring-1 focus:ring-saffron/20 transition-colors min-h-[80px]" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <button type="submit" className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-sm font-medium bg-saffron text-white hover:bg-saffron/90 transition-colors shadow-sm">
                Save Destination
              </button>
            </motion.form>
          )}

          {loading ? (
            <div className="text-center text-stone py-16">
              <div className="animate-spin w-6 h-6 border-2 border-saffron/30 border-t-saffron rounded-full mx-auto mb-3" />
              <span className="text-sm">Loading destinations...</span>
            </div>
          ) : destinations.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-3xl mb-3 text-stone/60">🏔️</div>
              <p className="text-stone text-sm">No destinations found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {destinations.map((d, i) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-xl px-5 py-4 border border-saffron/10 flex items-center justify-between hover:border-saffron/30 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-saffron/10 flex items-center justify-center text-saffron text-sm font-bold group-hover:bg-saffron/20 transition-all">
                      {d.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-snow group-hover:text-saffron transition-colors">{d.name}</h3>
                      <p className="text-xs text-stone/70 mt-0.5">{d.cluster}{d.region ? ` · ${d.region}` : ''}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    Delete
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {loading ? (
            <div className="text-center text-stone py-16">
              <div className="animate-spin w-6 h-6 border-2 border-saffron/30 border-t-saffron rounded-full mx-auto mb-3" />
              <span className="text-sm">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-3xl mb-3 text-stone/60">👤</div>
              <p className="text-stone text-sm">No users found.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-saffron/10 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-saffron/10 bg-amber-50/50">
                        <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone/70">Username</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone/70">Email</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone/70">Role</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone/70">Joined</th>
                        <th className="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone/70">Trips</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <React.Fragment key={u.id}>
                          <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.02 }}
                            onClick={() => toggleUserHistory(u.id)}
                            className="border-b border-saffron/5 hover:bg-amber-50/30 transition-colors cursor-pointer group"
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-saffron/10 flex items-center justify-center text-saffron text-xs font-bold">
                                  {u.username.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium text-snow">{u.username}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-stone">{u.email}</td>
                            <td className="px-5 py-3.5">
                              {u.role === 'admin' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                  </svg>
                                  Admin
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-gray-100 text-gray-500 border border-gray-200">
                                  User
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-stone/60">{new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-xs text-stone/60">{userHistory[u.id]?.length ?? 0}</span>
                                {u.role !== 'admin' && (
                                  confirmDeleteUser === u.id ? (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteUser(u.id) }}
                                        disabled={deletingUser === u.id}
                                        className="text-[11px] px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors"
                                      >
                                        {deletingUser === u.id ? '...' : 'Confirm'}
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteUser(null) }}
                                        className="text-[11px] px-2 py-1 rounded text-stone hover:text-snow transition-colors"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setConfirmDeleteUser(u.id) }}
                                      className="text-stone/30 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                                      aria-label="Delete user"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  )
                                )}
                              </div>
                            </td>
                          </motion.tr>
                          {expandedUserId === u.id && (
                            <motion.tr
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <td colSpan={5} className="px-5 py-4 bg-amber-50/30">
                                {loadingHistory === u.id ? (
                                  <div className="flex items-center gap-2 text-sm text-stone py-4">
                                    <span className="w-4 h-4 border-2 border-saffron/30 border-t-saffron rounded-full animate-spin" />
                                    Loading trip history...
                                  </div>
                                ) : userHistory[u.id]?.length === 0 ? (
                                  <p className="text-sm text-stone/60 py-4 text-center">No trip history yet</p>
                                ) : (
                                  <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-stone/70 mb-3">
                                      Trip History ({userHistory[u.id]?.length ?? 0})
                                    </p>
                                    {userHistory[u.id]?.map((h) => (
                                      <div key={h.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-saffron/10">
                                        <div className="flex items-center gap-3 min-w-0">
                                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-saffron/20 to-amber-500/20 flex items-center justify-center text-saffron shrink-0">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-sm font-medium text-snow truncate">{h.destination_name}</p>
                                            <p className="text-xs text-stone/60">
                                              {h.duration_days ? `${h.duration_days} days` : ''}
                                              {h.accommodation ? ` · ${h.accommodation}` : ''}
                                              {h.duration_days || h.accommodation ? ' · ' : ''}
                                              {new Date(h.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="text-right shrink-0 ml-4">
                                          <p className="text-sm font-semibold text-snow tabular-nums">Rs {h.budget_total.toLocaleString()}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                            </motion.tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    )
  }
