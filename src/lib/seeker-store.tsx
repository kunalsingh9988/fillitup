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

import * as seed from "./seeker-data"
import { supabase } from "./supabase/client"
import { loadSeekerState } from "./supabase/data"
import { useAuth } from "./auth"
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
   Seeker store — Supabase-backed when signed in; seed + localStorage
   for guests so the open demo routes still work.
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
  subscribedPlans: string[]
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
  loading: boolean
  remote: boolean
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
  trackJob: (jobId: string, stage: ApplicationStage) => void
  setStage: (trackId: string, stage: ApplicationStage) => void
  removeTracked: (trackId: string) => void
  applyToJob: (jobId: string) => void
  addResume: (r: Omit<ResumeDoc, "id">) => void
  setPrimaryResume: (id: string) => void
  removeResume: (id: string) => void
  enhanceResume: (id: string, forJob: string) => void
  addPrepSession: (s: Omit<PrepSession, "id">) => void
  setAssessmentStatus: (id: string, status: SkillAssessment["status"], score?: number) => void
  subscribePlan: (planId: string) => void
  addPost: (p: Omit<CommunityPost, "id" | "likes" | "comments">) => void
  toggleLike: (id: string) => void
  spendCredits: (amount: number, label: string) => boolean
  updateSettings: (patch: Partial<SeekerSettings>) => void
  markAllRead: () => void
  markRead: (id: string) => void
  sendMessage: (conversationId: string, text: string) => void
  markConversationRead: (conversationId: string) => void
  setStepDone: (id: string, done: boolean) => void
  resetDemo: () => void
}

const SeekerContext = createContext<SeekerContextValue | null>(null)
const uid = () => crypto.randomUUID()

export function SeekerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [state, setState] = useState<SeekerState>(load)
  const [loading, setLoading] = useState(false)
  const remoteRef = useRef(false)

  /* hydrate from Supabase when signed in */
  useEffect(() => {
    if (!user) {
      remoteRef.current = false
      return
    }
    let alive = true
    setLoading(true)
    loadSeekerState(user.id, user.email)
      .then(s => {
        if (alive) {
          remoteRef.current = true
          setState(s)
        }
      })
      .catch(err => console.error("seeker load failed", err))
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

  const uidRef = useRef<string | null>(null)
  uidRef.current = user?.id ?? null

  /* FK anchor — most seeker tables reference seeker_profiles(user_id),
     which only exists after the profile row is created. Ensure it before
     every write so inserts never hit a dangling FK and profile-column
     updates never silently no-op on a missing row. */
  const seekerReady = useCallback(async (id: string) => {
    await supabase
      .from("seeker_profiles")
      .upsert({ user_id: id }, { onConflict: "user_id" })
  }, [])

  const db = useCallback(
    (fn: (uid: string) => PromiseLike<unknown>) => {
      const id = uidRef.current
      if (id && remoteRef.current)
        void (async () => {
          await seekerReady(id)
          await fn(id)
        })().catch((e: unknown) => console.error("db write failed", e))
    },
    [seekerReady]
  )

  /* ---------- profile ---------- */
  const SEEKER_COLS: Partial<Record<keyof SeekerProfile, string>> = {
    title: "title", location: "location", availability: "availability",
    about: "about", linkedin: "linkedin", github: "github", portfolio: "portfolio",
    skills: "skills", readiness: "readiness",
  }

  const updateProfile = useCallback((patch: Partial<SeekerProfile>) => {
    setState(s => ({ ...s, profile: { ...s.profile, ...patch } }))
    db(async id => {
      if (patch.name) await supabase.from("profiles").update({ full_name: patch.name }).eq("id", id)
      const cols: Record<string, unknown> = {}
      for (const [k, col] of Object.entries(SEEKER_COLS))
        if (patch[k as keyof SeekerProfile] !== undefined) cols[col] = patch[k as keyof SeekerProfile]
      if (Object.keys(cols).length)
        await supabase.from("seeker_profiles").upsert({ user_id: id, ...cols })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const listPatch = <T extends { id: string }>(
    key: "experience" | "education" | "projects" | "certifications",
    table: string
  ) => ({
    add: (item: Omit<T, "id">) => {
      const tempId = uid()
      setState(s => ({
        ...s,
        profile: {
          ...s.profile,
          [key]: [{ ...item, id: tempId } as T, ...(s.profile[key] as unknown as T[])],
        },
      }))
      db(async me => {
        const { data } = await supabase
          .from(table)
          .insert({ seeker_id: me, ...rowFor(table, item) })
          .select("id").single()
        if (data?.id)
          setState(s => ({
            ...s,
            profile: {
              ...s.profile,
              [key]: (s.profile[key] as unknown as T[]).map(x => (x.id === tempId ? { ...x, id: data.id } : x)),
            },
          }))
      })
    },
    update: (id: string, item: Omit<T, "id">) => {
      setState(s => ({
        ...s,
        profile: {
          ...s.profile,
          [key]: (s.profile[key] as unknown as T[]).map(x => (x.id === id ? ({ ...item, id } as T) : x)),
        },
      }))
      db(() => supabase.from(table).update(rowFor(table, item)).eq("id", id))
    },
    remove: (id: string) => {
      setState(s => ({
        ...s,
        profile: {
          ...s.profile,
          [key]: (s.profile[key] as unknown as T[]).filter(x => x.id !== id),
        },
      }))
      db(() => supabase.from(table).delete().eq("id", id))
    },
  })

  const exp = listPatch<Experience>("experience", "seeker_experience")
  const edu = listPatch<Education>("education", "seeker_education")
  const proj = listPatch<Project>("projects", "seeker_projects")
  const cert = listPatch<Certification>("certifications", "seeker_certifications")

  const addSkill = useCallback((skill: string) => {
    setState(s => ({
      ...s,
      profile: {
        ...s.profile,
        skills: s.profile.skills.includes(skill) ? s.profile.skills : [...s.profile.skills, skill],
      },
    }))
    db(id => supabase.from("seeker_profiles").update({ skills: [...state.profile.skills, skill] }).eq("user_id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, state.profile.skills])

  const removeSkill = useCallback((skill: string) => {
    setState(s => ({
      ...s,
      profile: { ...s.profile, skills: s.profile.skills.filter(x => x !== skill) },
    }))
    db(id => supabase.from("seeker_profiles").update({ skills: state.profile.skills.filter(x => x !== skill) }).eq("user_id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, state.profile.skills])

  /* ---------- jobs & tracker ---------- */
  const trackJob = useCallback((jobId: string, stage: ApplicationStage) => {
    setState(s => {
      const existing = s.tracker.find(t => t.jobId === jobId)
      if (existing)
        return { ...s, tracker: s.tracker.map(t => (t.jobId === jobId ? { ...t, stage } : t)) }
      return { ...s, tracker: [{ id: uid(), jobId, stage }, ...s.tracker] }
    })
    db(id => supabase.from("applications").upsert(
      { job_id: jobId, seeker_id: id, stage },
      { onConflict: "job_id,seeker_id" }
    ))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const setStage = useCallback((trackId: string, stage: ApplicationStage) => {
    setState(s => ({
      ...s,
      tracker: s.tracker.map(t => (t.id === trackId ? { ...t, stage } : t)),
    }))
    db(() => supabase.from("applications").update({ stage }).eq("id", trackId))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const removeTracked = useCallback((trackId: string) => {
    setState(s => ({ ...s, tracker: s.tracker.filter(t => t.id !== trackId) }))
    db(() => supabase.from("applications").delete().eq("id", trackId))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const applyToJob = useCallback((jobId: string) => {
    setState(s => {
      const tracked = s.tracker.find(t => t.jobId === jobId)
      return {
        ...s,
        appliedJobs: s.appliedJobs.includes(jobId) ? s.appliedJobs : [...s.appliedJobs, jobId],
        tracker: tracked
          ? s.tracker.map(t => t.jobId === jobId ? { ...t, stage: "applied", appliedOn: "just now" } : t)
          : [{ id: uid(), jobId, stage: "applied" as const, appliedOn: "just now" }, ...s.tracker],
      }
    })
    db(id => supabase.from("applications").upsert(
      { job_id: jobId, seeker_id: id, stage: "applied" },
      { onConflict: "job_id,seeker_id" }
    ))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  /* ---------- resumes ---------- */
  const addResume = useCallback((r: Omit<ResumeDoc, "id">) => {
    const tempId = uid()
    setState(s => ({ ...s, resumes: [{ ...r, id: tempId }, ...s.resumes] }))
    db(async me => {
      const { data } = await supabase.from("resumes")
        .insert({ seeker_id: me, name: r.name, is_primary: r.primary, score: r.score })
        .select("id").single()
      if (data?.id)
        setState(s => ({ ...s, resumes: s.resumes.map(x => x.id === tempId ? { ...x, id: data.id } : x) }))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const setPrimaryResume = useCallback((id: string) => {
    setState(s => ({ ...s, resumes: s.resumes.map(r => ({ ...r, primary: r.id === id })) }))
    db(async me => {
      await supabase.from("resumes").update({ is_primary: false }).eq("seeker_id", me)
      await supabase.from("resumes").update({ is_primary: true }).eq("id", id)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const removeResume = useCallback((id: string) => {
    setState(s => ({ ...s, resumes: s.resumes.filter(r => r.id !== id) }))
    db(() => supabase.from("resumes").delete().eq("id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const enhanceResume = useCallback((id: string, forJob: string) => {
    setState(s => ({
      ...s,
      resumes: s.resumes.map(r =>
        r.id === id ? { ...r, enhancedFor: forJob, score: Math.min(98, r.score + 12) } : r
      ),
    }))
    // real AI enhancement lands via the resume-analyze edge function later
  }, [])

  /* ---------- AI tools ---------- */
  const addPrepSession = useCallback((ps: Omit<PrepSession, "id">) => {
    const tempId = uid()
    setState(s => ({ ...s, prepSessions: [{ ...ps, id: tempId }, ...s.prepSessions] }))
    db(me => supabase.from("interview_sessions").insert({
      seeker_id: me, kind: ps.category, score: ps.score,
      detail: { topic: ps.topic, duration: ps.duration, feedback: ps.feedback },
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const setAssessmentStatus = useCallback(
    (id: string, status: SkillAssessment["status"], score?: number) => {
      const skill = state.assessments.find(a => a.id === id)?.skill
      setState(s => ({
        ...s,
        assessments: s.assessments.map(a => (a.id === id ? { ...a, status, score } : a)),
      }))
      if (skill && (status === "passed" || status === "failed"))
        db(me => supabase.from("skill_assessments").upsert(
          { seeker_id: me, skill, status, score },
          { onConflict: "seeker_id,skill" }
        ))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [db, state.assessments]
  )

  const subscribePlan = useCallback((planId: string) => {
    setState(s => ({
      ...s,
      subscribedPlans: s.subscribedPlans.includes(planId) ? s.subscribedPlans : [...s.subscribedPlans, planId],
    }))
    db(async me => {
      const { data: plan } = await supabase.from("mentor_plans").select("mentor_id").eq("id", planId).single()
      if (plan)
        await supabase.from("mentor_subscriptions").insert({
          plan_id: planId, mentor_id: plan.mentor_id, mentee_id: me, status: "active",
        })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  /* ---------- community ---------- */
  const addPost = useCallback((p: Omit<CommunityPost, "id" | "likes" | "comments">) => {
    const tempId = uid()
    setState(s => ({ ...s, posts: [{ ...p, id: tempId, likes: 0, comments: 0 }, ...s.posts] }))
    db(async me => {
      const { data } = await supabase.from("community_posts")
        .insert({ author_id: me, tag: p.tag, body: p.body })
        .select("id").single()
      if (data?.id)
        setState(s => ({ ...s, posts: s.posts.map(x => x.id === tempId ? { ...x, id: data.id } : x) }))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const toggleLike = useCallback((id: string) => {
    const liked = state.posts.find(p => p.id === id)?.liked
    setState(s => ({
      ...s,
      posts: s.posts.map(p =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p
      ),
    }))
    db(me => liked
      ? supabase.from("community_likes").delete().eq("post_id", id).eq("user_id", me)
      : supabase.from("community_likes").insert({ post_id: id, user_id: me })
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, state.posts])

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
    if (ok) db(me => supabase.from("credit_transactions").insert({ user_id: me, delta: -amount, reason: label }))
    return ok
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  /* ---------- settings ---------- */
  const updateSettings = useCallback((patch: Partial<SeekerSettings>) => {
    setState(s => ({ ...s, settings: { ...s.settings, ...patch } }))
    db(me => supabase.from("user_settings").upsert(
      { user_id: me, data: { ...state.settings, ...patch } },
      { onConflict: "user_id" }
    ))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, state.settings])

  /* ---------- notifications ---------- */
  const markAllRead = useCallback(() => {
    setState(s => ({ ...s, notifications: s.notifications.map(n => ({ ...n, read: true })) }))
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

  /* ---------- checklist ---------- */
  const setStepDone = useCallback((id: string, done: boolean) => {
    setState(s => {
      const checklist = s.checklist.map(c => (c.id === id ? { ...c, done } : c))
      db(me => supabase.from("seeker_profiles").upsert({ user_id: me, checklist }))
      return { ...s, checklist }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const resetDemo = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    remoteRef.current = false
    setState(seedState())
  }, [])

  const value = useMemo<SeekerContextValue>(
    () => ({
      state, loading, remote: remoteRef.current,
      updateProfile,
      addExperience: exp.add, updateExperience: exp.update, removeExperience: exp.remove,
      addEducation: edu.add, updateEducation: edu.update, removeEducation: edu.remove,
      addProject: proj.add, updateProject: proj.update, removeProject: proj.remove,
      addCertification: cert.add, updateCertification: cert.update, removeCertification: cert.remove,
      addSkill, removeSkill,
      trackJob, setStage, removeTracked, applyToJob,
      addResume, setPrimaryResume, removeResume, enhanceResume,
      addPrepSession, setAssessmentStatus, subscribePlan,
      addPost, toggleLike, spendCredits, updateSettings,
      markAllRead, markRead, sendMessage, markConversationRead,
      setStepDone, resetDemo,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, loading]
  )

  return <SeekerContext.Provider value={value}>{children}</SeekerContext.Provider>
}

/** map UI item shapes to table columns for the four profile lists */
function rowFor(table: string, item: Record<string, unknown>) {
  switch (table) {
    case "seeker_experience":
      return { role: item.role, company: item.company, period: item.period, description: item.description }
    case "seeker_education":
      return { degree: item.degree, school: item.school, period: item.period }
    case "seeker_projects":
      return { name: item.name, description: item.description, link: item.link || null }
    case "seeker_certifications":
      return { name: item.name, issuer: item.issuer, year: item.year }
    default:
      return item
  }
}

export function useSeeker() {
  const ctx = useContext(SeekerContext)
  if (!ctx) throw new Error("useSeeker must be used inside <SeekerProvider>")
  return ctx
}
