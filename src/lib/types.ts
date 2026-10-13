export type Role = "seeker" | "employer" | "mentor"

export interface Job {
  id: string
  title: string
  company: string
  companyInitials: string
  location: string
  type: string
  salary: string
  postedAgo: string
  tags: string[]
  hiringFor?: string
  matchScore?: number
}

export interface Testimonial {
  quote: string
  name: string
  transition: string
  initials: string
}

export interface PricingTier {
  name: string
  monthly: number
  description: string
  cta: string
  popular?: boolean
  features: string[]
}

export interface FAQ {
  q: string
  a: string
}
