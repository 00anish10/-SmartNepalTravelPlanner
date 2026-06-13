import { useState } from 'react'
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import ErrorBoundary from './components/ErrorBoundary'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Home from './pages/Home'
import Preferences from './pages/Preferences'
import Recommendations from './pages/Recommendations'
import Itinerary from './pages/Itinerary'
import Safety from './pages/Safety'
import Budget from './pages/Budget'
import Destinations from './pages/Destinations'
import NepalInfo from './pages/NepalInfo'
import PackingChecklist from './pages/PackingChecklist'
import DestinationCompare from './pages/DestinationCompare'
import AMSChecker from './pages/AMSChecker'
import TripHistory from './pages/TripHistory'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminLayout from './components/AdminLayout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-5 w-5 text-saffron" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-stone text-sm">Checking authentication...</span>
        </div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

const NAV_ITEMS = [
  { to: '/preferences', label: 'Plan Trip', icon: '📋' },
  { to: '/destinations', label: 'Destinations', icon: '🏔️' },
  { to: '/recommendations', label: 'Recommend', icon: '🎯' },
  { to: '/itinerary', label: 'Itinerary', icon: '🗺️' },
  { to: '/safety', label: 'Safety', icon: '🛡️' },
  { to: '/budget', label: 'Budget', icon: '💰' },
  { to: '/nepal-info', label: 'Nepal Guide', icon: '🇳🇵' },
  { to: '/packing', label: 'Packing', icon: '🎒' },
  { to: '/ams-checker', label: 'AMS Check', icon: '🫀' },
  { to: '/compare', label: 'Compare', icon: '⚖️' },
  { to: '/trip-history', label: 'History', icon: '📜' },
]

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

function AppContent() {
  const location = useLocation()
  const { user, userSessionKey } = useAuth()
  const isHome = location.pathname === '/'
  const isAdmin = user?.role === 'admin'
  const [menuOpen, setMenuOpen] = useState(false)

  if (isAdmin) {
    return <AdminLayout />
  }

  return (
    <div className="min-h-screen gradient-bg">
      {!isHome && <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />}
      <ErrorBoundary key={userSessionKey}>
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/preferences" element={<ProtectedRoute><Preferences /></ProtectedRoute>} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/itinerary" element={<Itinerary />} />
              <Route path="/safety" element={<Safety />} />
              <Route path="/budget" element={<ProtectedRoute><Budget /></ProtectedRoute>} />
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/nepal-info" element={<NepalInfo />} />
              <Route path="/packing" element={<PackingChecklist />} />
              <Route path="/compare" element={<DestinationCompare />} />
              <Route path="/ams-checker" element={<AMSChecker />} />
              <Route path="/trip-history" element={<ProtectedRoute><TripHistory /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </motion.main>
        </AnimatePresence>
      </ErrorBoundary>
      {!isHome && <Footer />}
    </div>
  )
}

function Navbar({ menuOpen, setMenuOpen }: { menuOpen: boolean; setMenuOpen: (v: boolean) => void }) {
  const location = useLocation()
  const { user, logout } = useAuth()

  const isAdmin = user?.role === 'admin'
  const visibleNavItems = isAdmin ? [] : NAV_ITEMS

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-saffron/10 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <span className="text-2xl">🏔️</span>
          <span className="font-bold text-lg">
            <span className="text-saffron">Nepal</span>
            <span className="text-snow">Trek AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 text-sm">
          {visibleNavItems.map((item) => (
            <NavLink key={item.to} to={item.to} label={item.label} icon={item.icon} />
          ))}
          {user ? (
            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-saffron/15">
              {isAdmin && (
                <NavLink to="/admin" label="Admin" icon="⚙️" />
              )}
              <span className="flex items-center gap-1.5 text-xs px-2">
                <span className="text-stone">{user.username}</span>
                {isAdmin ? (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500 border border-gray-200">
                    User
                  </span>
                )}
              </span>
              <button onClick={logout} className="text-stone hover:text-red-500 transition-colors text-xs px-2 py-1">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-saffron/15">
              <NavLink to="/login" label="Login" icon="🔑" />
              <NavLink to="/register" label="Sign Up" icon="✋" />
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-snow p-2 hover:text-saffron transition-colors"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <div className="w-6 h-0.5 bg-current mb-1.5 transition-all" />
          <div className="w-6 h-0.5 bg-current mb-1.5 transition-all" />
          <div className="w-6 h-0.5 bg-current transition-all" />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-saffron/10 overflow-hidden bg-white"
          >
            <div className="px-4 py-3 space-y-1">
              {visibleNavItems.map((item) => {
                const active = location.pathname === item.to
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      active
                        ? 'bg-saffron/10 text-saffron'
                        : 'text-stone hover:text-saffron hover:bg-saffron/5'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              <div className="border-t border-saffron/10 pt-2 mt-2">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-xs text-stone">{user.username} ({user.role})</div>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone hover:text-saffron hover:bg-saffron/5">
                        <span>⚙️</span><span>Admin</span>
                      </Link>
                    )}
                    <button onClick={() => { logout(); setMenuOpen(false) }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone hover:text-red-500 hover:bg-saffron/5">
                      <span>🚪</span><span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone hover:text-saffron hover:bg-saffron/5">
                      <span>🔑</span><span>Login</span>
                    </Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone hover:text-saffron hover:bg-saffron/5">
                      <span>✋</span><span>Sign Up</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

function NavLink({ to, label, icon }: { to: string; label: string; icon: string }) {
  const location = useLocation()
  const active = location.pathname === to
  return (
    <Link
      to={to}
      className={`relative px-3 py-2 rounded-lg transition-colors text-sm flex items-center gap-1.5 ${
        active ? 'text-saffron bg-saffron/10' : 'text-stone hover:text-saffron hover:bg-saffron/5'
      }`}
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute -bottom-0.5 left-2 right-2 h-0.5 bg-saffron rounded-full"
        />
      )}
    </Link>
  )
}

function Footer() {
  return (
    <footer className="border-t border-saffron/10 py-10 mt-20 bg-white/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🏔️</span>
              <span className="font-bold">
                <span className="text-saffron">Nepal</span>
                <span className="text-snow">Trek AI</span>
              </span>
            </div>
            <p className="text-stone leading-relaxed">
              AI-powered travel planner for Nepal. Personalized itineraries, safety protocols, and budget tracking for the adventure of a lifetime.
            </p>
          </div>
          <div>
            <h4 className="text-saffron font-semibold mb-3 uppercase tracking-wider text-xs">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/preferences" className="block text-stone hover:text-saffron transition-colors">Plan a Trip</Link>
              <Link to="/destinations" className="block text-stone hover:text-saffron transition-colors">Explore Destinations</Link>
              <Link to="/recommendations" className="block text-stone hover:text-saffron transition-colors">Get Recommendations</Link>
              <Link to="/nepal-info" className="block text-stone hover:text-saffron transition-colors">Nepal Travel Guide</Link>
              <Link to="/packing" className="block text-stone hover:text-saffron transition-colors">Packing Checklist</Link>
              <Link to="/compare" className="block text-stone hover:text-saffron transition-colors">Compare Destinations</Link>
              <Link to="/ams-checker" className="block text-stone hover:text-saffron transition-colors">AMS Symptom Checker</Link>
            </div>
          </div>
          <div>
            <h4 className="text-saffron font-semibold mb-3 uppercase tracking-wider text-xs">Responsible Travel</h4>
            <ul className="space-y-1.5 text-stone">
              <li>• Leave No Trace — carry out all waste</li>
              <li>• Support local teahouses & Nepali businesses</li>
              <li>• Respect porter welfare (max 30kg, fair pay)</li>
              <li>• Ask permission before photographing people</li>
              <li>• Dress appropriately at religious sites</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-saffron/10 text-center text-stone text-xs">
          <p>Plan responsibly. Respect the mountains. Leave no trace. 🏔️</p>
        </div>
      </div>
    </footer>
  )
}
