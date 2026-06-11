import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getMyTripHistory, deleteTripHistory } from '../services/api'
import type { TripHistoryItem } from '../services/api'

export default function TripHistory() {
  const [history, setHistory] = useState<TripHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    getMyTripHistory()
      .then(setHistory)
      .catch(() => toast.error('Failed to load trip history'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: number) => {
    setDeleting(id)
    try {
      await deleteTripHistory(id)
      setHistory(prev => prev.filter(h => h.id !== id))
      toast.success('Trip deleted')
    } catch {
      toast.error('Failed to delete trip')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 border-2 border-saffron/30 border-t-saffron rounded-full animate-spin" />
              <span className="text-stone text-sm">Loading trip history...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold"><span className="text-gradient">Trip</span> History</h1>
            <span className="tag-pill">{history.length} trips</span>
          </div>
          <p className="text-stone text-sm">Your past trip plans, budgets, and preferences — all in one place.</p>
        </motion.div>

        {history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card rounded-xl p-12 text-center"
          >
            <div className="text-5xl mb-4 text-stone/40">🗺️</div>
            <h3 className="text-lg font-semibold text-snow mb-2">No trips yet</h3>
            <p className="text-sm text-stone mb-6 max-w-sm mx-auto">
              Your trip history will appear here once you calculate a budget for a destination.
            </p>
            <Link to="/preferences" className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm">
              <span>📋</span> Plan Your First Trip
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {history.map((trip, i) => {
              const breakdown = trip.breakdown as Array<{ category: string; item: string; cost_npr: number }> | null
              return (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card rounded-xl overflow-hidden group"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-saffron/20 to-amber-500/20 flex items-center justify-center text-saffron shrink-0">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-snow">{trip.destination_name}</h3>
                          <p className="text-xs text-stone/60 mt-0.5">
                            {trip.duration_days ? `${trip.duration_days} days` : ''}
                            {trip.accommodation ? ` · ${trip.accommodation}` : ''}
                            {trip.duration_days || trip.accommodation ? ' · ' : ''}
                            {new Date(trip.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() => handleDelete(trip.id)}
                          disabled={deleting === trip.id}
                          className="text-stone/30 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-30 p-1"
                          aria-label="Delete trip"
                        >
                          {deleting === trip.id ? (
                            <span className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin block" />
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                        <div className="text-right">
                          <p className="text-lg font-bold text-snow tabular-nums">Rs {trip.budget_total.toLocaleString()}</p>
                          <p className="text-[10px] text-stone/50 uppercase tracking-wider mt-0.5">Estimated Total</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {breakdown && breakdown.length > 0 && (
                    <>
                      <div className="border-t border-saffron/10">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-saffron/10 bg-amber-50/50">
                                <th className="text-left px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-stone/70">Category</th>
                                <th className="text-left px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-stone/70">Item</th>
                                <th className="text-right px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-stone/70">Cost</th>
                              </tr>
                            </thead>
                            <tbody>
                              {breakdown.map((item, j) => (
                                <tr key={j} className="border-b border-saffron/5 last:border-0">
                                  <td className="px-5 py-2 text-xs text-stone">{item.category}</td>
                                  <td className="px-5 py-2 text-xs text-snow">{item.item}</td>
                                  <td className="px-5 py-2 text-xs text-snow text-right tabular-nums font-medium">Rs {item.cost_npr.toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="px-5 py-3 bg-amber-50/30 border-t border-saffron/10 flex justify-between items-center">
                        <span className="text-xs text-stone/60">Total</span>
                        <span className="text-sm font-bold text-snow tabular-nums">Rs {trip.budget_total.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
