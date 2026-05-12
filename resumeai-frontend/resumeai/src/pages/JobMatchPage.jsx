import { useEffect, useState } from 'react'
import { useAuthStore } from '../store'
import { resumeApi, jobSearchApi, sectionApi } from '../api'
import toast from 'react-hot-toast'
import { 
  Briefcase, Search, Loader2, Sparkles, Target, 
  ChevronRight, ExternalLink, Bookmark, CheckCircle2,
  AlertCircle, ArrowLeft, Trophy
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function JobMatchPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  
  const [resumes, setResumes] = useState([])
  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [loadingResumes, setLoadingResumes] = useState(true)
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => {
    if (!user) return
    
    // Load resumes and history in parallel
    Promise.all([
      resumeApi.getByUser(user.userId),
      jobSearchApi.history()
    ]).then(([resList, histList]) => {
      setResumes(resList)
      if (resList.length > 0) setSelectedResumeId(resList[0].resumeId)
      setHistory(histList)
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setLoadingResumes(false))
  }, [user])

  const handleSearch = async () => {
    if (!selectedResumeId) return toast.error('Please select a resume')
    
    setSearching(true)
    setResults(null)
    try {
      // 1. Get resume sections to extract skills
      const sections = await sectionApi.getByResume(selectedResumeId)
      const skillsSection = sections.find(s => s.sectionType === 'SKILLS' || s.title.toLowerCase().includes('skills'))
      
      // If no skills section found, use job title and summary words
      let skills = ''
      if (skillsSection) {
        try {
          const content = JSON.parse(skillsSection.content)
          // Handle: ["a", "b"] OR {"skills": ["a", "b"]} OR {"items": ["a", "b"]}
          const items = Array.isArray(content) ? content : (content.skills || content.items || [])
          
          if (Array.isArray(items)) {
            skills = items.map(s => (typeof s === 'object' ? (s.text || s.name || '') : s)).filter(Boolean).join(', ')
          } else {
            skills = items.toString()
          }
        } catch {
          skills = skillsSection.content
        }
      } else {
        const resume = resumes.find(r => r.resumeId === Number(selectedResumeId))
        skills = resume?.targetJobTitle || 'Software Engineer'
      }

      // 2. Call Job Match Service
      const matches = await jobSearchApi.analyze({
        resumeId: Number(selectedResumeId),
        skills: skills
      })
      
      setResults(matches)
      toast.success(`Found ${matches.length} high-potential matches!`)
      
      // Refresh history
      const newHistory = await jobSearchApi.history()
      setHistory(newHistory)
    } catch (err) {
      toast.error(err.message || 'Job search failed')
    } finally {
      setSearching(false)
    }
  }

  const handleBookmark = async (id) => {
    try {
      await jobSearchApi.bookmark(id)
      setHistory(history.map(h => h.matchId === id ? { ...h, isBookmarked: !h.isBookmarked } : h))
      toast.success('Preference saved')
    } catch (err) {
      toast.error('Failed to bookmark')
    }
  }

  if (loadingResumes) {
    return (
      <div className="flex items-center justify-center h-full gap-3 text-ink-400">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Preparing your career portal…</span>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-gold-500/10 text-gold-400 border border-gold-500/20">
              <Target size={20} />
            </div>
            <span className="text-xs font-bold text-gold-400 uppercase tracking-widest">AI Career Scout</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-2">
            Smart <span className="text-gold-400">Job Matching</span>
          </h1>
          <p className="text-ink-400 text-sm max-w-md">
            Our AI scans remote job boards to find opportunities that perfectly align with your specific skill set.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Briefcase size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
            <select 
              className="input-field pl-10 h-11 text-sm bg-ink-800/50 border-ink-700/60"
              value={selectedResumeId}
              onChange={e => setSelectedResumeId(e.target.value)}
            >
              <option value="" disabled>Select a resume</option>
              {resumes.map(r => (
                <option key={r.resumeId} value={r.resumeId}>{r.title}</option>
              ))}
            </select>
          </div>
          <button 
            disabled={searching || resumes.length === 0}
            onClick={handleSearch}
            className="btn-primary h-11 px-6 flex items-center gap-2 shadow-lg shadow-gold-500/10 disabled:opacity-50 group"
          >
            {searching ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Search size={16} className="group-hover:scale-110 transition-transform" />
            )}
            <span>Scan for Jobs</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Results Area */}
        <div className="lg:col-span-2 space-y-6">
          {searching && (
            <div className="card p-12 flex flex-col items-center justify-center text-center animate-pulse">
              <div className="w-16 h-16 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-400 mb-4">
                <Sparkles size={32} className="animate-bounce" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Analyzing Job Market</h3>
              <p className="text-sm text-ink-400 max-w-xs">Comparing your skills against live listings from Himalayas Remote Job API...</p>
            </div>
          )}

          {!searching && !results && history.length === 0 && (
            <div className="card p-12 flex flex-col items-center justify-center text-center border-dashed border-ink-700/60 bg-transparent">
              <div className="w-16 h-16 rounded-full bg-ink-800 flex items-center justify-center text-ink-500 mb-4">
                <Briefcase size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Active Matches</h3>
              <p className="text-sm text-ink-400 max-w-xs mb-6">Select a resume above and click "Scan for Jobs" to see your personalized matches.</p>
            </div>
          )}

          {results && (
            <div className="space-y-4 animate-slide-up">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Trophy size={18} className="text-gold-400" />
                  Top Picks for You
                </h2>
                <span className="text-xs text-ink-500">Found {results.length} results</span>
              </div>
              {results.map((job, i) => (
                <div key={i} className="card p-5 hover:border-gold-500/40 transition-all group overflow-hidden relative">
                   {/* Match Score Indicator */}
                   <div className="absolute top-0 right-0 h-1 bg-gold-500" style={{ width: `${job.matchScore}%` }} />
                   
                   <div className="flex items-start justify-between gap-4">
                     <div className="flex-1 min-w-0">
                       <h3 className="font-bold text-white text-lg group-hover:text-gold-400 transition-colors truncate">{job.title}</h3>
                       <p className="text-sm text-ink-400 font-medium mb-4">{job.company} • {job.location}</p>
                       
                       <div className="flex flex-wrap gap-1.5 mb-5">
                         {job.matchingSkills.slice(0, 4).map(s => (
                           <span key={s} className="px-2 py-0.5 rounded-md bg-jade-500/10 text-jade-400 text-[10px] font-bold uppercase border border-jade-500/20">
                             {s}
                           </span>
                         ))}
                         {job.missingSkills.slice(0, 2).map(s => (
                           <span key={s} className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 text-[10px] font-bold uppercase border border-rose-500/20">
                             {s}
                           </span>
                         ))}
                       </div>
                     </div>

                     <div className="flex flex-col items-end gap-3">
                        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-ink-900 border border-ink-700 shadow-inner">
                          <span className={`text-lg font-bold ${job.matchScore > 70 ? 'text-jade-400' : 'text-gold-400'}`}>{job.matchScore}%</span>
                          <span className="text-[8px] text-ink-500 font-bold uppercase tracking-tighter">Match</span>
                        </div>
                        <a 
                          href={job.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-ink-700/50 text-ink-300 hover:text-white hover:bg-gold-500 transition-all shadow-lg"
                        >
                          <ExternalLink size={18} />
                        </a>
                     </div>
                   </div>
                </div>
              ))}
            </div>
          )}

          {!searching && !results && history.length > 0 && (
             <div className="space-y-4">
                <h2 className="text-lg font-bold text-white mb-4">Match History</h2>
                {history.slice(0, 10).map((h) => (
                  <div key={h.matchId} className="card p-4 border-ink-700/40 bg-ink-800/30 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-ink-900 flex items-center justify-center text-ink-500">
                        <CheckCircle2 size={20} className={h.matchScore > 70 ? 'text-jade-400' : 'text-gold-400'} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white truncate max-w-[200px]">{h.jobTitle}</p>
                        <p className="text-[11px] text-ink-500">{h.companyName} • {new Date(h.matchedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-bold text-ink-400 mr-2">{h.matchScore}%</span>
                       <button 
                        onClick={() => handleBookmark(h.matchId)}
                        className={`p-2 rounded-lg transition-all ${h.isBookmarked ? 'bg-gold-500 text-ink-900' : 'text-ink-500 hover:bg-ink-700'}`}
                       >
                         <Bookmark size={14} className={h.isBookmarked ? 'fill-current' : ''} />
                       </button>
                       <a 
                        href={h.jobUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg text-ink-500 hover:bg-ink-700"
                       >
                         <ExternalLink size={14} />
                       </a>
                    </div>
                  </div>
                ))}
             </div>
          )}
        </div>

        {/* Sidebar: Tips & Stats */}
        <div className="space-y-6">
          <div className="card p-6 bg-gradient-to-br from-gold-500/10 to-transparent border-gold-500/20">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-gold-400" />
              Pro Matching Tips
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <CheckCircle2 size={14} className="text-jade-400 mt-0.5 shrink-0" />
                <p className="text-xs text-ink-300 leading-relaxed">Add at least <span className="text-white font-bold">10 skills</span> to your resume for more accurate matching.</p>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 size={14} className="text-jade-400 mt-0.5 shrink-0" />
                <p className="text-xs text-ink-300 leading-relaxed">Use standard industry terms like <span className="text-white font-bold">"React"</span> instead of "Frontend coding".</p>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 size={14} className="text-jade-400 mt-0.5 shrink-0" />
                <p className="text-xs text-ink-300 leading-relaxed">Our AI prioritizes remote-first companies from the <span className="text-gold-400 font-bold italic underline">Himalayas</span> network.</p>
              </li>
            </ul>
          </div>

          <div className="card p-6">
             <h3 className="font-bold text-white mb-4">Your Search Stats</h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-ink-900/50 p-3 rounded-xl border border-ink-700/60">
                   <p className="text-[10px] text-ink-500 uppercase tracking-widest mb-1">Total Scans</p>
                   <p className="text-2xl font-bold text-white">{history.length}</p>
                </div>
                <div className="bg-ink-900/50 p-3 rounded-xl border border-ink-700/60">
                   <p className="text-[10px] text-ink-500 uppercase tracking-widest mb-1">Bookmarks</p>
                   <p className="text-2xl font-bold text-gold-400">{history.filter(h => h.isBookmarked).length}</p>
                </div>
             </div>
          </div>

          <div className="p-4 rounded-2xl bg-ink-800/40 border border-ink-700/40 flex items-start gap-4">
             <AlertCircle size={18} className="text-ink-500 shrink-0 mt-0.5" />
             <p className="text-[11px] text-ink-400 leading-relaxed italic">
               Match scores are calculated based on skill intersection and job title relevance. For deeper AI analysis, try our "AI Section Improver" in the editor.
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
