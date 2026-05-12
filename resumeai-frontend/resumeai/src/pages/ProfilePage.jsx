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
      .then(data => {
        setProfile(data)
        setForm({ fullName: data.fullName || '', phone: data.phone || '' })
      })
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
      <div className="flex items-center justify-center h-full gap-3 text-ink-400">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Loading profile…</span>
      </div>
    )
  }

  const planColor = profile?.subscriptionPlan === 'PREMIUM' ? 'text-gold-400' : 'text-ink-300'

  return (
    <div className="p-8 max-w-xl animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-1">
          Your <span className="text-gold-400">Profile</span>
        </h1>
        <p className="text-ink-400 text-sm">Manage your account information.</p>
      </div>

      {/* Account info card */}
      <div className={`card p-6 mb-8 relative overflow-hidden ${profile?.subscriptionPlan === 'PREMIUM' ? 'border-gold-500/50 shadow-xl shadow-gold-500/5' : ''}`}>
        {profile?.subscriptionPlan === 'PREMIUM' && (
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-gold-500/10 blur-2xl rounded-full" />
        )}
        
        <div className="flex items-center gap-5 mb-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-xl ${
            profile?.subscriptionPlan === 'PREMIUM' 
              ? 'bg-gradient-to-br from-gold-400 to-gold-600 shadow-gold-500/20' 
              : 'bg-gradient-to-br from-purple-500 to-blue-600'
          }`}>
            {profile?.subscriptionPlan === 'PREMIUM' 
              ? <Crown size={28} className="text-ink-900" />
              : (profile?.fullName?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || 'U')
            }
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-display font-bold text-white text-xl">{profile?.fullName || 'Anonymous User'}</p>
              {profile?.subscriptionPlan === 'PREMIUM' && <Crown size={16} className="text-gold-400 fill-gold-400/20" />}
            </div>
            <p className="text-sm text-ink-400">{profile?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-ink-700/40 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield size={13} className="text-ink-400" />
              <span className="text-[11px] text-ink-400 uppercase tracking-wide">Role</span>
            </div>
            <p className="text-sm font-medium text-white capitalize">
              {profile?.role?.toLowerCase() || 'user'}
            </p>
          </div>
          <div className="bg-ink-700/40 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={13} className="text-ink-400" />
              <span className="text-[11px] text-ink-400 uppercase tracking-wide">Plan</span>
            </div>
            <p className={`text-sm font-medium capitalize ${planColor}`}>
              {profile?.subscriptionPlan?.toLowerCase() || 'free'}
            </p>
          </div>
        </div>
      </div>

      {/* Upgrade CTA for Free Users */}
      {profile?.subscriptionPlan !== 'PREMIUM' && (
        <div className="bg-gradient-to-br from-gold-400/20 to-gold-600/5 border border-gold-500/20 rounded-2xl p-6 mb-8 flex items-center justify-between group cursor-pointer hover:border-gold-500/40 transition-all" onClick={() => setShowPricing(true)}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold-500 flex items-center justify-center text-ink-900 shadow-lg shadow-gold-500/20">
              <Crown size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Upgrade to Premium</h3>
              <p className="text-xs text-ink-300 mt-0.5">Unlock all templates & unlimited AI power.</p>
            </div>
          </div>
          <ArrowRight size={20} className="text-gold-400 group-hover:translate-x-1 transition-transform" />
        </div>
      )}

      {/* Edit form */}
      <div className="card p-5">
        <h2 className="font-semibold text-white text-base mb-4">Edit Information</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
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
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="email"
                className="input-field pl-10 opacity-60 cursor-not-allowed"
                value={profile?.email || ''}
                disabled
                title="Email cannot be changed"
              />
            </div>
            <p className="text-[11px] text-ink-500 mt-1">Email address cannot be changed.</p>
          </div>

          <div>
            <label className="label">Phone</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="tel"
                className="input-field pl-10"
                placeholder="+1 234 567 8900"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save Changes</>}
          </button>
        </form>
      </div>

      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
    </div>
  )
}
