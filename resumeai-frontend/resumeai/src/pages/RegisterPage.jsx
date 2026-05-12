import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api'
import toast from 'react-hot-toast'
import { Sparkles, Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.register(form)
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'fullName', label: 'Full Name', type: 'text', placeholder: 'John Doe', icon: User },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', icon: Mail },
    { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 234 567 8900', icon: Phone },
  ]

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center p-8">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
            <Sparkles size={16} className="text-ink-900" />
          </div>
          <span className="font-display text-xl font-bold text-white">
            Resume<span className="text-gold-400">AI</span>
          </span>
        </div>

        <h1 className="font-display text-3xl font-bold text-white mb-2">Create account</h1>
        <p className="text-ink-400 text-sm mb-8">
          Already have one?{' '}
          <Link to="/login" className="text-gold-400 hover:text-gold-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ key, label, type, placeholder, icon: Icon }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <div className="relative">
                <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type={type}
                  className="input-field pl-10"
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  required={key !== 'phone'}
                />
              </div>
            </div>
          ))}

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type={showPw ? 'text' : 'password'}
                className="input-field pl-10 pr-10"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-200 transition-colors"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-ink-800/40 border-t-ink-800 rounded-full animate-spin" />
                Creating account…
              </>
            ) : 'Create free account'}
          </button>

          <p className="text-xs text-ink-500 text-center pt-2">
            Free plan includes 10 AI requests and unlimited resumes.
          </p>
        </form>
      </div>
    </div>
  )
}
