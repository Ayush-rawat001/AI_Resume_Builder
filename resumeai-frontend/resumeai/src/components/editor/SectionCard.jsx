import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, ChevronDown, ChevronUp, Trash2, Sparkles, Check, X, Pencil } from 'lucide-react'
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
  const showAi = ['SUMMARY', 'EXPERIENCE'].includes(section.sectionType)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.sectionId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  const handleContentChange = (newContent) => onUpdate(section.sectionId, { content: newContent })
  const handleTitleSave = () => {
    setEditingTitle(false)
    if (localTitle.trim() !== section.title) onUpdate(section.sectionId, { title: localTitle.trim() })
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
        isActive
          ? 'border-orange-300 shadow-md shadow-orange-100'
          : 'border-stone-200 hover:border-stone-300'
      } ${isDragging ? 'shadow-2xl shadow-black/20 rotate-1' : ''}`}
    >
      {/* Header row */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none"
        onClick={() => { setExpanded(!expanded); setActiveSection(expanded ? null : section.sectionId) }}
      >
        {/* Drag handle */}
        <div
          {...attributes} {...listeners}
          className="drag-handle p-1 text-stone-300 hover:text-stone-400 transition-colors flex-shrink-0"
          onClick={e => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </div>

        {/* Section type pill */}
        <span className={`section-pill ${meta.color} flex-shrink-0`}>
          {meta.icon}
        </span>

        {/* Title */}
        {editingTitle ? (
          <div className="flex-1 flex items-center gap-1" onClick={e => e.stopPropagation()}>
            <input
              autoFocus
              className="input-field py-1 text-xs flex-1 h-7"
              value={localTitle}
              onChange={e => setLocalTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleTitleSave()
                if (e.key === 'Escape') { setEditingTitle(false); setLocalTitle(section.title) }
              }}
            />
            <button onClick={handleTitleSave} className="w-6 h-6 rounded-lg bg-orange-500 text-white flex items-center justify-center hover:bg-orange-400 transition-colors">
              <Check size={11} />
            </button>
            <button onClick={() => { setEditingTitle(false); setLocalTitle(section.title) }} className="w-6 h-6 rounded-lg bg-stone-100 text-stone-500 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-colors">
              <X size={11} />
            </button>
          </div>
        ) : (
          <span
            className="flex-1 text-[13px] font-medium text-stone-700 truncate"
            onDoubleClick={e => { e.stopPropagation(); setEditingTitle(true) }}
            title="Double-click to rename"
          >
            {section.title || meta.label}
          </span>
        )}

        {/* Action icons */}
        <div className="flex items-center gap-0.5 ml-auto flex-shrink-0" onClick={e => e.stopPropagation()}>
          {!editingTitle && (
            <button
              onClick={() => setEditingTitle(true)}
              className="btn-icon w-7 h-7 rounded-lg"
              title="Rename"
            >
              <Pencil size={11} />
            </button>
          )}
          {showAi && (
            <button
              onClick={() => onAiRequest(section)}
              className="btn-icon-orange w-7 h-7 rounded-lg"
              title="AI generate"
            >
              <Sparkles size={12} />
            </button>
          )}
          <button
            onClick={() => onDelete(section.sectionId)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
          <div className="w-6 h-6 flex items-center justify-center text-stone-400">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div className="border-t border-stone-100 px-3 pb-3 pt-3 animate-fade-in">
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
