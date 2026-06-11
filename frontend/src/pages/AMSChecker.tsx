import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

type HeadacheLevel = 'none' | 'mild' | 'moderate' | 'severe'
type SymptomKey = 'nausea' | 'dizziness' | 'fatigue' | 'lossAppetite' | 'shortnessBreath' | 'confusion' | 'cough' | 'blurredVision'
type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'EMERGENCY'

const SYMPTOMS: { key: SymptomKey; label: string; icon: string; description: string }[] = [
  { key: 'nausea', label: 'Nausea / Vomiting', icon: '🤢', description: 'Feeling sick to the stomach' },
  { key: 'dizziness', label: 'Dizziness', icon: '😵', description: 'Lightheaded or unsteady' },
  { key: 'fatigue', label: 'Fatigue / Weakness', icon: '😮‍💨', description: 'Unusual tiredness' },
  { key: 'lossAppetite', label: 'Loss of Appetite', icon: '🍽️', description: 'No desire to eat' },
  { key: 'shortnessBreath', label: 'Shortness of Breath', icon: '🫁', description: 'Difficulty breathing at rest' },
  { key: 'confusion', label: 'Confusion / Ataxia', icon: '🧠', description: 'Disorientation, poor coordination — CRITICAL' },
  { key: 'cough', label: 'Cough', icon: '🤧', description: 'Persistent dry cough' },
  { key: 'blurredVision', label: 'Blurred Vision', icon: '👁️', description: 'Visual disturbances' },
]

const HEADACHE_LEVELS: { value: HeadacheLevel; label: string; score: number; color: string }[] = [
  { value: 'none', label: 'None', score: 0, color: 'text-green-600 border-green-300 bg-green-50' },
  { value: 'mild', label: 'Mild', score: 1, color: 'text-yellow-600 border-yellow-300 bg-yellow-50' },
  { value: 'moderate', label: 'Moderate', score: 2, color: 'text-orange-600 border-orange-300 bg-orange-50' },
  { value: 'severe', label: 'Severe', score: 3, color: 'text-red-600 border-red-300 bg-red-50' },
]

const ALTITUDE_ZONES = [
  { min: 1000, max: 2500, label: 'Moderate', color: 'bg-green-400' },
  { min: 2500, max: 3500, label: 'High', color: 'bg-yellow-400' },
  { min: 3500, max: 4500, label: 'Very High', color: 'bg-orange-400' },
  { min: 4500, max: 6000, label: 'Extreme', color: 'bg-red-400' },
]

const RISK_CONFIG: Record<RiskLevel, {
  label: string; icon: string; color: string; bg: string; border: string; badge: string
}> = {
  LOW: {
    label: 'Low Risk', icon: '✅', color: 'text-green-600',
    bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-500/10 text-green-600 border-green-200',
  },
  MODERATE: {
    label: 'Moderate Risk', icon: '⚠️', color: 'text-yellow-600',
    bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  },
  HIGH: {
    label: 'High Risk', icon: '🔴', color: 'text-orange-600',
    bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-500/10 text-orange-600 border-orange-200',
  },
  EMERGENCY: {
    label: 'EMERGENCY', icon: '🚨', color: 'text-red-600',
    bg: 'bg-red-50', border: 'border-red-300', badge: 'bg-red-500/15 text-red-600 border-red-300',
  },
}

const getAltitudeZone = (alt: number) =>
  ALTITUDE_ZONES.find(z => alt >= z.min && alt <= z.max) ?? ALTITUDE_ZONES[0]

export default function AMSChecker() {
  const [altitude, setAltitude] = useState(2500)
  const [headache, setHeadache] = useState<HeadacheLevel>('none')
  const [symptoms, setSymptoms] = useState<Record<SymptomKey, boolean>>({
    nausea: false, dizziness: false, fatigue: false, lossAppetite: false,
    shortnessBreath: false, confusion: false, cough: false, blurredVision: false,
  })

  const toggleSymptom = (key: SymptomKey) =>
    setSymptoms(prev => ({ ...prev, [key]: !prev[key] }))

  const hs = HEADACHE_LEVELS.find(h => h.value === headache)?.score ?? 0
  const activeCount = SYMPTOMS.filter(s => symptoms[s.key]).length
  const zone = getAltitudeZone(altitude)

  const symptomScores: Record<SymptomKey, number> = {
    nausea: symptoms.nausea ? 1 : 0,
    dizziness: symptoms.dizziness ? 1 : 0,
    fatigue: symptoms.fatigue ? 1 : 0,
    lossAppetite: symptoms.lossAppetite ? 1 : 0,
    shortnessBreath: symptoms.shortnessBreath ? 1 : 0,
    confusion: symptoms.confusion ? 3 : 0,
    cough: symptoms.cough ? 1 : 0,
    blurredVision: symptoms.blurredVision ? 1 : 0,
  }

  const totalScore = hs + Object.values(symptomScores).reduce((a, b) => a + b, 0)
  const hasOtherSymptom = SYMPTOMS.some(s => s.key !== 'confusion' && symptoms[s.key])

  let risk: RiskLevel = 'LOW'
  if (symptoms.confusion) {
    risk = 'HIGH'
  } else if (headache === 'severe' && symptoms.nausea && symptoms.shortnessBreath) {
    risk = 'EMERGENCY'
  } else if (altitude > 2500 && headache !== 'none' && hasOtherSymptom) {
    if (totalScore >= 7) risk = 'EMERGENCY'
    else if (totalScore >= 5) risk = 'HIGH'
    else risk = 'MODERATE'
  }

  const rc = RISK_CONFIG[risk]

  const actions = (() => {
    switch (risk) {
      case 'LOW':
        return [
          { icon: '⬆️', text: 'Continue ascent — max 500m/day above 3,000m' },
          { icon: '💧', text: 'Drink 3-4L water daily' },
          { icon: '😴', text: 'Sleep at lower altitude than highest point reached' },
        ]
      case 'MODERATE':
        return [
          { icon: '⛔', text: 'Stop ascending — rest at current altitude' },
          { icon: '💧', text: 'Hydrate well and take paracetamol for headache' },
          { icon: '⬇️', text: 'Descend if symptoms worsen over 24 hours' },
        ]
      case 'HIGH':
        return [
          { icon: '⬇️', text: 'Descend 300-500m immediately' },
          { icon: '⛔', text: 'Do NOT ascend until symptoms resolve' },
          { icon: '🏥', text: 'Seek medical help — Diamox if prescribed' },
        ]
      case 'EMERGENCY':
        return [
          { icon: '🚨', text: 'DESCEND NOW — get to lowest altitude possible' },
          { icon: '📞', text: 'Call Tourist Police: 1144' },
          { icon: '🚁', text: 'Arrange helicopter evacuation immediately' },
        ]
    }
  })()

  const dangerSignals = [
    { label: 'HACE (Cerebral Edema)', active: symptoms.confusion, detail: 'Confusion, ataxia, altered consciousness' },
    { label: 'HAPE (Pulmonary Edema)', active: symptoms.shortnessBreath && symptoms.cough, detail: 'Breathlessness at rest, cough, chest tightness' },
  ]

  const shareResults = async () => {
    const checkedSymptoms = SYMPTOMS.filter(s => symptoms[s.key]).map(s => s.label)
    const summary = [
      '🏔️ Nepal Trek AI — AMS Self Assessment',
      '',
      `Lake Louise Score: ${totalScore}`,
      `Risk Level: ${rc.label}`,
      '',
      `Altitude: ${altitude.toLocaleString()}m (${zone.label})`,
      `Headache: ${headache}`,
      checkedSymptoms.length > 0 ? `Symptoms: ${checkedSymptoms.join(', ')}` : 'Symptoms: None',
      '',
      `Action: ${actions.map(a => a.text).join(' // ')}`,
    ].join('\n')

    try {
      await navigator.clipboard.writeText(summary)
      toast.success('Results copied to clipboard!')
    } catch {
      toast.error('Failed to copy results')
    }
  }

  const progressPercent = ((altitude - 1000) / 5000) * 100

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <h1 className="text-4xl font-bold"><span className="text-gradient">AMS</span> Self-Assessment</h1>
            <span className="tag-pill">Lake Louise Score</span>
          </div>
          <p className="text-stone text-sm max-w-2xl">
            Evidence-based Acute Mountain Sickness assessment using the Lake Louise Scoring System.
            Evaluate your symptoms and receive immediate, medically-informed recommendations.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-7 gap-6">
          <div className="lg:col-span-4 space-y-6">

            {/* Altitude */}
            <div className="card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏔️</span>
                  <h3 className="text-sm font-semibold text-saffron uppercase tracking-wider">Current Altitude</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-snow tabular-nums">{altitude.toLocaleString()}<span className="text-sm text-stone font-normal">m</span></span>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${zone.color} text-white`}>{zone.label}</span>
                </div>
              </div>
              <div className="relative mb-3">
                <input
                  type="range"
                  min={1000}
                  max={6000}
                  step={100}
                  value={altitude}
                  onChange={e => setAltitude(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer accent-saffron"
                  style={{
                    background: `linear-gradient(to right, #22c55e 0%, #eab308 30%, #f97316 50%, #ef4444 75%, #dc2626 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-stone mt-1.5">
                  {ALTITUDE_ZONES.map(z => (
                    <span key={z.min} className="flex flex-col items-center">
                      <span className={`w-1.5 h-1.5 rounded-full ${z.color} mb-0.5`} />
                      <span>{z.min.toLocaleString()}m</span>
                    </span>
                  ))}
                  <span className="flex flex-col items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mb-0.5" />
                    <span>6,000m</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone mt-1">
                <span className="text-saffron">ⓘ</span>
                <span>AMS risk begins above 2,500m. Above 3,500m, risk increases significantly.</span>
              </div>
            </div>

            {/* Headache */}
            <div className="card rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🤕</span>
                <h3 className="text-sm font-semibold text-saffron uppercase tracking-wider">Headache Severity</h3>
              </div>
              <p className="text-xs text-stone mb-3">Headache is the primary symptom of AMS — required for diagnosis above 2,500m</p>
              <div className="grid grid-cols-4 gap-2">
                {HEADACHE_LEVELS.map(h => (
                  <button
                    key={h.value}
                    onClick={() => setHeadache(h.value)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                      headache === h.value
                        ? h.color + ' ring-2 ring-saffron/30 shadow-sm'
                        : 'text-stone border-stone/20 hover:border-saffron/30 hover:text-snow bg-white'
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div className="card rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🩺</span>
                <h3 className="text-sm font-semibold text-saffron uppercase tracking-wider">Symptoms</h3>
                {activeCount > 0 && (
                  <span className="ml-auto text-xs bg-saffron/10 text-saffron px-2 py-0.5 rounded-full font-medium">
                    {activeCount} active
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SYMPTOMS.map(s => {
                  const checked = symptoms[s.key]
                  return (
                    <label
                      key={s.key}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border ${
                        checked
                          ? 'bg-saffron/10 border-saffron/30 shadow-sm'
                          : 'bg-white border-stone/15 hover:border-saffron/25 hover:shadow-sm'
                      } ${s.key === 'confusion' ? 'ring-1 ring-red-200' : ''}`}
                    >
                      <span className="text-lg">{s.icon}</span>
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium block ${checked ? 'text-snow' : 'text-stone'}`}>
                          {s.label}
                          {s.key === 'confusion' && (
                            <span className="ml-1.5 text-[10px] text-red-500 font-semibold uppercase tracking-wider">Critical</span>
                          )}
                        </span>
                        <span className="text-[11px] text-stone/70 block truncate">{s.description}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSymptom(s.key)}
                        className="w-4 h-4 accent-saffron rounded shrink-0"
                      />
                    </label>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-4">
              <motion.div
                key={risk}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`card rounded-xl p-6 border-2 ${rc.border}`}
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-semibold text-saffron uppercase tracking-wider">Assessment</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${rc.badge}`}>
                    Score: {totalScore}
                  </span>
                </div>

                <div className={`${rc.bg} -mx-6 -mt-2 px-6 py-5 border-b ${rc.border}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{rc.icon}</span>
                    <div>
                      <div className={`text-xl font-bold ${rc.color}`}>{rc.label}</div>
                      <div className="text-xs text-stone mt-0.5">
                        Altitude: {altitude.toLocaleString()}m · {zone.label} Zone
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score bar */}
                <div className="mt-5">
                  <div className="flex justify-between text-xs text-stone mb-1.5">
                    <span>Lake Louise Score</span>
                    <span className="font-semibold text-snow">{totalScore}/15</span>
                  </div>
                  <div className="h-2 bg-stone/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((totalScore / 15) * 100, 100)}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        risk === 'LOW' ? 'bg-green-400' :
                        risk === 'MODERATE' ? 'bg-yellow-400' :
                        risk === 'HIGH' ? 'bg-orange-400' : 'bg-red-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Danger signals */}
                {dangerSignals.some(d => d.active) && (
                  <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-xs font-semibold text-red-700 mb-2 uppercase tracking-wider">Possible Complications</p>
                    {dangerSignals.filter(d => d.active).map(d => (
                      <div key={d.label} className="flex items-start gap-2 text-xs text-red-600 mb-1 last:mb-0">
                        <span>⚠️</span>
                        <div>
                          <span className="font-medium">{d.label}</span>
                          <span className="text-red-500"> — {d.detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-5">
                  <p className="text-xs font-semibold text-snow uppercase tracking-wider mb-3">Recommended Actions</p>
                  <div className="space-y-2.5">
                    {actions.map((a, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-2.5"
                      >
                        <span className="text-sm mt-0.5">{a.icon}</span>
                        <span className="text-sm text-stone">{a.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-5 pt-4 border-t border-stone/10">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone">Headache</span>
                      <span className="text-snow capitalize font-medium">{headache}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-stone">Active Symptoms</span>
                      <span className="text-snow font-medium">{activeCount}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-stone">Headache Score</span>
                      <span className="text-snow font-medium">{hs}/3</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-2.5">
                  <button
                    onClick={shareResults}
                    className="btn-secondary w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2"
                  >
                    <span>📋</span> Share Assessment
                  </button>
                  <Link
                    to="/safety"
                    className="block w-full py-3 rounded-xl text-sm border border-saffron/20 text-stone hover:text-saffron hover:border-saffron/40 transition-all text-center font-medium"
                  >
                    View Complete Safety Guide →
                  </Link>
                </div>
              </motion.div>

              {/* Quick Reference */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card rounded-xl p-4"
              >
                <h4 className="text-xs font-semibold text-saffron uppercase tracking-wider mb-2">Quick Reference</h4>
                <div className="space-y-1.5 text-xs text-stone">
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                    Score 0-3: Low risk — continue monitoring
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
                    Score 4-5: Moderate — stop ascent, rest
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                    Score 6-7: High — descend immediately
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                    Score 8+: Emergency — evacuate now
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 card rounded-xl p-5 border border-red-200/50"
        >
          <div className="flex items-start gap-3">
            <span className="text-lg shrink-0 mt-0.5">⚠️</span>
            <div>
              <h3 className="text-sm font-semibold text-red-600 mb-1">Medical Disclaimer</h3>
              <p className="text-xs text-stone leading-relaxed">
                This tool provides an educational reference using the Lake Louise Scoring System and does not replace professional medical evaluation.
                Acute Mountain Sickness (AMS), High Altitude Cerebral Edema (HACE), and High Altitude Pulmonary Edema (HAPE) are potentially fatal.
                If you experience severe headache unresponsive to medication, confusion, ataxia, breathlessness at rest, or persistent cough — descend immediately and seek emergency medical care.
                Always trek with a certified guide and carry comprehensive evacuation insurance.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
