import { SECTION_META, SECTION_TYPES } from '../../utils/sections'
import { X, Plus } from 'lucide-react'

export default function AddSectionModal({ existingTypes, onAdd, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-sm rounded-2xl border border-stone-200 shadow-2xl animate-slide-up overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div>
            <h3 className="font-semibold text-stone-900 text-[15px]">Add Section</h3>
            <p className="text-xs text-stone-400 mt-0.5">Choose a section type to add</p>
          </div>
          <button onClick={onClose} className="btn-icon"><X size={15} /></button>
        </div>

        {/* List */}
        <div className="p-3 space-y-1 max-h-80 overflow-y-auto">
          {SECTION_TYPES.map(type => {
            const meta = SECTION_META[type]
            const added = existingTypes.includes(type)
            return (
              <button
                key={type}
                disabled={added}
                onClick={() => { onAdd(type); onClose() }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] transition-all duration-150 text-left ${
                  added
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-orange-50 hover:text-orange-700 text-stone-700 active:bg-orange-100'
                }`}
              >
                <span className={`section-pill ${meta.color} text-[10px] flex-shrink-0`}>{meta.icon}</span>
                <span className="font-medium flex-1">{meta.label}</span>
                {added
                  ? <span className="text-[10px] text-stone-300 bg-stone-100 px-2 py-0.5 rounded-full">Added</span>
                  : <Plus size={13} className="text-stone-300" />
                }
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
