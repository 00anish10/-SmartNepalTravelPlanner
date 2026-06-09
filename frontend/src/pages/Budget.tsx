import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getBudgetEstimate } from '../services/api'
import { TableSkeleton } from '../components/Skeletons'
import type { BudgetResult, Destination } from '../types'

export default function Budget() {
  const [destination, setDestination] = useState<Destination | null>(null)
  const [result, setResult] = useState<BudgetResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [duration, setDuration] = useState(7)
  const [accommodation, setAccommodation] = useState('mid')
  const [guide, setGuide] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedDestination')
    if (stored) {
      try {
        const d: Destination = JSON.parse(stored)
        setDestination(d)
        setDuration(d.duration_min || 7)
        setGuide(d.requires_guide ?? false)
      } catch {}
    }
    const prefs = sessionStorage.getItem('recommendations')
    if (prefs) {
      try {
        const p = JSON.parse(prefs)
        const up = p.user_preferences
        if (up) {
          setAccommodation(up.accommodation_type || 'mid')
        }
      } catch {}
    }
  }, [])

  const loadBudget = async () => {
    if (!destination) return
    setLoading(true)
    try {
      const r = await getBudgetEstimate(destination.name, duration, accommodation, guide)
      setResult(r)
      toast.success('Budget calculated!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to calculate budget')
    } finally {
      setLoading(false)
    }
  }

  if (!destination) {
    return (
      <div className="min-h-screen py-20 flex flex-col items-center justify-center px-4">
        <div className="text-6xl mb-6">💰</div>
        <h2 className="text-2xl font-bold mb-4">No Destination Selected</h2>
        <p className="text-stone mb-8">Get recommendations and select a destination for budgeting.</p>
        <Link to="/recommendations" className="btn-primary px-8 py-3 rounded-xl">
          View Destinations →
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold"><span className="text-gradient">Budget</span> Breakdown</h1>
            <span className="tag-pill">{destination.name}</span>
          </div>
          <p className="text-stone">Transparent cost analysis with emergency buffer included</p>
        </motion.div>

        {/* Input form */}
        {!result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="card-gradient rounded-2xl p-8 border border-white/10 max-w-xl"
          >
            <h3 className="text-lg font-semibold mb-1">{destination.name}</h3>
            <p className="text-stone text-sm mb-6">Configure parameters for accurate pricing</p>

            <div className="space-y-5 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-saffron block mb-1 font-medium">Duration (days)</label>
                  <input type="number" min={1} max={30}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:border-saffron/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm text-saffron block mb-1 font-medium">Accommodation</label>
                  <div className="flex gap-2">
                    {(['budget', 'mid', 'luxury'] as const).map((a) => (
                      <button key={a}
                        onClick={() => setAccommodation(a)}
                        className={`flex-1 p-2.5 rounded-lg border text-xs capitalize transition-all ${
                          accommodation === a
                            ? 'border-saffron bg-saffron/10 text-saffron'
                            : 'border-white/10 bg-white/5 text-stone hover:border-white/20'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <input type="checkbox" id="guide"
                  checked={guide}
                  onChange={(e) => setGuide(e.target.checked)}
                  className="w-4 h-4 accent-saffron rounded"
                />
                <label htmlFor="guide" className="text-sm text-stone cursor-pointer">
                  Include guide & porter costs (required for restricted areas)
                </label>
              </div>
            </div>

            <button onClick={loadBudget} disabled={loading}
              className="btn-primary w-full py-3.5 rounded-xl text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? 'Calculating... 💰' : 'Calculate Budget →'}
            </button>
          </motion.div>
        )}

        {loading && !result && (
          <div className="card-gradient rounded-xl p-6 border border-white/10">
            <TableSkeleton rows={6} />
          </div>
        )}

        {/* Results */}
        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {result.warnings && result.warnings.map((w, i) => (
              <div key={i} className="p-4 rounded-xl bg-amber/10 border border-amber/30 text-sm text-amber flex items-start gap-2">
                <span className="shrink-0">⚠️</span>
                <span>{w}</span>
              </div>
            ))}

            <div className="card-gradient rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left py-3 px-4 text-stone font-medium">Category</th>
                    <th className="text-left py-3 px-4 text-stone font-medium">Item</th>
                    <th className="text-right py-3 px-4 text-stone font-medium">Cost (Rs)</th>
                    <th className="text-left py-3 px-4 text-stone font-medium hidden lg:table-cell">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {result.breakdown.map((item, i) => (
                    <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-4 text-saffron font-medium text-xs">{item.category}</td>
                      <td className="py-3 px-4 text-snow text-xs">{item.item}</td>
                      <td className="py-3 px-4 text-right text-snow text-xs font-medium">Rs {item.cost_npr.toLocaleString()}</td>
                      <td className="py-3 px-4 text-stone text-[10px] hidden lg:table-cell">{item.notes || '—'}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="card-gradient rounded-xl p-5 border border-white/10">
                <div className="text-xs text-stone uppercase tracking-wider mb-1">Subtotal</div>
                <div className="text-2xl font-bold text-snow">Rs {result.subtotal_npr.toLocaleString()}</div>
              </div>
              <div className="card-gradient rounded-xl p-5 border border-saffron/30">
                <div className="text-xs text-saffron uppercase tracking-wider mb-1">Emergency Buffer (15%)</div>
                <div className="text-2xl font-bold text-saffron">Rs {result.emergency_buffer_15_npr.toLocaleString()}</div>
              </div>
              <div className="card-gradient rounded-xl p-5 border border-tea/30">
                <div className="text-xs text-tea uppercase tracking-wider mb-1">Grand Total</div>
                <div className="text-2xl font-bold text-gradient">Rs {result.grand_total_npr.toLocaleString()}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => setResult(null)} className="btn-secondary px-6 py-3 rounded-xl text-sm">
                ← Recalculate
              </button>
              <Link to="/safety" className="btn-primary px-6 py-3 rounded-xl text-sm flex items-center gap-2">
                <span>🛡️</span> Safety Report
              </Link>
              <Link to="/itinerary" className="px-6 py-3 rounded-xl text-sm border border-white/10 text-stone hover:text-saffron transition-all flex items-center gap-2">
                <span>🗺️</span> Itinerary
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
