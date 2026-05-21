import { useState } from 'react'
import { X, Check, Crown, Zap, Shield, Rocket, Loader2, Star } from 'lucide-react'
import { authApi } from '../../api'
import { useAuthStore } from '../../store'
import toast from 'react-hot-toast'

export default function PricingModal({ onClose }) {
  const { user, setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const handleUpgrade = () => {
    const options = {
      key: 'rzp_test_SoXMeq8uZCh9eU',
      amount: 99900,
      currency: 'INR',
      name: 'ResumeAI Premium',
      description: 'Lifetime Access to Pro Templates & AI',
      image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
      handler: async function () {
        setLoading(true)
        try {
          const data = await authApi.upgrade()
          setAuth(data.token, data.user)
          toast.success('Welcome to Premium! 🎉')
          onClose()
        } catch (err) {
          toast.error(err.message || 'Verification failed')
        } finally {
          setLoading(false)
        }
      },
      prefill: { name: user?.fullName || '', email: user?.email || '' },
      theme: { color: '#f97316' },
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  const perks = [
    { icon: Crown,  label: '50+ PRO Templates',         sub: 'Stand out with premium layouts' },
    { icon: Zap,    label: '100 AI Credits / month',     sub: '10× more than free plan' },
    { icon: Shield, label: 'No Watermarks',              sub: 'Clean professional exports' },
    { icon: Rocket, label: 'Priority Support',           sub: 'Expert help when you need it' },
  ]

  const included = [
    'All Premium Templates',
    'Unlimited Resumes',
    'ATS Optimization',
    'PDF Export (no watermark)',
    'Early Feature Access',
    'Priority Email Support',
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 animate-slide-up my-auto" onClick={e => e.stopPropagation()}>

        <div className="flex flex-col md:flex-row">

          {/* ── Left: feature info ── */}
          <div className="flex-1 p-8 md:p-10">
            <button onClick={onClose} className="btn-icon mb-6 -ml-1"><X size={18} /></button>

            <div className="tag-orange mb-4">
              <Crown size={11} /> Premium Plan
            </div>

            <h2 className="font-display text-3xl font-bold text-stone-900 leading-tight mb-3">
              Land your <span className="text-orange-500">dream job</span><br />faster.
            </h2>
            <p className="text-stone-400 text-sm leading-relaxed mb-8 max-w-xs">
              Unlock powerful tools used by thousands of professionals to craft standout resumes.
            </p>

            <div className="space-y-5">
              {perks.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 flex-shrink-0">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-stone-800">{label}</p>
                    <p className="text-[12px] text-stone-400">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="mt-8 flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-100">
              <div className="flex -space-x-2">
                {['bg-orange-400','bg-amber-400','bg-rose-400','bg-blue-400'].map((c,i) => (
                  <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-white flex items-center justify-center text-[9px] font-bold text-white`}>
                    {['J','M','K','A'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} size={10} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-[11px] text-stone-500">Loved by <span className="font-semibold text-stone-700">2,400+</span> job seekers</p>
              </div>
            </div>
          </div>

          {/* ── Right: pricing card ── */}
          <div className="w-full md:w-[300px] bg-gradient-to-br from-orange-500 to-amber-500 p-8 md:p-10 flex flex-col">

            <div className="mb-6 text-center">
              <p className="text-orange-100 text-[11px] font-bold uppercase tracking-widest mb-2">Lifetime Deal</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-white text-xl font-bold font-display">₹</span>
                <span className="text-white text-5xl font-bold font-display tracking-tight">999</span>
              </div>
              <p className="text-orange-100 text-xs mt-1">One-time · Forever yours</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {included.map(item => (
                <li key={item} className="flex items-center gap-2.5 text-[13px] text-white">
                  <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Check size={10} className="text-white" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <button
              disabled={loading}
              onClick={handleUpgrade}
              className="w-full bg-white text-orange-600 font-bold h-13 py-3.5 rounded-2xl text-[14px] flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading
                ? <Loader2 size={20} className="animate-spin" />
                : <><Crown size={18} /> Upgrade Now</>
              }
            </button>

            <p className="text-orange-100 text-[10px] text-center mt-4 leading-relaxed">
              Secure payment · No recurring fees · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
