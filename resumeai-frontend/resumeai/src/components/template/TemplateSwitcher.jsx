import { useTemplateStore, useResumeStore } from '../../store'
import { resumeApi } from '../../api'
import toast from 'react-hot-toast'
import { X, Lock, CheckCircle2, Palette } from 'lucide-react'

export default function TemplateSwitcher({ onClose }) {
  const { templates, selectedTemplate, setSelectedTemplate } = useTemplateStore()
  const { currentResume, updateCurrentResume } = useResumeStore()

  const applyTemplate = async (template) => {
    try {
      // Optimistic update
      setSelectedTemplate(template)
      updateCurrentResume({ templateId: template.templateId })
      
      // Persist to backend
      await resumeApi.update(currentResume.resumeId, { templateId: template.templateId })
      
      toast.success(`Template "${template.name}" applied`)
    } catch (err) {
      toast.error('Failed to update template in database')
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-2xl max-h-[80vh] overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-ink-700/60">
          <div className="flex items-center gap-3">
            <Palette size={18} className="text-gold-400" />
            <h3 className="font-display font-bold text-white text-lg">Choose Template</h3>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={14} /></button>
        </div>

        {/* Templates grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-4">
          {templates.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-ink-400 text-sm">
              No templates available
            </div>
          ) : (
            templates.map(template => {
              const isSelected = selectedTemplate?.templateId === template.templateId ||
                currentResume?.templateId === template.templateId
              return (
                <button
                  key={template.templateId}
                  onClick={() => applyTemplate(template)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 group ${
                    isSelected
                      ? 'border-gold-400 shadow-lg shadow-gold-500/20'
                      : 'border-ink-700/60 hover:border-ink-500'
                  }`}
                >
                  {/* Preview */}
                  <div className="aspect-[3/4] bg-gradient-to-br from-ink-700 to-ink-800 flex items-center justify-center relative">
                    {template.thumbnailUrl ? (
                      <img src={template.thumbnailUrl} alt={template.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-ink-500 text-center p-4">
                        <div className="text-2xl mb-2">📄</div>
                        <div className="text-[10px] font-mono">{template.category || 'CLASSIC'}</div>
                      </div>
                    )}

                    {/* Premium badge */}
                    {template.isPremium && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-gold-500/90 rounded-full px-2 py-0.5">
                        <Lock size={9} className="text-ink-900" />
                        <span className="text-[9px] text-ink-900 font-bold">PRO</span>
                      </div>
                    )}

                    {/* Selected overlay */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-gold-400/10 flex items-center justify-center">
                        <CheckCircle2 size={28} className="text-gold-400" />
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <div className="bg-ink-800 p-2.5 border-t border-ink-700/60">
                    <p className="text-xs font-medium text-ink-200 truncate">{template.name}</p>
                    <p className="text-[10px] text-ink-500">
                      {template.usageCount ? `${template.usageCount} uses` : template.category || 'Classic'}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
