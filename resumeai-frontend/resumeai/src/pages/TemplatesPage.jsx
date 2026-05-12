import { useEffect, useState } from 'react'
import { useTemplateStore, useAuthStore } from '../store'
import { templateApi } from '../api'
import toast from 'react-hot-toast'
import { Loader2, Lock, Palette, Crown, ChevronRight } from 'lucide-react'
import PricingModal from '../components/premium/PricingModal'

export default function TemplatesPage() {
  const { templates, setTemplates } = useTemplateStore()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(!templates.length)
  const [filter, setFilter] = useState('all')
  const [showPricing, setShowPricing] = useState(false)

  const isPremiumUser = user?.subscriptionPlan === 'PREMIUM'

  useEffect(() => {
    if (templates.length) return
    templateApi.list()
      .then(data => setTemplates(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load templates'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = templates.filter(t => {
    if (filter === 'free') return !t.isPremium
    if (filter === 'premium') return t.isPremium
    return true
  })

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Palette size={20} className="text-gold-400" />
          <h1 className="font-display text-3xl font-bold text-white">
            Resume <span className="text-gold-400">Templates</span>
          </h1>
        </div>
        <p className="text-ink-400 text-sm">
          Choose a template to use when creating your next resume.
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {['all', 'free', 'premium'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all duration-200 ${
              filter === f
                ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                : 'text-ink-400 hover:text-white border border-ink-700/60 hover:border-ink-500'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 gap-3 text-ink-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Loading templates…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-ink-400">
          <Palette size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No templates available</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 stagger-children">
          {filtered.map(template => {
            const isLocked = template.isPremium && !isPremiumUser

            return (
              <div 
                key={template.templateId} 
                onClick={() => isLocked && setShowPricing(true)}
                className={`card overflow-hidden group transition-all duration-300 ${
                  isLocked ? 'cursor-pointer hover:border-gold-500/50' : 'hover:border-ink-500/60'
                }`}
              >
                {/* Preview */}
                <div className="aspect-[3/4] bg-gradient-to-br from-ink-700 to-ink-800 relative flex items-center justify-center overflow-hidden">
                  {template.thumbnailUrl ? (
                    <img src={template.thumbnailUrl} alt={template.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="text-center p-4">
                      <div className="text-4xl mb-2 text-ink-500">📄</div>
                      <div className="text-xs text-ink-500 font-mono uppercase tracking-widest">{template.category || 'CLASSIC'}</div>
                    </div>
                  )}

                  {/* PRO Badge */}
                  {template.isPremium && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-gold-500 text-ink-900 rounded-full px-2.5 py-1 shadow-lg z-10">
                      <Crown size={10} className="fill-ink-900" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">PRO</span>
                    </div>
                  )}

                  {/* Lock Overlay for Free Users */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-ink-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-12 h-12 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-400 mb-3 shadow-2xl">
                        <Lock size={20} />
                      </div>
                      <span className="text-[10px] font-bold text-gold-400 uppercase tracking-widest text-center">Upgrade to Unlock</span>
                    </div>
                  )}

                  {!isLocked && (
                    <div className="absolute inset-0 bg-gold-400/0 group-hover:bg-gold-400/5 transition-all duration-300" />
                  )}
                </div>

                <div className="p-4 border-t border-ink-700/50 bg-ink-800/30">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-gold-400 transition-colors">{template.name}</p>
                      <p className="text-[11px] text-ink-500 mt-0.5">
                        {template.category || 'Professional Design'}
                      </p>
                    </div>
                    {isLocked ? (
                      <div className="text-gold-500/50">
                        <Lock size={14} />
                      </div>
                    ) : (
                      <div className="text-ink-500 group-hover:text-jade-400 transition-colors">
                        <ChevronRight size={16} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
    </div>
  )
}
