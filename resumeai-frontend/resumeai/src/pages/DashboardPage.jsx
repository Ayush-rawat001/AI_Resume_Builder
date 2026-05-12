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
  if (!atsScore) return 'text-ink-400'
  if (atsScore >= 80) return 'text-jade-400'
  if (atsScore >= 60) return 'text-gold-400'
  return 'text-rose-400'
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
    { label: 'Total Resumes', value: resumes.length, icon: FileText, color: 'text-blue-400' },
    { label: 'Published', value: resumes.filter(r => r.isPublic).length, icon: Eye, color: 'text-jade-400' },
    {
      label: 'Avg ATS Score',
      value: resumes.length
        ? Math.round(resumes.reduce((a, r) => a + (r.atsScore || 0), 0) / resumes.length) + '%'
        : '—',
      icon: TrendingUp,
      color: 'text-gold-400',
    },
  ]

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-ink-400 text-sm mb-1">Welcome back</p>
          <h1 className="font-display text-3xl font-bold text-white">
            Your <span className="text-gold-400">Resumes</span>
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
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-ink-700/60 flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white font-mono">{value}</p>
              <p className="text-xs text-ink-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Resume grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48 gap-3 text-ink-400">
          <Loader2 size={20} className="animate-spin" />
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
            className="card border-dashed border-ink-600/60 hover:border-gold-500/40 hover:bg-gold-500/5 transition-all duration-300 p-6 flex flex-col items-center justify-center gap-3 min-h-[180px] group"
          >
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-ink-600 group-hover:border-gold-400/60 flex items-center justify-center transition-colors">
              <Plus size={20} className="text-ink-500 group-hover:text-gold-400 transition-colors" />
            </div>
            <span className="text-sm text-ink-400 group-hover:text-gold-400 transition-colors font-medium">
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

  const handleDuplicate = async (e) => {
    e.stopPropagation()
    try {
      const duplicate = await resumeApi.duplicate(resume.resumeId)
      setResumes([duplicate, ...resumes])
      toast.success('Resume duplicated')
    } catch (err) {
      toast.error('Failed to duplicate resume')
    }
  }

  return (
    <div
      className="card hover:border-ink-500/60 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 cursor-pointer group overflow-hidden"
      onClick={onOpen}
    >
      {/* Preview strip */}
      <div className="h-28 bg-gradient-to-br from-ink-700/80 to-ink-800/80 border-b border-ink-700/60 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, #e8b422 20px, #e8b422 21px)',
          }}
        />
        <FileText size={36} className="text-ink-500 group-hover:text-ink-400 transition-colors" />
        
        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-ink-900/60 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
           <button onClick={handleDuplicate} className="p-2 bg-ink-800 rounded-lg hover:bg-ink-700 text-gold-400" title="Duplicate">
             <Sparkles size={16} />
           </button>
           <button onClick={handleDelete} className="p-2 bg-ink-800 rounded-lg hover:bg-rose-500/20 text-rose-400" title="Delete">
             <Trash2 size={16} />
           </button>
        </div>

        {resume.isPublic && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-jade-500/20 border border-jade-500/30 rounded-full px-2 py-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-jade-400" />
            <span className="text-[10px] text-jade-400 font-medium">Public</span>
          </div>
        )}
        {resume.atsScore ? (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-ink-800/80 rounded-full px-2 py-0.5 border border-ink-600/60">
            <Star size={10} className={statColor(resume.atsScore)} />
            <span className={`text-[10px] font-mono font-bold ${statColor(resume.atsScore)}`}>
              {resume.atsScore}
            </span>
          </div>
        ) : null}
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-white text-base truncate group-hover:text-gold-300 transition-colors mb-1">
          {resume.title || 'Untitled Resume'}
        </h3>
        {resume.targetJobTitle && (
          <p className="text-xs text-ink-400 truncate mb-3">{resume.targetJobTitle}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-ink-500">
            <Clock size={11} />
            <span className="text-[11px]">{formatDate(resume.updatedAt)}</span>
          </div>
          <div className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
            resume.status === 'COMPLETE'
              ? 'text-jade-400 bg-jade-400/10 border-jade-400/20'
              : 'text-gold-400 bg-gold-400/10 border-gold-400/20'
          }`}>
            {resume.status || 'DRAFT'}
          </div>
        </div>

        <button className="w-full mt-4 flex items-center justify-center gap-2 text-xs text-ink-400 hover:text-white bg-ink-700/40 hover:bg-ink-700 rounded-lg py-2 transition-all duration-200 group-hover:border-ink-600 border border-transparent">
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
      <div className="w-20 h-20 rounded-2xl bg-ink-800/60 border border-ink-700/60 flex items-center justify-center mb-6">
        <Sparkles size={32} className="text-ink-500" />
      </div>
      <h3 className="font-display text-xl font-bold text-white mb-2">No resumes yet</h3>
      <p className="text-ink-400 text-sm max-w-sm mb-6">
        Start building your first AI-powered resume. It only takes a few minutes.
      </p>
      <button onClick={onNew} className="btn-primary flex items-center gap-2">
        <Plus size={16} />
        Create your first resume
      </button>
    </div>
  )
}
