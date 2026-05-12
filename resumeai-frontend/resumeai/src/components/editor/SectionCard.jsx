import { useState, useRef, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical, ChevronDown, ChevronUp, Trash2, Sparkles, Check, X
} from 'lucide-react'
import { SECTION_META } from '../../utils/sections'
import { SectionContentEditor } from './SectionEditors'
import { useUIStore } from '../../store'

export default function SectionCard({ section, onUpdate, onDelete, onAiRequest }) {
  const [expanded, setExpanded] = useState(false)
  const [localTitle, setLocalTitle] = useState(section.title || '')
  const [editingTitle, setEditingTitle] = useState(false)
  const { activeSection, setActiveSection } = useUIStore()

  const meta = SECTION_META[section.sectionType] || SECTION_META.CUSTOM
  const isActive = activeSection === section.sectionId

  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: section.sectionId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  const handleContentChange = (newContent) => {
    onUpdate(section.sectionId, { content: newContent })
  }

  const handleTitleSave = () => {
    setEditingTitle(false)
    if (localTitle.trim() !== section.title) {
      onUpdate(section.sectionId, { title: localTitle.trim() })
    }
  }

  const showAi = ['SUMMARY', 'EXPERIENCE'].includes(section.sectionType)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card border transition-all duration-200 ${
        isActive ? 'border-gold-500/40 shadow-lg shadow-gold-500/5' : 'border-ink-700/60 hover:border-ink-600/80'
      } ${isDragging ? 'shadow-2xl shadow-black/40' : ''}`}
    >
      {/* Card header */}
      <div
        className="flex items-center gap-2 p-3 cursor-pointer"
        onClick={() => {
          setExpanded(!expanded)
          setActiveSection(expanded ? null : section.sectionId)
        }}
      >
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="drag-handle text-ink-600 hover:text-ink-400 transition-colors p-1"
          onClick={e => e.stopPropagation()}
        >
          <GripVertical size={15} />
        </div>

        {/* Type badge */}
        <span className={`section-pill ${meta.color} text-[10px] shrink-0`}>
          {meta.icon} {meta.label}
        </span>

        {/* Title */}
        {editingTitle ? (
          <div className="flex-1 flex items-center gap-1" onClick={e => e.stopPropagation()}>
            <input
              autoFocus
              className="input-field py-1 text-xs flex-1"
              value={localTitle}
              onChange={e => setLocalTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleTitleSave(); if (e.key === 'Escape') { setEditingTitle(false); setLocalTitle(section.title) } }}
            />
            <button onClick={handleTitleSave} className="text-jade-400 hover:text-jade-300 p-1"><Check size={13} /></button>
            <button onClick={() => { setEditingTitle(false); setLocalTitle(section.title) }} className="text-rose-400 hover:text-rose-300 p-1"><X size={13} /></button>
          </div>
        ) : (
          <span
            className="flex-1 text-sm text-ink-200 truncate hover:text-white transition-colors cursor-pointer"
            onDoubleClick={(e) => { e.stopPropagation(); setEditingTitle(true) }}
            title="Double-click to rename"
          >
            {section.title || meta.label}
          </span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 ml-auto" onClick={e => e.stopPropagation()}>
          {showAi && (
            <button
              onClick={() => onAiRequest(section)}
              className="p-1.5 text-ink-500 hover:text-gold-400 transition-colors rounded-lg hover:bg-gold-400/10"
              title="Generate with AI"
            >
              <Sparkles size={13} />
            </button>
          )}
          <button
            onClick={() => onDelete(section.sectionId)}
            className="p-1.5 text-ink-500 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-400/10"
            title="Delete section"
          >
            <Trash2 size={13} />
          </button>
          <div className="text-ink-500 p-1">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>

      {/* Expandable editor */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-ink-700/40 pt-3 animate-fade-in">
          <SectionContentEditor
            sectionType={section.sectionType}
            content={section.content}
            onChange={handleContentChange}
          />
        </div>
      )}
    </div>
  )
}
