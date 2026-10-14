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

import * as seed from "./mentor-data"
import { supabase } from "./supabase/client"
import { loadMentorState } from "./supabase/data"
import { useAuth } from "./auth"
import type { AppNotification, ChatMessage, Conversation } from "./employer-types"
import type {
  AvailabilityState,
  Mentee,
  MentorChecklistStep,
  MentorPayout,
  MentorPlan,
  MentorProfile,
  MentorResource,
  MentorReview,
  MentorSession,
  MentorSettings,
} from "./mentor-types"

/* ----------------------------------------------------------------
   Mentor store — Supabase-backed when signed in; seed + localStorage
   for guests so the open demo routes still work.
   ---------------------------------------------------------------- */

const STORAGE_KEY = "fillitup-mentor-v1"

export interface MentorState {
  profile: MentorProfile
  plans: MentorPlan[]
  mentees: Mentee[]
  sessions: MentorSession[]
  reviews: MentorReview[]
  resources: MentorResource[]
  payouts: MentorPayout[]
  availability: AvailabilityState
  settings: MentorSettings
  checklist: MentorChecklistStep[]
  notifications: AppNotification[]
  conversations: Conversation[]
}

function seedState(): MentorState {
  return {
    profile: seed.mentorProfile,
    plans: seed.mentorPlans,
    mentees: seed.mentees,
    sessions: seed.mentorSessions,
    reviews: seed.mentorReviews,
    resources: seed.mentorResources,
    payouts: seed.mentorPayouts,
    availability: seed.mentorAvailability,
    settings: seed.mentorSettings,
    checklist: seed.mentorChecklist,
    notifications: seed.mentorNotifications,
    conversations: seed.mentorConversations,
  }
}

function load(): MentorState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...seedState(), ...JSON.parse(raw) }
  } catch {
    /* corrupted storage — reseed */
  }
  return seedState()
}

interface MentorContextValue {
  state: MentorState
  loading: boolean
  remote: boolean
  updateProfile: (patch: Partial<MentorProfile>) => void
  addPlan: (p: Omit<MentorPlan, "id" | "menteeCount">) => void
  updatePlan: (id: string, patch: Partial<MentorPlan>) => void
  togglePlanPaused: (id: string) => void
  removeMentee: (id: string) => void
  addSession: (s: Omit<MentorSession, "id">) => void
  rescheduleSession: (id: string, date: string, time: string) => void
  cancelSession: (id: string) => void
  replyReview: (id: string, reply: string) => void
  addResource: (r: Omit<MentorResource, "id" | "views" | "downloads">) => void
  removeResource: (id: string) => void
  toggleSlot: (day: string, slot: string) => void
  setAvailability: (patch: Partial<AvailabilityState>) => void
  addBlockedDate: (d: string) => void
  removeBlockedDate: (d: string) => void
  updateSettings: (patch: Partial<MentorSettings>) => void
  markAllRead: () => void
  markRead: (id: string) => void
  sendMessage: (conversationId: string, text: string) => void
  markConversationRead: (conversationId: string) => void
  setStepDone: (id: string, done: boolean) => void
  resetDemo: () => void
}

const MentorContext = createContext<MentorContextValue | null>(null)
const uid = () => crypto.randomUUID()

function toScheduled(date: string, time: string): string {
  const d = new Date(`${date} ${time}`)
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
}

export function MentorProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [state, setState] = useState<MentorState>(load)
  const [loading, setLoading] = useState(false)
  const remoteRef = useRef(false)
  const uidRef = useRef<string | null>(null)
  uidRef.current = user?.id ?? null

  /* hydrate from Supabase when signed in */
  useEffect(() => {
    if (!user) {
      remoteRef.current = false
      return
    }
    let alive = true
    setLoading(true)
    loadMentorState(user.id, user.email)
      .then(s => {
        if (!alive) return
        remoteRef.current = true
        setState(prev => ({
          ...prev,
          ...s,
          settings: { ...prev.settings, ...(s.settings ?? {}) },
          checklist: s.checklist?.length ? s.checklist : prev.checklist,
        } as MentorState))
      })
      .catch(err => console.error("mentor load failed", err))
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
    (fn: (uid: string) => PromiseLike<unknown>) => {
      const id = uidRef.current
      if (id && remoteRef.current)
        void Promise.resolve(fn(id)).catch((e: unknown) => console.error("db write failed", e))
    },
    []
  )

  const PROFILE_COLS: Partial<Record<keyof MentorProfile, string>> = {
    headline: "headline", bio: "bio", expertise: "expertise", company: "company",
    hourlyRate: "hourly_rate", languages: "languages", timezone: "timezone",
    linkedin: "linkedin", website: "website",
  }

  const updateProfile = useCallback((patch: Partial<MentorProfile>) => {
    setState(s => ({ ...s, profile: { ...s.profile, ...patch } }))
    db(async id => {
      if (patch.name) await supabase.from("profiles").update({ full_name: patch.name }).eq("id", id)
      const cols: Record<string, unknown> = {}
      for (const [k, col] of Object.entries(PROFILE_COLS))
        if (patch[k as keyof MentorProfile] !== undefined) cols[col] = patch[k as keyof MentorProfile]
      if (Object.keys(cols).length)
        await supabase.from("mentor_profiles").upsert({ user_id: id, ...cols })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const addPlan = useCallback((p: Omit<MentorPlan, "id" | "menteeCount">) => {
    const tempId = uid()
    setState(s => ({ ...s, plans: [...s.plans, { ...p, id: tempId, menteeCount: 0 }] }))
    db(async me => {
      const { data } = await supabase.from("mentor_plans").insert({
        mentor_id: me, name: p.name, price: p.price, blurb: p.blurb,
        features: p.features, published: p.published,
      }).select("id").single()
      if (data?.id)
        setState(s => ({ ...s, plans: s.plans.map(x => (x.id === tempId ? { ...x, id: data.id } : x)) }))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const updatePlan = useCallback((id: string, patch: Partial<MentorPlan>) => {
    setState(s => ({ ...s, plans: s.plans.map(p => (p.id === id ? { ...p, ...patch } : p)) }))
    const cols: Record<string, unknown> = {}
    for (const [k, col] of Object.entries({ name: "name", price: "price", blurb: "blurb", features: "features", published: "published", paused: "paused" }))
      if ((patch as Record<string, unknown>)[k] !== undefined) cols[col] = (patch as Record<string, unknown>)[k]
    if (Object.keys(cols).length)
      db(() => supabase.from("mentor_plans").update(cols).eq("id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const togglePlanPaused = useCallback((id: string) => {
    const plan = state.plans.find(p => p.id === id)
    setState(s => ({
      ...s,
      plans: s.plans.map(p => (p.id === id ? { ...p, paused: !p.paused } : p)),
    }))
    if (plan) db(() => supabase.from("mentor_plans").update({ paused: !plan.paused }).eq("id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, state.plans])

  const removeMentee = useCallback((id: string) => {
    setState(s => ({ ...s, mentees: s.mentees.filter(m => m.id !== id) }))
    db(me => supabase.from("mentor_subscriptions")
      .update({ status: "canceled" })
      .eq("mentor_id", me).eq("mentee_id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const addSession = useCallback((sess: Omit<MentorSession, "id">) => {
    const tempId = uid()
    setState(s => ({ ...s, sessions: [{ ...sess, id: tempId }, ...s.sessions] }))
    db(async me => {
      const { data } = await supabase.from("mentor_sessions").insert({
        mentor_id: me, mentee_id: sess.menteeId, title: sess.title,
        scheduled_at: toScheduled(sess.date, sess.time),
        status: sess.status === "upcoming" ? "scheduled" : "completed",
      }).select("id").single()
      if (data?.id)
        setState(s => ({ ...s, sessions: s.sessions.map(x => (x.id === tempId ? { ...x, id: data.id } : x)) }))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const rescheduleSession = useCallback((id: string, date: string, time: string) => {
    setState(s => ({
      ...s,
      sessions: s.sessions.map(x => (x.id === id ? { ...x, date, time } : x)),
    }))
    db(() => supabase.from("mentor_sessions")
      .update({ scheduled_at: toScheduled(date, time) }).eq("id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const cancelSession = useCallback((id: string) => {
    setState(s => ({ ...s, sessions: s.sessions.filter(x => x.id !== id) }))
    db(() => supabase.from("mentor_sessions").update({ status: "canceled" }).eq("id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const replyReview = useCallback((id: string, reply: string) => {
    setState(s => ({
      ...s,
      reviews: s.reviews.map(r => (r.id === id ? { ...r, reply } : r)),
    }))
    db(() => supabase.from("mentor_reviews").update({ reply }).eq("id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const addResource = useCallback((r: Omit<MentorResource, "id" | "views" | "downloads">) => {
    const tempId = uid()
    setState(s => ({
      ...s,
      resources: [{ ...r, id: tempId, views: 0, downloads: 0 }, ...s.resources],
    }))
    db(async me => {
      const { data } = await supabase.from("mentor_resources").insert({
        mentor_id: me, title: r.title, kind: r.kind, category: r.category, meta: r.meta,
      }).select("id").single()
      if (data?.id)
        setState(s => ({ ...s, resources: s.resources.map(x => (x.id === tempId ? { ...x, id: data.id } : x)) }))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const removeResource = useCallback((id: string) => {
    setState(s => ({ ...s, resources: s.resources.filter(r => r.id !== id) }))
    db(() => supabase.from("mentor_resources").delete().eq("id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const toggleSlot = useCallback((day: string, slot: string) => {
    setState(s => {
      const cur = s.availability.weekly[day] ?? []
      const next = cur.includes(slot) ? cur.filter(x => x !== slot) : [...cur, slot].sort()
      const weekly = { ...s.availability.weekly, [day]: next }
      db(me => supabase.from("mentor_availability").upsert({ mentor_id: me, weekly }))
      return { ...s, availability: { ...s.availability, weekly } }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const setAvailability = useCallback((patch: Partial<AvailabilityState>) => {
    setState(s => ({ ...s, availability: { ...s.availability, ...patch } }))
    const cols: Record<string, unknown> = {}
    if (patch.sessionLength !== undefined) cols.session_length = patch.sessionLength
    if (patch.buffer !== undefined) cols.buffer_minutes = patch.buffer
    if (patch.weekly !== undefined) cols.weekly = patch.weekly
    if (Object.keys(cols).length)
      db(me => supabase.from("mentor_availability").upsert({ mentor_id: me, ...cols }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const addBlockedDate = useCallback((d: string) => {
    setState(s => ({
      ...s,
      availability: {
        ...s.availability,
        blockedDates: s.availability.blockedDates.includes(d)
          ? s.availability.blockedDates
          : [...s.availability.blockedDates, d],
      },
    }))
    db(me => supabase.from("mentor_blocked_dates").insert({ mentor_id: me, day: d }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const removeBlockedDate = useCallback((d: string) => {
    setState(s => ({
      ...s,
      availability: {
        ...s.availability,
        blockedDates: s.availability.blockedDates.filter(x => x !== d),
      },
    }))
    db(me => supabase.from("mentor_blocked_dates").delete().eq("mentor_id", me).eq("day", d))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const updateSettings = useCallback((patch: Partial<MentorSettings>) => {
    setState(s => ({ ...s, settings: { ...s.settings, ...patch } }))
    db(me => supabase.from("user_settings").upsert(
      { user_id: me, data: { ...state.settings, ...patch } },
      { onConflict: "user_id" }
    ))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, state.settings])

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

  const setStepDone = useCallback((id: string, done: boolean) => {
    setState(s => {
      const checklist = s.checklist.map(c => (c.id === id ? { ...c, done } : c))
      db(me => supabase.from("mentor_profiles").upsert({ user_id: me, checklist }))
      return { ...s, checklist }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const resetDemo = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    remoteRef.current = false
    setState(seedState())
  }, [])

  const value = useMemo<MentorContextValue>(
    () => ({
      state, loading, remote: remoteRef.current,
      updateProfile, addPlan, updatePlan, togglePlanPaused, removeMentee,
      addSession, rescheduleSession, cancelSession,
      replyReview, addResource, removeResource,
      toggleSlot, setAvailability, addBlockedDate, removeBlockedDate,
      updateSettings, markAllRead, markRead,
      sendMessage, markConversationRead, setStepDone, resetDemo,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, loading]
  )

  return <MentorContext.Provider value={value}>{children}</MentorContext.Provider>
}

export function useMentor() {
  const ctx = useContext(MentorContext)
  if (!ctx) throw new Error("useMentor must be used inside <MentorProvider>")
  return ctx
}
