import { useEffect, useState } from 'react'
import { useAuthStore } from '../store'
import { authApi } from '../api'
import toast from 'react-hot-toast'
import { User, Phone, Mail, Save, Loader2, Shield, Zap, Crown, ArrowRight } from 'lucide-react'
import PricingModal from '../components/premium/PricingModal'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ fullName: '', phone: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPricing, setShowPricing] = useState(false)

  useEffect(() => {
    if (!user) return
    authApi.profile(user.userId)
      .then(data => { setProfile(data); setForm({ fullName: data.fullName || '', phone: data.phone || '' }) })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [user?.userId])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await authApi.updateProfile(user.userId, form)
      updateUser({ ...user, ...form })
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-3 text-stone-400">
        <Loader2 size={18} className="animate-spin text-orange-400" />
        <span className="text-sm">Loading profile…</span>
      </div>
    )
  }

  const isPremium = profile?.subscriptionPlan === 'PREMIUM'

  return (
    <div className="p-8 max-w-2xl animate-fade-in">

      {/* Header */}
      <div className="mb-8">
        <p className="text-stone-400 text-sm mb-0.5">Account</p>
        <h1 className="font-display text-2xl font-bold text-stone-900">Your Profile</h1>
      </div>

      {/* Avatar + plan card */}
      <div className="card p-6 mb-5">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0 ${
            isPremium
              ? 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-200'
              : 'bg-gradient-to-br from-slate-500 to-slate-700'
          }`}>
            {isPremium
              ? <Crown size={26} className="text-white" />
              : <span className="text-2xl font-bold">{profile?.fullName?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || 'U'}</span>
            }
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="font-display font-bold text-stone-900 text-lg truncate">
                {profile?.fullName || 'Anonymous User'}
              </h2>
              {isPremium && <span className="tag-orange"><Crown size={10} /> PRO</span>}
            </div>
            <p className="text-sm text-stone-400 truncate">{profile?.email}</p>
          </div>
        </div>

        {/* Meta pills */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="bg-stone-50 border border-stone-100 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-400">
              <Shield size={14} />
            </div>
            <div>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">Role</p>
              <p className="text-[13px] font-semibold text-stone-800 capitalize">{profile?.role?.toLowerCase() || 'User'}</p>
            </div>
          </div>
          <div className="bg-stone-50 border border-stone-100 rounded-xl p-3 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPremium ? 'bg-orange-100 text-orange-500' : 'bg-white border border-stone-200 text-stone-400'}`}>
              <Zap size={14} />
            </div>
            <div>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">Plan</p>
              <p className={`text-[13px] font-semibold capitalize ${isPremium ? 'text-orange-500' : 'text-stone-700'}`}>
                {profile?.subscriptionPlan?.toLowerCase() || 'Free'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      {!isPremium && (
        <button
          onClick={() => setShowPricing(true)}
          className="w-full card mb-5 p-4 flex items-center gap-4 hover:border-orange-200 hover:shadow-md transition-all group text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-orange-200 group-hover:scale-105 transition-transform">
            <Crown size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-stone-900 text-[14px]">Upgrade to Premium</p>
            <p className="text-xs text-stone-400 mt-0.5">Unlock all templates & 100 AI credits/month</p>
          </div>
          <ArrowRight size={18} className="text-orange-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
        </button>
      )}

      {/* Edit form */}
      <div className="card p-6">
        <h3 className="font-semibold text-stone-900 text-[15px] mb-5">Edit Information</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                className="input-field pl-10"
                placeholder="Your full name"
                value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                className="input-field pl-10 bg-stone-50 cursor-not-allowed text-stone-400"
                value={profile?.email || ''}
                disabled
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-1.5">Email address cannot be changed.</p>
          </div>

          <div>
            <label className="label">Phone</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="tel"
                className="input-field pl-10"
                placeholder="+1 234 567 8900"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>
          </div>

          <div className="pt-1">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving
                ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                : <><Save size={14} /> Save Changes</>
              }
            </button>
          </div>
        </form>
      </div>

      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
    </div>
  )
}
