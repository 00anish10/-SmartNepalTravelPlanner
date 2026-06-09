import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { login, loading } = useAuth()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({})

  const validate = () => {
    const newErrors: { username?: string; password?: string } = {}
    if (!username.trim()) newErrors.username = 'Username is required'
    if (!password) newErrors.password = 'Password is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    try {
      await login(username, password)
    } catch {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-amber-50/50 via-white to-orange-50/50">
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-saffron/5 via-amber-50 to-white" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 600 L100 450 L200 520 L300 400 L400 480 L500 350 L600 420 L700 300 L800 380 L800 800 L0 800Z" fill="#FF9933"/>
          <path d="M0 700 L150 550 L250 600 L350 480 L450 550 L550 420 L650 500 L750 380 L800 450 L800 800 L0 800Z" fill="#D4A843" opacity="0.5"/>
        </svg>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-7xl mb-6"
          >
            <svg viewBox="0 0 100 100" className="w-24 h-24 mx-auto" fill="none">
              <path d="M50 5 L65 35 L95 35 L70 55 L80 90 L50 70 L20 90 L30 55 L5 35 L35 35Z" fill="url(#mountain-grad)" stroke="#FF9933" strokeWidth="2"/>
              <defs>
                <linearGradient id="mountain-grad" x1="50" y1="5" x2="50" y2="90">
                  <stop offset="0%" stopColor="#FF9933"/>
                  <stop offset="100%" stopColor="#D4A843"/>
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
          <h2 className="text-2xl font-bold text-snow mb-2">Nepal Trek AI</h2>
          <p className="text-stone/70 text-sm max-w-xs mx-auto leading-relaxed">
            AI-powered travel planning for the Himalayan adventure of a lifetime
          </p>
          <div className="mt-8 flex justify-center gap-3">
            {['Everest', 'Annapurna', 'Langtang', 'Manaslu'].map((peak, i) => (
              <motion.div
                key={peak}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="text-xs text-stone/50 font-medium px-2 py-1 rounded-full bg-white/50 border border-saffron/10"
              >
                {peak}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-snow">Welcome back</h1>
              <p className="text-stone text-sm mt-1">Sign in to plan your Himalayan adventure</p>
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
                <label className="block text-sm font-medium text-snow mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setErrors(p => ({ ...p, username: undefined })) }}
                  className={`input ${errors.username ? '!border-red-400 !shadow-red-100' : ''}`}
                  placeholder="Enter your username"
                  autoFocus
                />
                {errors.username && (
                  <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-snow mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })) }}
                    className={`input pr-10 ${errors.password ? '!border-red-400 !shadow-red-100' : ''}`}
                    placeholder="Enter your password"
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
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-stone/30 text-saffron focus:ring-saffron/30 cursor-pointer"
                  />
                  <span className="text-sm text-stone">Remember me</span>
                </label>
              </div>

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
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 text-center space-y-4">
              <p className="text-sm text-stone">
                Don't have an account?{' '}
                <Link
                  to={`/register${redirect !== '/' ? `?redirect=${redirect}` : ''}`}
                  className="text-saffron font-semibold hover:text-amber-600 transition-colors"
                >
                  Create one
                </Link>
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/50 text-xs text-stone">
                <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Demo: <span className="text-saffron font-medium">admin</span> / <span className="text-saffron font-medium">admin123</span>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-stone/50 mt-6">
            Secure login powered by JWT authentication
          </p>
        </motion.div>
      </div>
    </div>
  )
}
