import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getSafetyReport } from '../services/api'
import { PageSkeleton } from '../components/Skeletons'
import type { SafetyReport, Destination } from '../types'

export default function Safety() {
  const [destination, setDestination] = useState<Destination | null>(null)
  const [report, setReport] = useState<SafetyReport | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedDestination')
    if (stored) {
      try { setDestination(JSON.parse(stored)) } catch {}
    }
  }, [])

  useEffect(() => {
    if (destination && !report && !loading) loadReport()
  }, [destination])

  const loadReport = async () => {
    if (!destination) return
    setLoading(true)
    try {
      const r = await getSafetyReport(destination.name)
      setReport(r)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load safety report')
    } finally {
      setLoading(false)
    }
  }

  if (!destination) {
    return (
      <div className="min-h-screen py-20 flex flex-col items-center justify-center px-4">
        <div className="text-6xl mb-6">🛡️</div>
        <h2 className="text-2xl font-bold mb-4">No Destination Selected</h2>
        <p className="text-stone mb-8">Get recommendations and select a destination to view its safety report.</p>
        <Link to="/recommendations" className="btn-primary px-8 py-3 rounded-xl">
          View Destinations →
        </Link>
      </div>
    )
  }

  if (loading) return <PageSkeleton />

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold"><span className="text-gradient">Safety</span> Report</h1>
            <span className="tag-pill">{destination.name}</span>
          </div>
          <p className="text-stone">Comprehensive risk assessment and preparation guide</p>
        </motion.div>

        {!report && !loading && (
          <div className="card-gradient rounded-xl p-8 text-center border border-white/10">
            <p className="text-stone mb-4">Failed to load safety report.</p>
            <button onClick={loadReport} className="btn-primary px-6 py-3 rounded-xl text-sm">Retry</button>
          </div>
        )}

        {report && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <StatCard title="Difficulty" value={report.difficulty} color={
                report.difficulty === 'Easy' ? 'text-tea' :
                report.difficulty === 'Moderate' ? 'text-amber' :
                report.difficulty === 'Difficult' ? 'text-orange' : 'text-crimson'
              } />
              <StatCard title="Max Altitude" value={`${report.max_altitude.toLocaleString()}m`} />
              <StatCard title="AMS Risk" value={report.ams_risk_level} color={
                report.ams_risk_level === 'Low' ? 'ams-low' :
                report.ams_risk_level === 'Moderate' ? 'ams-moderate' :
                report.ams_risk_level === 'High' ? 'ams-high' : 'ams-very-high'
              } />
            </div>

            <Section title="Why This Difficulty?">
              <p className="text-sm text-stone leading-relaxed">{report.difficulty_explanation}</p>
            </Section>

            <Section title="Acclimatization Schedule">
              <p className="text-sm text-stone mb-3">
                Required rest days: <span className="text-saffron font-bold">{report.required_acclimatization_days}</span>
              </p>
              <ul className="space-y-2">
                {report.acclimatization_schedule.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-stone">
                    <span className="text-saffron mt-0.5 shrink-0">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Fitness Preparation">
              <p className="text-sm text-stone">{report.recommended_fitness_prep}</p>
            </Section>

            <Section title="Essential Gear">
              <div className="grid md:grid-cols-2 gap-2">
                {report.essential_gear.map((g, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-stone">
                    <span className="text-tea shrink-0">✓</span>
                    <span>{g}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Emergency & Evacuation">
              <div className="mb-4">
                <div className="text-xs text-saffron uppercase tracking-wider mb-2">Nearest Hospital</div>
                <p className="text-sm text-snow">{report.nearest_hospital}</p>
              </div>
              <div>
                <div className="text-xs text-saffron uppercase tracking-wider mb-2">Evacuation Points</div>
                <ul className="space-y-1">
                  {report.emergency_evacuation_points.map((p, i) => (
                    <li key={i} className="text-sm text-stone flex items-start gap-2">
                      <span className="text-crimson shrink-0">🚁</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Section>

            <Section title="Safety Flags & Alerts">
              {report.safety_flags.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-sm mb-2 last:mb-0"
                  style={{ color: f.includes('HIGH') ? '#ef4444' : f.includes('MODERATE') ? '#eab308' : '#a3a3a3' }}
                >
                  <span className="shrink-0 mt-0.5">⚠</span>
                  <span>{f}</span>
                </div>
              ))}
            </Section>

            <Section title="Required Permits">
              {report.permits_required.length > 0 ? report.permits_required.map((p, i) => (
                <div key={i} className="text-sm text-stone flex items-start gap-2 mb-1">
                  <span className="text-saffron">📜</span>
                  <span>{p}</span>
                </div>
              )) : (
                <p className="text-sm text-stone">No special permits required for this destination.</p>
              )}
              <p className="text-xs text-stone mt-3 border-t border-white/5 pt-3">
                All permits must be obtained through registered agencies or TAAN offices in Kathmandu/Pokhara.
                Carry original permits at all checkpoints — photocopies are not accepted.
              </p>
            </Section>

            <div className="flex flex-wrap gap-3 mt-8">
              <button onClick={loadReport} className="btn-secondary px-6 py-3 rounded-xl text-sm">
                Refresh Report
              </button>
              <Link to="/itinerary" className="btn-primary px-6 py-3 rounded-xl text-sm flex items-center gap-2">
                <span>🗺️</span> View Itinerary
              </Link>
              <Link to="/budget" className="px-6 py-3 rounded-xl text-sm border border-white/10 text-stone hover:text-saffron transition-all flex items-center gap-2">
                <span>💰</span> Budget
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, color }: { title: string; value: string; color?: string }) {
  return (
    <div className="card-gradient rounded-xl p-5 border border-white/10 text-center">
      <div className="text-xs text-stone uppercase tracking-wider mb-1">{title}</div>
      <div className={`text-2xl font-bold ${color || 'text-snow'}`}>{value}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-gradient rounded-xl p-5 border border-white/10">
      <h3 className="text-sm font-semibold text-saffron mb-4 uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  )
}
