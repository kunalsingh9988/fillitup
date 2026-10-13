import type { FAQ, Job, PricingTier, Testimonial } from "./types"

/* ---------------------------------------------------------------
   Demo/seed data — powers the frontend until Supabase is wired in.
   All entities here are mock data flagged for replacement.
   --------------------------------------------------------------- */

export const DEMO_DATA = true

export const trendingJobs: Job[] = [
  { id: "j1", title: "Senior Product Designer", company: "Vertex Labs", companyInitials: "VL", location: "Remote", type: "Full-time", salary: "$180–220K", postedAgo: "2h ago", tags: ["Figma", "Design Systems"], hiringFor: "Top Design Companies", matchScore: 94 },
  { id: "j2", title: "Frontend Engineer", company: "Northwind", companyInitials: "NW", location: "San Francisco", type: "Full-time", salary: "$160–200K", postedAgo: "5h ago", tags: ["React", "TypeScript"], hiringFor: "Leading Tech Firms", matchScore: 91 },
  { id: "j3", title: "Data Scientist", company: "Cobalt AI", companyInitials: "CA", location: "New York", type: "Full-time", salary: "$170–210K", postedAgo: "1d ago", tags: ["Python", "ML"], hiringFor: "Data-Driven Companies", matchScore: 88 },
  { id: "j4", title: "Engineering Manager", company: "Heliosoft", companyInitials: "HS", location: "Remote", type: "Full-time", salary: "$200–260K", postedAgo: "3h ago", tags: ["Leadership", "SaaS"], hiringFor: "Scaling Startups", matchScore: 86 },
  { id: "j5", title: "Product Manager", company: "Ferrous", companyInitials: "FE", location: "London", type: "Full-time", salary: "$150–190K", postedAgo: "12h ago", tags: ["B2B", "Growth"], hiringFor: "Product-Led Companies", matchScore: 83 },
  { id: "j6", title: "Staff Backend Engineer", company: "Quantia", companyInitials: "QT", location: "Remote", type: "Full-time", salary: "$190–250K", postedAgo: "1d ago", tags: ["Go", "Distributed Systems"], hiringFor: "Infrastructure Leaders", matchScore: 81 },
]

export const testimonials: Testimonial[] = [
  {
    quote: "I found my dream role in 3 days. The AI matched me with a startup I'd never heard of — and it was perfect.",
    name: "Sarah K.",
    transition: "Product Designer → Figma",
    initials: "S",
  },
  {
    quote: "The salary insights alone saved me $30K in negotiation. I walked in knowing exactly what to ask for.",
    name: "Marcus J.",
    transition: "Sr. Engineer → Stripe",
    initials: "M",
  },
  {
    quote: "After 6 months of applying everywhere, Fill-it-up got me 4 interviews in a week. The matching is unreal.",
    name: "Priya R.",
    transition: "Data Scientist → Notion",
    initials: "P",
  },
  {
    quote: "The interview prep feature predicted 3 out of 5 questions I was asked. Felt like a cheat code.",
    name: "James L.",
    transition: "Engineering Manager → Vercel",
    initials: "J",
  },
  {
    quote: "Finally a platform that doesn't spam you with irrelevant roles. Every match felt intentional.",
    name: "Aisha M.",
    transition: "Growth Lead → Linear",
    initials: "A",
  },
  {
    quote: "Went from zero callbacks to multiple offers within two weeks. The resume feedback was a game-changer.",
    name: "David C.",
    transition: "Backend Engineer → Datadog",
    initials: "D",
  },
]

export const faqs: FAQ[] = [
  {
    q: "How does the AI matching work?",
    a: "We parse your resume and preferences, then cross-reference 40+ signals against live job postings to surface the best-fit roles. Every match ships with a score and human-readable reasons — never a black box.",
  },
  {
    q: "Is Fill-it-up free for job seekers?",
    a: "Yes. The Free plan gives you 20 AI credits per month, one resume upload, and basic match scores at no cost. Pro and Elite unlock deeper AI features, unlimited search, and mentor discounts.",
  },
  {
    q: "How accurate are the salary estimates?",
    a: "Salary Intelligence is built on real compensation data from over 10,000 verified offers, normalized by role, level, and location. Benchmarks refresh continuously as new offer data comes in.",
  },
  {
    q: "Can I use it if I'm not actively looking?",
    a: "Absolutely. Passive mode monitors thousands of new postings daily and only pings you when something exceptional matches your criteria — no noise, no spam.",
  },
  {
    q: "What file formats do you accept?",
    a: "PDF and DOCX resumes up to 10MB. Our parser extracts skills, experience, and preferences into a structured profile you can review and edit before matching begins.",
  },
]

export const seekerTiers: PricingTier[] = [
  {
    name: "Free",
    monthly: 0,
    description: "Get discovered and start applying with AI.",
    cta: "Start free",
    features: [
      "20 AI credits / month",
      "1 resume upload",
      "Smart profile creation",
      "Basic match % on jobs",
      "1 profile visibility boost / month",
      "Email support",
    ],
  },
  {
    name: "Pro",
    monthly: 299,
    description: "Everything you need to land interviews faster.",
    cta: "Upgrade to Pro",
    popular: true,
    features: [
      "200 AI credits / month",
      "Unlimited resume versions",
      "Full AI job search + match explanations",
      "Unlimited natural-language search",
      "5 visibility boosts / month",
      "AI interview practice (audio + video)",
      "Browse mentor profiles",
      "10% mentor session discount",
      "Priority support",
    ],
  },
  {
    name: "Elite",
    monthly: 799,
    description: "Maximum visibility, deepest AI, mentor priority.",
    cta: "Go Elite",
    features: [
      "700 AI credits / month",
      "Everything in Pro",
      "Humanity Score + Proof-of-Work verification",
      "Priority + exclusive mentor access (20% off)",
      "Exclusive beta features",
      "Premium support",
    ],
  },
]

export interface CreditCost {
  action: string
  credits: number
}

export const creditCosts: CreditCost[] = [
  { action: "AI Job Search", credits: 1 },
  { action: "Match Explanation", credits: 2 },
  { action: "Resume Parsing", credits: 5 },
  { action: "Career Readiness Report", credits: 10 },
  { action: "AI Audio Interview Practice", credits: 15 },
]

export interface CreditPack {
  credits: number
  price: number
  best?: boolean
}

export const creditPacks: CreditPack[] = [
  { credits: 100, price: 299 },
  { credits: 500, price: 999 },
  { credits: 1000, price: 1999, best: true },
  { credits: 5000, price: 7999 },
]

export interface MentorService {
  name: string
  price: string
}

export const mentorServices: MentorService[] = [
  { name: "Resume Review", price: "₹499 – ₹999" },
  { name: "Mock Interview", price: "₹999 – ₹2,999" },
  { name: "Career Counseling", price: "₹1,499 – ₹4,999" },
  { name: "LinkedIn Review", price: "₹499 – ₹999" },
  { name: "Portfolio Review", price: "₹799 – ₹1,999" },
]

export interface ComparisonGroup {
  group: string
  rows: { feature: string; free: string | boolean; pro: string | boolean; elite: string | boolean }[]
}

export const comparisonTable: ComparisonGroup[] = [
  {
    group: "AI Credits & Usage",
    rows: [
      { feature: "Monthly AI Credits", free: "20", pro: "200", elite: "700" },
      { feature: "Resume Upload", free: "1", pro: "5", elite: "Unlimited" },
      { feature: "Multiple Resume Versions", free: false, pro: true, elite: true },
      { feature: "Resume Parsing", free: "Basic", pro: "Advanced", elite: "Advanced" },
    ],
  },
  {
    group: "Profile & Resume",
    rows: [
      { feature: "Smart Profile Creation", free: true, pro: true, elite: true },
      { feature: "Editable Profile Fields", free: true, pro: true, elite: true },
      { feature: "Profile Strength Score", free: "Basic", pro: "Advanced", elite: "Advanced" },
      { feature: "AI Summary Generation", free: "Limited", pro: true, elite: true },
      { feature: "AI Resume Suggestions", free: false, pro: true, elite: true },
    ],
  },
  {
    group: "AI Job Search & Matching",
    rows: [
      { feature: "AI Job Search", free: "Limited", pro: "Full", elite: "Full" },
      { feature: "Natural Language Search", free: "10/month", pro: "100/month", elite: "Unlimited" },
      { feature: "Match % on Jobs", free: "Basic", pro: "Full", elite: "Full" },
      { feature: "Match Explanation", free: false, pro: true, elite: true },
      { feature: "Context-Aware Ranking", free: false, pro: true, elite: true },
      { feature: "Resume-to-Job Matching", free: "Basic", pro: "Advanced", elite: "Advanced" },
    ],
  },
  {
    group: "Career Readiness",
    rows: [
      { feature: "Career Readiness Score", free: "Basic", pro: "Detailed", elite: "Detailed" },
      { feature: "Skill Gap Insights", free: "Basic", pro: "Advanced", elite: "Advanced" },
      { feature: "Recommended Skills", free: "Limited", pro: true, elite: true },
      { feature: "Next Career Path Recommendations", free: false, pro: true, elite: "Advanced" },
      { feature: "Career Roadmap", free: "Basic", pro: "Advanced", elite: "Advanced" },
      { feature: "Certification Recommendations", free: false, pro: true, elite: "Personalized" },
      { feature: "Learning Path Suggestions", free: false, pro: "Personalized", elite: "Personalized" },
      { feature: "Personalized Improvement Plan", free: false, pro: false, elite: "Advanced" },
    ],
  },
  {
    group: "Visibility & Analytics",
    rows: [
      { feature: "Profile Visibility Boost", free: "1/month", pro: "5/month", elite: true },
      { feature: "Priority Candidate Visibility", free: false, pro: false, elite: true },
      { feature: "Analytics Dashboard", free: "Basic", pro: "Advanced", elite: "Advanced" },
    ],
  },
  {
    group: "Mentorship",
    rows: [
      { feature: "Browse Mentor Profiles", free: true, pro: true, elite: true },
      { feature: "Book Paid Sessions", free: true, pro: true, elite: true },
      { feature: "Session Discount", free: false, pro: "10%", elite: "20%" },
      { feature: "Priority Booking", free: false, pro: false, elite: true },
      { feature: "Exclusive Mentor Access", free: false, pro: false, elite: true },
    ],
  },
  {
    group: "Interview Practice",
    rows: [
      { feature: "AI Audio Interview Practice", free: "Limited", pro: true, elite: "Unlimited" },
      { feature: "AI Video Interview Practice", free: "Limited", pro: true, elite: "Unlimited" },
      { feature: "AI Interview Feedback", free: false, pro: true, elite: "Advanced" },
      { feature: "Interview Readiness Score", free: "Basic", pro: "Detailed", elite: "Advanced" },
    ],
  },
  {
    group: "Salary & Optimization",
    rows: [
      { feature: "Salary Oracle", free: "Limited", pro: "Full", elite: "Advanced + Benchmarking" },
      { feature: "Salary Benchmark by Role & Location", free: false, pro: true, elite: "Advanced" },
      { feature: "LinkedIn Profile Optimization", free: false, pro: false, elite: "Advanced" },
      { feature: "Portfolio Review", free: false, pro: false, elite: "Advanced" },
    ],
  },
  {
    group: "Skill Verification",
    rows: [
      { feature: "Verified Skill Badges", free: false, pro: true, elite: true },
      { feature: "Proof of Work Verification", free: false, pro: false, elite: true },
      { feature: "Soft Skills Assessment", free: "Limited", pro: true, elite: "Advanced" },
      { feature: "Humanity Score", free: false, pro: false, elite: true },
    ],
  },
  {
    group: "Community & Support",
    rows: [
      { feature: "Community Access (Future Ready)", free: "Basic", pro: true, elite: "Priority" },
      { feature: "Support", free: "Email", pro: "Priority", elite: "Premium" },
      { feature: "Exclusive Beta Features", free: false, pro: false, elite: true },
    ],
  },
]

export const footerColumns: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", to: "/how-it-works" },
      { label: "How It Works", to: "/how-it-works" },
      { label: "Pricing", to: "/pricing" },
      { label: "AI Resume Parser", to: "/how-it-works" },
      { label: "Salary Intelligence", to: "/how-it-works" },
      { label: "Career Path Mapping", to: "/how-it-works" },
    ],
  },
  {
    title: "Job Seekers",
    links: [
      { label: "Browse Jobs", to: "/signup" },
      { label: "Companies Hiring", to: "/about" },
      { label: "Remote Jobs", to: "/signup" },
      { label: "Entry Level Jobs", to: "/signup" },
      { label: "Engineering Jobs", to: "/signup" },
      { label: "Design Jobs", to: "/signup" },
    ],
  },
  {
    title: "Locations",
    links: [
      { label: "Jobs in San Francisco", to: "/signup" },
      { label: "Jobs in New York", to: "/signup" },
      { label: "Jobs in London", to: "/signup" },
      { label: "Jobs in Austin", to: "/signup" },
      { label: "Jobs in Seattle", to: "/signup" },
      { label: "Jobs in Berlin", to: "/signup" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Blog", to: "/about" },
      { label: "Careers", to: "/about" },
      { label: "Press", to: "/about" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", to: "/contact" },
      { label: "Resume Tips", to: "/how-it-works" },
      { label: "Interview Guide", to: "/how-it-works" },
      { label: "Salary Calculator", to: "/pricing" },
      { label: "Career Advice", to: "/how-it-works" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
      { label: "Cookie Policy", to: "/privacy" },
      { label: "GDPR", to: "/privacy" },
      { label: "Accessibility", to: "/contact" },
    ],
  },
]
