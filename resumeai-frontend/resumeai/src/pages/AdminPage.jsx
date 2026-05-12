import React, { useState, useEffect } from 'react'
import { authApi, resumeApi, aiApi, templateApi } from '../api'
import toast from 'react-hot-toast'
import { 
  Users, 
  BarChart3, 
  Cpu, 
  FileText, 
  ShieldAlert, 
  ShieldCheck, 
  Trash2, 
  Crown,
  Layout,
  RefreshCw,
  Search,
  Plus,
  Edit2,
  Eye,
  EyeOff
} from 'lucide-react'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('analytics')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ auth: null, resume: null, ai: null })
  const [users, setUsers] = useState([])
  const [templates, setTemplates] = useState([])
  const [search, setSearch] = useState('')
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  
  // Template Form State
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    category: 'Professional',
    isPremium: false,
    htmlLayout: '',
    cssStyles: '',
    thumbnailUrl: ''
  })

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'analytics') {
        const [a, r, i] = await Promise.all([
          authApi.getAnalytics(),
          resumeApi.getAdminAnalytics(),
          aiApi.getAdminStats()
        ])
        setStats({ auth: a, resume: r, ai: i })
      } else if (activeTab === 'users') {
        const u = await authApi.getUsers()
        setUsers(u)
      } else if (activeTab === 'templates') {
        const t = await templateApi.listAdmin()
        setTemplates(t)
      }
    } catch (err) {
      toast.error('Failed to fetch admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId, action) => {
    try {
      if (action === 'suspend') await authApi.suspend(userId)
      if (action === 'reactivate') await authApi.reactivate(userId)
      if (action === 'delete') {
        if (!window.confirm('Permanently delete this user?')) return
        await authApi.deleteUser(userId)
      }
      if (action === 'premium') await authApi.updateSubscription(userId, { plan: 'PREMIUM' })
      if (action === 'free') await authApi.updateSubscription(userId, { plan: 'FREE' })
      
      toast.success(`User ${action}ed`)
      fetchData()
    } catch (err) {
      toast.error('Action failed')
    }
  }

  const handleTemplateSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingTemplate) {
        await templateApi.update(editingTemplate.templateId, templateForm)
        toast.success('Template updated')
      } else {
        await templateApi.create(templateForm)
        toast.success('Template created')
      }
      setShowTemplateModal(false)
      setEditingTemplate(null)
      fetchData()
    } catch (err) {
      toast.error('Failed to save template')
    }
  }

  const openTemplateEdit = (t) => {
    setEditingTemplate(t)
    setTemplateForm({
      name: t.name,
      description: t.description,
      category: t.category,
      isPremium: t.isPremium,
      htmlLayout: t.htmlLayout,
      cssStyles: t.cssStyles,
      thumbnailUrl: t.thumbnailUrl
    })
    setShowTemplateModal(true)
  }

  const toggleTemplateActive = async (id) => {
    try {
      await templateApi.deactivate(id)
      toast.success('Status toggled')
      fetchData()
    } catch (err) {
      toast.error('Failed to toggle status')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Admin Control Center
          </h1>
          <p className="text-slate-500 mt-1">Platform management & analytics hub</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
          <TabBtn active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<BarChart3 className="w-4 h-4" />} label="Analytics" />
          <TabBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users className="w-4 h-4" />} label="Users" />
          <TabBtn active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} icon={<Layout className="w-4 h-4" />} label="Templates" />
          <TabBtn active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon={<Cpu className="w-4 h-4" />} label="AI Usage" />
        </div>
      </div>

      {loading && !showTemplateModal ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={stats.auth?.totalUsers} subText={`${stats.auth?.activeUsers} Active`} icon={<Users className="text-blue-500" />} />
                <StatCard title="Resumes" value={stats.resume?.totalResumes} subText={`${stats.resume?.publicResumes} Public`} icon={<FileText className="text-purple-500" />} />
                <StatCard title="AI Calls" value={stats.ai?.totalRequests} subText={`${stats.ai?.completedRequests} Success`} icon={<Cpu className="text-green-500" />} />
                <StatCard title="Total Views" value={stats.resume?.totalViews} subText="Across platform" icon={<BarChart3 className="text-orange-500" />} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Crown className="w-5 h-5 text-yellow-500" /> Subscription Mix</h3>
                  <div className="space-y-4">
                    <ProgressBar label="Free Tier" current={stats.auth?.freeUsers} total={stats.auth?.totalUsers} color="bg-slate-400" />
                    <ProgressBar label="Premium Tier" current={stats.auth?.premiumUsers} total={stats.auth?.totalUsers} color="bg-yellow-500" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Cpu className="w-5 h-5 text-primary" /> AI Performance</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-xs text-slate-500 uppercase font-bold">Tokens Consumed</p>
                      <p className="text-2xl font-bold">{stats.ai?.totalTokensUsed?.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-xs text-slate-500 uppercase font-bold">Health Rate</p>
                      <p className="text-2xl font-bold">{Math.round((stats.ai?.completedRequests / stats.ai?.totalRequests) * 100) || 0}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4">
               <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input type="text" placeholder="Search by name/email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm" />
                  </div>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <tr><th className="px-6 py-4">User</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Plan</th><th className="px-6 py-4 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.filter(u => u.email.includes(search)).map(user => (
                        <tr key={user.userId} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{user.fullName}</div>
                            <div className="text-xs text-slate-500">{user.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {user.isActive ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium">{user.subscriptionPlan}</td>
                          <td className="px-6 py-4 text-right flex justify-end gap-2">
                             <ActionBtn onClick={() => handleUserAction(user.userId, user.subscriptionPlan === 'FREE' ? 'premium' : 'free')} icon={<Crown className="w-4 h-4" />} color={user.subscriptionPlan === 'FREE' ? 'text-yellow-600' : 'text-slate-400'} />
                             <ActionBtn onClick={() => handleUserAction(user.userId, user.isActive ? 'suspend' : 'reactivate')} icon={user.isActive ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />} color={user.isActive ? 'text-orange-600' : 'text-green-600'} />
                             <ActionBtn onClick={() => handleUserAction(user.userId, 'delete')} icon={<Trash2 className="w-4 h-4" />} color="text-red-600" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="animate-in slide-in-from-bottom-4">
              <div className="flex justify-end mb-6">
                <button onClick={() => { setEditingTemplate(null); setTemplateForm({ name: '', description: '', category: 'Professional', isPremium: false, htmlLayout: '', cssStyles: '', thumbnailUrl: '' }); setShowTemplateModal(true); }} className="bg-primary text-white px-6 py-2 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all">
                  <Plus className="w-5 h-5" /> Add New Template
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(t => (
                  <div key={t.templateId} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all group">
                    <div className="h-48 bg-slate-100 relative overflow-hidden">
                      <img src={t.thumbnailUrl || 'https://via.placeholder.com/300x400?text=No+Preview'} className="w-full h-full object-cover" />
                      {!t.isActive && <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center text-white font-bold">DEACTIVATED</div>}
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900">{t.name}</h4>
                        <p className="text-xs text-slate-500">{t.category} • {t.isPremium ? 'Premium' : 'Free'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openTemplateEdit(t)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => toggleTemplateActive(t.templateId)} className={`p-2 rounded-lg ${t.isActive ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                          {t.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-lg font-semibold mb-6">Usage by Request Type</h3>
                  <div className="space-y-3">
                    {Object.entries(stats.ai?.requestsByType || {}).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <span className="text-sm font-medium">{type}</span>
                        <span className="text-sm font-bold text-primary">{count}</span>
                      </div>
                    ))}
                  </div>
               </div>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-lg font-semibold mb-6">Model Distribution</h3>
                  <div className="space-y-3">
                    {Object.entries(stats.ai?.requestsByModel || {}).map(([model, count]) => (
                      <div key={model} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <span className="text-sm font-medium">{model}</span>
                        <span className="text-sm font-bold text-blue-600">{count}</span>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          )}
        </>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold">{editingTemplate ? 'Edit Template' : 'Add New Template'}</h2>
              <button onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-slate-600"><Trash2 className="w-6 h-6 rotate-45" /></button>
            </div>
            <form onSubmit={handleTemplateSubmit} className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Name" value={templateForm.name} onChange={e => setTemplateForm({...templateForm, name: e.target.value})} />
                <Input label="Category" value={templateForm.category} onChange={e => setTemplateForm({...templateForm, category: e.target.value})} />
                <Input label="Thumbnail URL" value={templateForm.thumbnailUrl} onChange={e => setTemplateForm({...templateForm, thumbnailUrl: e.target.value})} />
                <div className="flex items-center gap-4 pt-8">
                  <input type="checkbox" checked={templateForm.isPremium} onChange={e => setTemplateForm({...templateForm, isPremium: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" id="premium-check" />
                  <label htmlFor="premium-check" className="font-semibold text-slate-700">Premium Template</label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <textarea value={templateForm.description} onChange={e => setTemplateForm({...templateForm, description: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl h-24 focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">HTML Layout</label>
                  <textarea value={templateForm.htmlLayout} onChange={e => setTemplateForm({...templateForm, htmlLayout: e.target.value})} className="w-full p-4 bg-slate-900 text-green-400 font-mono text-xs border-none rounded-2xl h-64 focus:ring-2 focus:ring-primary/20" placeholder="<div class='resume'>...</div>" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">CSS Styles</label>
                  <textarea value={templateForm.cssStyles} onChange={e => setTemplateForm({...templateForm, cssStyles: e.target.value})} className="w-full p-4 bg-slate-900 text-blue-400 font-mono text-xs border-none rounded-2xl h-64 focus:ring-2 focus:ring-primary/20" placeholder=".resume { ... }" />
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setShowTemplateModal(false)} className="px-8 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" className="px-10 py-3 bg-primary text-white rounded-2xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all">Save Template</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function TabBtn({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
      active ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
    }`}>{icon}{label}</button>
  )
}

function StatCard({ title, value, subText, icon }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-slate-50 rounded-xl">
          {React.cloneElement(icon, { className: 'w-6 h-6 ' + icon.props.className })}
        </div>
        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{subText}</span>
      </div>
      <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-slate-900 mt-1">{value ?? '0'}</p>
    </div>
  )
}

function ProgressBar({ label, current, total, color }) {
  const percent = Math.round((current / total) * 100) || 0
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-900">{percent}%</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full transition-all duration-1000 ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function ActionBtn({ onClick, icon, color }) {
  return (
    <button onClick={onClick} className={`p-2 hover:bg-slate-100 rounded-lg transition-colors ${color}`}>{icon}</button>
  )
}

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
      <input type="text" value={value} onChange={onChange} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20" />
    </div>
  )
}
