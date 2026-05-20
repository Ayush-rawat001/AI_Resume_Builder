import { useState, useEffect } from 'react'
import { useUIStore, useResumeStore } from '../../store'
import { aiApi } from '../../api'
import { parseContent } from '../../utils/sections'
import toast from 'react-hot-toast'
import { X, Sparkles, Loader2, Check, RefreshCw, Zap } from 'lucide-react'

export default function AiPanel({ targetSection, onApply, onClose }) {
  const { currentResume } = useResumeStore()
  const { aiQuota, setAiQuota } = useUIStore()
  const [mode, setMode] = useState('SUMMARY') // SUMMARY, BULLETS, IMPROVE, ATS
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    aiApi.quota().then(q => setAiQuota(q)).catch(() => {})
    if (targetSection?.content) {
       const content = typeof targetSection.content === 'string' ? targetSection.content : JSON.stringify(targetSection.content);
       setInput(content.substring(0, 200));
    }
  }, [targetSection])

  const generate = async () => {
    if (!input.trim()) { toast.error('Please provide some input'); return }
    setLoading(true)
    setOutput('')
    try {
      const payload = {
        resumeId: currentResume?.resumeId,
        input: input.trim(),
        sectionType: targetSection?.sectionType
      }

      let result;
      if (mode === 'SUMMARY') result = await aiApi.generateSummary(payload)
      else if (mode === 'BULLETS') result = await aiApi.generateBullets(payload)
      else if (mode === 'IMPROVE') result = await aiApi.improve(payload)
      else if (mode === 'ATS') result = await aiApi.checkAts(payload)

      setOutput(result)
      aiApi.quota().then(q => setAiQuota(q)).catch(() => {})
    } catch (err) {
      toast.error(err.message || 'AI generation failed')
    } finally {
      setLoading(false)
    }
  }

  const apply = () => {
    if (!output) return
    onApply(output)
    toast.success('AI content applied!')
    onClose()
  }

  const modes = [
    { id: 'SUMMARY', label: 'Summary' },
    { id: 'BULLETS', label: 'Bullets' },
    { id: 'IMPROVE', label: 'Improve' },
    { id: 'ATS', label: 'ATS Check' },
  ]

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg animate-slide-up overflow-hidden rounded-2xl border border-stone-200 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-stone-100 bg-gradient-to-r from-orange-50 to-transparent">
          <div className="w-8 h-8 rounded-lg bg-orange-100 border border-orange-200 flex items-center justify-center">
            <Sparkles size={15} className="text-orange-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-stone-800 text-sm">AI Assistant</h3>
            <p className="text-xs text-stone-400">Target: <span className="text-orange-500">{targetSection?.title || 'Resume'}</span></p>
          </div>
          <div className="flex items-center gap-2">
            {aiQuota !== null && (
              <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-3 py-1">
                <Zap size={11} className="text-orange-500" />
                <span className="text-xs text-stone-600">{aiQuota} left</span>
              </div>
            )}
            <button onClick={onClose} className="btn-ghost p-1.5"><X size={14} /></button>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex border-b border-stone-100 bg-stone-50">
          {modes.map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex-1 py-2.5 text-[11px] font-medium transition-colors ${
                mode === m.id ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-50' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="label">
              {mode === 'ATS' ? 'Paste Job Description' : 'Input Details'}
            </label>
            <textarea
              className="input-field resize-none text-sm"
              rows={4}
              placeholder={
                mode === 'ATS' ? "Paste the job description here to check compatibility..." :
                mode === 'SUMMARY' ? "Describe your professional background..." :
                "Enter details or paste existing content to improve..."
              }
              value={input}
              onChange={e => setInput(e.target.value)}
            />
          </div>

          <button
            onClick={generate}
            disabled={loading || !input.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin" /> Working…</>
            ) : (
              <><Sparkles size={14} /> Run AI {modes.find(m => m.id === mode).label}</>
            )}
          </button>

          {/* Output */}
          {output && (
            <div className="animate-fade-in space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="label mb-0">Result</label>
                <button onClick={generate} className="text-[11px] text-stone-400 hover:text-stone-700 flex items-center gap-1">
                   <RefreshCw size={11} /> Retry
                </button>
              </div>
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">
                {output}
              </div>
              {mode !== 'ATS' && (
                <button
                  onClick={apply}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <Check size={14} /> Apply Changes
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
