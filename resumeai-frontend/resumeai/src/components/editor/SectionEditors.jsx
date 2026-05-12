import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

// ─── SUMMARY ──────────────────────────────────────────────────────────────────
export function SummaryEditor({ content, onChange }) {
  const val = typeof content === 'object' ? (content?.summary || '') : (content || '')
  return (
    <div>
      <label className="label">Professional Summary</label>
      <textarea
        className="input-field resize-none"
        rows={5}
        placeholder="Write a compelling summary about your professional background, skills, and career goals…"
        value={val}
        onChange={e => onChange({ summary: e.target.value })}
      />
    </div>
  )
}

// ─── EXPERIENCE ───────────────────────────────────────────────────────────────
export function ExperienceEditor({ content, onChange }) {
  const items = Array.isArray(content) ? content : [{ company: '', title: '', dates: '', description: '' }]

  const update = (idx, field, val) => {
    const next = items.map((it, i) => i === idx ? { ...it, [field]: val } : it)
    onChange(next)
  }

  const add = () => onChange([...items, { company: '', title: '', dates: '', description: '' }])
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx))

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={idx} className="bg-ink-700/30 border border-ink-600/40 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-ink-400 font-medium">Position {idx + 1}</span>
            {items.length > 1 && (
              <button onClick={() => remove(idx)} className="text-ink-500 hover:text-rose-400 transition-colors">
                <Trash2 size={13} />
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Job Title</label>
              <input className="input-field" placeholder="Software Engineer" value={item.title} onChange={e => update(idx, 'title', e.target.value)} />
            </div>
            <div>
              <label className="label">Company</label>
              <input className="input-field" placeholder="Acme Corp" value={item.company} onChange={e => update(idx, 'company', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Dates</label>
            <input className="input-field" placeholder="Jan 2022 – Present" value={item.dates} onChange={e => update(idx, 'dates', e.target.value)} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input-field resize-none" rows={3} placeholder="Describe your responsibilities and achievements…" value={item.description} onChange={e => update(idx, 'description', e.target.value)} />
          </div>
        </div>
      ))}
      <button onClick={add} className="w-full btn-ghost border border-dashed border-ink-600 hover:border-ink-400 flex items-center justify-center gap-2 py-2.5">
        <Plus size={14} /> Add Position
      </button>
    </div>
  )
}

// ─── EDUCATION ────────────────────────────────────────────────────────────────
export function EducationEditor({ content, onChange }) {
  const items = Array.isArray(content) ? content : [{ school: '', degree: '', year: '' }]

  const update = (idx, field, val) => onChange(items.map((it, i) => i === idx ? { ...it, [field]: val } : it))
  const add = () => onChange([...items, { school: '', degree: '', year: '' }])
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx))

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={idx} className="bg-ink-700/30 border border-ink-600/40 rounded-xl p-4 space-y-3">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-ink-400 font-medium">Entry {idx + 1}</span>
            {items.length > 1 && (
              <button onClick={() => remove(idx)} className="text-ink-500 hover:text-rose-400 transition-colors">
                <Trash2 size={13} />
              </button>
            )}
          </div>
          <div>
            <label className="label">School / University</label>
            <input className="input-field" placeholder="MIT" value={item.school} onChange={e => update(idx, 'school', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Degree</label>
              <input className="input-field" placeholder="B.Sc. Computer Science" value={item.degree} onChange={e => update(idx, 'degree', e.target.value)} />
            </div>
            <div>
              <label className="label">Year</label>
              <input className="input-field" placeholder="2020" value={item.year} onChange={e => update(idx, 'year', e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <button onClick={add} className="w-full btn-ghost border border-dashed border-ink-600 hover:border-ink-400 flex items-center justify-center gap-2 py-2.5">
        <Plus size={14} /> Add Education
      </button>
    </div>
  )
}

// ─── SKILLS ───────────────────────────────────────────────────────────────────
export function SkillsEditor({ content, onChange }) {
  const [newSkill, setNewSkill] = useState('')
  const skills = Array.isArray(content)
    ? content
    : (content?.skills || [])

  const add = () => {
    const trimmed = newSkill.trim()
    if (!trimmed || skills.includes(trimmed)) return
    onChange({ skills: [...skills, trimmed] })
    setNewSkill('')
  }

  const remove = (s) => onChange({ skills: skills.filter(x => x !== s) })

  return (
    <div>
      <label className="label">Skills</label>
      <div className="flex gap-2 mb-3">
        <input
          className="input-field flex-1"
          placeholder="e.g. React, TypeScript…"
          value={newSkill}
          onChange={e => setNewSkill(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
        />
        <button onClick={add} className="btn-primary px-3">
          <Plus size={15} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map(s => (
          <span
            key={s}
            className="flex items-center gap-1.5 bg-ink-700/60 border border-ink-600 text-ink-200 text-xs px-3 py-1 rounded-full"
          >
            {s}
            <button onClick={() => remove(s)} className="hover:text-rose-400 transition-colors">
              ×
            </button>
          </span>
        ))}
        {skills.length === 0 && (
          <p className="text-xs text-ink-500">No skills added yet. Type a skill and press Enter.</p>
        )}
      </div>
    </div>
  )
}

// ─── CERTIFICATIONS ───────────────────────────────────────────────────────────
export function CertificationsEditor({ content, onChange }) {
  const items = Array.isArray(content) ? content : [{ title: '', issuer: '' }]
  const update = (idx, field, val) => onChange(items.map((it, i) => i === idx ? { ...it, [field]: val } : it))
  const add = () => onChange([...items, { title: '', issuer: '' }])
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx))

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="bg-ink-700/30 border border-ink-600/40 rounded-xl p-3 space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-ink-400">Cert {idx + 1}</span>
            {items.length > 1 && (
              <button onClick={() => remove(idx)} className="text-ink-500 hover:text-rose-400 transition-colors"><Trash2 size={13} /></button>
            )}
          </div>
          <input className="input-field" placeholder="Certification Title" value={item.title} onChange={e => update(idx, 'title', e.target.value)} />
          <input className="input-field" placeholder="Issuing Organization" value={item.issuer} onChange={e => update(idx, 'issuer', e.target.value)} />
        </div>
      ))}
      <button onClick={add} className="w-full btn-ghost border border-dashed border-ink-600 hover:border-ink-400 flex items-center justify-center gap-2 py-2">
        <Plus size={14} /> Add Certification
      </button>
    </div>
  )
}

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
export function ProjectsEditor({ content, onChange }) {
  const items = Array.isArray(content) ? content : [{ title: '', technologies: '', description: '' }]
  const update = (idx, field, val) => onChange(items.map((it, i) => i === idx ? { ...it, [field]: val } : it))
  const add = () => onChange([...items, { title: '', technologies: '', description: '' }])
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx))

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={idx} className="bg-ink-700/30 border border-ink-600/40 rounded-xl p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-xs text-ink-400">Project {idx + 1}</span>
            {items.length > 1 && (
              <button onClick={() => remove(idx)} className="text-ink-500 hover:text-rose-400 transition-colors"><Trash2 size={13} /></button>
            )}
          </div>
          <input className="input-field" placeholder="Project Name" value={item.title} onChange={e => update(idx, 'title', e.target.value)} />
          <input className="input-field" placeholder="Technologies used (e.g. React, Node.js, PostgreSQL)" value={item.technologies} onChange={e => update(idx, 'technologies', e.target.value)} />
          <textarea className="input-field resize-none" rows={3} placeholder="Describe the project, your role, and impact…" value={item.description} onChange={e => update(idx, 'description', e.target.value)} />
        </div>
      ))}
      <button onClick={add} className="w-full btn-ghost border border-dashed border-ink-600 hover:border-ink-400 flex items-center justify-center gap-2 py-2.5">
        <Plus size={14} /> Add Project
      </button>
    </div>
  )
}

// ─── CONTACT (CUSTOM) ─────────────────────────────────────────────────────────
export function ContactEditor({ content, onChange }) {
  const val = typeof content === 'object' ? content : {}
  return (
    <div className="space-y-3">
      <div>
        <label className="label">Full Name</label>
        <input className="input-field" placeholder="John Doe" value={val.fullName || ''} onChange={e => onChange({ ...val, fullName: e.target.value })} />
      </div>
      <div>
        <label className="label">Email</label>
        <input type="email" className="input-field" placeholder="you@example.com" value={val.email || ''} onChange={e => onChange({ ...val, email: e.target.value })} />
      </div>
      <div>
        <label className="label">Phone</label>
        <input className="input-field" placeholder="+1 234 567 8900" value={val.phone || ''} onChange={e => onChange({ ...val, phone: e.target.value })} />
      </div>
    </div>
  )
}

// ─── LANGUAGES ────────────────────────────────────────────────────────────────
export function LanguagesEditor({ content, onChange }) {
  const items = Array.isArray(content) ? content : [{ language: '', level: '' }]
  const update = (idx, field, val) => onChange(items.map((it, i) => i === idx ? { ...it, [field]: val } : it))
  const add = () => onChange([...items, { language: '', level: '' }])
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx))

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-3 items-center">
          <input className="input-field flex-1" placeholder="Language" value={item.language} onChange={e => update(idx, 'language', e.target.value)} />
          <select className="input-field w-36" value={item.level} onChange={e => update(idx, 'level', e.target.value)}>
            <option value="">Level</option>
            <option value="Native">Native</option>
            <option value="Fluent">Fluent</option>
            <option value="Advanced">Advanced</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Basic">Basic</option>
          </select>
          {items.length > 1 && (
            <button onClick={() => remove(idx)} className="text-ink-500 hover:text-rose-400"><Trash2 size={13} /></button>
          )}
        </div>
      ))}
      <button onClick={add} className="w-full btn-ghost border border-dashed border-ink-600 hover:border-ink-400 flex items-center justify-center gap-2 py-2">
        <Plus size={14} /> Add Language
      </button>
    </div>
  )
}

// ─── DISPATCH ─────────────────────────────────────────────────────────────────
export function SectionContentEditor({ sectionType, content, onChange }) {
  switch (sectionType) {
    case 'SUMMARY':         return <SummaryEditor content={content} onChange={onChange} />
    case 'EXPERIENCE':      return <ExperienceEditor content={content} onChange={onChange} />
    case 'EDUCATION':       return <EducationEditor content={content} onChange={onChange} />
    case 'SKILLS':          return <SkillsEditor content={content} onChange={onChange} />
    case 'CERTIFICATIONS':  return <CertificationsEditor content={content} onChange={onChange} />
    case 'PROJECTS':        return <ProjectsEditor content={content} onChange={onChange} />
    case 'LANGUAGES':       return <LanguagesEditor content={content} onChange={onChange} />
    case 'CUSTOM':          return <ContactEditor content={content} onChange={onChange} />
    default:
      return (
        <textarea
          className="input-field resize-none"
          rows={4}
          placeholder="Enter content…"
          value={typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
          onChange={e => onChange(e.target.value)}
        />
      )
  }
}
