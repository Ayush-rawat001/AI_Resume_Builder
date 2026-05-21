import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store'
import {
  LayoutDashboard, Palette, User, LogOut, Sparkles, ShieldCheck, Crown, Target, Zap
} from 'lucide-react'
import PricingModal from '../premium/PricingModal'
import { useState } from 'react'

export default function Layout() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const [showPricing, setShowPricing] = useState(false)

  const handleLogout = () => { clearAuth(); navigate('/login') }

  const isPremium = user?.subscriptionPlan === 'PREMIUM'
  const isAdmin = user?.role === 'Admin' || user?.email === 'admin@test.com'

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/templates', icon: Palette, label: 'Templates' },
    { to: '/job-match', icon: Target, label: 'Job Match' },
    { to: '/profile', icon: User, label: 'Profile' },
  ]
  if (isAdmin) navItems.push({ to: '/admin', icon: ShieldCheck, label: 'Admin' })

  return (
    <div className="flex min-h-screen bg-[#fafaf8]">
      {/* ── Sidebar ── */}
      <aside className="w-60 flex flex-col border-r border-stone-200 bg-white">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md shadow-orange-200">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="font-display font-bold text-stone-900 text-[17px] tracking-tight">
              Resume<span className="text-orange-500">AI</span>
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={15} className={isActive ? 'text-white' : 'text-stone-400 group-hover:text-stone-600'} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Upgrade CTA */}
        {!isPremium && !isAdmin && (
          <div className="mx-3 mb-3 p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Zap size={13} className="text-amber-200" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-100">Go Premium</span>
            </div>
            <p className="text-[11px] text-orange-100 mb-3 leading-relaxed">
              Unlock all templates &amp; 10× AI credits
            </p>
            <button
              onClick={() => setShowPricing(true)}
              className="w-full py-2 bg-white hover:bg-orange-50 text-orange-600 text-[12px] font-bold rounded-xl transition-all active:scale-95"
            >
              Upgrade Now
            </button>
          </div>
        )}

        {/* User */}
        <div className="px-3 pb-3 border-t border-stone-100 pt-3">
          <div
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl mb-1 hover:bg-stone-50 cursor-pointer transition-colors"
            onClick={() => navigate('/profile')}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
              isPremium ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 'bg-gradient-to-br from-amber-400 to-orange-500'
            }`}>
              {isPremium ? <Crown size={13} /> : (user?.email?.[0]?.toUpperCase() || 'U')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-stone-800 truncate">{user?.email?.split('@')[0]}</p>
              <p className={`text-[10px] font-medium uppercase tracking-wide ${isPremium ? 'text-orange-500' : 'text-stone-400'}`}>
                {user?.subscriptionPlan || 'FREE'}
              </p>
            </div>
            {isAdmin && (
              <span className="text-[9px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-lg border border-stone-200 font-bold">ADMIN</span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-stone-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-[#fafaf8]">
        <Outlet />
      </main>

      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
    </div>
  )
}
