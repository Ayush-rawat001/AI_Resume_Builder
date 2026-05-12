import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, arrayMove
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

import { useAuthStore, useResumeStore, useTemplateStore, useUIStore } from '../store'
import { resumeApi, sectionApi, templateApi, exportApi } from '../api'
import { parseContent, stringifyContent, defaultContent, SECTION_META } from '../utils/sections'

import LivePreview from '../components/preview/LivePreview'
import SectionCard from '../components/editor/SectionCard'
import AddSectionModal from '../components/editor/AddSectionModal'
import TemplateSwitcher from '../components/template/TemplateSwitcher'
import AiPanel from '../components/ai/AiPanel'

import toast from 'react-hot-toast'
import {
  ArrowLeft, Plus, Download, Sparkles, Palette, Save,
  Eye, EyeOff, Globe, Loader2, ChevronRight, AlertCircle
} from 'lucide-react'

// Debounce hook
function useDebounce(fn, delay) {
  const timer = useRef(null)
  return useCallback((...args) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => fn(...args), delay)
  }, [fn, delay])
}

export default function EditorPage() {
  const { resumeId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    currentResume, sections, setCurrentResume, setSections,
    updateSection, removeSection, addSection, reorderSections,
    isDirty, markClean, reset,
  } = useResumeStore()
  const { templates, setTemplates, selectedTemplate, setSelectedTemplate } = useTemplateStore()
  const { setActiveSection } = useUIStore()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showAddSection, setShowAddSection] = useState(false)
  const [showTemplateSwitcher, setShowTemplateSwitcher] = useState(false)
  const [aiTarget, setAiTarget] = useState(null)
  const [showPreview, setShowPreview] = useState(true)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // ─── Load resume + sections + templates ───────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [resumeData, templateData] = await Promise.all([
          resumeApi.get(resumeId),
          templateApi.list(),
        ])

        const resume = resumeData.resume || resumeData
        const rawSections = resumeData.sections || []

        // Parse section content
        const parsedSections = rawSections
          .map(s => ({ ...s, content: parseContent(s.content) }))
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))

        setCurrentResume(resume)
        setSections(parsedSections)
        setTemplates(Array.isArray(templateData) ? templateData : [])

        // Set template
        const tmpl = templateData.find(t => t.templateId === resume.templateId)
        if (tmpl) setSelectedTemplate(tmpl)

      } catch (err) {
        toast.error('Failed to load resume')
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => reset()
  }, [resumeId])

  // ─── Auto-save sections ───────────────────────────────────────────────────
  const saveChanges = useCallback(async () => {
    if (!isDirty || !currentResume) return
    setSaving(true)
    try {
      const payload = sections.map((s, idx) => ({
        ...s,
        content: stringifyContent(s.content),
        displayOrder: idx,
      }))
      await sectionApi.bulkUpdate(currentResume.resumeId, payload)
      markClean()
    } catch (err) {
      toast.error('Auto-save failed')
    } finally {
      setSaving(false)
    }
  }, [isDirty, currentResume, sections])

  const debouncedSave = useDebounce(saveChanges, 2000)

  useEffect(() => {
    if (isDirty) debouncedSave()
  }, [isDirty, sections])

  // ─── Manual save ──────────────────────────────────────────────────────────
  const handleManualSave = async () => {
    if (!currentResume) return
    setSaving(true)
    try {
      const payload = sections.map((s, idx) => ({
        ...s,
        content: stringifyContent(s.content),
        displayOrder: idx,
      }))
      await sectionApi.bulkUpdate(currentResume.resumeId, payload)
      markClean()
      toast.success('Saved!')
    } catch (err) {
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  // ─── Add section ─────────────────────────────────────────────────────────
  const handleAddSection = async (type) => {
    try {
      const meta = SECTION_META[type]
      const newSec = await sectionApi.create({
        resumeId: Number(resumeId),
        sectionType: type,
        title: meta.label,
        content: stringifyContent(defaultContent(type)),
        displayOrder: sections.length,
      })
      addSection({ ...newSec, content: defaultContent(type) })
      toast.success(`${meta.label} section added`)
    } catch (err) {
      toast.error('Failed to add section')
    }
  }

  // ─── Update section ───────────────────────────────────────────────────────
  const handleUpdateSection = (sectionId, patch) => {
    updateSection(sectionId, patch)
  }

  // ─── Delete section ───────────────────────────────────────────────────────
  const handleDeleteSection = async (sectionId) => {
    if (!confirm('Delete this section?')) return
    try {
      await sectionApi.delete(sectionId)
      removeSection(sectionId)
      toast.success('Section removed')
    } catch (err) {
      toast.error('Failed to delete section from database')
    }
  }

  // ─── DnD end ─────────────────────────────────────────────────────────────
  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = sections.findIndex(s => s.sectionId === active.id)
    const newIdx = sections.findIndex(s => s.sectionId === over.id)
    const reordered = arrayMove(sections, oldIdx, newIdx)
    reorderSections(reordered)
  }

  // ─── Export PDF ───────────────────────────────────────────────────────────
  const handleExportPdf = async () => {
    setExporting(true)
    try {
      const blob = await exportApi.pdf(resumeId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${currentResume?.title || 'resume'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF exported!')
    } catch (err) {
      toast.error('Export failed. Ensure backend is running.')
    } finally {
      setExporting(false)
    }
  }

  // ─── Publish ─────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    try {
      await resumeApi.publish(resumeId)
      setCurrentResume({ ...currentResume, isPublic: true })
      toast.success('Resume published!')
    } catch (err) {
      toast.error('Publish failed')
    }
  }

  // ─── AI apply ────────────────────────────────────────────────────────────
  const handleAiApply = (text) => {
    if (!aiTarget) return
    const { sectionId, sectionType } = aiTarget
    if (sectionType === 'SUMMARY') {
      handleUpdateSection(sectionId, { content: { summary: text } })
    } else if (sectionType === 'EXPERIENCE') {
      // Append as a description to first item
      const current = sections.find(s => s.sectionId === sectionId)
      if (current) {
        const content = parseContent(current.content)
        const arr = Array.isArray(content) ? content : [{}]
        arr[0] = { ...arr[0], description: text }
        handleUpdateSection(sectionId, { content: arr })
      }
    }
    setAiTarget(null)
  }

  const existingTypes = sections.map(s => s.sectionType)

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-900 flex items-center justify-center gap-3 text-ink-400">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Loading editor…</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-900 flex flex-col">
      {/* ─── Top bar ─────────────────────────────────────────────────────── */}
      <header className="h-14 flex items-center px-4 gap-3 border-b border-ink-700/60 bg-ink-800/80 backdrop-blur-sm shrink-0 z-20">
        {/* Back */}
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 text-ink-400 hover:text-white transition-colors mr-2 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm hidden sm:block">Dashboard</span>
        </Link>

        <div className="w-px h-5 bg-ink-700/60" />

        {/* Resume title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-white truncate">
            {currentResume?.title || 'Untitled Resume'}
          </h1>
          <p className="text-[11px] text-ink-500 hidden sm:block">
            {currentResume?.targetJobTitle || 'No job title set'}
          </p>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          {isDirty && !saving && (
            <div className="flex items-center gap-1.5 text-[11px] text-gold-400/70">
              <div className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
              <span className="hidden sm:block">Unsaved</span>
            </div>
          )}
          {saving && (
            <div className="flex items-center gap-1.5 text-[11px] text-ink-400">
              <Loader2 size={11} className="animate-spin" />
              <span className="hidden sm:block">Saving…</span>
            </div>
          )}
          {!isDirty && !saving && (
            <div className="flex items-center gap-1.5 text-[11px] text-jade-400/70 hidden sm:flex">
              <div className="w-1.5 h-1.5 rounded-full bg-jade-400" />
              <span>Saved</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTemplateSwitcher(true)}
            className="btn-ghost flex items-center gap-1.5 text-xs"
            title="Switch template"
          >
            <Palette size={14} />
            <span className="hidden sm:block">Template</span>
          </button>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className="btn-ghost flex items-center gap-1.5 text-xs"
            title="Toggle preview"
          >
            {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            <span className="hidden sm:block">{showPreview ? 'Hide' : 'Preview'}</span>
          </button>

          <button
            onClick={handleManualSave}
            disabled={saving || !isDirty}
            className="btn-ghost flex items-center gap-1.5 text-xs disabled:opacity-40"
          >
            <Save size={14} />
            <span className="hidden sm:block">Save</span>
          </button>

          {!currentResume?.isPublic && (
            <button
              onClick={handlePublish}
              className="btn-ghost flex items-center gap-1.5 text-xs text-jade-400 hover:bg-jade-400/10"
            >
              <Globe size={14} />
              <span className="hidden sm:block">Publish</span>
            </button>
          )}

          <button
            onClick={handleExportPdf}
            disabled={exporting}
            className="btn-primary flex items-center gap-1.5 text-xs"
          >
            {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            <span>Export PDF</span>
          </button>
        </div>
      </header>

      {/* ─── Editor body ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT — Sections panel */}
        <aside className={`flex flex-col border-r border-ink-700/60 bg-ink-800/30 overflow-hidden transition-all duration-300 ${showPreview ? 'w-[420px]' : 'flex-1'}`}>
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink-700/60 shrink-0">
            <span className="text-sm font-semibold text-ink-200">
              Sections
              <span className="ml-2 text-xs font-normal text-ink-500">({sections.length})</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAiTarget({ sectionId: null, sectionType: 'SUMMARY', title: 'AI Assistant' })}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gold-400 bg-gold-400/10 hover:bg-gold-400/20 border border-gold-400/20 rounded-lg transition-all"
              >
                <Sparkles size={12} />
                AI
              </button>
              <button
                onClick={() => setShowAddSection(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-ink-700/60 hover:bg-ink-700 border border-ink-600/60 rounded-lg transition-all"
              >
                <Plus size={12} />
                Add
              </button>
            </div>
          </div>

          {/* Sections list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {sections.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
                <AlertCircle size={24} className="text-ink-600 mb-3" />
                <p className="text-sm text-ink-400 mb-4">No sections yet.<br />Add your first section to get started.</p>
                <button onClick={() => setShowAddSection(true)} className="btn-primary flex items-center gap-2 text-sm">
                  <Plus size={14} /> Add Section
                </button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sections.map(s => s.sectionId)}
                  strategy={verticalListSortingStrategy}
                >
                  {sections.map(section => (
                    <SectionCard
                      key={section.sectionId}
                      section={section}
                      onUpdate={handleUpdateSection}
                      onDelete={handleDeleteSection}
                      onAiRequest={(sec) => setAiTarget(sec)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Drag tip */}
          {sections.length > 1 && (
            <div className="px-4 py-2.5 border-t border-ink-700/40 shrink-0">
              <p className="text-[11px] text-ink-600 text-center">
                ⠿ Drag sections to reorder · Double-click title to rename
              </p>
            </div>
          )}
        </aside>

        {/* RIGHT — Live preview */}
        {showPreview && <LivePreview />}
      </div>

      {/* ─── Modals / Overlays ────────────────────────────────────────────── */}
      {showAddSection && (
        <AddSectionModal
          existingTypes={existingTypes}
          onAdd={handleAddSection}
          onClose={() => setShowAddSection(false)}
        />
      )}

      {showTemplateSwitcher && (
        <TemplateSwitcher onClose={() => setShowTemplateSwitcher(false)} />
      )}

      {aiTarget && (
        <AiPanel
          targetSection={aiTarget}
          onApply={handleAiApply}
          onClose={() => setAiTarget(null)}
        />
      )}
    </div>
  )
}
