import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

function getPasswordStrength(password: string): { label: string; color: string; width: string; score: number } {
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (password.length >= 14) score++

  if (score <= 1) return { label: 'Weak', color: '#ef4444', width: '16%', score }
  if (score <= 2) return { label: 'Fair', color: '#f97316', width: '33%', score }
  if (score <= 3) return { label: 'Good', color: '#eab308', width: '50%', score }
  if (score <= 4) return { label: 'Strong', color: '#22c55e', width: '75%', score }
  return { label: 'Very Strong', color: '#16a34a', width: '100%', score }
}

export default function Register() {
  const { register, loading } = useAuth()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const strength = getPasswordStrength(password)

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!username.trim()) newErrors.username = 'Username is required'
    else if (username.trim().length < 3) newErrors.username = 'Username must be at least 3 characters'
    else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) newErrors.username = 'Username can only contain letters, numbers, and underscores'

    if (!email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) newErrors.email = 'Please enter a valid email address'

    if (!password) newErrors.password = 'Password is required'
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters'

    if (password !== confirm) newErrors.confirm = 'Passwords do not match'

    if (!agreeTerms) newErrors.terms = 'You must agree to the terms'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    try {
      await register(username.trim(), email.trim(), password)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Registration failed')
    }
  }

  const clearError = (field: string) => {
    setErrors(p => {
      const next = { ...p }
      delete next[field]
      return next
    })
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-amber-50/50 via-white to-orange-50/50">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl shadow-saffron/5 border border-saffron/10 p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-saffron to-amber-500 shadow-lg shadow-saffron/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-snow">Create your account</h1>
              <p className="text-stone text-sm mt-1">Join Nepal Trek AI and start planning your adventure</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 flex items-center gap-2"
                >
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium text-snow mb-1.5">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); clearError('username') }}
                  className={`input ${errors.username ? '!border-red-400 !shadow-red-100' : ''}`}
                  placeholder="Choose a username"
                  autoFocus
                />
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-snow mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError('email') }}
                  className={`input ${errors.email ? '!border-red-400 !shadow-red-100' : ''}`}
                  placeholder="your@email.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-snow mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearError('password') }}
                    className={`input pr-10 ${errors.password ? '!border-red-400 !shadow-red-100' : ''}`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-snow transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1 h-1.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: i <= Math.ceil(strength.score / 5 * 5) ? strength.color : '#e5e7eb',
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs mt-1" style={{ color: strength.color }}>{strength.label}</p>
                  </div>
                )}
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-snow mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); clearError('confirm') }}
                    className={`input pr-10 ${errors.confirm ? '!border-red-400 !shadow-red-100' : ''}`}
                    placeholder="Repeat your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-snow transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
                {confirm && password === confirm && password.length >= 6 && (
                  <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Passwords match
                  </p>
                )}
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => { setAgreeTerms(e.target.checked); clearError('terms') }}
                  className="w-4 h-4 rounded border-stone/30 text-saffron focus:ring-saffron/30 cursor-pointer mt-0.5 shrink-0"
                />
                <label className="text-sm text-stone cursor-pointer">
                  I agree to the{' '}
                  <span className="text-saffron font-medium hover:text-amber-600 transition-colors cursor-pointer">Terms of Service</span>
                  {' '}and{' '}
                  <span className="text-saffron font-medium hover:text-amber-600 transition-colors cursor-pointer">Privacy Policy</span>
                </label>
              </div>
              {errors.terms && <p className="text-red-500 text-xs -mt-2">{errors.terms}</p>}

              <input type="hidden" name="redirect" value={redirect} />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-saffron to-amber-500 hover:from-amber-500 hover:to-saffron shadow-lg shadow-saffron/20 hover:shadow-xl hover:shadow-saffron/25 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-stone">
                Already have an account?{' '}
                <Link
                  to={`/login${redirect !== '/' ? `?redirect=${redirect}` : ''}`}
                  className="text-saffron font-semibold hover:text-amber-600 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-stone/50 mt-6">
            Your data is protected with industry-standard encryption
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-bl from-saffron/5 via-amber-50 to-white" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 600 L100 450 L200 520 L300 400 L400 480 L500 350 L600 420 L700 300 L800 380 L800 800 L0 800Z" fill="#FF9933"/>
          <path d="M0 700 L150 550 L250 600 L350 480 L450 550 L550 420 L650 500 L750 380 L800 450 L800 800 L0 800Z" fill="#D4A843" opacity="0.5"/>
          <path d="M0 750 L100 650 L200 700 L300 600 L400 680 L500 550 L600 620 L700 500 L800 580 L800 800 L0 800Z" fill="#FF9933" opacity="0.3"/>
        </svg>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 text-center"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg viewBox="0 0 120 100" className="w-28 h-24 mx-auto mb-6" fill="none">
              <path d="M60 5 L75 35 L105 35 L80 55 L90 90 L60 70 L30 90 L40 55 L15 35 L45 35Z" fill="url(#reg-mountain)" stroke="#FF9933" strokeWidth="2"/>
              <path d="M35 20 L45 40 L65 40 L50 55 L55 75 L35 60 L15 75 L20 55 L5 40 L25 40Z" fill="url(#reg-mountain2)" stroke="#D4A843" strokeWidth="1.5" opacity="0.6"/>
              <defs>
                <linearGradient id="reg-mountain" x1="60" y1="5" x2="60" y2="90">
                  <stop offset="0%" stopColor="#FF9933"/>
                  <stop offset="100%" stopColor="#D4A843"/>
                </linearGradient>
                <linearGradient id="reg-mountain2" x1="35" y1="20" x2="35" y2="75">
                  <stop offset="0%" stopColor="#D4A843"/>
                  <stop offset="100%" stopColor="#FF9933"/>
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
          <h2 className="text-2xl font-bold text-snow mb-3">Begin Your Journey</h2>
          <div className="space-y-3 text-left max-w-xs mx-auto">
            {[
              { icon: '🤖', text: 'AI-powered destination matching' },
              { icon: '🗺️', text: 'Smart day-by-day itineraries' },
              { icon: '💰', text: 'Real-time budget tracking' },
              { icon: '🛡️', text: 'Comprehensive safety reports' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3 text-sm text-stone"
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
