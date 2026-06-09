import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { getDestinations } from '../services/api'
import { CardSkeleton } from '../components/Skeletons'
import type { Destination } from '../types'

const CLUSTERS = [
  'All', 'High Himalayan Treks', 'Cultural Heritage', 'Wildlife and Terai',
  'Adventure and Mid-Hill', 'Remote Wilderness',
]

const DIFFICULTIES = ['All', 'Easy', 'Moderate', 'Difficult', 'Expert']

export default function Destinations() {
  const navigate = useNavigate()
  const [dests, setDests] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [clusterFilter, setClusterFilter] = useState('All')
  const [difficultyFilter, setDifficultyFilter] = useState('All')
  const [sortBy, setSortBy] = useState('name')
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({})

  useEffect(() => {
    getDestinations()
      .then(setDests)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = dests
    .filter((d) => {
      if (clusterFilter !== 'All' && d.cluster !== clusterFilter) return false
      if (difficultyFilter !== 'All' && d.difficulty !== difficultyFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          d.name.toLowerCase().includes(q) ||
          d.region?.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q) ||
          d.activities?.some((a) => a.toLowerCase().includes(q))
        )
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'altitude') return (b.altitude_max ?? 0) - (a.altitude_max ?? 0)
      if (sortBy === 'cost') return (a.cost_per_day_npr ?? 0) - (b.cost_per_day_npr ?? 0)
      if (sortBy === 'duration') return (a.duration_min ?? 0) - (b.duration_min ?? 0)
      return 0
    })

  const selectDestination = (d: Destination) => {
    sessionStorage.setItem('selectedDestination', JSON.stringify(d))
    navigate('/recommendations')
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold mb-2">
            Explore <span className="text-gradient">27 Destinations</span>
          </h1>
          <p className="text-stone">
            Browse Nepal's best destinations across 5 curated clusters
          </p>
        </motion.div>

        {/* Search & Filters */}
        <div className="card-gradient rounded-xl p-4 border border-white/10 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search destinations, regions, activities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-snow placeholder:text-stone focus:border-saffron/50 focus:outline-none transition-colors"
              />
            </div>
            <select
              value={clusterFilter}
              onChange={(e) => setClusterFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-snow focus:border-saffron/50 focus:outline-none transition-colors"
            >
              {CLUSTERS.map((c) => (
                <option key={c} value={c} className="bg-midnight">{c}</option>
              ))}
            </select>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-snow focus:border-saffron/50 focus:outline-none transition-colors"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d} className="bg-midnight">{d}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-stone">{filtered.length} of {dests.length} destinations</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border border-white/10 rounded-lg px-3 py-1.5 text-xs text-stone focus:border-saffron/50 focus:outline-none"
            >
              <option value="name" className="bg-midnight">Sort: Name</option>
              <option value="altitude" className="bg-midnight">Sort: Altitude (high)</option>
              <option value="cost" className="bg-midnight">Sort: Cost (low)</option>
              <option value="duration" className="bg-midnight">Sort: Duration (short)</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-stone">No destinations match your filters. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((dest, i) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i % 9) * 0.03 }}
                onClick={() => selectDestination(dest)}
                className="card-gradient rounded-xl p-5 border border-white/5 hover:border-saffron/30 hover:bg-white/[0.03] transition-all cursor-pointer group"
              >
                <div className="relative -mx-5 -mt-5 mb-4 h-[120px] overflow-hidden rounded-t-xl">
                  {dest.image_url && !imgErrors[dest.id] ? (
                    <img
                      src={import.meta.env.BASE_URL + dest.image_url.replace(/^\//, '')}
                      alt={dest.name}
                      className="w-full h-full object-cover"
                      onError={() => setImgErrors(prev => ({ ...prev, [dest.id]: true }))}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-saffron/30 to-midnight flex items-center justify-center">
                      <span className="text-4xl font-bold text-white/60">{dest.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-snow group-hover:text-saffron transition-colors">{dest.name}</h3>
                  <span className={`tag-pill text-[10px] ${
                    dest.difficulty === 'Easy' ? 'bg-tea/20 text-tea border-tea/30' :
                    dest.difficulty === 'Moderate' ? 'bg-amber/20 text-amber border-amber/30' :
                    dest.difficulty === 'Difficult' ? 'bg-orange/20 text-orange border-orange/30' :
                    'bg-crimson/20 text-crimson border-crimson/30'
                  }`}>{dest.difficulty}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-stone mb-2 flex-wrap">
                  <span className="tag-pill text-[9px]">{dest.cluster?.split(' ')[0]}...</span>
                  <span>{dest.altitude_max?.toLocaleString()}m</span>
                  <span>•</span>
                  <span>Rs {dest.cost_per_day_npr?.toLocaleString()}/day</span>
                  <span>•</span>
                  <span>{dest.duration_min}–{dest.duration_max}d</span>
                </div>

                <p className="text-xs text-stone leading-relaxed line-clamp-2 mb-3">{dest.description}</p>

                <div className="flex flex-wrap gap-1">
                  {dest.activities?.slice(0, 3).map((a) => (
                    <span key={a} className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-stone">{a}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
