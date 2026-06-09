import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import type { Destination } from '../types'

export default function DestinationCompare() {
  const navigate = useNavigate()
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [compareDest, setCompareDest] = useState<Destination | null>(null)
  const [showSelector, setShowSelector] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('recommendations')
    const selected = sessionStorage.getItem('selectedDestination')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.destinations?.length > 0) {
          setDestinations(parsed.destinations)
        }
      } catch {
        console.error('Failed to parse stored recommendations')
      }
    }
    if (selected) {
      try {
        const parsed = JSON.parse(selected)
        setSelectedId(parsed.id ?? null)
        setCompareDest(parsed)
      } catch {
        console.error('Failed to parse selected destination')
      }
    }
    setLoaded(true)
  }, [])

  const handleCompareSelect = (dest: Destination) => {
    setCompareDest(dest)
    setShowSelector(false)
  }

  const maxCompare = 3
  const compareList = compareDest
    ? [compareDest, ...destinations.filter(d => d.id !== compareDest.id)].slice(0, maxCompare)
    : destinations.slice(0, maxCompare)

  if (!loaded) {
    return (
      <div className="min-h-screen py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card-gradient rounded-xl p-6 border border-white/10 h-80 shimmer" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (destinations.length === 0) {
    return (
      <div className="min-h-screen py-20 flex flex-col items-center justify-center px-4">
        <div className="text-6xl mb-6">🔍</div>
        <h2 className="text-2xl font-bold mb-4">No Destinations to Compare</h2>
        <p className="text-stone mb-8 text-center max-w-md">
          Get personalized recommendations first, then compare them side by side.
        </p>
        <Link to="/preferences" className="btn-primary px-8 py-3 rounded-xl">
          Get Recommendations →
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Side-by-Side <span className="text-gradient">Comparison</span>
              </h1>
              <p className="text-stone">
                Compare destinations across altitude, difficulty, cost, seasons, activities, and more
              </p>
            </div>
            <div className="flex gap-3">
              {compareDest && (
                <button
                  onClick={() => setShowSelector(true)}
                  className="btn-secondary px-5 py-2.5 rounded-xl text-sm flex items-center gap-2"
                >
                  ↔ Compare
                </button>
              )}
              <button
                onClick={() => navigate('/recommendations')}
                className="border border-white/10 px-5 py-2.5 rounded-xl text-sm text-stone hover:text-saffron hover:border-saffron/30 transition-all flex items-center gap-2"
              >
                ← Back to Recommendations
              </button>
            </div>
          </div>
        </motion.div>

        {destinations.length > 0 && !compareDest && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-xl bg-saffron/10 border border-saffron/30"
          >
            <p className="text-sm text-saffron/90 flex items-center gap-2">
              <span>💡</span>
              <span>Select a destination below to start comparing.</span>
            </p>
          </motion.div>
        )}

        {showSelector && compareDest && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-5 card-gradient rounded-xl border border-saffron/30"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-saffron uppercase tracking-wider">
                Compare with another destination
              </h3>
              <button
                onClick={() => setShowSelector(false)}
                className="text-xs text-stone hover:text-snow transition-colors"
              >
                ✕ Close
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {destinations.filter(d => d.id !== compareDest.id).slice(0, 4).map(dest => (
                <button
                  key={dest.id}
                  onClick={() => handleCompareSelect(dest)}
                  className="text-left p-3 rounded-lg bg-white/5 border border-white/10 hover:border-saffron/30 hover:bg-white/[0.03] transition-all"
                >
                  <div className="text-sm font-medium text-snow mb-1">{dest.name}</div>
                  <div className="flex items-center gap-2 text-[11px] text-stone">
                    <span>{dest.altitude_max?.toLocaleString()}m</span>
                    <span>•</span>
                    <span>Rs {dest.cost_per_day_npr?.toLocaleString()}/day</span>
                    <span>•</span>
                    <span>{dest.difficulty}</span>
                  </div>
                  {dest.match_score != null && (
                    <span className="mt-1 inline-block text-[10px] tag-pill">
                      {dest.match_score}% Match
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <div className={`grid gap-4 ${compareList.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
          {compareList.map((dest, i) => {
            const isSelected = dest.id === selectedId
            return (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`card-gradient rounded-xl border ${
                  isSelected
                    ? 'border-saffron ring-1 ring-saffron/30'
                    : 'border-white/10'
                }`}
              >
                <div className="p-5 border-b border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-lg font-bold text-snow truncate">{dest.name}</h3>
                        {isSelected && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-saffron/20 text-saffron border border-saffron/30 font-medium">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone">{dest.cluster}{dest.region ? ` · ${dest.region}` : ''}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-saffron/20 to-saffron/5 border border-saffron/20 flex items-center justify-center text-2xl`}>
                        🏔️
                      </div>
                    </div>
                  </div>
                  {dest.match_score != null && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-saffron to-gold transition-all duration-500"
                          style={{ width: `${Math.min(dest.match_score, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-saffron">{dest.match_score}%</span>
                    </div>
                  )}
                  <p className="text-xs text-stone leading-relaxed line-clamp-2">{dest.description || '—'}</p>
                </div>

                <div className="p-5 space-y-3">
                  <CompareRow label="Altitude" value={dest.altitude_min != null && dest.altitude_max != null
                    ? `${dest.altitude_min.toLocaleString()} – ${dest.altitude_max.toLocaleString()}m`
                    : dest.altitude_max != null
                      ? `Up to ${dest.altitude_max.toLocaleString()}m`
                      : '—'
                  } />
                  <CompareRow label="Difficulty" value={dest.difficulty || '—'} highlight={dest.difficulty} />
                  <CompareRow label="Cost (Rs)" value={dest.cost_per_day_npr != null ? `Rs ${dest.cost_per_day_npr.toLocaleString()}/day` : '—'} />
                  <CompareRow label="Duration" value={dest.duration_min != null && dest.duration_max != null
                    ? `${dest.duration_min}–${dest.duration_max} days`
                    : dest.duration_min != null
                      ? `${dest.duration_min}+ days`
                      : '—'
                  } />
                  <CompareRow label="Best Seasons" value={dest.best_seasons?.join(', ') || '—'} />
                  <CompareRow label="Fitness Level" value={dest.fitness_level ? (
                    <span className="capitalize">{dest.fitness_level}</span>
                  ) : '—'} />
                  <CompareRow label="AMS Risk" value={dest.ams_risk ? (
                    <span className={
                      dest.ams_risk === 'Low' ? 'ams-low' :
                      dest.ams_risk === 'Moderate' ? 'ams-moderate' :
                      dest.ams_risk === 'High' ? 'ams-high' :
                      'ams-very-high'
                    }>{dest.ams_risk}</span>
                  ) : '—'} />

                  <div className="pt-2 border-t border-white/10">
                    <div className="text-[10px] font-semibold text-saffron uppercase tracking-wider mb-2">Activities</div>
                    <div className="flex flex-wrap gap-1">
                      {dest.activities && dest.activities.length > 0
                        ? dest.activities.map(a => (
                            <span key={a} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-stone border border-white/10">
                              {a}
                            </span>
                          ))
                        : <span className="text-[10px] text-stone">—</span>
                      }
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <div className="text-[10px] font-semibold text-saffron uppercase tracking-wider mb-2">Highlights</div>
                    <div className="flex flex-wrap gap-1">
                      {dest.highlights && dest.highlights.length > 0
                        ? dest.highlights.map(h => (
                            <span key={h} className="tag-pill text-[10px]">{h}</span>
                          ))
                        : <span className="text-[10px] text-stone">—</span>
                      }
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <div className="text-[10px] font-semibold text-saffron uppercase tracking-wider mb-2">Permits</div>
                    <div className="flex flex-wrap gap-1">
                      {dest.permits && dest.permits.length > 0
                        ? dest.permits.map(p => (
                            <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-stone border border-white/10">
                              {p}
                            </span>
                          ))
                        : <span className="text-[10px] text-stone">None required</span>
                      }
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {compareList.length === 3 && compareDest && destinations.length > 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center"
          >
            <button
              onClick={() => setShowSelector(true)}
              className="btn-secondary px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2"
            >
              ↔ Change Comparison
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function CompareRow({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[11px] text-stone">{label}</span>
      <span className={`text-xs text-right font-medium truncate ml-4 ${
        highlight
          ? highlight === 'Easy' ? 'text-tea' :
            highlight === 'Moderate' ? 'text-amber' :
            highlight === 'Difficult' ? 'text-orange' :
            highlight === 'Expert' ? 'text-crimson' :
            'text-snow'
          : 'text-snow'
      }`}>
        {value}
      </span>
    </div>
  )
}
