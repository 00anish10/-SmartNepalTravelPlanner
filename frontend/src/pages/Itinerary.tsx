import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { generateItinerary } from '../services/api'
import { TableSkeleton } from '../components/Skeletons'
import type { ItineraryResult, Destination } from '../types'

export default function Itinerary() {
  const navigate = useNavigate()
  const [destination, setDestination] = useState<Destination | null>(null)
  const [result, setResult] = useState<ItineraryResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [duration, setDuration] = useState(7)
  const [startCity, setStartCity] = useState('Kathmandu')
  const [budget, setBudget] = useState(270000)
  const [fitness, setFitness] = useState('active')
  const [accommodation, setAccommodation] = useState('mid')

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedDestination')
    if (stored) {
      try {
        const d: Destination = JSON.parse(stored)
        setDestination(d)
        setDuration(d.duration_min || 7)
      } catch {
        console.error('Failed to parse destination')
      }
    }
    const prefs = sessionStorage.getItem('recommendations')
    if (prefs) {
      try {
        const p = JSON.parse(prefs)
        const up = p.user_preferences
        if (up) {
          setBudget((up.budget || 2000) * 135)
          setFitness(up.fitness_level || 'active')
          setAccommodation(up.accommodation_type || 'mid')
        }
      } catch {}
    }
  }, [])

  const handleGenerate = async () => {
    if (!destination) return
    setLoading(true)
    try {
      const res = await generateItinerary({
        destination_name: destination.name,
        duration,
        budget: Math.round(budget / 135),
        fitness_level: fitness,
        starting_city: startCity,
        accommodation_type: accommodation,
      })
      setResult(res)
      toast.success('Itinerary generated successfully!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate itinerary')
    } finally {
      setLoading(false)
    }
  }

  if (!destination) {
    return (
      <div className="min-h-screen py-20 flex flex-col items-center justify-center px-4">
        <div className="text-6xl mb-6">🗺️</div>
        <h2 className="text-2xl font-bold mb-4">No Destination Selected</h2>
        <p className="text-stone mb-8 text-center max-w-md">Get recommendations and select a destination to generate a personalized itinerary.</p>
        <Link to="/recommendations" className="btn-primary px-8 py-3 rounded-xl">
          View Destinations →
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold">
              <span className="text-gradient">Itinerary</span> Generator
            </h1>
            <span className="tag-pill">{destination.name}</span>
          </div>
          <p className="text-stone">
            Greedy-optimized day schedule with altitude constraints, acclimatization rules, and budget tracking
          </p>
        </motion.div>

        {!result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-gradient rounded-2xl p-8 border border-white/10 max-w-xl"
          >
            <h3 className="text-lg font-semibold mb-1">{destination.name}</h3>
            <p className="text-stone text-sm mb-6">Configure your itinerary parameters below</p>

            <div className="space-y-5 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-saffron block mb-1 font-medium">Duration (days)</label>
                  <input
                    type="number" min={1} max={30}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:border-saffron/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm text-saffron block mb-1 font-medium">Budget (Rs)</label>
                  <input
                    type="number" min={13500} max={6750000} step={1000}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:border-saffron/50 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-saffron block mb-1 font-medium">Starting City</label>
                  <select
                    value={startCity}
                    onChange={(e) => setStartCity(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:border-saffron/50 focus:outline-none transition-colors"
                  >
                    <option value="Kathmandu">Kathmandu</option>
                    <option value="Pokhara">Pokhara</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-saffron block mb-1 font-medium">Fitness Level</label>
                  <select
                    value={fitness}
                    onChange={(e) => setFitness(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:border-saffron/50 focus:outline-none transition-colors"
                  >
                    <option value="sedentary">Sedentary</option>
                    <option value="moderate">Moderate</option>
                    <option value="active">Active</option>
                    <option value="athletic">Athletic</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="btn-primary w-full py-3.5 rounded-xl text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating... 🏔️' : 'Generate Itinerary →'}
            </button>
          </motion.div>
        )}

        {loading && !result && (
          <div className="card-gradient rounded-xl p-6 border border-white/10">
            <TableSkeleton rows={7} />
          </div>
        )}

        {result && (
          <>
            {result.warnings && result.warnings.length > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-crimson/10 border border-crimson/30">
                {result.warnings.map((w, i) => (
                  <p key={i} className="text-sm text-crimson/90 flex items-start gap-2">
                    <span className="mt-0.5">⚠️</span>
                    <span>{w}</span>
                  </p>
                ))}
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-white/10 mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left py-3 px-3 text-stone font-medium">Day</th>
                    <th className="text-left py-3 px-3 text-stone font-medium">Location</th>
                    <th className="text-left py-3 px-3 text-stone font-medium">Activity</th>
                    <th className="text-right py-3 px-3 text-stone font-medium">Altitude</th>
                    <th className="text-right py-3 px-3 text-stone font-medium">Cost (Rs)</th>
                    <th className="text-left py-3 px-3 text-stone font-medium hidden md:table-cell">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {result.days.map((day, i) => (
                    <motion.tr
                      key={day.day}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                        day.activity === 'Acclimatization Rest Day' ? 'bg-amber/5' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <span className="text-saffron font-medium">D{day.day}</span>
                      </td>
                      <td className="py-3 px-3 text-snow whitespace-nowrap">{day.location}</td>
                      <td className="py-3 px-3">
                        <span className={`${
                          day.activity === 'Acclimatization Rest Day' ? 'text-amber' : 'text-stone'
                        }`}>{day.activity}</span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span className="text-snow">{day.altitude.toLocaleString()}m</span>
                        {day.altitude_gain > 0 && (
                          <span className="text-tea text-xs ml-1">↑{day.altitude_gain}</span>
                        )}
                        {day.altitude_gain < 0 && (
                          <span className="text-crimson text-xs ml-1">↓{Math.abs(day.altitude_gain)}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right text-snow">Rs {day.est_cost_npr.toLocaleString()}</td>
                      <td className="py-3 px-3 text-stone text-xs hidden md:table-cell max-w-[200px] truncate" title={day.notes}>
                        {day.notes}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Altitude profile mini-chart */}
            <div className="card-gradient rounded-xl p-5 border border-white/10 mb-6">
              <div className="text-xs text-stone mb-3 uppercase tracking-wider font-medium">Altitude Profile</div>
              <div className="flex items-end gap-1 h-24">
                {result.days.map((d, i) => {
                  const maxAlt = Math.max(...result.days.map(x => x.altitude), 1)
                  const heightPct = (d.altitude / maxAlt) * 100
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <div
                        className="w-full rounded-t-sm transition-all"
                        style={{
                          height: `${Math.max(heightPct, 5)}%`,
                          background: d.activity === 'Acclimatization Rest Day'
                            ? '#eab308'
                            : `linear-gradient(to top, #FF9933, #D4A843)`,
                          opacity: d.activity === 'Acclimatization Rest Day' ? 0.8 : 0.6 + (heightPct / 100) * 0.4,
                        }}
                      />
                      <span className="text-[8px] text-stone">{d.day}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Cost Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-gradient rounded-xl p-6 border border-white/10 grid md:grid-cols-3 gap-6"
            >
              <div>
                <div className="text-xs text-stone uppercase tracking-wider mb-1">Total Cost</div>
                <div className="text-2xl font-bold text-snow">Rs {result.total_cost_npr.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-stone uppercase tracking-wider mb-1">Emergency Buffer (15%)</div>
                <div className="text-2xl font-bold text-saffron">Rs {result.emergency_buffer_npr.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-stone uppercase tracking-wider mb-1">Grand Total</div>
                <div className="text-2xl font-bold text-gradient">Rs {result.grand_total_npr.toLocaleString()}</div>
              </div>
            </motion.div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => setResult(null)} className="btn-secondary px-6 py-3 rounded-xl text-sm">
                ← Regenerate
              </button>
              <button onClick={() => navigate('/safety')} className="btn-primary px-6 py-3 rounded-xl text-sm flex items-center gap-2">
                <span>🛡️</span> Safety Report
              </button>
              <button onClick={() => navigate('/budget')} className="px-6 py-3 rounded-xl text-sm border border-white/10 text-stone hover:text-saffron transition-all flex items-center gap-2">
                <span>💰</span> Budget
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
