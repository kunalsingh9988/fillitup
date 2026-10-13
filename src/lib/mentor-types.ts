// ── Mentor domain types ─────────────────────────────────────────────────────

export interface MentorPlan {
  id: string
  name: string
  price: number // ₹/mo
  blurb: string
  features: string[]
  published: boolean
  menteeCount: number
  paused?: boolean
}

export interface Mentee {
  id: string
  name: string
  initials: string
  role: string
  plan: string // plan name
  since: string
  renews: string
  avatarColor?: string
}

export interface MentorSession {
  id: string
  title: string
  menteeId: string
  date: string // e.g. "2026-03-28"
  time: string // e.g. "10:00 AM"
  status: "upcoming" | "past"
  notes?: string
}

export interface MentorReview {
  id: string
  author: string
  initials: string
  role: string
  ago: string
  rating: number
  text: string
  reply?: string
}

export interface MentorResource {
  id: string
  title: string
  kind: "video" | "pdf" | "template" | "link"
  meta: string // duration or size
  category: string
  views: number
  downloads: number
}

export interface MentorPayout {
  id: string
  label: string
  date: string
  amount: number // ₹
  status: "paid" | "pending"
}

export interface AvailabilityState {
  /** map of day → array of hour slots e.g. { Mon: ["09:00","10:00"] } */
  weekly: Record<string, string[]>
  sessionLength: number
  buffer: number
  blockedDates: string[]
}

export interface MentorProfile {
  name: string
  initials: string
  email: string
  headline: string
  bio: string
  expertise: string[]
  company: string
  hourlyRate: number
  languages: string[]
  timezone: string
  linkedin: string
  website: string
}

export interface MentorSettings {
  acceptMentees: boolean
  profileVisibility: boolean
  calendarConnected: string // url or ""
  twoFactor: boolean
  notifications: {
    messages: boolean
    sessionReminders: boolean
    productUpdates: boolean
    payoutAlerts: boolean
  }
}

export interface MentorChecklistStep {
  id: string
  title: string
  done: boolean
}
