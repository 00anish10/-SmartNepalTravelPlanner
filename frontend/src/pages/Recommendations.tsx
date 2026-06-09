import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { CardSkeleton, DetailPanelSkeleton } from '../components/Skeletons'
import type { Destination } from '../types'

export default function Recommendations() {
  const navigate = useNavigate()
  const [data, setData] = useState<{ destinations: Destination[]; warnings?: string[] } | null>(null)
  const [selected, setSelected] = useState<Destination | null>(null)
  const [loading, setLoading] = useState(true)
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({})

  useEffect(() => {
    const stored = sessionStorage.getItem('recommendations')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setData(parsed)
        if (parsed.destinations?.length > 0) {
          setSelected(parsed.destinations[0])
        }
      } catch {
        console.error('Failed to parse stored recommendations')
      }
    }
    setLoading(false)
  }, [])

  const selectAndStore = (dest: Destination) => {
    setSelected(dest)
    sessionStorage.setItem('selectedDestination', JSON.stringify(dest))
  }

  if (!data && loading) {
    return (
      <div className="min-h-screen py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => <CardSkeleton key={i} />)}
            </div>
            <div><DetailPanelSkeleton /></div>
          </div>
        </div>
      </div>
    )
  }

  if (!data || !data.destinations || data.destinations.length === 0) {
    return (
      <div className="min-h-screen py-20 flex flex-col items-center justify-center px-4">
        <div className="text-6xl mb-6">🏔️</div>
        <h2 className="text-2xl font-bold mb-4">{data ? 'No Matches Found' : 'No Recommendations Yet'}</h2>
        <p className="text-stone mb-8 text-center max-w-md">
          {data
            ? 'Your preferences didn\'t match any destinations. Try adjusting your budget, duration, or interests.'
            : 'Tell us about your preferences and our AI will match you with the perfect Nepal destinations!'}
        </p>
        <Link to="/preferences" className="btn-primary px-8 py-3 rounded-xl">
          {data ? 'Try Again →' : 'Start Planning →'}
        </Link>
      </div>
    )
  }

  const dests = data.destinations

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold mb-2">
            Your <span className="text-gradient">Personalized</span> Destinations
          </h1>
          <p className="text-stone">
            Ranked by AI content-based matching — cosine similarity on TF-IDF vectors against your preferences
          </p>
        </motion.div>

        {data.warnings && data.warnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-xl bg-crimson/10 border border-crimson/30"
          >
            {data.warnings.map((w, i) => (
              <p key={i} className="text-sm text-crimson/90 flex items-start gap-2">
                <span className="mt-0.5">⚠️</span>
                <span>{w}</span>
              </p>
            ))}
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {dests.map((dest, i) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => selectAndStore(dest)}
                className={`card-gradient rounded-xl p-5 cursor-pointer transition-all border ${
                  selected?.id === dest.id
                    ? 'border-saffron bg-saffron/5 shadow-lg shadow-saffron/5'
                    : 'border-white/5 hover:border-white/20 hover:bg-white/5'
                } flex gap-4`}
              >
                <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
                  {dest.image_url && !imgErrors[dest.id] ? (
                    <img
                      src={import.meta.env.BASE_URL + dest.image_url.replace(/^\//, '')}
                      alt={dest.name}
                      className="w-full h-full object-cover"
                      onError={() => setImgErrors(prev => ({ ...prev, [dest.id]: true }))}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-saffron/30 to-midnight flex items-center justify-center">
                      <span className="text-2xl font-bold text-white/60">{dest.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-lg font-semibold text-snow">
                          {i + 1}. {dest.name}
                        </span>
                        <span className={`tag-pill ${dest.match_score && dest.match_score > 75 ? 'bg-tea/20 text-tea border-tea/30' : ''}`}>
                          {dest.match_score ?? '—'}% Match
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone flex-wrap">
                        <span>{dest.cluster}</span>
                        <span>•</span>
                        <span>{dest.altitude_max?.toLocaleString()}m</span>
                        <span>•</span>
                        <span>Rs {dest.cost_per_day_npr?.toLocaleString()}/day</span>
                        <span>•</span>
                        <DifficultyBadge difficulty={dest.difficulty} />
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-stone mb-2 line-clamp-2 leading-relaxed">{dest.description}</p>

                  {dest.similarity_explanation && (
                    <p className="text-xs text-saffron/80 mb-3 italic">{dest.similarity_explanation}</p>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {dest.activities?.slice(0, 5).map((a) => (
                      <span key={a} className="tag-pill text-[10px]">{a}</span>
                    ))}
                    {(dest.activities?.length ?? 0) > 5 && (
                      <span className="tag-pill text-[10px]">+{dest.activities.length - 5}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-1">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card-gradient rounded-xl p-6 sticky top-24 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-snow">{selected.name}</h3>
                  <span className="text-2xl">🏔️</span>
                </div>

                <div className="space-y-2.5 text-sm mb-6">
                  <Row label="Altitude" value={`${selected.altitude_min?.toLocaleString()} – ${selected.altitude_max?.toLocaleString()}m`} />
                  <Row label="Region" value={selected.region || selected.cluster || '—'} />
                  <Row label="Duration" value={`${selected.duration_min}–${selected.duration_max} days`} />
                  <Row label="Difficulty" value={<DifficultyBadge difficulty={selected.difficulty} />} />
                  <Row label="Cost" value={`Rs ${(selected.cost_per_day_npr ?? 0).toLocaleString()}/day`} />
                  <Row label="AMS Risk" value={
                    <span className={amsColor(selected.ams_risk)}>{selected.ams_risk || 'Low'}</span>
                  } />
                  <Row label="Guide Required" value={selected.requires_guide ? '✅ Yes (mandatory)' : '❌ No'} />
                  <Row label="Fitness Level" value={<span className="capitalize">{selected.fitness_level || 'Moderate'}</span>} />
                  <Row label="Best Seasons" value={selected.best_seasons?.join(', ') || '—'} />
                  <Row label="Permits" value={
                    <span className="text-xs">{selected.permits?.join(', ') || 'None required'}</span>
                  } />
                </div>

                {selected.highlights && selected.highlights.length > 0 && (
                  <div className="mb-6">
                    <div className="text-xs font-semibold text-saffron mb-2 uppercase tracking-wider">Highlights</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.highlights.map((h) => (
                        <span key={h} className="tag-pill text-[10px]">{h}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/itinerary')}
                    className="btn-primary w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2"
                  >
                    <span>🗺️</span> Generate Itinerary
                  </button>
                  <button
                    onClick={() => navigate('/safety')}
                    className="btn-secondary w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2"
                  >
                    <span>🛡️</span> Safety Report
                  </button>
                  <button
                    onClick={() => navigate('/budget')}
                    className="w-full py-3 rounded-xl text-sm border border-white/10 text-stone hover:text-saffron hover:border-saffron/30 transition-all flex items-center justify-center gap-2"
                  >
                    <span>💰</span> Budget Breakdown
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="card-gradient rounded-xl p-6 text-center text-stone text-sm border border-white/10">
                <div className="text-3xl mb-3">👆</div>
                <p>Select a destination to see full details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-stone text-xs">{label}</span>
      <span className="text-snow text-right text-xs font-medium">{value}</span>
    </div>
  )
}

function DifficultyBadge({ difficulty }: { difficulty?: string }) {
  const color = difficulty === 'Easy' ? 'text-tea' :
    difficulty === 'Moderate' ? 'text-amber' :
    difficulty === 'Difficult' ? 'text-orange' : 'text-crimson'
  return <span className={`font-medium ${color}`}>{difficulty || '—'}</span>
}

function amsColor(risk?: string) {
  if (risk === 'Low') return 'ams-low'
  if (risk === 'Moderate') return 'ams-moderate'
  if (risk === 'High') return 'ams-high'
  return 'ams-very-high'
}
