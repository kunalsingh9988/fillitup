import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import * as seed from "./employer-data"
import { supabase } from "./supabase/client"
import { loadEmployerState } from "./supabase/data"
import { useAuth } from "./auth"
import type {
  ActivityEntry,
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
   Employer store — Supabase-backed when signed in; seed + localStorage
   for guests so the open demo routes still work.
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
  activity: ActivityEntry[]
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
    activity: seed.activityLog,
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
  loading: boolean
  remote: boolean
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

const uid = () => crypto.randomUUID()

const workplaceToDb: Record<string, string> = {
  Remote: "remote", Hybrid: "hybrid", "On-site": "onsite",
}

export function EmployerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [state, setState] = useState<EmployerState>(load)
  const [loading, setLoading] = useState(false)
  const remoteRef = useRef(false)
  const uidRef = useRef<string | null>(null)
  const companyIdRef = useRef<string | null>(null)
  uidRef.current = user?.id ?? null

  /* hydrate from Supabase when signed in */
  useEffect(() => {
    if (!user) {
      remoteRef.current = false
      companyIdRef.current = null
      return
    }
    let alive = true
    setLoading(true)
    loadEmployerState(user.id)
      .then(s => {
        if (!alive) return
        remoteRef.current = true
        companyIdRef.current = s.companyId ?? null
        setState(prev => ({
          ...prev,
          ...s,
          company: s.company ?? prev.company,
          settings: { ...prev.settings, ...(s.settings ?? {}) },
        } as EmployerState))
      })
      .catch(err => console.error("employer load failed", err))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [user])

  /* guest-mode persistence */
  useEffect(() => {
    if (remoteRef.current) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch { /* non-fatal */ }
  }, [state])

  const db = useCallback(
    (fn: (uid: string, companyId: string | null) => PromiseLike<unknown>) => {
      const id = uidRef.current
      if (id && remoteRef.current)
        void Promise.resolve(fn(id, companyIdRef.current)).catch((e: unknown) =>
          console.error("db write failed", e)
        )
    },
    []
  )

  const addJob = useCallback((job: EmployerJob) => {
    const tempId = job.id || uid()
    const withId = { ...job, id: tempId }
    setState(s => ({ ...s, jobs: [withId, ...s.jobs] }))
    db(async (me, companyId) => {
      if (!companyId) return
      const { data } = await supabase.from("jobs").insert({
        company_id: companyId, posted_by: me,
        title: job.title, department: job.department, location: job.location,
        workplace: workplaceToDb[job.workplace] ?? "remote",
        type: job.type, level: job.level, status: job.status,
        comp_min: job.salaryMin ?? null, comp_max: job.salaryMax ?? null,
        currency: job.currency || "INR",
        description: job.description, responsibilities: job.responsibilities,
        requirements: job.qualifications, skills: job.skills,
        screening: job.screening, education: job.education,
      }).select("id").single()
      if (data?.id)
        setState(s => ({ ...s, jobs: s.jobs.map(j => (j.id === tempId ? { ...j, id: data.id } : j)) }))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const updateJob = useCallback((id: string, patch: Partial<EmployerJob>) => {
    setState(s => ({ ...s, jobs: s.jobs.map(j => (j.id === id ? { ...j, ...patch } : j)) }))
    const cols: Record<string, unknown> = {}
    if (patch.title !== undefined) cols.title = patch.title
    if (patch.status !== undefined) cols.status = patch.status
    if (patch.location !== undefined) cols.location = patch.location
    if (patch.workplace !== undefined) cols.workplace = workplaceToDb[patch.workplace]
    if (patch.type !== undefined) cols.type = patch.type
    if (patch.level !== undefined) cols.level = patch.level
    if (patch.salaryMin !== undefined) cols.comp_min = patch.salaryMin
    if (patch.salaryMax !== undefined) cols.comp_max = patch.salaryMax
    if (patch.description !== undefined) cols.description = patch.description
    if (patch.department !== undefined) cols.department = patch.department
    if (Object.keys(cols).length)
      db(() => supabase.from("jobs").update(cols).eq("id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const COMPANY_COLS: Partial<Record<keyof CompanyProfile, string>> = {
    name: "name", industry: "industry", size: "size", website: "website",
    about: "about", founded: "founded", headquarters: "hq", funding: "funding",
    revenue: "revenue", linkedin: "linkedin", twitter: "twitter", plan: "plan",
    techStack: "tech_stack", benefits: "benefits", values: "values", locations: "locations",
  }

  const updateCompany = useCallback((patch: Partial<CompanyProfile>) => {
    setState(s => ({ ...s, company: { ...s.company, ...patch } }))
    const cols: Record<string, unknown> = {}
    for (const [k, col] of Object.entries(COMPANY_COLS))
      if (patch[k as keyof CompanyProfile] !== undefined) cols[col] = patch[k as keyof CompanyProfile]
    if (Object.keys(cols).length)
      db((_me, companyId) => companyId
        ? supabase.from("companies").update(cols).eq("id", companyId)
        : Promise.resolve())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const setCandidateStatus = useCallback((id: string, status: CandidateStatus) => {
    setState(s => ({
      ...s,
      candidates: s.candidates.map(c => (c.id === id ? { ...c, status } : c)),
    }))
    db(() => supabase.from("applications").update({ candidate_stage: status }).eq("id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const addCandidateNote = useCallback((id: string, text: string) => {
    const note: CandidateNote = { id: uid(), text, ago: "just now" }
    setState(s => ({
      ...s,
      candidates: s.candidates.map(c =>
        c.id === id ? { ...c, notes: [note, ...c.notes] } : c
      ),
    }))
    db(me => supabase.from("application_notes").insert({ application_id: id, author_id: me, body: text }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const assignCandidate = useCallback((id: string, memberId: string | undefined) => {
    setState(s => ({
      ...s,
      candidates: s.candidates.map(c =>
        c.id === id ? { ...c, assignedTo: memberId } : c
      ),
    }))
    db(() => supabase.from("applications").update({ assigned_to: memberId ?? null }).eq("id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const updateSettings = useCallback((patch: Partial<EmployerSettings>) => {
    setState(s => ({ ...s, settings: { ...s.settings, ...patch } }))
    db((_me, companyId) => companyId
      ? supabase.from("companies").update({ settings: { ...state.settings, ...patch } }).eq("id", companyId)
      : Promise.resolve())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, state.settings])

  const markAllRead = useCallback(() => {
    setState(s => ({
      ...s,
      notifications: s.notifications.map(n => ({ ...n, read: true })),
    }))
    db(me => supabase.from("notifications").update({ read: true }).eq("user_id", me).eq("read", false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const markRead = useCallback((id: string) => {
    setState(s => ({
      ...s,
      notifications: s.notifications.map(n => (n.id === id ? { ...n, read: true } : n)),
    }))
    db(() => supabase.from("notifications").update({ read: true }).eq("id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

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
    db(me => supabase.from("messages").insert({ conversation_id: conversationId, sender_id: me, body: text }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const markConversationRead = useCallback((conversationId: string) => {
    setState(s => ({
      ...s,
      conversations: s.conversations.map(c =>
        c.id === conversationId ? { ...c, unread: 0 } : c
      ),
    }))
    db(me => supabase.from("conversation_participants")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId).eq("user_id", me))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const addTeamMember = useCallback((m: TeamMember) => {
    const withId = { ...m, id: m.id || uid() }
    setState(s => ({ ...s, team: [...s.team, withId] }))
    db((_me, companyId) => companyId
      ? supabase.from("company_members").insert({
          company_id: companyId, user_id: withId.id,
          member_role: "recruiter", status: m.pending ? "invited" : "active",
          title: m.role, email: m.email, phone: m.phone,
        })
      : Promise.resolve())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const removeTeamMember = useCallback((id: string) => {
    setState(s => ({ ...s, team: s.team.filter(t => t.id !== id) }))
    db((_me, companyId) => companyId
      ? supabase.from("company_members").delete().eq("company_id", companyId).eq("user_id", id)
      : Promise.resolve())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const setStepDone = useCallback((id: string, done: boolean) => {
    setState(s => {
      const onboarding = s.onboarding.map(o => (o.id === id ? { ...o, done } : o))
      db(me => supabase.from("user_settings").upsert(
        { user_id: me, data: { onboarding } },
        { onConflict: "user_id" }
      ))
      return { ...s, onboarding }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const inviteCandidate = useCallback((candidateId: string) => {
    setState(s => ({
      ...s,
      invited: s.invited.includes(candidateId) ? s.invited : [...s.invited, candidateId],
    }))
  }, [])

  const resetDemo = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    remoteRef.current = false
    companyIdRef.current = null
    setState(seedState())
  }, [])

  const value = useMemo<EmployerContextValue>(
    () => ({
      state, loading, remote: remoteRef.current,
      addJob, updateJob, updateCompany,
      setCandidateStatus, addCandidateNote, assignCandidate,
      updateSettings, markAllRead, markRead,
      sendMessage, markConversationRead,
      addTeamMember, removeTeamMember, setStepDone, inviteCandidate, resetDemo,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, loading]
  )

  return <EmployerContext.Provider value={value}>{children}</EmployerContext.Provider>
}

export function useEmployer() {
  const ctx = useContext(EmployerContext)
  if (!ctx) throw new Error("useEmployer must be used inside <EmployerProvider>")
  return ctx
}
