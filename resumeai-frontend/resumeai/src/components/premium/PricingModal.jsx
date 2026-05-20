import { useState } from 'react'
import { X, Check, Crown, Zap, Shield, Rocket, Loader2 } from 'lucide-react'
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
      handler: async function (response) {
        setLoading(true)
        try {
          const data = await authApi.upgrade()
          setAuth(data.token, data.user)
          toast.success('Payment Successful! Welcome to PREMIUM.')
          onClose()
        } catch (err) {
          toast.error(err.message || 'Verification failed')
        } finally {
          setLoading(false)
        }
      },
      prefill: {
        name: user?.fullName || '',
        email: user?.email || '',
      },
      theme: {
        color: '#f97316',
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  const features = [
    { title: 'PRO Resume Templates', desc: 'Unlock all 50+ premium layouts', icon: Crown },
    { title: 'AI Power Boost', desc: '100 AI credits/month (10x more!)', icon: Zap },
    { title: 'No Watermarks', desc: 'Clean, professional PDF exports', icon: Shield },
    { title: 'Priority Support', desc: 'Direct access to our expert team', icon: Rocket },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Decorative bg */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-200/40 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-200/40 blur-[100px] rounded-full" />

        <div className="flex flex-col md:flex-row">
          {/* Left: Info */}
          <div className="flex-1 p-8 md:p-12 relative">
            <button onClick={onClose} className="absolute top-6 left-6 text-stone-400 hover:text-stone-700 transition-colors">
              <X size={24} />
            </button>

            <div className="mt-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-600 text-xs font-bold uppercase tracking-widest mb-4">
                <Crown size={12} />
                Premium Access
              </div>
              <h2 className="text-4xl font-display font-bold text-stone-900 mb-4">
                Elevate Your <span className="text-orange-500">Career</span> Path
              </h2>
              <p className="text-stone-500 leading-relaxed mb-10 max-w-sm">
                Join thousands of professionals who landed their dream jobs using our premium AI-powered tools.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {features.map((f, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
                      <f.icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-800">{f.title}</h4>
                      <p className="text-xs text-stone-400 mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Pricing Card */}
          <div className="w-full md:w-[360px] bg-gradient-to-br from-orange-500 to-amber-500 p-8 md:p-12 flex flex-col justify-center items-center text-center">
            <div className="mb-8">
              <span className="text-orange-100 text-sm font-medium uppercase tracking-widest">Lifetime Deal</span>
              <div className="flex items-baseline justify-center gap-1 mt-2">
                <span className="text-2xl font-bold text-white font-display">₹</span>
                <span className="text-6xl font-bold text-white font-display tracking-tight">999</span>
              </div>
              <p className="text-orange-100 text-sm mt-2 italic">One-time payment. Forever yours.</p>
            </div>

            <ul className="w-full space-y-4 mb-10">
              {['All Templates Included', 'Unlimited Revisions', 'AI ATS Optimization', 'Early Access to Features'].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm text-white">
                  <Check size={16} className="text-white" />
                  {item}
                </li>
              ))}
            </ul>

            <button 
              disabled={loading}
              onClick={handleUpgrade}
              className="w-full bg-white text-orange-600 font-bold h-14 rounded-2xl text-base flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <Crown size={20} />
                  Upgrade Now
                </>
              )}
            </button>
            <p className="text-orange-100 text-[10px] mt-6 px-4">
              Secure payment processed by Stripe. By upgrading, you agree to our Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
