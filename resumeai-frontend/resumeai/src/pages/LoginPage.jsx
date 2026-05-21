import { useState } from 'react'
import { Form, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { authApi } from '../api'
import toast from 'react-hot-toast'
import { Sparkles, Eye, EyeOff, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await authApi.login(form)
      setAuth(data.token, data.user)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex">
      
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-orange-500 to-amber-500 items-center justify-center p-12">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-300/20 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-white">
              Resume<span className="text-amber-200">AI</span>
            </span>
          </div>

          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Your next job starts<br />
            <span className="text-amber-200 italic">with a great resume.</span>
          </h2>
          <p className="text-orange-100 text-base leading-relaxed mb-8">
            Build a job-winning resume in minutes — powered by AI, ATS-ready, and beautifully designed.
          </p>

          {/* Feature list */}
          {[
            '✦  AI writes your summary & bullet points for you',
            '✦  Beat ATS filters with smart keyword suggestions',
            '✦  50+ professional templates, live preview',
            '✦  Export a clean PDF in one click — no watermark',
          ].map((f) => (
            <div key={f} className="flex items-center gap-3 mb-4">
              <span className="text-orange-100 text-sm leading-relaxed">{f}</span>
            </div>
          ))}

          {/* Social proof */}
          
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="font-display text-xl font-bold text-stone-800">
              Resume<span className="text-orange-500">AI</span>
            </span>
          </div>

          <h1 className="font-display text-3xl font-bold text-stone-900 mb-2">Sign in</h1>
          <p className="text-stone-500 text-sm mb-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-500 hover:text-orange-400 font-medium transition-colors">
              Create one free
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : 'Sign in'}
            </button>
          </form>
          <button onClick={()=>alert(form.email+" "+form.password)}>click</button>
        </div>
      </div>
    </div>
  )
}
