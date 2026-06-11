import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getBudgetEstimate, saveTripHistory } from '../services/api'
import { TableSkeleton } from '../components/Skeletons'
import type { BudgetResult, Destination } from '../types'

export default function Budget() {
  const [destination, setDestination] = useState<Destination | null>(null)
  const [result, setResult] = useState<BudgetResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [duration, setDuration] = useState(7)
  const [accommodation, setAccommodation] = useState('mid')
  const [guide, setGuide] = useState(false)
  const [preferenceBudget, setPreferenceBudget] = useState<number | null>(null)

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
          if (up.budget) setPreferenceBudget(up.budget)
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
      saveTripHistory({
        destination_name: destination.name,
        budget_total: r.grand_total_npr,
        duration_days: duration,
        accommodation,
        preferences_snapshot: { budget: preferenceBudget, duration },
        breakdown: r.breakdown.map(b => ({ category: b.category, item: b.item, cost_npr: b.cost_npr })),
      }).catch((err) => {
        console.error('Failed to save trip history:', err)
      })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to calculate budget')
    } finally {
      setLoading(false)
    }
  }

  if (!destination) {
    return (
      <div className="min-h-screen py-20 flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-3xl mb-6">💰</div>
        <h2 className="text-2xl font-bold text-snow mb-2">No Destination Selected</h2>
        <p className="text-stone mb-8">Get recommendations and select a destination for budgeting.</p>
        <Link to="/recommendations" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-saffron text-white text-sm font-medium hover:bg-saffron/90 transition-colors shadow-sm">
          View Destinations
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-snow">Budget Breakdown</h1>
            <span className="tag-pill bg-saffron/10 text-saffron border-saffron/20 text-xs font-medium">{destination.name}</span>
          </div>
          <p className="text-stone">Transparent cost analysis with emergency buffer included</p>
        </motion.div>

        {/* Input form */}
        {!result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-8 border border-saffron/10 shadow-sm max-w-xl"
          >
            <h3 className="text-lg font-semibold text-snow mb-1">{destination.name}</h3>
            <p className="text-stone text-sm mb-6">Configure parameters for accurate pricing</p>

            <div className="space-y-5 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-saffron block mb-1.5 font-medium">Duration (days)</label>
                  <input type="number" min={1} max={30}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-white border border-stone/20 rounded-xl px-4 py-2.5 text-sm text-snow focus:border-saffron/50 focus:outline-none focus:ring-2 focus:ring-saffron/10 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm text-saffron block mb-1.5 font-medium">Accommodation</label>
                  <div className="flex gap-2">
                    {(['budget', 'mid', 'luxury'] as const).map((a) => (
                      <button key={a}
                        onClick={() => setAccommodation(a)}
                        className={`flex-1 py-2.5 rounded-lg border text-xs capitalize font-medium transition-all ${
                          accommodation === a
                            ? 'border-saffron bg-saffron/10 text-saffron shadow-sm'
                            : 'border-stone/20 bg-white text-stone hover:border-saffron/30'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50/50 border border-saffron/10 cursor-pointer hover:bg-amber-50 transition-colors">
                <input type="checkbox" checked={guide}
                  onChange={(e) => setGuide(e.target.checked)}
                  className="w-4 h-4 rounded border-saffron/30 text-saffron focus:ring-saffron/20"
                />
                <div>
                  <span className="text-sm text-snow font-medium">Include guide & porter costs</span>
                  <p className="text-xs text-stone mt-0.5">Required for restricted/remote areas</p>
                </div>
              </label>
            </div>

            <button onClick={loadBudget} disabled={loading}
              className="w-full py-3 rounded-xl bg-saffron text-white text-sm font-semibold hover:bg-saffron/90 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Calculating...
                </>
              ) : 'Calculate Budget'}
            </button>
          </motion.div>
        )}

        {loading && !result && (
          <div className="bg-white rounded-2xl p-6 border border-saffron/10 shadow-sm">
            <TableSkeleton rows={6} />
          </div>
        )}

        {/* Results */}
        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {result.warnings && result.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700">
                <span className="text-lg shrink-0 mt-0.5">⚠️</span>
                <span>{w}</span>
              </div>
            ))}

            {/* Budget vs Preference */}
            {preferenceBudget && (
              <div className={`flex items-start gap-3 p-4 rounded-xl border ${
                result.grand_total_npr > preferenceBudget
                  ? 'bg-red-50 border-red-200'
                  : 'bg-emerald-50 border-emerald-200'
              }`}>
                <div className={`text-lg shrink-0 mt-0.5 ${result.grand_total_npr > preferenceBudget ? 'text-red-500' : 'text-emerald-500'}`}>
                  {result.grand_total_npr > preferenceBudget ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${result.grand_total_npr > preferenceBudget ? 'text-red-700' : 'text-emerald-700'}`}>
                    {result.grand_total_npr > preferenceBudget
                      ? `Estimated cost exceeds your budget by Rs ${(result.grand_total_npr - preferenceBudget).toLocaleString()}`
                      : `Within your budget — Rs ${(preferenceBudget - result.grand_total_npr).toLocaleString()} remaining`}
                  </p>
                  <p className="text-xs mt-1 text-stone">
                    Your plan budget: Rs {preferenceBudget.toLocaleString()} &middot; Estimated total: Rs {result.grand_total_npr.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-saffron/10 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-saffron/10 bg-amber-50/50">
                      <th className="text-left py-3.5 px-5 text-xs font-semibold uppercase tracking-wider text-stone/70">Category</th>
                      <th className="text-left py-3.5 px-5 text-xs font-semibold uppercase tracking-wider text-stone/70">Item</th>
                      <th className="text-right py-3.5 px-5 text-xs font-semibold uppercase tracking-wider text-stone/70">Cost (Rs)</th>
                      <th className="text-left py-3.5 px-5 text-xs font-semibold uppercase tracking-wider text-stone/70 hidden lg:table-cell">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.breakdown.map((item, i) => (
                      <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                        className="border-b border-saffron/5 hover:bg-amber-50/30 transition-colors"
                      >
                        <td className="py-3.5 px-5">
                          <span className="text-xs font-semibold text-saffron uppercase tracking-wider">{item.category}</span>
                        </td>
                        <td className="py-3.5 px-5 text-sm text-snow">{item.item}</td>
                        <td className="py-3.5 px-5 text-right text-sm text-snow font-medium tabular-nums">Rs {item.cost_npr.toLocaleString()}</td>
                        <td className="py-3.5 px-5 text-xs text-stone/70 hidden lg:table-cell">{item.notes || '—'}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-saffron/10 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone/70 mb-1">Subtotal</p>
                <p className="text-2xl font-bold text-snow tabular-nums">Rs {result.subtotal_npr.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm bg-amber-50/30">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">Emergency Buffer (15%)</p>
                <p className="text-2xl font-bold text-amber-600 tabular-nums">Rs {result.emergency_buffer_15_npr.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm bg-emerald-50/30">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">Grand Total</p>
                <p className="text-2xl font-bold text-emerald-600 tabular-nums">Rs {result.grand_total_npr.toLocaleString()}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button onClick={() => setResult(null)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone/20 text-sm text-stone hover:border-saffron/30 hover:text-saffron transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Recalculate
              </button>
              <Link to="/safety"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-saffron text-white text-sm font-medium hover:bg-saffron/90 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Safety Report
              </Link>
              <Link to="/itinerary"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone/20 text-sm text-stone hover:border-saffron/30 hover:text-saffron transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Itinerary
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
