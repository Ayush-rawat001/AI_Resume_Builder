import { useState, useEffect } from 'react'
import { useUIStore, useResumeStore } from '../../store'
import { aiApi } from '../../api'
import toast from 'react-hot-toast'
import { X, Sparkles, Loader2, Check, RefreshCw, Zap, Wand2, AlignLeft, List, SearchCheck } from 'lucide-react'

const MODES = [
  { id: 'SUMMARY',  label: 'Summary',  icon: AlignLeft,    desc: 'Write a professional summary' },
  { id: 'BULLETS',  label: 'Bullets',  icon: List,         desc: 'Generate bullet points' },
  { id: 'IMPROVE',  label: 'Improve',  icon: Wand2,        desc: 'Polish existing content' },
  { id: 'ATS',      label: 'ATS Check',icon: SearchCheck,  desc: 'Check job description match' },
]

export default function AiPanel({ targetSection, onApply, onClose }) {
  const { currentResume } = useResumeStore()
  const { aiQuota, setAiQuota } = useUIStore()
  const [mode, setMode] = useState('SUMMARY')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    aiApi.quota().then(q => setAiQuota(q)).catch(() => {})
    if (targetSection?.content) {
      const content = typeof targetSection.content === 'string'
        ? targetSection.content : JSON.stringify(targetSection.content)
      setInput(content.substring(0, 300))
    }
  }, [targetSection])

  const generate = async () => {
    if (!input.trim()) { toast.error('Please provide some input'); return }
    setLoading(true)
    setOutput('')
    try {
      const payload = { resumeId: currentResume?.resumeId, input: input.trim(), sectionType: targetSection?.sectionType }
      let result
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
    toast.success('Applied!')
    onClose()
  }

  const currentMode = MODES.find(m => m.id === mode)

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-stone-200 shadow-2xl animate-slide-up overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md shadow-orange-200 flex-shrink-0">
            <Sparkles size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-stone-900 text-[14px]">AI Assistant</h3>
            <p className="text-[11px] text-stone-400 truncate">
              {targetSection?.title || 'Resume'} · {currentMode?.desc}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {aiQuota !== null && (
              <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-3 py-1">
                <Zap size={11} className="text-orange-500" />
                <span className="text-[11px] font-semibold text-orange-600">{aiQuota} left</span>
              </div>
            )}
            <button onClick={onClose} className="btn-icon"><X size={16} /></button>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 p-3 bg-stone-50 border-b border-stone-100">
          {MODES.map(m => {
            const Icon = m.icon
            return (
              <button
                key={m.id}
                onClick={() => { setMode(m.id); setOutput('') }}
                className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-[11px] font-medium transition-all ${
                  mode === m.id
                    ? 'bg-white text-orange-600 shadow-sm border border-orange-200'
                    : 'text-stone-400 hover:text-stone-700 hover:bg-white/60'
                }`}
              >
                <Icon size={14} className={mode === m.id ? 'text-orange-500' : ''} />
                {m.label}
              </button>
            )
          })}
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="label">
              {mode === 'ATS' ? 'Paste Job Description' : 'Your Input'}
            </label>
            <textarea
              className="input-field resize-none text-sm leading-relaxed"
              rows={4}
              placeholder={
                mode === 'ATS'    ? 'Paste the job description here to check compatibility…' :
                mode === 'SUMMARY'? 'Describe your background, skills, and career goals…' :
                mode === 'BULLETS'? 'Describe your responsibilities or achievements…' :
                'Paste existing content to improve and polish…'
              }
              value={input}
              onChange={e => setInput(e.target.value)}
            />
          </div>

          <button
            onClick={generate}
            disabled={loading || !input.trim()}
            className="btn-primary w-full disabled:opacity-40"
          >
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Generating…</>
              : <><Sparkles size={14} /> Generate {currentMode?.label}</>
            }
          </button>

          {/* Output */}
          {output && (
            <div className="animate-slide-up space-y-3">
              <div className="flex items-center justify-between">
                <label className="label mb-0">Result</label>
                <button onClick={generate} className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-700 transition-colors">
                  <RefreshCw size={11} /> Retry
                </button>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-4 text-[13px] text-stone-700 leading-relaxed whitespace-pre-wrap">
                {output}
              </div>
              {mode !== 'ATS' && (
                <button onClick={apply} className="btn-primary w-full">
                  <Check size={14} /> Apply to Section
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
