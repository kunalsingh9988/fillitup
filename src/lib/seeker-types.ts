// ── Job seeker domain types (mock-data shapes; swap for Supabase later) ──────

export type ApplicationStage =
  | "saved"
  | "in_progress"
  | "applied"
  | "interview"
  | "offer"
  | "rejected"
  | "archived"

export const STAGE_LABEL: Record<ApplicationStage, string> = {
  saved: "Saved",
  in_progress: "In Progress",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  archived: "Archived",
}

export interface SeekerJob {
  id: string
  company: string
  logoInitials: string
  title: string
  location: string
  type: string // Full-time / Contract
  salary: string
  posted: string
  matchScore: number
  tags: string[]
  about: string
  responsibilities: string[]
  requirements: string[]
  benefits: string[]
  applyType: "quick" | "easy" | "standard"
  // AI match analysis
  aiSummary: string
  skillsMatched: [number, number] // matched of listed
  fitPoints: string[]
  gaps: string[]
  salaryContext: string
  resumeTips: string[]
  prepPoints: string[]
  growth: string
  teamSize: string
  reportsTo: string
}

export interface TrackedApplication {
  id: string
  jobId: string
  stage: ApplicationStage
  appliedOn?: string
  nextStep?: string
  note?: string
}

export interface ResumeDoc {
  id: string
  name: string
  updated: string
  size: string
  primary: boolean
  score: number
  enhancedFor?: string
}

export interface Experience {
  id: string
  role: string
  company: string
  initials: string
  period: string
  description: string
}

export interface Education {
  id: string
  degree: string
  school: string
  period: string
}

export interface Project {
  id: string
  name: string
  description: string
  link?: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  year: string
}

export interface AchievementBadge {
  id: string
  title: string
  description: string
  earned: string
  kind: "system" | "custom"
}

export interface SeekerProfile {
  name: string
  initials: string
  title: string
  location: string
  joined: string
  email: string
  phone: string
  availability: string
  about: string
  skills: string[]
  aiSuggestedSkills: string[]
  portfolio: string
  github: string
  linkedin: string
  readiness: number
  profileStrength: number
  experience: Experience[]
  education: Education[]
  projects: Project[]
  certifications: Certification[]
  badges: AchievementBadge[]
}

export interface PrepCategory {
  id: string
  name: string
  topics: string[]
}

export interface PrepSession {
  id: string
  topic: string
  category: string
  duration: string
  date: string
  score: number
  feedback: string[]
}

export interface QuizQuestion {
  q: string
  options: string[]
  answer: number
}

export interface SkillAssessment {
  id: string
  skill: string
  questions: number
  minutes: number
  passPct: number
  status: "none" | "in_progress" | "passed" | "failed"
  score?: number
  quiz: QuizQuestion[]
}

export interface MentorPlan {
  id: string
  name: string
  price: number
  blurb: string
  features: string[]
  recommended?: boolean
}

export interface MentorListing {
  id: string
  name: string
  initials: string
  role: string
  company: string
  rating: number
  mentees: number
  responseTime: string
  about: string
  expertise: string[]
  videos: { title: string; duration: string }[]
  resources: { title: string; kind: string }[]
  plans: MentorPlan[]
  reviews: { name: string; role: string; ago: string; text: string; rating: number }[]
}

export interface CommunityPost {
  id: string
  author: string
  initials: string
  role: string
  ago: string
  tag: string
  title: string
  body: string
  likes: number
  comments: number
  liked?: boolean
}

export interface CreditTransaction {
  id: string
  label: string
  date: string
  amount: number
  kind: "spend" | "earn"
}

export interface Invoice {
  id: string
  date: string
  amount: string
  status: "paid" | "pending"
  plan: string
}

export interface SeekerSettings {
  profileVisibility: boolean
  openToWork: boolean
  jobAlerts: boolean
  aiAutoApply: boolean
  twoFactor: boolean
  notifications: {
    jobMatches: boolean
    applicationUpdates: boolean
    messages: boolean
    weeklyDigest: boolean
    productUpdates: boolean
  }
}

export interface ChecklistStep {
  id: string
  title: string
  description: string
  done: boolean
}
