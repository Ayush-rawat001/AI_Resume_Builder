import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useResumeStore, useTemplateStore } from '../store'
import { resumeApi, templateApi } from '../api'
import toast from 'react-hot-toast'
import {
  Plus, FileText, Clock, Eye, Loader2, Trash2, ExternalLink,
  Sparkles, TrendingUp, Star
} from 'lucide-react'
import NewResumeModal from '../components/dashboard/NewResumeModal'

const statColor = (atsScore) => {
  if (!atsScore) return 'text-stone-400'
  if (atsScore >= 80) return 'text-orange-500'
  if (atsScore >= 60) return 'text-amber-500'
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
      } catch (err) {
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const openEditor = (id) => navigate(`/editor/${id}`)

  const stats = [
    { label: 'Total Resumes', value: resumes.length, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Published', value: resumes.filter(r => r.isPublic).length, icon: Eye, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
    {
      label: 'Avg ATS Score',
      value: resumes.length
        ? Math.round(resumes.reduce((a, r) => a + (r.atsScore || 0), 0) / resumes.length) + '%'
        : '—',
      icon: TrendingUp,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
  ]

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-stone-400 text-sm mb-1">Welcome back</p>
          <h1 className="font-display text-3xl font-bold text-stone-900">
            Your <span className="text-orange-500">Resumes</span>
          </h1>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          New Resume
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className={`card p-5 flex items-center gap-4 border ${border}`}>
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900 font-mono">{value}</p>
              <p className="text-xs text-stone-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Resume grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48 gap-3 text-stone-400">
          <Loader2 size={20} className="animate-spin text-orange-400" />
          <span className="text-sm">Loading your resumes…</span>
        </div>
      ) : resumes.length === 0 ? (
        <EmptyState onNew={() => setShowNewModal(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume.resumeId}
              resume={resume}
              onOpen={() => openEditor(resume.resumeId)}
            />
          ))}
          {/* New card */}
          <button
            onClick={() => setShowNewModal(true)}
            className="card border-2 border-dashed border-stone-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all duration-300 p-6 flex flex-col items-center justify-center gap-3 min-h-[180px] group"
          >
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-stone-300 group-hover:border-orange-400 flex items-center justify-center transition-colors">
              <Plus size={20} className="text-stone-400 group-hover:text-orange-500 transition-colors" />
            </div>
            <span className="text-sm text-stone-400 group-hover:text-orange-500 transition-colors font-medium">
              Create new resume
            </span>
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
  const formatDate = (iso) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this resume?')) return
    try {
      await resumeApi.delete(resume.resumeId)
      setResumes(resumes.filter(r => r.resumeId !== resume.resumeId))
      toast.success('Resume deleted')
    } catch (err) {
      toast.error('Failed to delete resume')
    }
  }

  return (
    <div
      className="card hover:shadow-md hover:border-orange-200 transition-all duration-300 cursor-pointer group overflow-hidden"
      onClick={onOpen}
    >
      {/* Preview strip */}
      <div className="h-28 bg-gradient-to-br from-orange-50 to-amber-50 border-b border-stone-100 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, #fed7aa 20px, #fed7aa 21px)',
          }}
        />
        <FileText size={36} className="text-orange-300 group-hover:text-orange-400 transition-colors" />
        
        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
           <button onClick={handleDelete} className="p-2 bg-white rounded-lg shadow hover:bg-rose-50 text-rose-400 border border-rose-100" title="Delete">
             <Trash2 size={16} />
           </button>
        </div>

        {resume.isPublic && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-orange-100 border border-orange-200 rounded-full px-2 py-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span className="text-[10px] text-orange-600 font-medium">Public</span>
          </div>
        )}
        {resume.atsScore ? (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/90 rounded-full px-2 py-0.5 border border-stone-200 shadow-sm">
            <Star size={10} className={statColor(resume.atsScore)} />
            <span className={`text-[10px] font-mono font-bold ${statColor(resume.atsScore)}`}>
              {resume.atsScore}
            </span>
          </div>
        ) : null}
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-stone-800 text-base truncate group-hover:text-orange-600 transition-colors mb-1">
          {resume.title || 'Untitled Resume'}
        </h3>
        {resume.targetJobTitle && (
          <p className="text-xs text-stone-400 truncate mb-3">{resume.targetJobTitle}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-stone-400">
            <Clock size={11} />
            <span className="text-[11px]">{formatDate(resume.updatedAt)}</span>
          </div>
          <div className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
            resume.status === 'COMPLETE'
              ? 'text-orange-600 bg-orange-50 border-orange-200'
              : 'text-amber-600 bg-amber-50 border-amber-200'
          }`}>
            {resume.status || 'DRAFT'}
          </div>
        </div>

        <button className="w-full mt-4 flex items-center justify-center gap-2 text-xs text-stone-500 hover:text-orange-600 bg-stone-50 hover:bg-orange-50 rounded-lg py-2 transition-all duration-200 border border-stone-200 hover:border-orange-200">
          <ExternalLink size={12} />
          Open Editor
        </button>
      </div>
    </div>
  )
}

function EmptyState({ onNew }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-6">
        <Sparkles size={32} className="text-orange-400" />
      </div>
      <h3 className="font-display text-xl font-bold text-stone-900 mb-2">No resumes yet</h3>
      <p className="text-stone-400 text-sm max-w-sm mb-6">
        Start building your first AI-powered resume. It only takes a few minutes.
      </p>
      <button onClick={onNew} className="btn-primary flex items-center gap-2">
        <Plus size={16} />
        Create your first resume
      </button>
    </div>
  )
}
