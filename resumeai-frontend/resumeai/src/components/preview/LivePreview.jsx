import { useEffect, useRef, useMemo } from 'react'
import { useResumeStore, useTemplateStore } from '../../store'
import { injectDataIntoTemplate } from '../../utils/sections'

export default function LivePreview() {
  const { currentResume, sections } = useResumeStore()
  const { selectedTemplate } = useTemplateStore()
  const iframeRef = useRef(null)

  const html = useMemo(() => {
    if (!currentResume) return '<html><body style="font-family:sans-serif;color:#999;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f8f8f8"><p>Loading preview…</p></body></html>'
    return injectDataIntoTemplate(
      selectedTemplate?.htmlLayout || null,
      selectedTemplate?.cssStyles || null,
      currentResume,
      sections,
    )
  }, [currentResume, sections, selectedTemplate])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) return
    doc.open()
    doc.write(html)
    doc.close()
  }, [html])

  return (
    <div className="flex-1 bg-ink-900 flex flex-col overflow-hidden">
      {/* Preview header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-ink-700/60 bg-ink-800/60">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-gold-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-jade-500/60" />
          </div>
          <span className="text-xs text-ink-400 ml-2 font-mono">preview.html</span>
        </div>
        <span className="text-[11px] text-ink-500">
          {selectedTemplate?.name || 'Default Template'} · Live
        </span>
      </div>

      {/* Iframe wrapper with paper shadow */}
      <div className="flex-1 overflow-auto bg-ink-950 flex items-start justify-center p-6">
        <div
          className="bg-white rounded-sm shadow-2xl shadow-black/60 overflow-hidden transition-all duration-300"
          style={{ width: '100%', maxWidth: '680px', minHeight: '900px' }}
        >
          <iframe
            ref={iframeRef}
            title="Resume Preview"
            className="w-full block"
            style={{ height: '1100px', border: 'none' }}
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      </div>
    </div>
  )
}
