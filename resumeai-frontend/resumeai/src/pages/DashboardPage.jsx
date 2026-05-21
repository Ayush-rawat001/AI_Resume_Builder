import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useResumeStore, useTemplateStore } from '../store'
import { resumeApi, templateApi } from '../api'
import toast from 'react-hot-toast'
import {
  Plus, FileText, Clock, Eye, Loader2, Trash2, ExternalLink,
  Sparkles, TrendingUp, Star, MoreVertical
} from 'lucide-react'
import NewResumeModal from '../components/dashboard/NewResumeModal'

const atsColor = (s) => {
  if (!s) return 'text-stone-400'
  if (s >= 80) return 'text-emerald-500'
  if (s >= 60) return 'text-amber-500'
  return 'text-rose-500'
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { resumes, setResumes } = useResumeStore()
  const { setTemplates } = useTemplateStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [showNewModal, setShowNewModal] = useState(false)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        const [resumeData, templateData] = await Promise.all([
          resumeApi.getByUser(user.userId),
          templateApi.list(),
        ])
        setResumes(Array.isArray(resumeData) ? resumeData : [])
        setTemplates(Array.isArray(templateData) ? templateData : [])
      } catch { toast.error('Failed to load data') }
      finally { setLoading(false) }
    }
    load()
  }, [user])

  const stats = [
    { label: 'Total Resumes', value: resumes.length, icon: FileText, bg: 'bg-blue-50', color: 'text-blue-500', ring: 'ring-blue-100' },
    { label: 'Published', value: resumes.filter(r => r.isPublic).length, icon: Eye, bg: 'bg-orange-50', color: 'text-orange-500', ring: 'ring-orange-100' },
    {
      label: 'Avg ATS Score',
      value: resumes.length ? Math.round(resumes.reduce((a, r) => a + (r.atsScore || 0), 0) / resumes.length) + '%' : '—',
      icon: TrendingUp, bg: 'bg-emerald-50', color: 'text-emerald-500', ring: 'ring-emerald-100'
    },
  ]

  return (
    <div className="p-8 animate-fade-in max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-stone-400 text-sm mb-0.5">Welcome back, {user?.email?.split('@')[0]} 👋</p>
          <h1 className="font-display text-2xl font-bold text-stone-900">
            My Resumes
          </h1>
        </div>
        <button onClick={() => setShowNewModal(true)} className="btn-primary">
          <Plus size={15} />
          New Resume
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, bg, color, ring }) => (
          <div key={label} className={`card p-5 flex items-center gap-4 ring-1 ${ring}`}>
            <div className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center ${color} flex-shrink-0`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-[22px] font-bold text-stone-900 font-mono leading-none">{value}</p>
              <p className="text-xs text-stone-400 mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48 gap-3 text-stone-400">
          <Loader2 size={18} className="animate-spin text-orange-400" />
          <span className="text-sm">Loading resumes…</span>
        </div>
      ) : resumes.length === 0 ? (
        <EmptyState onNew={() => setShowNewModal(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {resumes.map(resume => (
            <ResumeCard
              key={resume.resumeId}
              resume={resume}
              onOpen={() => navigate(`/editor/${resume.resumeId}`)}
            />
          ))}
          {/* Add card */}
          <button
            onClick={() => setShowNewModal(true)}
            className="card border-2 border-dashed border-stone-200 hover:border-orange-300 hover:bg-orange-50/40 transition-all duration-200 p-6 flex flex-col items-center justify-center gap-3 min-h-[200px] group"
          >
            <div className="w-12 h-12 rounded-2xl bg-stone-100 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
              <Plus size={22} className="text-stone-400 group-hover:text-orange-500 transition-colors" />
            </div>
            <span className="text-sm text-stone-400 group-hover:text-orange-500 font-medium transition-colors">New resume</span>
          </button>
        </div>
      )}

      {showNewModal && (
        <NewResumeModal
          onClose={() => setShowNewModal(false)}
          onCreated={(id) => { setShowNewModal(false); navigate(`/editor/${id}`) }}
        />
      )}
    </div>
  )
}

function ResumeCard({ resume, onOpen }) {
  const { resumes, setResumes } = useResumeStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

  const handleDelete = async (e) => {
    e.stopPropagation()
    setMenuOpen(false)
    if (!confirm('Delete this resume?')) return
    try {
      await resumeApi.delete(resume.resumeId)
      setResumes(resumes.filter(r => r.resumeId !== resume.resumeId))
      toast.success('Deleted')
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div
      className="card hover:shadow-md hover:border-stone-300 transition-all duration-200 cursor-pointer group overflow-hidden flex flex-col"
      onClick={onOpen}
    >
      {/* Preview area */}
      <div className="h-32 bg-gradient-to-135 from-orange-50 via-amber-50 to-stone-50 relative overflow-hidden flex items-center justify-center flex-shrink-0">
        {/* dot grid */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #d4cfc8 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
        <div className="relative w-16 h-20 bg-white rounded-lg shadow-md border border-stone-200 flex flex-col p-2 gap-1">
          <div className="h-1.5 bg-orange-300 rounded-full w-8" />
          <div className="h-1 bg-stone-200 rounded-full w-full" />
          <div className="h-1 bg-stone-200 rounded-full w-3/4" />
          <div className="h-px bg-stone-100 w-full my-0.5" />
          <div className="h-1 bg-stone-200 rounded-full w-full" />
          <div className="h-1 bg-stone-200 rounded-full w-5/6" />
          <div className="h-1 bg-stone-200 rounded-full w-4/5" />
        </div>

        {/* Badges */}
        {resume.isPublic && (
          <div className="absolute top-2.5 right-2.5 tag-green">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Public
          </div>
        )}
        {resume.atsScore ? (
          <div className="absolute top-2.5 left-2.5 badge bg-white border border-stone-200 shadow-sm">
            <Star size={9} className={atsColor(resume.atsScore)} fill="currentColor" />
            <span className={`font-mono font-bold text-[10px] ${atsColor(resume.atsScore)}`}>{resume.atsScore}</span>
          </div>
        ) : null}

        {/* Menu btn */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-7 h-7 rounded-lg bg-white shadow border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors"
            >
              <MoreVertical size={13} className="text-stone-500" />
            </button>
            {menuOpen && (
              <div className="absolute bottom-8 right-0 bg-white border border-stone-200 rounded-xl shadow-xl py-1 w-32 z-10">
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-stone-800 text-[14px] truncate group-hover:text-orange-600 transition-colors">
          {resume.title || 'Untitled Resume'}
        </h3>
        {resume.targetJobTitle && (
          <p className="text-xs text-stone-400 truncate mt-0.5">{resume.targetJobTitle}</p>
        )}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-stone-400">
            <Clock size={11} />
            <span className="text-[11px]">{formatDate(resume.updatedAt)}</span>
          </div>
          <span className={`badge ${resume.status === 'COMPLETE' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-stone-100 text-stone-500 border-stone-200'}`}>
            {resume.status || 'DRAFT'}
          </span>
        </div>
        <button className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-stone-500 hover:text-orange-600 bg-stone-50 hover:bg-orange-50 border border-stone-200 hover:border-orange-200 rounded-xl py-2 transition-all">
          <ExternalLink size={11} /> Open Editor
        </button>
      </div>
    </div>
  )
}

function EmptyState({ onNew }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-3xl bg-orange-50 border-2 border-orange-100 flex items-center justify-center mb-5">
        <Sparkles size={30} className="text-orange-400" />
      </div>
      <h3 className="font-display text-xl font-bold text-stone-800 mb-2">No resumes yet</h3>
      <p className="text-stone-400 text-sm max-w-xs mb-6">
        Build your first AI-powered resume in minutes.
      </p>
      <button onClick={onNew} className="btn-primary">
        <Plus size={15} /> Create your first resume
      </button>
    </div>
  )
}
