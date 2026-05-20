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
    <div className="flex min-h-screen bg-stone-50">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-stone-200 bg-white shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md shadow-orange-200">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-stone-800 text-lg leading-none">Resume</span>
              <span className="font-display font-bold text-orange-500 text-lg leading-none">AI</span>
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
                    ? 'bg-orange-50 text-orange-600 border border-orange-200'
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-orange-500' : 'text-stone-400 group-hover:text-stone-600'} />
                  <span>{label}</span>
                  {isActive && <ChevronRight size={12} className="ml-auto text-orange-400" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Premium Upgrade CTA */}
        {!isPremium && !isAdmin && (
          <div className="mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200">
            <div className="flex items-center gap-2 mb-2 text-orange-500">
              <Crown size={14} className="fill-orange-100" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Premium Plan</span>
            </div>
            <p className="text-[10px] text-stone-500 mb-3 leading-relaxed">
              Unlock PRO templates and 10x more AI credits.
            </p>
            <button 
              onClick={() => setShowPricing(true)}
              className="w-full py-2 bg-orange-500 hover:bg-orange-400 text-white text-[11px] font-bold rounded-lg transition-all shadow-md shadow-orange-200 active:scale-95"
            >
              Upgrade Now
            </button>
          </div>
        )}

        {/* User section */}
        <div className="p-4 border-t border-stone-100">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-2 hover:bg-stone-50 transition-colors cursor-pointer" onClick={() => navigate('/profile')}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow ${
              isPremium ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 'bg-gradient-to-br from-amber-400 to-orange-500'
            }`}>
              {isPremium ? <Crown size={14} className="text-white" /> : (user?.email?.[0]?.toUpperCase() || 'U')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-stone-800 truncate">{user?.email?.split('@')[0]}</p>
              <div className="flex items-center gap-2">
                <p className={`text-[10px] font-medium uppercase tracking-tighter ${isPremium ? 'text-orange-500' : 'text-stone-400'}`}>
                  {user?.subscriptionPlan || 'FREE'} PLAN
                </p>
                {isAdmin && <span className="text-[9px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded border border-stone-200 font-bold uppercase tracking-tighter">Admin</span>}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-400 hover:text-rose-500 hover:bg-rose-50 transition-all duration-200"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-stone-50">
        <Outlet />
      </main>

      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
    </div>
  )
}
