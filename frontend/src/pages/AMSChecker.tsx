import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

type HeadacheLevel = 'none' | 'mild' | 'moderate' | 'severe'
type SymptomKey = 'nausea' | 'dizziness' | 'fatigue' | 'lossAppetite' | 'shortnessBreath' | 'confusion' | 'cough' | 'blurredVision'
type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'EMERGENCY'

const SYMPTOMS: { key: SymptomKey; label: string }[] = [
  { key: 'nausea', label: 'Nausea / Vomiting' },
  { key: 'dizziness', label: 'Dizziness' },
  { key: 'fatigue', label: 'Fatigue / Weakness' },
  { key: 'lossAppetite', label: 'Loss of Appetite' },
  { key: 'shortnessBreath', label: 'Shortness of Breath' },
  { key: 'confusion', label: 'Confusion / Ataxia' },
  { key: 'cough', label: 'Cough' },
  { key: 'blurredVision', label: 'Blurred Vision' },
]

const HEADACHE_LEVELS: { value: HeadacheLevel; label: string; score: number }[] = [
  { value: 'none', label: 'None', score: 0 },
  { value: 'mild', label: 'Mild', score: 1 },
  { value: 'moderate', label: 'Moderate', score: 2 },
  { value: 'severe', label: 'Severe', score: 3 },
]

export default function AMSChecker() {
  const [altitude, setAltitude] = useState(2500)
  const [headache, setHeadache] = useState<HeadacheLevel>('none')
  const [symptoms, setSymptoms] = useState<Record<SymptomKey, boolean>>({
    nausea: false,
    dizziness: false,
    fatigue: false,
    lossAppetite: false,
    shortnessBreath: false,
    confusion: false,
    cough: false,
    blurredVision: false,
  })

  const toggleSymptom = (key: SymptomKey) => {
    setSymptoms(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const hs = HEADACHE_LEVELS.find(h => h.value === headache)?.score ?? 0

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
    if (totalScore >= 7) {
      risk = 'EMERGENCY'
    } else if (totalScore >= 5) {
      risk = 'HIGH'
    } else {
      risk = 'MODERATE'
    }
  }

  const recommendation = (() => {
    switch (risk) {
      case 'LOW':
        return 'No AMS symptoms. Continue ascent with caution (max 500m/day above 3000m)'
      case 'MODERATE':
        return 'Stop ascent. Rest at same altitude. Hydrate. Paracetamol for headache. Descend if worsens.'
      case 'HIGH':
        return 'Descend 300-500m immediately. Do not ascend. Seek medical help. Diamox (if prescribed).'
      case 'EMERGENCY':
        return 'EMERGENCY: Descend NOW! Get to lower altitude. Evacuation needed. Call 1144 (Tourist Police) or arrange helicopter evacuation. High altitude pulmonary/cerebral edema possible.'
    }
  })()

  const riskLabel: Record<RiskLevel, string> = {
    LOW: 'Low Risk',
    MODERATE: 'Moderate Risk',
    HIGH: 'High Risk',
    EMERGENCY: 'EMERGENCY',
  }

  const riskColor: Record<RiskLevel, string> = {
    LOW: 'ams-low',
    MODERATE: 'ams-moderate',
    HIGH: 'ams-high',
    EMERGENCY: 'ams-very-high',
  }

  const riskBorder: Record<RiskLevel, string> = {
    LOW: 'border-green-500/30',
    MODERATE: 'border-yellow-500/30',
    HIGH: 'border-orange-500/30',
    EMERGENCY: 'border-red-500/30',
  }

  const shareResults = async () => {
    const checkedSymptoms = SYMPTOMS.filter(s => symptoms[s.key]).map(s => s.label)
    const summary = [
      '🏔️ Nepal Trek AI - AMS Self Assessment',
      '',
      `Altitude: ${altitude.toLocaleString()}m`,
      `Headache: ${headache}`,
      checkedSymptoms.length > 0 ? `Symptoms: ${checkedSymptoms.join(', ')}` : 'Symptoms: None',
      '',
      `Risk Level: ${riskLabel[risk]}`,
      `Score: ${totalScore}`,
      '',
      `Recommendation: ${recommendation}`,
    ].join('\n')

    try {
      await navigator.clipboard.writeText(summary)
      toast.success('Results copied to clipboard!')
    } catch {
      toast.error('Failed to copy results')
    }
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold"><span className="text-gradient">AMS</span> Self-Assessment</h1>
            <span className="tag-pill">🏔️ Altitude</span>
          </div>
          <p className="text-stone">Lake Louise scoring system for Acute Mountain Sickness. Assess your symptoms and get immediate recommendations.</p>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 space-y-6">
            {/* Altitude */}
            <div className="card-gradient rounded-xl p-5 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-saffron uppercase tracking-wider">Current Altitude</h3>
                <span className="text-2xl font-bold text-snow">{altitude.toLocaleString()}m</span>
              </div>
              <input
                type="range"
                min={1000}
                max={6000}
                step={100}
                value={altitude}
                onChange={e => setAltitude(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-saffron"
                style={{
                  background: `linear-gradient(to right, #FF9933 ${((altitude - 1000) / 5000) * 100}%, rgba(255,255,255,0.1) ${((altitude - 1000) / 5000) * 100}%)`,
                }}
              />
              <div className="flex justify-between text-xs text-stone mt-1">
                <span>1,000m</span>
                <span>6,000m</span>
              </div>
            </div>

            {/* Headache */}
            <div className="card-gradient rounded-xl p-5 border border-white/10">
              <h3 className="text-sm font-semibold text-saffron uppercase tracking-wider mb-3">Headache Severity</h3>
              <div className="flex gap-2 flex-wrap">
                {HEADACHE_LEVELS.map(h => (
                  <button
                    key={h.value}
                    onClick={() => setHeadache(h.value)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all border ${
                      headache === h.value
                        ? 'bg-saffron/20 text-saffron border-saffron/40'
                        : 'bg-white/5 text-stone border-white/10 hover:text-snow hover:border-white/30'
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div className="card-gradient rounded-xl p-5 border border-white/10">
              <h3 className="text-sm font-semibold text-saffron uppercase tracking-wider mb-3">Symptoms</h3>
              <div className="grid grid-cols-2 gap-3">
                {SYMPTOMS.map(s => {
                  const checked = symptoms[s.key]
                  return (
                    <label
                      key={s.key}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all border ${
                        checked
                          ? 'bg-saffron/10 border-saffron/30 text-snow'
                          : 'bg-white/5 border-white/10 text-stone hover:text-snow hover:border-white/30'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSymptom(s.key)}
                        className="w-4 h-4 accent-saffron rounded"
                      />
                      <span className="text-sm">{s.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className={`card-gradient rounded-xl p-6 border ${riskBorder[risk]} sticky top-24`}
            >
              <h3 className="text-sm font-semibold text-saffron uppercase tracking-wider mb-4">Assessment Result</h3>

              <div className="text-center mb-6">
                <div className={`text-3xl font-bold ${riskColor[risk]} mb-1`}>
                  {riskLabel[risk]}
                </div>
                <div className="text-xs text-stone uppercase tracking-wider">
                  AMS Score: {totalScore}
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${riskBorder[risk]} ${riskColor[risk].replace('ams-', 'bg-').replace('low', 'green-500/5').replace('moderate', 'yellow-500/5').replace('high', 'orange-500/5').replace('very-high', 'red-500/5')} mb-4`}>
                <p className="text-sm leading-relaxed">{recommendation}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-stone">
                  <span>Altitude</span>
                  <span className="text-snow">{altitude.toLocaleString()}m</span>
                </div>
                <div className="flex justify-between text-xs text-stone">
                  <span>Headache</span>
                  <span className="text-snow capitalize">{headache}</span>
                </div>
                <div className="flex justify-between text-xs text-stone">
                  <span>Active Symptoms</span>
                  <span className="text-snow">{SYMPTOMS.filter(s => symptoms[s.key]).length}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={shareResults}
                  className="btn-secondary w-full px-4 py-3 rounded-xl text-sm flex items-center justify-center gap-2"
                >
                  <span>📋</span> Share Results
                </button>
                <Link
                  to="/safety"
                  className="block w-full px-4 py-3 rounded-xl text-sm border border-white/10 text-stone hover:text-saffron transition-all text-center"
                >
                  View Safety Guide →
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 card-gradient rounded-xl p-5 border border-white/10"
        >
          <h3 className="text-sm font-semibold text-saffron uppercase tracking-wider mb-2">⚠️ Medical Disclaimer</h3>
          <p className="text-xs text-stone leading-relaxed">
            This tool is for educational purposes only and does not replace professional medical advice.
            AMS can be life-threatening. If you experience severe symptoms, confusion, difficulty breathing,
            or inability to walk properly — descend immediately and seek medical help.
            Always trek with a guide and carry travel insurance that covers helicopter evacuation.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
