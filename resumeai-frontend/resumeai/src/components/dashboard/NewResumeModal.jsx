import { useState } from 'react'
import { useAuthStore, useResumeStore, useTemplateStore } from '../../store'
import { resumeApi, sectionApi } from '../../api'
import { defaultContent, stringifyContent } from '../../utils/sections'
import toast from 'react-hot-toast'
import { X, Loader2, FileText, Briefcase, CheckCircle2, Lock, Crown } from 'lucide-react'
import PricingModal from '../premium/PricingModal'

export default function NewResumeModal({ onClose, onCreated }) {
  const { user } = useAuthStore()
  const { templates } = useTemplateStore()
  const { setResumes, resumes } = useResumeStore()

  const [form, setForm] = useState({
    title: '',
    targetJobTitle: '',
    templateId: templates[0]?.templateId || 1,
    language: 'en',
  })
  const [loading, setLoading] = useState(false)
  const [showPricing, setShowPricing] = useState(false)

  const isPremiumUser = user?.subscriptionPlan === 'PREMIUM'

  const handleSelectTemplate = (t) => {
    if (t.isPremium && !isPremiumUser) {
      toast.error('This is a Premium template. Upgrade to unlock!')
      setShowPricing(true)
      return
    }
    setForm(f => ({ ...f, templateId: t.templateId }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('Please enter a resume title'); return }
    setLoading(true)
    try {
      const resume = await resumeApi.create({ ...form, userId: user.userId, templateId: Number(form.templateId) })
      const resumeId = resume.resumeId

      // Create default contact section
      await sectionApi.create({
        resumeId,
        sectionType: 'CUSTOM',
        title: 'Contact',
        content: stringifyContent(defaultContent('CUSTOM')),
        displayOrder: 0,
      })

      // Create default summary section
      await sectionApi.create({
        resumeId,
        sectionType: 'SUMMARY',
        title: 'Professional Summary',
        content: stringifyContent(defaultContent('SUMMARY')),
        displayOrder: 1,
      })

      setResumes([...resumes, resume])
      toast.success('Resume created!')
      onCreated(resumeId)
    } catch (err) {
      toast.error(err.message || 'Failed to create resume')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="card w-full max-w-4xl p-8 animate-slide-up bg-ink-800/90 border-ink-700/60 shadow-2xl my-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Create Your <span className="text-gold-400">Masterpiece</span></h2>
            <p className="text-ink-400 text-sm mt-1">Fill in the details and choose a stunning layout</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2 hover:bg-rose-500/10 text-ink-400 hover:text-rose-400 transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleCreate} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div>
              <label className="label text-ink-300 font-bold mb-2">Resume Title</label>
              <div className="relative">
                <FileText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" />
                <input
                  type="text"
                  className="input-field pl-12 h-12 bg-ink-900/50 border-ink-700/60 focus:border-gold-500/50"
                  placeholder="e.g. Software Engineer Resume"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="label text-ink-300 font-bold mb-2">Target Job Title</label>
              <div className="relative">
                <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" />
                <input
                  type="text"
                  className="input-field pl-12 h-12 bg-ink-900/50 border-ink-700/60 focus:border-gold-500/50"
                  placeholder="e.g. Senior Frontend Developer"
                  value={form.targetJobTitle}
                  onChange={e => setForm(f => ({ ...f, targetJobTitle: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="label text-ink-300 font-bold mb-2">Language</label>
              <select
                className="input-field h-12 bg-ink-900/50 border-ink-700/60 focus:border-gold-500/50"
                value={form.language}
                onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <div className="flex gap-4 pt-6">
              <button type="button" onClick={onClose} className="btn-secondary h-12 flex-1">Cancel</button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary h-12 flex-[2] flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-gold-500/10"
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> Preparing...</> : 'Launch Editor'}
              </button>
            </div>
          </div>

          <div>
            <label className="label text-ink-300 font-bold mb-4">Choose Visual Style</label>
            <div className="grid grid-cols-2 gap-4 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
              {templates.map(t => {
                const isLocked = t.isPremium && !isPremiumUser
                return (
                  <div 
                    key={t.templateId}
                    onClick={() => handleSelectTemplate(t)}
                    className={`relative group cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                      form.templateId === t.templateId 
                        ? 'border-gold-500 shadow-xl shadow-gold-500/10 scale-[1.02]' 
                        : isLocked ? 'border-ink-700/40 opacity-80 hover:opacity-100' : 'border-ink-700/60 hover:border-ink-500'
                    }`}
                  >
                    <img src={t.thumbnailUrl} alt={t.name} className="w-full h-32 object-cover transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider truncate">{t.name}</span>
                      {form.templateId === t.templateId && <CheckCircle2 size={14} className="text-gold-400 fill-gold-400/10" />}
                      {isLocked && <Lock size={12} className="text-gold-500/50" />}
                    </div>

                    {t.isPremium && (
                      <div className="absolute top-2 right-2 bg-gold-500 text-ink-900 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                        <Crown size={8} />
                        PRO
                      </div>
                    )}

                    {isLocked && (
                      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="bg-gold-500/20 p-2 rounded-full border border-gold-500/30 text-gold-400">
                           <Lock size={16} />
                         </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </form>
      </div>
      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
    </div>
  )
}
