import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store'
import {
  LayoutDashboard, Palette, User, LogOut, Sparkles, ChevronRight, ShieldCheck, Crown, Target
} from 'lucide-react'
import PricingModal from '../premium/PricingModal'
import { useState } from 'react'

export default function Layout() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const [showPricing, setShowPricing] = useState(false)

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  const isPremium = user?.subscriptionPlan === 'PREMIUM'
  const isAdmin = user?.role === 'Admin' || user?.email === 'admin@test.com'

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/templates', icon: Palette, label: 'Templates' },
    { to: '/job-match', icon: Target, label: 'Job Match' },
    { to: '/profile', icon: User, label: 'Profile' },
  ]

  if (isAdmin) {
    navItems.push({ to: '/admin', icon: ShieldCheck, label: 'Admin Panel' })
  }

  return (
    <div className="flex min-h-screen bg-ink-900">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-ink-700/60 bg-ink-800/40 backdrop-blur-sm">
        {/* Logo */}
        <div className="p-6 border-b border-ink-700/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
              <Sparkles size={16} className="text-ink-900" />
            </div>
            <div>
              <span className="font-display font-bold text-white text-lg leading-none">Resume</span>
              <span className="font-display font-bold text-gold-400 text-lg leading-none">AI</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                    : 'text-ink-300 hover:text-white hover:bg-ink-700/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-gold-400' : 'text-ink-400 group-hover:text-white'} />
                  <span>{label}</span>
                  {isActive && <ChevronRight size={12} className="ml-auto text-gold-400/60" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Premium Upgrade CTA */}
        {!isPremium && !isAdmin && (
          <div className="mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-br from-gold-400/20 to-gold-600/5 border border-gold-500/20">
            <div className="flex items-center gap-2 mb-2 text-gold-400">
              <Crown size={14} className="fill-gold-400/20" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Premium Plan</span>
            </div>
            <p className="text-[10px] text-ink-300 mb-3 leading-relaxed">
              Unlock PRO templates and 10x more AI credits.
            </p>
            <button 
              onClick={() => setShowPricing(true)}
              className="w-full py-2 bg-gold-500 hover:bg-gold-400 text-ink-900 text-[11px] font-bold rounded-lg transition-all shadow-lg shadow-gold-500/10 active:scale-95"
            >
              Upgrade Now
            </button>
          </div>
        )}

        {/* User section */}
        <div className="p-4 border-t border-ink-700/60">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-2 hover:bg-ink-700/30 transition-colors cursor-pointer" onClick={() => navigate('/profile')}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg ${
              isPremium ? 'bg-gradient-to-br from-gold-400 to-gold-600' : 'bg-gradient-to-br from-purple-400 to-blue-500'
            }`}>
              {isPremium ? <Crown size={14} className="text-ink-900" /> : (user?.email?.[0]?.toUpperCase() || 'U')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.email?.split('@')[0]}</p>
              <div className="flex items-center gap-2">
                <p className={`text-[10px] font-medium uppercase tracking-tighter ${isPremium ? 'text-gold-400' : 'text-ink-400'}`}>
                  {user?.subscriptionPlan || 'FREE'} PLAN
                </p>
                {isAdmin && <span className="text-[9px] bg-white/10 text-white px-1.5 py-0.5 rounded border border-white/20 font-bold uppercase tracking-tighter">Admin</span>}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-ink-400 hover:text-rose-400 hover:bg-rose-400/5 transition-all duration-200"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-[#fafafa]">
        <Outlet />
      </main>

      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
    </div>
  )
}
