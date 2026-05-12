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
      amount: 99900, // 999 INR in paise
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
        color: '#e8b422',
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
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div 
        className="relative w-full max-w-4xl bg-ink-900 border border-gold-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(232,180,34,0.15)] animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold-500/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gold-500/10 blur-[100px] rounded-full" />

        <div className="flex flex-col md:flex-row">
          {/* Left: Info */}
          <div className="flex-1 p-8 md:p-12">
            <button onClick={onClose} className="absolute top-6 left-6 text-ink-500 hover:text-white transition-colors">
              <X size={24} />
            </button>

            <div className="mt-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-bold uppercase tracking-widest mb-4">
                <Crown size={12} />
                Premium Access
              </div>
              <h2 className="text-4xl font-display font-bold text-white mb-4">
                Elevate Your <span className="text-gold-400">Career</span> Path
              </h2>
              <p className="text-ink-400 leading-relaxed mb-10 max-w-sm">
                Join thousands of professionals who landed their dream jobs using our premium AI-powered tools.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {features.map((f, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-ink-800 border border-ink-700 flex items-center justify-center text-gold-400">
                      <f.icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{f.title}</h4>
                      <p className="text-xs text-ink-500 mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Pricing Card */}
          <div className="w-full md:w-[360px] bg-ink-800/50 backdrop-blur-sm border-l border-ink-700/50 p-8 md:p-12 flex flex-col justify-center items-center text-center">
            <div className="mb-8">
              <span className="text-ink-400 text-sm font-medium uppercase tracking-widest">Lifetime Deal</span>
              <div className="flex items-baseline justify-center gap-1 mt-2">
                <span className="text-2xl font-bold text-ink-400 font-display">₹</span>
                <span className="text-6xl font-bold text-white font-display tracking-tight">999</span>
              </div>
              <p className="text-ink-500 text-sm mt-2 italic text-gold-500/80">One-time payment. Forever yours.</p>
            </div>

            <ul className="w-full space-y-4 mb-10">
              {['All Templates Included', 'Unlimited Revisions', 'AI ATS Optimization', 'Early Access to Features'].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm text-ink-300">
                  <Check size={16} className="text-gold-400" />
                  {item}
                </li>
              ))}
            </ul>

            <button 
              disabled={loading}
              onClick={handleUpgrade}
              className="w-full btn-primary h-14 rounded-2xl text-base flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(232,180,34,0.2)] hover:scale-[1.02] active:scale-[0.98]"
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
            <p className="text-ink-500 text-[10px] mt-6 px-4">
              Secure payment processed by Stripe. By upgrading, you agree to our Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
