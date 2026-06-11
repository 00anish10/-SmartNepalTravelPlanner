import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adToBs } from '@sbmdkl/nepali-date-converter'
import { getRecommendations } from '../services/api'
import { usePreferencesStore } from '../hooks/usePreferencesStore'
import { userStorageKey } from '../hooks/useAuth'
import type { PreferenceInput } from '../types'

const NPR_RATE = 135

const STEPS = [
  { id: 'basics', title: 'Trip Basics', icon: '📋' },
  { id: 'interests', title: 'Interests', icon: '🎯' },
  { id: 'fitness', title: 'Fitness & Style', icon: '💪' },
  { id: 'details', title: 'Final Details', icon: '✈️' },
]

const INTEREST_OPTIONS = [
  { value: 'trekking', label: 'Trekking', icon: '🥾' },
  { value: 'cultural', label: 'Cultural', icon: '🏛️' },
  { value: 'wildlife', label: 'Wildlife', icon: '🐅' },
  { value: 'adventure', label: 'Adventure', icon: '🪂' },
  { value: 'spiritual', label: 'Spiritual', icon: '🕉️' },
  { value: 'photography', label: 'Photography', icon: '📷' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { value: 'rafting', label: 'Rafting', icon: '🛶' },
]

const SEASONS = [
  { value: 'spring', label: 'Spring (Mar-May)', icon: '🌸', desc: 'Best for trekking, rhododendrons bloom' },
  { value: 'summer', label: 'Summer (Jun-Aug)', icon: '☀️', desc: 'Monsoon, great for rain shadow treks' },
  { value: 'autumn', label: 'Autumn (Sep-Nov)', icon: '🍂', desc: 'Peak season, clearest skies' },
  { value: 'winter', label: 'Winter (Dec-Feb)', icon: '❄️', desc: 'Cold, fewer crowds, good for Terai' },
]

const FITNESS_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little to no regular exercise' },
  { value: 'moderate', label: 'Moderate', desc: 'Walk or exercise 2-3x/week' },
  { value: 'active', label: 'Active', desc: 'Regular exercise 4-5x/week' },
  { value: 'athletic', label: 'Athletic', desc: 'High fitness, endurance trained, regular hiker' },
]

const TRAVEL_TYPES = [
  { value: 'solo', label: 'Solo', icon: '🧑', desc: 'Traveling alone' },
  { value: 'couple', label: 'Couple', icon: '💑', desc: 'Traveling with a partner' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', desc: 'Traveling with children' },
  { value: 'group', label: 'Group', icon: '👥', desc: 'Traveling with 3+ people' },
]

interface StepProps {
  p: PreferenceInput;
  update: (field: keyof PreferenceInput, value: unknown) => void;
  errors: Record<string, string>;
  toggle?: (value: string) => void;
}

export default function Preferences() {
  const navigate = useNavigate()
  const { preferences, setPreference } = usePreferencesStore()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const prefKey = userStorageKey('preferences_draft')

  useEffect(() => {
    const saved = localStorage.getItem(prefKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.nationality || parsed.budget) {
          Object.entries(parsed).forEach(([key, value]) => {
            setPreference(key, value)
          })
        }
      } catch {
        localStorage.removeItem(prefKey)
      }
    }
  }, [setPreference, prefKey])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (preferences.budget || preferences.nationality) {
        localStorage.setItem(prefKey, JSON.stringify(preferences))
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [preferences, prefKey])

  const update = (field: keyof PreferenceInput, value: unknown) => {
    setPreference(field, value)
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {}
    switch (step) {
      case 0:
        if (!preferences.budget || preferences.budget < 13500) newErrors.budget = 'Minimum budget: Rs 13,500 (~$100)'
        if (!preferences.duration || preferences.duration < 1 || preferences.duration > 30) newErrors.duration = 'Duration: 1–30 days'
        if (!preferences.season) newErrors.season = 'Please select a season'
        break
      case 1:
        if (preferences.interests.length === 0) newErrors.interests = 'Select at least one interest'
        break
      case 2:
        if (!preferences.fitness_level) newErrors.fitness_level = 'Select your fitness level'
        if (!preferences.travel_type) newErrors.travel_type = 'Select your travel type'
        break
      case 3:
        if (!preferences.nationality?.trim()) newErrors.nationality = 'Enter your nationality'
        if (!preferences.starting_city) newErrors.starting_city = 'Select starting city'
        break
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) setStep(step + 1)
  }

  const handleSubmit = async () => {
    if (!validateStep()) return
    setLoading(true)
    try {
      const payload = { ...preferences, budget_currency: 'NPR', budget: Math.round(preferences.budget / NPR_RATE) }
      const result = await getRecommendations(payload as PreferenceInput)
      sessionStorage.setItem('recommendations', JSON.stringify(result))
      const bestDest = result.destinations?.[0]
      if (bestDest) {
        sessionStorage.setItem('selectedDestination', JSON.stringify(bestDest))
      }
      toast.success(`${result.destinations?.length || 0} destinations matched!`)
      navigate('/recommendations')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to get recommendations')
    } finally {
      setLoading(false)
    }
  }

  const toggleInterest = (val: string) => {
    const current = preferences.interests
    if (current.includes(val)) {
      update('interests', current.filter((i: string) => i !== val))
    } else {
      update('interests', [...current, val])
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={s.id} className={`flex items-center gap-2 text-xs ${i <= step ? 'text-saffron' : 'text-stone'}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i <= step ? 'bg-saffron text-midnight' : 'bg-white/10'
                }`}>
                  {i < step ? '✓' : s.icon}
                </span>
                <span className="hidden sm:inline">{s.title}</span>
              </div>
            ))}
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-saffron rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {step === 0 && <StepBasics p={preferences} update={update} errors={errors} />}
            {step === 1 && <StepInterests p={preferences} toggle={toggleInterest} errors={errors} />}
            {step === 2 && <StepFitness p={preferences} update={update} errors={errors} />}
            {step === 3 && <StepDetails p={preferences} update={update} errors={errors} />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-10">
          <button
            onClick={() => step === 0 ? navigate('/') : setStep(step - 1)}
            className="btn-secondary px-6 py-3 rounded-xl text-sm"
          >
            {step === 0 ? '← Back Home' : '← Previous'}
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={handleNext} className="btn-primary px-8 py-3 rounded-xl text-sm">
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary px-8 py-3 rounded-xl text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing... 🏔️' : 'Get Recommendations →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const MONTH_NAMES_BS = ['Baisakh', 'Jestha', 'Ashad', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra']

function NepaliDatePicker({ value, onChange }: {
  value: string
  onChange: (v: string) => void
}) {
  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  const formatNepali = (ad: string) => {
    if (!ad) return ''
    try {
      const bs = adToBs(ad)
      const [y, m, d] = bs.split('-')
      const monthName = MONTH_NAMES_BS[parseInt(m) - 1] || ''
      return `${monthName} ${parseInt(d)}, ${y} BS`
    } catch { return '' }
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-saffron">
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          Travel Date (optional)
        </span>
      </label>
      <div className="relative">
        <input type="date" min={today} value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white border border-stone/20 rounded-xl pl-10 pr-4 py-3 text-sm text-snow focus:border-saffron/50 focus:outline-none focus:ring-2 focus:ring-saffron/10 transition-all [color-scheme:light]" />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone/40">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      {value && (
        <div className="flex items-center gap-1.5 text-xs text-saffron/80 font-medium mt-1.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{formatNepali(value)}</span>
        </div>
      )}
      <p className="text-xs text-stone/60 mt-2 flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        Helps with seasonal permit availability
      </p>
    </div>
  )
}

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="text-crimson text-xs mt-1">{msg}</p> : null
}

function StepBasics({ p, update, errors }: StepProps) {
  return (
    <div className="card-gradient rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold mb-2">Trip Basics</h2>
      <p className="text-stone mb-8">Let's start with the essentials for your Nepal adventure</p>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-saffron">
            Your Budget (Rs)
          </label>
          <input type="number" min={1000} max={6750000}
            value={p.budget || ''}
            onChange={(e) => update('budget', Number(e.target.value))}
            placeholder="e.g., 202500"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:border-saffron/50 focus:outline-none transition-colors" />
          <span className="text-xs text-stone mt-1">Rs 13,500 – Rs 6,750,000</span>
          <Err msg={errors.budget} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-saffron">Duration (days)</label>
          <input type="number" min={1} max={30}
            value={p.duration || ''}
            onChange={(e) => update('duration', Number(e.target.value))}
            placeholder="e.g., 10"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:border-saffron/50 focus:outline-none transition-colors" />
          <span className="text-xs text-stone mt-1">1 – 30 days</span>
          <Err msg={errors.duration} />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-3 text-saffron">Preferred Season</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SEASONS.map((s) => (
              <button key={s.value}
                onClick={() => update('season', s.value)}
                className={`p-4 rounded-xl border text-center transition-all ${
                  p.season === s.value
                    ? 'border-saffron bg-saffron/10 text-saffron'
                    : 'border-white/10 bg-white/5 text-stone hover:border-white/20'
                }`}
              >
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="text-sm font-medium">{s.label}</div>
                <div className="text-[10px] mt-1 opacity-60">{s.desc}</div>
              </button>
            ))}
          </div>
          <Err msg={errors.season} />
        </div>
      </div>
    </div>
  )
}

function StepInterests({ p, toggle, errors }: StepProps) {
  const handleToggle = toggle ?? (() => {})
  return (
    <div className="card-gradient rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold mb-2">Your Interests</h2>
      <p className="text-stone mb-6">What kind of experiences are you looking for? (Select all that apply)</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {INTEREST_OPTIONS.map((opt) => {
          const selected = p.interests.includes(opt.value)
          return (
            <button key={opt.value}
              onClick={() => handleToggle(opt.value)}
              className={`p-5 rounded-xl border text-center transition-all ${
                selected
                  ? 'border-saffron bg-saffron/10 text-saffron shadow-sm shadow-saffron/10'
                  : 'border-white/10 bg-white/5 text-stone hover:border-white/20'
              }`}
            >
              <div className="text-2xl mb-1">{opt.icon}</div>
              <div className="text-sm font-medium">{opt.label}</div>
            </button>
          )
        })}
      </div>

      {p.interests.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {p.interests.map((i: string) => (
            <span key={i} className="tag-pill flex items-center gap-1">
              {i}
              <button onClick={() => handleToggle(i)} className="hover:text-crimson ml-0.5">✕</button>
            </span>
          ))}
        </div>
      )}
      <Err msg={errors.interests} />
    </div>
  )
}

function StepFitness({ p, update, errors }: StepProps) {
  return (
    <div className="card-gradient rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold mb-2">Fitness & Travel Style</h2>
      <p className="text-stone mb-8">Help us match the right difficulty level and travel setup</p>

      <div className="mb-10">
        <h3 className="text-sm font-medium text-saffron mb-3">Fitness Level</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {FITNESS_LEVELS.map((f) => (
            <button key={f.value}
              onClick={() => update('fitness_level', f.value)}
              className={`p-4 rounded-xl border text-left transition-all ${
                p.fitness_level === f.value
                  ? 'border-saffron bg-saffron/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="text-sm font-semibold text-snow">{f.label}</div>
              <div className="text-xs text-stone mt-0.5">{f.desc}</div>
            </button>
          ))}
        </div>
        <Err msg={errors.fitness_level} />
      </div>

      <div>
        <h3 className="text-sm font-medium text-saffron mb-3">Travel Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TRAVEL_TYPES.map((t) => (
            <button key={t.value}
              onClick={() => update('travel_type', t.value)}
              className={`p-4 rounded-xl border text-center transition-all ${
                p.travel_type === t.value
                  ? 'border-saffron bg-saffron/10 text-saffron'
                  : 'border-white/10 bg-white/5 text-stone hover:border-white/20'
              }`}
            >
              <div className="text-xl mb-1">{t.icon}</div>
              <div className="text-sm font-medium">{t.label}</div>
              <div className="text-[10px] mt-0.5 opacity-60">{t.desc}</div>
            </button>
          ))}
        </div>
        <Err msg={errors.travel_type} />
      </div>
    </div>
  )
}

function StepDetails({ p, update, errors }: StepProps) {
  return (
    <div className="card-gradient rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold mb-2">Final Details</h2>
      <p className="text-stone mb-8">Almost there! These help us personalize permits and logistics</p>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-saffron">Nationality</label>
          <input type="text"
            value={p.nationality}
            onChange={(e) => update('nationality', e.target.value)}
            placeholder="e.g., US, UK, India..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:border-saffron/50 focus:outline-none transition-colors" />
          <span className="text-xs text-stone mt-1">Visa requirements and permit fees vary by nationality</span>
          <Err msg={errors.nationality} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-saffron">Starting City</label>
          <select value={p.starting_city}
            onChange={(e) => update('starting_city', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:border-saffron/50 focus:outline-none transition-colors"
          >
            <option value="Kathmandu">Kathmandu</option>
            <option value="Pokhara">Pokhara</option>
          </select>
          <Err msg={errors.starting_city} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-saffron">Accommodation</label>
          <div className="flex gap-3">
            {(['budget', 'mid', 'luxury'] as const).map((a) => (
              <button key={a}
                onClick={() => update('accommodation_type', a)}
                className={`flex-1 p-3 rounded-xl border text-center text-sm capitalize transition-all ${
                  p.accommodation_type === a
                    ? 'border-saffron bg-saffron/10 text-saffron'
                    : 'border-white/10 bg-white/5 text-stone hover:border-white/20'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
          <span className="text-xs text-stone mt-1">Budget: Rs 1,350-2,025/night | Mid: Rs 3,375-4,725/night | Luxury: Rs 10,800+/night</span>
        </div>

        <NepaliDatePicker
          value={p.travel_dates || ''}
          onChange={(v) => update('travel_dates', v)}
        />
      </div>
    </div>
  )
}
