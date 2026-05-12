import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Auth Store
export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      clearAuth: () => set({ token: null, user: null, isAuthenticated: false }),
      updateUser: (user) => set({ user }),
    }),
    {
      name: 'resumeai-auth',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)

// Resume Store
export const useResumeStore = create((set, get) => ({
  resumes: [],
  currentResume: null,
  sections: [],
  isDirty: false,

  setResumes: (resumes) => set({ resumes }),
  setCurrentResume: (resume) => set({ currentResume: resume, isDirty: false }),
  updateCurrentResume: (patch) => set((s) => ({
    currentResume: { ...s.currentResume, ...patch },
    isDirty: true,
  })),
  setSections: (sections) => set({ sections }),
  addSection: (section) => set((s) => ({ sections: [...s.sections, section], isDirty: true })),
  updateSection: (sectionId, patch) => set((s) => ({
    sections: s.sections.map((sec) => sec.sectionId === sectionId ? { ...sec, ...patch } : sec),
    isDirty: true,
  })),
  removeSection: (sectionId) => set((s) => ({
    sections: s.sections.filter((sec) => sec.sectionId !== sectionId),
    isDirty: true,
  })),
  reorderSections: (sections) => set({ sections, isDirty: true }),
  markClean: () => set({ isDirty: false }),
  reset: () => set({ currentResume: null, sections: [], isDirty: false }),
}))

// Template Store
export const useTemplateStore = create((set) => ({
  templates: [],
  selectedTemplate: null,
  setTemplates: (templates) => set({ templates }),
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
}))

// UI Store
export const useUIStore = create((set) => ({
  previewMode: false,
  activeSection: null,
  aiPanelOpen: false,
  aiQuota: null,

  setPreviewMode: (val) => set({ previewMode: val }),
  setActiveSection: (id) => set({ activeSection: id }),
  setAiPanelOpen: (val) => set({ aiPanelOpen: val }),
  setAiQuota: (q) => set({ aiQuota: q }),
}))
