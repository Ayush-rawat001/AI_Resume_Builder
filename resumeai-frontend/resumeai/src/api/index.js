import axios from 'axios'
import toast from 'react-hot-toast'

// ─── API Gateway Configuration ────────────────────────────────────────────────
// Use environment variable, or fallback to production URL if running on Render, otherwise localhost
const isRender = typeof window !== 'undefined' && window.location.hostname.includes('onrender.com');
const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 
                    (isRender ? 'https://resume-ai-gateway.onrender.com' : 'http://localhost:4000');

export const SERVICES = {
  auth:      'https://resume-ai-auth.onrender.com',
  resume:    'https://resume-ai-resumes.onrender.com',
  section:   'https://resume-ai-sections.onrender.com',
  template:  'https://resume-ai-templates.onrender.com',
  ai:        'https://resume-ai-ai.onrender.com',
  export:    'https://resume-ai-export-oo6m.onrender.com',
  jobSearch: 'https://resume-ai-job-search.onrender.com',
}


// ─── Axios factory ────────────────────────────────────────────────────────────
const createClient = (baseURL) => {
  const client = axios.create({ baseURL })

  client.interceptors.request.use((config) => {
    const raw = localStorage.getItem('resumeai-auth')
    if (raw) {
      try {
        const { state } = JSON.parse(raw)
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`
        }
      } catch (_) {}
    }
    return config
  })

  client.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        localStorage.removeItem('resumeai-auth')
        window.location.href = '/login'
      }
      return Promise.reject(err)
    }
  )

  return client
}

export const authClient     = createClient(SERVICES.auth)
export const resumeClient   = createClient(SERVICES.resume)
export const sectionClient  = createClient(SERVICES.section)
export const templateClient = createClient(SERVICES.template)
export const aiClient       = createClient(SERVICES.ai)
export const exportClient   = createClient(SERVICES.export)
export const jobSearchClient = createClient(SERVICES.jobSearch)

// ─── Helper: unwrap ApiResponse ──────────────────────────────────────────────
export const unwrap = (res) => {
  const { data } = res
  if (!data.success) throw new Error(data.message || 'Request failed')
  return data.data
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  register: (body) => authClient.post('/api/auth/register', body).then(unwrap),
  login:    (body) => authClient.post('/api/auth/login', body).then(unwrap),
  profile:  (id)   => authClient.get(`/api/auth/profile/${id}`).then(unwrap),
  updateProfile: (id, body) => authClient.put(`/api/auth/profile/${id}`, body).then(unwrap),
  changePassword: (id, body) => authClient.put(`/api/auth/password/${id}`, body).then(unwrap),
  upgrade: () => authClient.post('/api/auth/upgrade').then(unwrap),
  
  // Admin-only Auth
  getUsers:      ()     => authClient.get('/api/auth/admin/users').then(unwrap),
  updateSubscription: (id, body) => authClient.put(`/api/auth/admin/subscription/${id}`, body).then(unwrap),
  suspend:      (id)    => authClient.put(`/api/auth/admin/suspend/${id}`).then(unwrap),
  reactivate:   (id)    => authClient.put(`/api/auth/admin/reactivate/${id}`).then(unwrap),
  deleteUser:   (id)    => authClient.delete(`/api/auth/admin/delete/${id}`).then(unwrap),
  getAnalytics: ()      => authClient.get('/api/auth/admin/analytics').then(unwrap),
}

// ─── Resume API ───────────────────────────────────────────────────────────────
export const resumeApi = {
  create:  (body)   => resumeClient.post('/api/resumes', body).then(unwrap),
  duplicate: (id)   => resumeClient.post(`/api/resumes/duplicate/${id}`).then(unwrap),
  get:     (id)     => resumeClient.get(`/api/resumes/${id}`).then(unwrap),
  getByUser: (uid)  => resumeClient.get(`/api/resumes/user/${uid}`).then(unwrap),
  update:  (id, body) => resumeClient.put(`/api/resumes/${id}`, body).then(unwrap),
  publish: (id)     => resumeClient.put(`/api/resumes/publish/${id}`).then(unwrap),
  unpublish: (id)   => resumeClient.put(`/api/resumes/unpublish/${id}`).then(unwrap),
  delete:  (id)     => resumeClient.delete(`/api/resumes/${id}`).then(unwrap),
  updateAts: (id, score) => resumeClient.put(`/api/resumes/ats/${id}?score=${score}`).then(unwrap),
  incrementView: (id) => resumeClient.put(`/api/resumes/view/${id}`).then(unwrap),

  // Admin-only Resume
  getAdminAnalytics: () => resumeClient.get('/api/resumes/admin/analytics').then(unwrap),
}

// ─── Section API ──────────────────────────────────────────────────────────────
export const sectionApi = {
  create:  (body)           => sectionClient.post('/api/sections', body).then(unwrap),
  get:     (id)             => sectionClient.get(`/api/sections/${id}`).then(unwrap),
  getByResume: (rid)        => sectionClient.get(`/api/sections/resume/${rid}`).then(unwrap),
  update:  (id, body)       => sectionClient.put(`/api/sections/${id}`, body).then(unwrap),
  delete:  (id)             => sectionClient.delete(`/api/sections/${id}`).then(unwrap),
  reorder: (resumeId, ids)  => sectionClient.put(`/api/sections/reorder/${resumeId}`, ids).then(unwrap),
  bulkUpdate: (resumeId, sections) => sectionClient.put(`/api/sections/bulk/${resumeId}`, sections).then(unwrap),
  toggleVisibility: (id)    => sectionClient.put(`/api/sections/toggle/${id}`).then(unwrap),
}

// ─── Template API ─────────────────────────────────────────────────────────────
export const templateApi = {
  list: ()   => templateClient.get('/api/templates').then(unwrap),
  listAdmin: () => templateClient.get('/api/templates/admin/all').then(unwrap),
  get:  (id) => templateClient.get(`/api/templates/${id}`).then(unwrap),
  getByCategory: (cat) => templateClient.get(`/api/templates/category/${cat}`).then(unwrap),
  getPopular: () => templateClient.get('/api/templates/popular').then(unwrap),
  incrementUsage: (id) => templateClient.put(`/api/templates/use/${id}`).then(unwrap),
  
  // Admin-only Template
  create: (body)     => templateClient.post('/api/templates', body).then(unwrap),
  update: (id, body) => templateClient.put(`/api/templates/${id}`, body).then(unwrap),
  deactivate: (id)   => templateClient.put(`/api/templates/deactivate/${id}`).then(unwrap),
}

// ─── AI API ───────────────────────────────────────────────────────────────────
export const aiApi = {
  generateSummary: (body) => aiClient.post('/api/ai/generate-summary', body).then(unwrap),
  generateBullets: (body) => aiClient.post('/api/ai/generate-bullets', body).then(unwrap),
  improve:         (body) => aiClient.post('/api/ai/improve-section', body).then(unwrap),
  checkAts:        (body) => aiClient.post('/api/ai/check-ats', body).then(unwrap),
  suggestSkills:   (body) => aiClient.post('/api/ai/suggest-skills', body).then(unwrap),
  history:         ()     => aiClient.get('/api/ai/history').then(unwrap),
  quota:           ()     => aiClient.get('/api/ai/quota').then(unwrap),

  // Admin-only AI
  getAdminStats:   ()     => aiClient.get('/api/ai/admin/stats').then(unwrap),
}

// ─── Export API ───────────────────────────────────────────────────────────────
export const exportApi = {
  pdf: async (resumeId) => {
    const raw = localStorage.getItem('resumeai-auth')
    let token = ''
    if (raw) {
      try { token = JSON.parse(raw).state?.token || '' } catch (_) {}
    }
    const res = await fetch(`${SERVICES.export}/api/export/pdf/${resumeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Export failed')
    return res.blob()
  },
}

// ─── Job Search API ──────────────────────────────────────────────────────────
export const jobSearchApi = {
  analyze:  (body) => jobSearchClient.post('/api/job-search/analyze', body).then(unwrap),
  history:  ()     => jobSearchClient.get('/api/job-search/history').then(unwrap),
  bookmark: (id)     => jobSearchClient.post(`/api/job-search/bookmark/${id}`).then(unwrap),
}

