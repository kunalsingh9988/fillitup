import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import * as seed from "./employer-data"
import type {
  AppNotification,
  Candidate,
  CandidateNote,
  CandidateStatus,
  ChatMessage,
  CompanyProfile,
  Conversation,
  EmployerJob,
  EmployerSettings,
  OnboardingStep,
  TeamMember,
} from "./employer-types"

/* ----------------------------------------------------------------
   Employer demo store — seed data + localStorage persistence.
   Mirrors what Supabase queries/mutations will replace later.
   ---------------------------------------------------------------- */

const STORAGE_KEY = "fillitup-employer-v1"

export interface EmployerState {
  jobs: EmployerJob[]
  candidates: Candidate[]
  settings: EmployerSettings
  notifications: AppNotification[]
  conversations: Conversation[]
  team: TeamMember[]
  onboarding: OnboardingStep[]
  invited: string[]
  company: CompanyProfile
}

const defaultSettings: EmployerSettings = {
  blindHiring: false,
  twoFactor: false,
  integrations: { calendar: true, slack: false, ats: false },
  notifications: {
    newApplicants: true,
    interviewReminders: true,
    weeklyReport: true,
    aiAlerts: true,
    productUpdates: false,
  },
  analyticsSections: {
    insights: true,
    stats: true,
    perJob: true,
    sources: true,
    distribution: true,
    trend: true,
    funnel: true,
  },
}

function seedState(): EmployerState {
  return {
    jobs: seed.employerJobs,
    candidates: seed.candidates,
    settings: defaultSettings,
    notifications: seed.employerNotifications,
    conversations: seed.conversations,
    team: seed.teamMembers,
    onboarding: seed.onboardingSteps,
    invited: [],
    company: seed.companyProfile,
  }
}

function load(): EmployerState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...seedState(), ...JSON.parse(raw) }
  } catch {
    /* corrupted storage — reseed */
  }
  return seedState()
}

interface EmployerContextValue {
  state: EmployerState
  // jobs
  addJob: (job: EmployerJob) => void
  updateJob: (id: string, patch: Partial<EmployerJob>) => void
  // company
  updateCompany: (patch: Partial<CompanyProfile>) => void
  // candidates
  setCandidateStatus: (id: string, status: CandidateStatus) => void
  addCandidateNote: (id: string, text: string) => void
  assignCandidate: (id: string, memberId: string | undefined) => void
  // settings
  updateSettings: (patch: Partial<EmployerSettings>) => void
  // notifications
  markAllRead: () => void
  markRead: (id: string) => void
  // messaging
  sendMessage: (conversationId: string, text: string) => void
  markConversationRead: (conversationId: string) => void
  // team
  addTeamMember: (m: TeamMember) => void
  removeTeamMember: (id: string) => void
  // onboarding
  setStepDone: (id: string, done: boolean) => void
  // invites
  inviteCandidate: (candidateId: string) => void
  resetDemo: () => void
}

const EmployerContext = createContext<EmployerContextValue | null>(null)

const uid = () => Math.random().toString(36).slice(2, 10)

export function EmployerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EmployerState>(load)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage full/blocked — non-fatal for demo */
    }
  }, [state])

  const addJob = useCallback((job: EmployerJob) => {
    setState(s => ({ ...s, jobs: [job, ...s.jobs] }))
  }, [])

  const updateJob = useCallback((id: string, patch: Partial<EmployerJob>) => {
    setState(s => ({ ...s, jobs: s.jobs.map(j => (j.id === id ? { ...j, ...patch } : j)) }))
  }, [])

  const updateCompany = useCallback((patch: Partial<CompanyProfile>) => {
    setState(s => ({ ...s, company: { ...s.company, ...patch } }))
  }, [])

  const setCandidateStatus = useCallback((id: string, status: CandidateStatus) => {
    setState(s => ({
      ...s,
      candidates: s.candidates.map(c => (c.id === id ? { ...c, status } : c)),
    }))
  }, [])

  const addCandidateNote = useCallback((id: string, text: string) => {
    const note: CandidateNote = { id: uid(), text, ago: "just now" }
    setState(s => ({
      ...s,
      candidates: s.candidates.map(c =>
        c.id === id ? { ...c, notes: [note, ...c.notes] } : c
      ),
    }))
  }, [])

  const assignCandidate = useCallback((id: string, memberId: string | undefined) => {
    setState(s => ({
      ...s,
      candidates: s.candidates.map(c =>
        c.id === id ? { ...c, assignedTo: memberId } : c
      ),
    }))
  }, [])

  const updateSettings = useCallback((patch: Partial<EmployerSettings>) => {
    setState(s => ({ ...s, settings: { ...s.settings, ...patch } }))
  }, [])

  const markAllRead = useCallback(() => {
    setState(s => ({
      ...s,
      notifications: s.notifications.map(n => ({ ...n, read: true })),
    }))
  }, [])

  const markRead = useCallback((id: string) => {
    setState(s => ({
      ...s,
      notifications: s.notifications.map(n => (n.id === id ? { ...n, read: true } : n)),
    }))
  }, [])

  const sendMessage = useCallback((conversationId: string, text: string) => {
    const msg: ChatMessage = { id: uid(), from: "us", text, ago: "just now" }
    setState(s => ({
      ...s,
      conversations: s.conversations.map(c =>
        c.id === conversationId
          ? { ...c, preview: text, ago: "just now", messages: [...c.messages, msg] }
          : c
      ),
    }))
  }, [])

  const markConversationRead = useCallback((conversationId: string) => {
    setState(s => ({
      ...s,
      conversations: s.conversations.map(c =>
        c.id === conversationId ? { ...c, unread: 0 } : c
      ),
    }))
  }, [])

  const addTeamMember = useCallback((m: TeamMember) => {
    setState(s => ({ ...s, team: [...s.team, m] }))
  }, [])

  const removeTeamMember = useCallback((id: string) => {
    setState(s => ({ ...s, team: s.team.filter(t => t.id !== id) }))
  }, [])

  const setStepDone = useCallback((id: string, done: boolean) => {
    setState(s => ({
      ...s,
      onboarding: s.onboarding.map(o => (o.id === id ? { ...o, done } : o)),
    }))
  }, [])

  const inviteCandidate = useCallback((candidateId: string) => {
    setState(s => ({
      ...s,
      invited: s.invited.includes(candidateId) ? s.invited : [...s.invited, candidateId],
    }))
  }, [])

  const resetDemo = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    setState(seedState())
  }, [])

  const value = useMemo<EmployerContextValue>(
    () => ({
      state,
      addJob,
      updateJob,
      updateCompany,
      setCandidateStatus,
      addCandidateNote,
      assignCandidate,
      updateSettings,
      markAllRead,
      markRead,
      sendMessage,
      markConversationRead,
      addTeamMember,
      removeTeamMember,
      setStepDone,
      inviteCandidate,
      resetDemo,
    }),
    [
      state,
      addJob,
      updateJob,
      setCandidateStatus,
      addCandidateNote,
      assignCandidate,
      updateSettings,
      markAllRead,
      markRead,
      sendMessage,
      markConversationRead,
      addTeamMember,
      removeTeamMember,
      setStepDone,
      inviteCandidate,
      resetDemo,
      updateCompany,
    ]
  )

  return <EmployerContext.Provider value={value}>{children}</EmployerContext.Provider>
}

export function useEmployer() {
  const ctx = useContext(EmployerContext)
  if (!ctx) throw new Error("useEmployer must be used inside <EmployerProvider>")
  return ctx
}
