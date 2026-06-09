import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import type { Destination } from '../types'

const API_BASE = '/api'

export default function Admin() {
  const { user, token } = useAuth()
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
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

  const fetchDestinations = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/destinations`, { headers })
      if (res.ok) setDestinations(await res.json())
    } catch {
      toast.error('Failed to load destinations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDestinations() }, [])

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

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-snow mb-2">Access Denied</h2>
          <p className="text-stone">Admin privileges required.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-snow">Admin Dashboard</h1>
          <p className="text-stone mt-1">Manage destinations</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Add Destination'}
        </button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="card p-6 mb-8 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="input" placeholder="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <input className="input" placeholder="Cluster *" value={form.cluster} onChange={e => setForm({ ...form, cluster: e.target.value })} required />
            <input className="input" placeholder="Region" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} />
            <input className="input" placeholder="Terrain" value={form.terrain} onChange={e => setForm({ ...form, terrain: e.target.value })} />
            <input className="input" placeholder="Difficulty" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} />
            <input className="input" placeholder="AMS Risk" value={form.ams_risk} onChange={e => setForm({ ...form, ams_risk: e.target.value })} />
            <input className="input" placeholder="Fitness Level" value={form.fitness_level} onChange={e => setForm({ ...form, fitness_level: e.target.value })} />
            <input className="input" type="number" placeholder="Cost per day (NPR)" value={form.cost_per_day_npr} onChange={e => setForm({ ...form, cost_per_day_npr: e.target.value })} />
            <input className="input" type="number" placeholder="Altitude Min" value={form.altitude_min} onChange={e => setForm({ ...form, altitude_min: e.target.value })} />
            <input className="input" type="number" placeholder="Altitude Max" value={form.altitude_max} onChange={e => setForm({ ...form, altitude_max: e.target.value })} />
            <input className="input" type="number" placeholder="Duration Min (days)" value={form.duration_min} onChange={e => setForm({ ...form, duration_min: e.target.value })} />
            <input className="input" type="number" placeholder="Duration Max (days)" value={form.duration_max} onChange={e => setForm({ ...form, duration_max: e.target.value })} />
            <input className="input" placeholder="Image URL" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
            <label className="flex items-center gap-2 text-sm text-stone">
              <input type="checkbox" checked={form.requires_guide} onChange={e => setForm({ ...form, requires_guide: e.target.checked })} className="rounded" />
              Requires Guide
            </label>
          </div>
          <textarea className="input min-h-[80px]" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <button type="submit" className="btn-primary">Save Destination</button>
        </motion.form>
      )}

      {loading ? (
        <div className="text-center text-stone py-12">Loading...</div>
      ) : (
        <div className="space-y-3">
          {destinations.map((d) => (
            <div key={d.id} className="card p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-snow">{d.name}</h3>
                <p className="text-sm text-stone">{d.cluster} &middot; {d.region || '—'}</p>
              </div>
              <button
                onClick={() => handleDelete(d.id)}
                className="px-3 py-1.5 text-sm bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                Delete
              </button>
            </div>
          ))}
          {destinations.length === 0 && (
            <p className="text-center text-stone py-12">No destinations found.</p>
          )}
        </div>
      )}
    </div>
  )
}
