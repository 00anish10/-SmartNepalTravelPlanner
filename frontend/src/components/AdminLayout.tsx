import { useState } from 'react'
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import Admin from '../pages/Admin'
import ErrorBoundary from './ErrorBoundary'

const SIDEBAR_ITEMS = [
  {
    to: '/admin',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/admin/destinations',
    label: 'Destinations',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    to: '/admin/users',
    label: 'Users',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
]

function SidebarItem({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) {
  const location = useLocation()
  const active = location.pathname === to

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
        active
          ? 'bg-saffron/10 text-saffron shadow-sm border border-saffron/10'
          : 'text-stone hover:text-saffron hover:bg-saffron/5'
      }`}
    >
      <span className={`${active ? 'text-saffron' : 'text-stone/60'}`}>{icon}</span>
      <span>{label}</span>
    </Link>
  )
}

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen gradient-bg">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-saffron/10 shadow-lg shadow-saffron/5 transform transition-all duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="h-16 flex items-center gap-2.5 px-5 border-b border-saffron/10">
            <div className="w-8 h-8 rounded-lg bg-saffron flex items-center justify-center text-white text-sm font-bold shadow-md shadow-saffron/30">
              NT
            </div>
            <div>
              <span className="font-bold text-sm text-snow tracking-tight">Nepal Trek AI</span>
              <span className="block text-[10px] text-stone uppercase tracking-widest font-medium">Admin Console</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-5 space-y-1">
            <p className="px-4 pb-2 text-[10px] font-semibold uppercase tracking-widest text-stone/60">Navigation</p>
            {SIDEBAR_ITEMS.map((item) => (
              <SidebarItem key={item.to} {...item} />
            ))}
          </nav>

          {/* Bottom user area */}
          <div className="border-t border-saffron/10 px-4 py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-saffron/15 flex items-center justify-center text-saffron text-sm font-bold flex-shrink-0">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-snow truncate leading-tight">{user?.username}</p>
                <p className="text-[11px] text-stone truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-stone hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 lg:pl-64 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-xl border-b border-saffron/10 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-stone hover:text-saffron p-1.5 rounded-lg hover:bg-saffron/5 transition-colors"
              aria-label="Open sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-sm text-stone hidden sm:block">Admin Panel</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs text-stone hover:text-saffron transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Site
            </Link>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1">
          <ErrorBoundary>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/destinations" element={<AdminPage defaultTab="destinations" />} />
                <Route path="/admin/users" element={<AdminPage defaultTab="users" />} />
                <Route path="*" element={<Navigate to="/admin" />} />
              </Routes>
            </AnimatePresence>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}

function AdminPage({ defaultTab }: { defaultTab?: 'destinations' | 'users' }) {
  const location = useLocation()
  return (
    <motion.main
      key={location.pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.15 }}
      className="p-4 lg:p-6 xl:p-8"
    >
      <Admin initialTab={defaultTab} />
    </motion.main>
  )
}
