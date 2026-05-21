import { useState } from 'react'
import { useAuthStore, useResumeStore, useTemplateStore } from '../../store'
import { resumeApi, sectionApi } from '../../api'
import { defaultContent, stringifyContent } from '../../utils/sections'
import toast from 'react-hot-toast'
import { X, Loader2, FileText, Briefcase, CheckCircle2, Lock, Crown, Rocket } from 'lucide-react'
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
      await sectionApi.create({ resumeId, sectionType: 'CUSTOM', title: 'Contact', content: stringifyContent(defaultContent('CUSTOM')), displayOrder: 0 })
      await sectionApi.create({ resumeId, sectionType: 'SUMMARY', title: 'Professional Summary', content: stringifyContent(defaultContent('SUMMARY')), displayOrder: 1 })
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white w-full max-w-4xl rounded-3xl border border-stone-200 shadow-2xl animate-slide-up my-auto overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-stone-100">
          <div>
            <h2 className="font-display text-xl font-bold text-stone-900">New Resume</h2>
            <p className="text-sm text-stone-400 mt-0.5">Choose a layout and fill in the basics</p>
          </div>
          <button onClick={onClose} className="btn-icon"><X size={18} /></button>
        </div>

        <form onSubmit={handleCreate} className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Left: Form */}
          <div className="p-8 space-y-5 border-r border-stone-100">
            <div>
              <label className="label">Resume Title</label>
              <div className="relative">
                <FileText size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  className="input-field pl-10"
                  placeholder="e.g. Software Engineer Resume"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required autoFocus
                />
              </div>
            </div>

            <div>
              <label className="label">Target Job Title</label>
              <div className="relative">
                <Briefcase size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  className="input-field pl-10"
                  placeholder="e.g. Senior Frontend Developer"
                  value={form.targetJobTitle}
                  onChange={e => setForm(f => ({ ...f, targetJobTitle: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="label">Language</label>
              <select className="input-field" value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-[2] disabled:opacity-50">
                {loading ? <><Loader2 size={15} className="animate-spin" /> Creating…</> : <><Rocket size={15} /> Launch Editor</>}
              </button>
            </div>
          </div>

          {/* Right: Templates */}
          <div className="p-8">
            <label className="label mb-4">Choose Layout</label>
            <div className="grid grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
              {templates.map(t => {
                const isLocked = t.isPremium && !isPremiumUser
                const isSelected = form.templateId === t.templateId
                return (
                  <div
                    key={t.templateId}
                    onClick={() => handleSelectTemplate(t)}
                    className={`relative group cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-orange-400 shadow-lg shadow-orange-100 scale-[1.02]'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <img src={t.thumbnailUrl} alt={t.name} className="w-full h-28 object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider truncate">{t.name}</span>
                      {isSelected && <CheckCircle2 size={14} className="text-orange-300 flex-shrink-0" />}
                    </div>
                    {t.isPremium && (
                      <div className="absolute top-2 right-2 bg-orange-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Crown size={7} /> PRO
                      </div>
                    )}
                    {isLocked && (
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white rounded-xl p-2 shadow border border-stone-200 text-orange-500">
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
