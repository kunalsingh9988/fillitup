/* ----------------------------------------------------------------
   Employer-domain types — mirror the "Job Poster" Figma page.
   All data comes from src/lib/employer-data.ts (mock, DEMO_DATA).
   ---------------------------------------------------------------- */

export type JobStatus = "active" | "draft" | "closed"
export type WorkplaceType = "Remote" | "Hybrid" | "On-site"
export type EmploymentType = "Full-time" | "Part-time" | "Contract" | "Internship"
export type ExperienceLevel = "Entry" | "Mid" | "Senior" | "Lead" | "Executive"

export interface ScreeningQuestion {
  question: string
  mustHave: boolean
}

export interface EmployerJob {
  id: string
  title: string
  department: string
  location: string
  workplace: WorkplaceType
  type: EmploymentType
  level: ExperienceLevel
  status: JobStatus
  applicants: number
  views: number
  shortlisted: number
  hired: number
  salaryMin?: number
  salaryMax?: number
  currency: string
  description: string
  responsibilities: string[]
  qualifications: string[]
  skills: string[]
  screening: ScreeningQuestion[]
  education: "Any" | "Bachelor's" | "Master's" | "PhD"
}

export type CandidateStatus =
  | "new"
  | "screened"
  | "shortlisted"
  | "interview"
  | "offer"
  | "hired"
  | "rejected"

export interface CandidateNote {
  id: string
  text: string
  ago: string
}

export interface Candidate {
  id: string
  name: string
  initials: string
  title: string
  location: string
  years: number
  skills: string[]
  match: number
  matchBreakdown: { skills: number; experience: number; culture: number }
  rationale: string
  status: CandidateStatus
  appliedFor: string // job id
  appliedAgo: string
  source: "Fill-it-up" | "LinkedIn" | "Naukri" | "Indeed"
  isAiPick: boolean
  assignedTo?: string
  notes: CandidateNote[]
}

export type TeamRole =
  | "Super Admin"
  | "Admin"
  | "Hiring Manager"
  | "Interviewer"
  | "Vendor"

export interface TeamMember {
  id: string
  name: string
  initials: string
  email: string
  phone: string
  role: TeamRole
  pending?: boolean
}

export interface ActivityEntry {
  id: string
  actor: string
  action: string
  ago: string
}

export interface ChatMessage {
  id: string
  from: "us" | "them"
  text: string
  ago: string
}

export interface Conversation {
  id: string
  candidateId: string
  subject: string
  preview: string
  ago: string
  unread: number
  messages: ChatMessage[]
}

export interface AppNotification {
  id: string
  text: string
  ago: string
  read: boolean
}

export interface Interview {
  id: string
  candidateId: string
  round: string
  jobTitle: string
  when: string
  predictedFit: number
}

export interface CompanyProfile {
  name: string
  initials: string
  industry: string
  location: string
  size: string
  openRoles: number
  plan: string
  website: string
  linkedin: string
  twitter: string
  about: string
  founded: string
  headquarters: string
  funding: string
  revenue: string
  techStack: string[]
  benefits: string[]
  values: string[]
  locations: { name: string; hq?: boolean }[]
}

export interface EmployerSettings {
  blindHiring: boolean
  twoFactor: boolean
  integrations: { calendar: boolean; slack: boolean; ats: boolean }
  notifications: {
    newApplicants: boolean
    interviewReminders: boolean
    weeklyReport: boolean
    aiAlerts: boolean
    productUpdates: boolean
  }
  analyticsSections: Record<string, boolean>
}

export interface OnboardingStep {
  id: string
  title: string
  description: string
  done: boolean
}

export const CANDIDATE_STATUS_LABEL: Record<CandidateStatus, string> = {
  new: "New",
  screened: "Screened",
  shortlisted: "Shortlisted",
  interview: "Interview",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
}

export interface InviteSuggestion {
  candidateId: string
  jobId: string
}
