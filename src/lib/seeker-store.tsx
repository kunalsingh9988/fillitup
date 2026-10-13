import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import * as seed from "./seeker-data"
import type {
  ChatMessage,
  AppNotification,
  Conversation,
} from "./employer-types"
import type {
  ApplicationStage,
  Certification,
  ChecklistStep,
  CommunityPost,
  CreditTransaction,
  Education,
  Experience,
  Invoice,
  MentorListing,
  PrepSession,
  Project,
  ResumeDoc,
  SeekerJob,
  SeekerProfile,
  SeekerSettings,
  SkillAssessment,
  TrackedApplication,
} from "./seeker-types"

/* ----------------------------------------------------------------
   Seeker demo store — seed data + localStorage persistence.
   ---------------------------------------------------------------- */

const STORAGE_KEY = "fillitup-seeker-v1"

export interface SeekerState {
  profile: SeekerProfile
  jobs: SeekerJob[]
  tracker: TrackedApplication[]
  resumes: ResumeDoc[]
  prepSessions: PrepSession[]
  assessments: SkillAssessment[]
  mentors: MentorListing[]
  subscribedPlans: string[] // mentorPlan ids
  posts: CommunityPost[]
  credits: number
  creditTxns: CreditTransaction[]
  invoices: Invoice[]
  checklist: ChecklistStep[]
  settings: SeekerSettings
  notifications: AppNotification[]
  conversations: Conversation[]
  appliedJobs: string[]
}

function seedState(): SeekerState {
  return {
    profile: seed.seekerProfile,
    jobs: seed.seekerJobs,
    tracker: seed.trackedApplications,
    resumes: seed.resumes,
    prepSessions: seed.prepSessions,
    assessments: seed.skillAssessments,
    mentors: seed.mentorListings,
    subscribedPlans: [],
    posts: seed.communityPosts,
    credits: 1240,
    creditTxns: seed.creditTransactions,
    invoices: seed.invoices,
    checklist: seed.seekerChecklist,
    settings: seed.seekerSettings,
    notifications: seed.seekerNotifications,
    conversations: seed.seekerConversations,
    appliedJobs: [],
  }
}

function load(): SeekerState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...seedState(), ...JSON.parse(raw) }
  } catch {
    /* corrupted storage — reseed */
  }
  return seedState()
}

interface SeekerContextValue {
  state: SeekerState
  // profile
  updateProfile: (patch: Partial<SeekerProfile>) => void
  addExperience: (e: Omit<Experience, "id">) => void
  updateExperience: (id: string, e: Omit<Experience, "id">) => void
  removeExperience: (id: string) => void
  addEducation: (e: Omit<Education, "id">) => void
  updateEducation: (id: string, e: Omit<Education, "id">) => void
  removeEducation: (id: string) => void
  addProject: (p: Omit<Project, "id">) => void
  updateProject: (id: string, p: Omit<Project, "id">) => void
  removeProject: (id: string) => void
  addCertification: (c: Omit<Certification, "id">) => void
  updateCertification: (id: string, c: Omit<Certification, "id">) => void
  removeCertification: (id: string) => void
  addSkill: (skill: string) => void
  removeSkill: (skill: string) => void
  // jobs & tracker
  trackJob: (jobId: string, stage: ApplicationStage) => void
  setStage: (trackId: string, stage: ApplicationStage) => void
  removeTracked: (trackId: string) => void
  applyToJob: (jobId: string) => void
  // resumes
  addResume: (r: Omit<ResumeDoc, "id">) => void
  setPrimaryResume: (id: string) => void
  removeResume: (id: string) => void
  enhanceResume: (id: string, forJob: string) => void
  // AI tools
  addPrepSession: (s: Omit<PrepSession, "id">) => void
  setAssessmentStatus: (id: string, status: SkillAssessment["status"], score?: number) => void
  // mentorship
  subscribePlan: (planId: string) => void
  // community
  addPost: (p: Omit<CommunityPost, "id" | "likes" | "comments">) => void
  toggleLike: (id: string) => void
  // credits
  spendCredits: (amount: number, label: string) => boolean
  // settings
  updateSettings: (patch: Partial<SeekerSettings>) => void
  // notifications
  markAllRead: () => void
  markRead: (id: string) => void
  // messaging
  sendMessage: (conversationId: string, text: string) => void
  markConversationRead: (conversationId: string) => void
  // checklist
  setStepDone: (id: string, done: boolean) => void
  resetDemo: () => void
}

const SeekerContext = createContext<SeekerContextValue | null>(null)

const uid = () => Math.random().toString(36).slice(2, 10)

export function SeekerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SeekerState>(load)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage full/blocked — non-fatal for demo */
    }
  }, [state])

  /* ---------- profile ---------- */
  const updateProfile = useCallback((patch: Partial<SeekerProfile>) => {
    setState(s => ({ ...s, profile: { ...s.profile, ...patch } }))
  }, [])

  const listPatch = <T extends { id: string }>(
    key: "experience" | "education" | "projects" | "certifications"
  ) =>
    ({
      add: (item: Omit<T, "id">) =>
        setState(s => ({
          ...s,
          profile: {
            ...s.profile,
            [key]: [{ ...item, id: uid() } as T, ...(s.profile[key] as unknown as T[])],
          },
        })),
      update: (id: string, item: Omit<T, "id">) =>
        setState(s => ({
          ...s,
          profile: {
            ...s.profile,
            [key]: (s.profile[key] as unknown as T[]).map(x => (x.id === id ? ({ ...item, id } as T) : x)),
          },
        })),
      remove: (id: string) =>
        setState(s => ({
          ...s,
          profile: {
            ...s.profile,
            [key]: (s.profile[key] as unknown as T[]).filter(x => x.id !== id),
          },
        })),
    })

  const exp = listPatch<Experience>("experience")
  const edu = listPatch<Education>("education")
  const proj = listPatch<Project>("projects")
  const cert = listPatch<Certification>("certifications")

  const addSkill = useCallback((skill: string) => {
    setState(s => ({
      ...s,
      profile: {
        ...s.profile,
        skills: s.profile.skills.includes(skill) ? s.profile.skills : [...s.profile.skills, skill],
      },
    }))
  }, [])

  const removeSkill = useCallback((skill: string) => {
    setState(s => ({
      ...s,
      profile: { ...s.profile, skills: s.profile.skills.filter(x => x !== skill) },
    }))
  }, [])

  /* ---------- jobs & tracker ---------- */
  const trackJob = useCallback((jobId: string, stage: ApplicationStage) => {
    setState(s => {
      const existing = s.tracker.find(t => t.jobId === jobId)
      if (existing) {
        return {
          ...s,
          tracker: s.tracker.map(t => (t.jobId === jobId ? { ...t, stage } : t)),
        }
      }
      return {
        ...s,
        tracker: [{ id: uid(), jobId, stage }, ...s.tracker],
      }
    })
  }, [])

  const setStage = useCallback((trackId: string, stage: ApplicationStage) => {
    setState(s => ({
      ...s,
      tracker: s.tracker.map(t => (t.id === trackId ? { ...t, stage } : t)),
    }))
  }, [])

  const removeTracked = useCallback((trackId: string) => {
    setState(s => ({ ...s, tracker: s.tracker.filter(t => t.id !== trackId) }))
  }, [])

  const applyToJob = useCallback((jobId: string) => {
    setState(s => {
      const tracked = s.tracker.find(t => t.jobId === jobId)
      return {
        ...s,
        appliedJobs: s.appliedJobs.includes(jobId) ? s.appliedJobs : [...s.appliedJobs, jobId],
        tracker: tracked
          ? s.tracker.map(t =>
              t.jobId === jobId ? { ...t, stage: "applied", appliedOn: "just now" } : t
            )
          : [{ id: uid(), jobId, stage: "applied" as const, appliedOn: "just now" }, ...s.tracker],
      }
    })
  }, [])

  /* ---------- resumes ---------- */
  const addResume = useCallback((r: Omit<ResumeDoc, "id">) => {
    setState(s => ({ ...s, resumes: [{ ...r, id: uid() }, ...s.resumes] }))
  }, [])

  const setPrimaryResume = useCallback((id: string) => {
    setState(s => ({
      ...s,
      resumes: s.resumes.map(r => ({ ...r, primary: r.id === id })),
    }))
  }, [])

  const removeResume = useCallback((id: string) => {
    setState(s => ({ ...s, resumes: s.resumes.filter(r => r.id !== id) }))
  }, [])

  const enhanceResume = useCallback((id: string, forJob: string) => {
    setState(s => ({
      ...s,
      resumes: s.resumes.map(r =>
        r.id === id ? { ...r, enhancedFor: forJob, score: Math.min(98, r.score + 12) } : r
      ),
    }))
  }, [])

  /* ---------- AI tools ---------- */
  const addPrepSession = useCallback((ps: Omit<PrepSession, "id">) => {
    setState(s => ({ ...s, prepSessions: [{ ...ps, id: uid() }, ...s.prepSessions] }))
  }, [])

  const setAssessmentStatus = useCallback(
    (id: string, status: SkillAssessment["status"], score?: number) => {
      setState(s => ({
        ...s,
        assessments: s.assessments.map(a => (a.id === id ? { ...a, status, score } : a)),
      }))
    },
    []
  )

  const subscribePlan = useCallback((planId: string) => {
    setState(s => ({
      ...s,
      subscribedPlans: s.subscribedPlans.includes(planId)
        ? s.subscribedPlans
        : [...s.subscribedPlans, planId],
    }))
  }, [])

  /* ---------- community ---------- */
  const addPost = useCallback((p: Omit<CommunityPost, "id" | "likes" | "comments">) => {
    setState(s => ({
      ...s,
      posts: [{ ...p, id: uid(), likes: 0, comments: 0 }, ...s.posts],
    }))
  }, [])

  const toggleLike = useCallback((id: string) => {
    setState(s => ({
      ...s,
      posts: s.posts.map(p =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p
      ),
    }))
  }, [])

  /* ---------- credits ---------- */
  const spendCredits = useCallback((amount: number, label: string) => {
    let ok = false
    setState(s => {
      if (s.credits < amount) return s
      ok = true
      return {
        ...s,
        credits: s.credits - amount,
        creditTxns: [
          { id: uid(), label, date: "just now", amount: -amount, kind: "spend" as const },
          ...s.creditTxns,
        ],
      }
    })
    return ok
  }, [])

  /* ---------- settings ---------- */
  const updateSettings = useCallback((patch: Partial<SeekerSettings>) => {
    setState(s => ({ ...s, settings: { ...s.settings, ...patch } }))
  }, [])

  /* ---------- notifications ---------- */
  const markAllRead = useCallback(() => {
    setState(s => ({ ...s, notifications: s.notifications.map(n => ({ ...n, read: true })) }))
  }, [])

  const markRead = useCallback((id: string) => {
    setState(s => ({
      ...s,
      notifications: s.notifications.map(n => (n.id === id ? { ...n, read: true } : n)),
    }))
  }, [])

  /* ---------- messaging ---------- */
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

  /* ---------- checklist ---------- */
  const setStepDone = useCallback((id: string, done: boolean) => {
    setState(s => ({
      ...s,
      checklist: s.checklist.map(c => (c.id === id ? { ...c, done } : c)),
    }))
  }, [])

  const resetDemo = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    setState(seedState())
  }, [])

  const value = useMemo<SeekerContextValue>(
    () => ({
      state,
      updateProfile,
      addExperience: exp.add,
      updateExperience: exp.update,
      removeExperience: exp.remove,
      addEducation: edu.add,
      updateEducation: edu.update,
      removeEducation: edu.remove,
      addProject: proj.add,
      updateProject: proj.update,
      removeProject: proj.remove,
      addCertification: cert.add,
      updateCertification: cert.update,
      removeCertification: cert.remove,
      addSkill,
      removeSkill,
      trackJob,
      setStage,
      removeTracked,
      applyToJob,
      addResume,
      setPrimaryResume,
      removeResume,
      enhanceResume,
      addPrepSession,
      setAssessmentStatus,
      subscribePlan,
      addPost,
      toggleLike,
      spendCredits,
      updateSettings,
      markAllRead,
      markRead,
      sendMessage,
      markConversationRead,
      setStepDone,
      resetDemo,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state]
  )

  return <SeekerContext.Provider value={value}>{children}</SeekerContext.Provider>
}

export function useSeeker() {
  const ctx = useContext(SeekerContext)
  if (!ctx) throw new Error("useSeeker must be used inside <SeekerProvider>")
  return ctx
}
