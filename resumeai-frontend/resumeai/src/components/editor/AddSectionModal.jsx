import { SECTION_META, SECTION_TYPES } from '../../utils/sections'
import { X } from 'lucide-react'

export default function AddSectionModal({ existingTypes, onAdd, onClose }) {
  const available = SECTION_TYPES

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-sm p-5 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white text-base">Add Section</h3>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={14} /></button>
        </div>
        <div className="space-y-1.5">
          {available.map(type => {
            const meta = SECTION_META[type]
            const added = existingTypes.includes(type)
            return (
              <button
                key={type}
                disabled={added}
                onClick={() => { onAdd(type); onClose() }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  added
                    ? 'opacity-40 cursor-not-allowed text-ink-500'
                    : 'hover:bg-ink-700/60 text-ink-200 hover:text-white'
                }`}
              >
                <span className={`section-pill ${meta.color} text-[10px]`}>{meta.icon}</span>
                <span className="font-medium">{meta.label}</span>
                {added && <span className="ml-auto text-[11px] text-ink-500">Added</span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
