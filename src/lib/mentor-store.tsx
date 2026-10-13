import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import * as seed from "./mentor-data"
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
   Mentor demo store — seed data + localStorage persistence.
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
  // profile
  updateProfile: (patch: Partial<MentorProfile>) => void
  // plans
  addPlan: (p: Omit<MentorPlan, "id" | "menteeCount">) => void
  updatePlan: (id: string, patch: Partial<MentorPlan>) => void
  togglePlanPaused: (id: string) => void
  // mentees
  removeMentee: (id: string) => void
  // sessions
  addSession: (s: Omit<MentorSession, "id">) => void
  rescheduleSession: (id: string, date: string, time: string) => void
  cancelSession: (id: string) => void
  // reviews
  replyReview: (id: string, reply: string) => void
  // resources
  addResource: (r: Omit<MentorResource, "id" | "views" | "downloads">) => void
  removeResource: (id: string) => void
  // availability
  toggleSlot: (day: string, slot: string) => void
  setAvailability: (patch: Partial<AvailabilityState>) => void
  addBlockedDate: (d: string) => void
  removeBlockedDate: (d: string) => void
  // settings
  updateSettings: (patch: Partial<MentorSettings>) => void
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

const MentorContext = createContext<MentorContextValue | null>(null)
const uid = () => Math.random().toString(36).slice(2, 10)

export function MentorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MentorState>(load)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage full/blocked */
    }
  }, [state])

  const updateProfile = useCallback((patch: Partial<MentorProfile>) => {
    setState(s => ({ ...s, profile: { ...s.profile, ...patch } }))
  }, [])

  const addPlan = useCallback((p: Omit<MentorPlan, "id" | "menteeCount">) => {
    setState(s => ({ ...s, plans: [...s.plans, { ...p, id: uid(), menteeCount: 0 }] }))
  }, [])

  const updatePlan = useCallback((id: string, patch: Partial<MentorPlan>) => {
    setState(s => ({ ...s, plans: s.plans.map(p => (p.id === id ? { ...p, ...patch } : p)) }))
  }, [])

  const togglePlanPaused = useCallback((id: string) => {
    setState(s => ({
      ...s,
      plans: s.plans.map(p => (p.id === id ? { ...p, paused: !p.paused } : p)),
    }))
  }, [])

  const removeMentee = useCallback((id: string) => {
    setState(s => ({ ...s, mentees: s.mentees.filter(m => m.id !== id) }))
  }, [])

  const addSession = useCallback((sess: Omit<MentorSession, "id">) => {
    setState(s => ({ ...s, sessions: [{ ...sess, id: uid() }, ...s.sessions] }))
  }, [])

  const rescheduleSession = useCallback((id: string, date: string, time: string) => {
    setState(s => ({
      ...s,
      sessions: s.sessions.map(x => (x.id === id ? { ...x, date, time } : x)),
    }))
  }, [])

  const cancelSession = useCallback((id: string) => {
    setState(s => ({ ...s, sessions: s.sessions.filter(x => x.id !== id) }))
  }, [])

  const replyReview = useCallback((id: string, reply: string) => {
    setState(s => ({
      ...s,
      reviews: s.reviews.map(r => (r.id === id ? { ...r, reply } : r)),
    }))
  }, [])

  const addResource = useCallback((r: Omit<MentorResource, "id" | "views" | "downloads">) => {
    setState(s => ({
      ...s,
      resources: [{ ...r, id: uid(), views: 0, downloads: 0 }, ...s.resources],
    }))
  }, [])

  const removeResource = useCallback((id: string) => {
    setState(s => ({ ...s, resources: s.resources.filter(r => r.id !== id) }))
  }, [])

  const toggleSlot = useCallback((day: string, slot: string) => {
    setState(s => {
      const cur = s.availability.weekly[day] ?? []
      const next = cur.includes(slot) ? cur.filter(x => x !== slot) : [...cur, slot].sort()
      return { ...s, availability: { ...s.availability, weekly: { ...s.availability.weekly, [day]: next } } }
    })
  }, [])

  const setAvailability = useCallback((patch: Partial<AvailabilityState>) => {
    setState(s => ({ ...s, availability: { ...s.availability, ...patch } }))
  }, [])

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
  }, [])

  const removeBlockedDate = useCallback((d: string) => {
    setState(s => ({
      ...s,
      availability: {
        ...s.availability,
        blockedDates: s.availability.blockedDates.filter(x => x !== d),
      },
    }))
  }, [])

  const updateSettings = useCallback((patch: Partial<MentorSettings>) => {
    setState(s => ({ ...s, settings: { ...s.settings, ...patch } }))
  }, [])

  const markAllRead = useCallback(() => {
    setState(s => ({ ...s, notifications: s.notifications.map(n => ({ ...n, read: true })) }))
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

  const value = useMemo<MentorContextValue>(
    () => ({
      state,
      updateProfile,
      addPlan,
      updatePlan,
      togglePlanPaused,
      removeMentee,
      addSession,
      rescheduleSession,
      cancelSession,
      replyReview,
      addResource,
      removeResource,
      toggleSlot,
      setAvailability,
      addBlockedDate,
      removeBlockedDate,
      updateSettings,
      markAllRead,
      markRead,
      sendMessage,
      markConversationRead,
      setStepDone,
      resetDemo,
    }),
    [
      state,
      updateProfile,
      addPlan,
      updatePlan,
      togglePlanPaused,
      removeMentee,
      addSession,
      rescheduleSession,
      cancelSession,
      replyReview,
      addResource,
      removeResource,
      toggleSlot,
      setAvailability,
      addBlockedDate,
      removeBlockedDate,
      updateSettings,
      markAllRead,
      markRead,
      sendMessage,
      markConversationRead,
      setStepDone,
      resetDemo,
    ]
  )

  return <MentorContext.Provider value={value}>{children}</MentorContext.Provider>
}

export function useMentor() {
  const ctx = useContext(MentorContext)
  if (!ctx) throw new Error("useMentor must be used inside <MentorProvider>")
  return ctx
}
