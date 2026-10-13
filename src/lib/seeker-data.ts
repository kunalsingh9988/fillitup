import type {
  ChecklistStep,
  CommunityPost,
  CreditTransaction,
  Invoice,
  MentorListing,
  PrepCategory,
  PrepSession,
  ResumeDoc,
  SeekerJob,
  SeekerProfile,
  SeekerSettings,
  SkillAssessment,
  TrackedApplication,
} from "./seeker-types"
import type { AppNotification, Conversation } from "./employer-types"

export const DEMO = true

export const seekerProfile: SeekerProfile = {
  name: "Alex Johnson",
  initials: "AJ",
  title: "Senior Frontend Engineer",
  location: "San Francisco, CA",
  joined: "Jan 2025",
  email: "alex.johnson@email.com",
  phone: "+1 (415) 555-0192",
  availability: "2 weeks notice",
  about:
    "Passionate frontend engineer with 5+ years of experience building modern web applications. I love creating intuitive user experiences and scalable design systems.",
  skills: ["React", "TypeScript", "Node.js", "Python", "AWS"],
  aiSuggestedSkills: ["GraphQL", "Docker", "CI/CD"],
  portfolio: "https://alexjohnson.dev",
  github: "https://github.com/alexjohnson",
  linkedin: "https://linkedin.com/in/alexjohnson",
  readiness: 78,
  profileStrength: 78,
  experience: [
    {
      id: "e1",
      role: "Senior Frontend Engineer",
      company: "TechCorp",
      initials: "TC",
      period: "2023 - Present",
      description:
        "Led migration to React 18, reduced bundle size by 40%. Mentored 3 junior developers.",
    },
    {
      id: "e2",
      role: "Frontend Developer",
      company: "StartupXYZ",
      initials: "SX",
      period: "2021 - 2023",
      description:
        "Built component library used across 3 products. Improved Core Web Vitals by 60%.",
    },
    {
      id: "e3",
      role: "Junior Developer",
      company: "AgencyFirst",
      initials: "AF",
      period: "2019 - 2021",
      description: "Shipped 20+ client marketing sites and internal dashboards.",
    },
  ],
  education: [
    {
      id: "ed1",
      degree: "B.S. Computer Science",
      school: "UC Berkeley",
      period: "2015 - 2019",
    },
  ],
  projects: [
    {
      id: "p1",
      name: "Design System Kit",
      description: "Open-source React component library · 2.1k GitHub stars",
      link: "github.com/alexjohnson/dsk",
    },
    {
      id: "p2",
      name: "DevPortfolio",
      description: "Portfolio generator for developers · 8k users",
    },
  ],
  certifications: [
    { id: "c1", name: "AWS Certified Developer", issuer: "Amazon", year: "2024" },
    { id: "c2", name: "Meta Frontend Professional", issuer: "Meta", year: "2023" },
  ],
  badges: [
    {
      id: "b1",
      title: "Profile Complete",
      description: "Completed all profile sections",
      earned: "Feb 2026",
      kind: "system",
    },
    {
      id: "b2",
      title: "Skill Verified",
      description: "Passed 2+ skill verifications",
      earned: "Mar 2026",
      kind: "system",
    },
    {
      id: "b3",
      title: "Top Applicant",
      description: "Ranked top 10% match score",
      earned: "Mar 2026",
      kind: "system",
    },
    {
      id: "b4",
      title: "Early Adopter",
      description: "Joined during beta",
      earned: "Jan 2026",
      kind: "system",
    },
  ],
}

const job = (j: Partial<SeekerJob> & Pick<SeekerJob, "id" | "company" | "title">): SeekerJob => ({
  logoInitials: j.company.slice(0, 1).toUpperCase(),
  location: "Remote",
  type: "Full-time",
  salary: "$150k–$190k",
  posted: "3 days ago",
  matchScore: 85,
  tags: ["React", "TypeScript"],
  about:
    "Join a world-class engineering team building product used by millions. You'll own features end-to-end and ship fast.",
  responsibilities: [
    "Build and maintain product UI components",
    "Collaborate with design and backend teams",
    "Drive performance and accessibility improvements",
  ],
  requirements: [
    "5+ years with React and TypeScript",
    "Experience with design systems",
    "Strong communication skills",
  ],
  benefits: ["Health, dental, vision", "Equity", "Unlimited PTO", "Remote-first"],
  applyType: "easy",
  aiSummary:
    "Your React + TypeScript experience aligns well with this role's requirements.",
  skillsMatched: [6, 8],
  fitPoints: [
    "6+ yrs React/TS — above bar",
    "Design system experience matches their stack",
    "Remote-ready timezone overlap",
  ],
  gaps: ["GraphQL experience could be stronger", "No Storybook mentions on resume"],
  salaryContext:
    "This offer is 15% above market median for this role in India.",
  resumeTips: [
    "Add your component library projects to the featured section",
    "Quantify dashboard performance improvements you've made",
  ],
  prepPoints: [
    "Expect deep dives into React rendering optimization",
    "Prepare for system design around real-time dashboards",
    "They value accessibility knowledge — review WCAG guidelines",
  ],
  growth:
    "High. The company promotes internally — 60% of senior engineers move to Staff within 3 years.",
  teamSize: "8-12 engineers",
  reportsTo: "Engineering Manager",
  ...j,
})

export const seekerJobs: SeekerJob[] = [
  job({
    id: "j1",
    company: "Stripe",
    title: "Senior React Developer",
    salary: "₹35L–₹50L",
    posted: "2 days ago",
    matchScore: 96,
    tags: ["React", "TypeScript", "GraphQL"],
    applyType: "standard",
    about:
      "Build and maintain payment infrastructure UI components used by millions of developers worldwide. You'll work on Stripe's core dashboard, Elements SDK, and internal tooling — shipping pixel-perfect, accessible, high-performance interfaces at massive scale.",
    reportsTo: "Engineering Manager, Payments UI",
  }),
  job({
    id: "j2",
    company: "Linear",
    title: "Frontend Engineer",
    location: "San Francisco",
    salary: "$160k–$200k",
    matchScore: 91,
    tags: ["React", "TypeScript", "GraphQL"],
  }),
  job({
    id: "j3",
    company: "Notion",
    title: "Full Stack Developer",
    salary: "₹40L–₹55L",
    posted: "5 days ago",
    matchScore: 87,
    tags: ["React", "Node.js", "Postgres"],
  }),
  job({
    id: "j4",
    company: "Figma",
    title: "React Native Developer",
    type: "Contract",
    salary: "$140k–$180k",
    posted: "1 week ago",
    matchScore: 82,
    tags: ["React Native", "TypeScript"],
  }),
  job({
    id: "j5",
    company: "Vercel",
    title: "UI Engineer",
    salary: "$150k–$190k",
    posted: "1 week ago",
    matchScore: 94,
    tags: ["React", "Next.js", "Design Systems"],
  }),
  job({
    id: "j6",
    company: "Airbnb",
    title: "Software Engineer, Frontend",
    location: "London",
    salary: "£80k–£110k",
    posted: "2 weeks ago",
    matchScore: 76,
    tags: ["React", "JavaScript"],
  }),
  job({
    id: "j7",
    company: "Shopify",
    title: "Senior Frontend Developer",
    location: "Toronto",
    salary: "C$140k–C$180k",
    posted: "2 weeks ago",
    matchScore: 84,
    tags: ["React", "TypeScript", "GraphQL"],
  }),
  job({
    id: "j8",
    company: "Datadog",
    title: "Frontend Tech Lead",
    salary: "$170k–$220k",
    posted: "3 weeks ago",
    matchScore: 79,
    tags: ["React", "TypeScript", "Leadership"],
  }),
]

export const trackedApplications: TrackedApplication[] = [
  { id: "a1", jobId: "j1", stage: "saved" },
  { id: "a2", jobId: "j2", stage: "applied", appliedOn: "Mar 12", nextStep: "Recruiter screen" },
  { id: "a3", jobId: "j3", stage: "interview", appliedOn: "Mar 5", nextStep: "Onsite loop · Mar 28" },
  { id: "a4", jobId: "j5", stage: "in_progress" },
  { id: "a5", jobId: "j4", stage: "saved" },
  { id: "a6", jobId: "j6", stage: "applied", appliedOn: "Feb 28" },
  { id: "a7", jobId: "j7", stage: "interview", appliedOn: "Feb 20", nextStep: "System design · Apr 2" },
  { id: "a8", jobId: "j8", stage: "archived", appliedOn: "Jan 15", note: "Position paused" },
]

export const resumes: ResumeDoc[] = [
  {
    id: "r1",
    name: "Senior_Frontend_Resume.pdf",
    updated: "Mar 10, 2026",
    size: "184 KB",
    primary: true,
    score: 82,
  },
  {
    id: "r2",
    name: "Alex_Staff_Engineer_Resume.pdf",
    updated: "Feb 20, 2026",
    size: "176 KB",
    primary: false,
    score: 74,
  },
  {
    id: "r3",
    name: "Resume_2025.pdf",
    updated: "Nov 2, 2025",
    size: "160 KB",
    primary: false,
    score: 61,
  },
]

export const prepCategories: PrepCategory[] = [
  {
    id: "pc1",
    name: "Behavioral",
    topics: [
      "Tell me about yourself",
      "Leadership & Conflict",
      "Why this company",
      "Teamwork examples",
    ],
  },
  {
    id: "pc2",
    name: "Technical",
    topics: ["React deep dive", "Performance optimization", "Testing strategy", "API design"],
  },
  {
    id: "pc3",
    name: "System Design",
    topics: ["Design a feed", "URL shortener", "Payment system", "Rate limiting"],
  },
]

export const prepSessions: PrepSession[] = [
  {
    id: "s1",
    topic: "Leadership & Conflict",
    category: "Behavioral",
    duration: "25 min",
    date: "Feb 27",
    score: 85,
    feedback: [
      "Strong STAR structure on the conflict example",
      "Add a concrete metric to the outcome",
      "Pause before answering — reduce filler words",
    ],
  },
  {
    id: "s2",
    topic: "React Performance",
    category: "Technical",
    duration: "30 min",
    date: "Feb 24",
    score: 90,
    feedback: [
      "Excellent memoization explanation",
      "Cover virtualization for long lists next time",
    ],
  },
  {
    id: "s3",
    topic: "Design a URL shortener",
    category: "System Design",
    duration: "40 min",
    date: "Feb 18",
    score: 72,
    feedback: [
      "Clarify read/write ratio assumptions up front",
      "Discuss database choice tradeoffs more explicitly",
      "Sketch the rate-limiting layer",
    ],
  },
]

export const skillAssessments: SkillAssessment[] = [
  {
    id: "sa1",
    skill: "React",
    questions: 4,
    minutes: 15,
    passPct: 75,
    status: "passed",
    score: 88,
    quiz: [
      {
        q: "Which hook memoizes a computed value?",
        options: ["useEffect", "useMemo", "useCallback", "useRef"],
        answer: 1,
      },
      {
        q: "What triggers a re-render in React?",
        options: ["DOM mutation", "State or props change", "CSS update", "Network response"],
        answer: 1,
      },
      {
        q: "Key prop should be…",
        options: ["Array index", "Random each render", "Stable & unique", "Optional"],
        answer: 2,
      },
      {
        q: "Suspense is used for…",
        options: ["Animations", "Code-splitting fallbacks", "Forms", "Routing"],
        answer: 1,
      },
    ],
  },
  {
    id: "sa2",
    skill: "TypeScript",
    questions: 4,
    minutes: 15,
    passPct: 75,
    status: "passed",
    score: 92,
    quiz: [
      {
        q: "Which utility picks a subset of props?",
        options: ["Omit", "Pick", "Partial", "Record"],
        answer: 1,
      },
      {
        q: "`unknown` vs `any`?",
        options: ["Same", "unknown is type-safe", "any is safer", "Neither compiles"],
        answer: 1,
      },
      {
        q: "A discriminated union needs…",
        options: ["Generics", "A common literal field", "Decorators", "Interfaces only"],
        answer: 1,
      },
      {
        q: "`satisfies` does what?",
        options: ["Widens type", "Validates without widening", "Narrows at runtime", "Nothing"],
        answer: 1,
      },
    ],
  },
  {
    id: "sa3",
    skill: "System Design",
    questions: 4,
    minutes: 15,
    passPct: 75,
    status: "none",
    quiz: [
      {
        q: "Sharding primarily solves…",
        options: ["Latency", "Horizontal write scaling", "Caching", "Auth"],
        answer: 1,
      },
      {
        q: "A CDN improves…",
        options: ["DB throughput", "Static asset latency", "Build time", "API auth"],
        answer: 1,
      },
      {
        q: "CAP theorem tradeoff is between…",
        options: ["Speed & cost", "Consistency & availability", "CPU & memory", "Read & write"],
        answer: 1,
      },
      {
        q: "A message queue provides…",
        options: ["Sync calls", "Async decoupling", "UI rendering", "DNS"],
        answer: 1,
      },
    ],
  },
  {
    id: "sa4",
    skill: "GraphQL",
    questions: 4,
    minutes: 15,
    passPct: 75,
    status: "none",
    quiz: [
      {
        q: "GraphQL queries fetch…",
        options: ["Whole tables", "Exactly requested fields", "Only cached data", "Static files"],
        answer: 1,
      },
      {
        q: "A mutation is for…",
        options: ["Reading", "Writing data", "Auth only", "Caching"],
        answer: 1,
      },
      {
        q: "N+1 in GraphQL is fixed with…",
        options: ["Indexes", "DataLoader batching", "SSR", "CDN"],
        answer: 1,
      },
      {
        q: "Subscriptions use…",
        options: ["Polling only", "WebSockets/SSE streams", "Cookies", "REST"],
        answer: 1,
      },
    ],
  },
]

export const mentorListings: MentorListing[] = [
  {
    id: "m1",
    name: "Sarah Chen",
    initials: "SC",
    role: "Staff Engineer",
    company: "Google",
    rating: 4.9,
    mentees: 28,
    responseTime: "< 12 hours",
    about:
      "Staff Engineer at Google with 12+ years of experience building large-scale web applications. I specialize in helping engineers transition from senior to staff level roles, navigate system design interviews, and develop leadership skills within engineering organizations.",
    expertise: ["System Design", "Staff+ Career Growth", "React", "Leadership"],
    videos: [
      { title: "System Design Fundamentals", duration: "12:30" },
      { title: "From Senior to Staff Engineer", duration: "18:45" },
      { title: "React at Scale — Patterns", duration: "9:15" },
    ],
    resources: [
      { title: "Staff Engineer Promotion Checklist", kind: "PDF" },
      { title: "System Design Template", kind: "PDF" },
    ],
    plans: [
      {
        id: "mp1",
        name: "Lite",
        price: 80,
        blurb: "Async mentorship with monthly guidance",
        features: ["1 call/month (30 min)", "Async chat support", "48hr response time", "Career advice"],
      },
      {
        id: "mp2",
        name: "Pro",
        price: 150,
        blurb: "Hands-on mentorship with regular check-ins",
        recommended: true,
        features: ["2 calls/month (45 min)", "Resume & LinkedIn review", "Priority chat (24hr)", "Code reviews", "Goal tracking"],
      },
      {
        id: "mp3",
        name: "Premium",
        price: 250,
        blurb: "Intensive mentorship for career transformation",
        features: ["4 calls/month (60 min)", "Career roadmap", "Mock interviews", "Same-day response", "Job referrals", "Salary negotiation help"],
      },
    ],
    reviews: [
      {
        name: "Arjun M.",
        role: "Senior Engineer",
        ago: "2 weeks ago",
        rating: 5,
        text: "Sarah helped me land my staff engineer promotion. Her system design guidance was invaluable.",
      },
      {
        name: "Lisa K.",
        role: "Frontend Dev",
        ago: "1 month ago",
        rating: 5,
        text: "Incredible mentor. She gives very actionable feedback and genuinely cares about your growth.",
      },
      {
        name: "David P.",
        role: "Tech Lead",
        ago: "2 months ago",
        rating: 4,
        text: "Great at breaking down complex problems. Helped me navigate a difficult team restructuring.",
      },
    ],
  },
  {
    id: "m2",
    name: "Marcus Williams",
    initials: "MW",
    role: "Engineering Manager",
    company: "Stripe",
    rating: 4.8,
    mentees: 19,
    responseTime: "< 24 hours",
    about:
      "Engineering Manager at Stripe. I help engineers grow into leadership roles and prepare for management-track interviews.",
    expertise: ["Leadership", "Career Growth", "Fintech"],
    videos: [{ title: "Managing up as a senior IC", duration: "14:10" }],
    resources: [{ title: "EM Interview Playbook", kind: "PDF" }],
    plans: [
      {
        id: "mp4",
        name: "Starter",
        price: 60,
        blurb: "Monthly coaching for new leads",
        features: ["1 call/month (30 min)", "Async chat", "72hr response"],
      },
      {
        id: "mp5",
        name: "Growth",
        price: 120,
        blurb: "Bi-weekly coaching + reviews",
        recommended: true,
        features: ["2 calls/month", "Promotion packet review", "Priority chat"],
      },
    ],
    reviews: [
      {
        name: "Neha G.",
        role: "Full Stack Dev",
        ago: "3 weeks ago",
        rating: 5,
        text: "Marcus gave me a clear path to tech lead. Landed the role last month.",
      },
    ],
  },
  {
    id: "m3",
    name: "Priya Nair",
    initials: "PN",
    role: "Principal Engineer",
    company: "Microsoft",
    rating: 4.9,
    mentees: 34,
    responseTime: "< 12 hours",
    about:
      "Principal Engineer focused on distributed systems and interview prep for senior+ candidates at FAANG-scale companies.",
    expertise: ["System Design", "FAANG Interviews", "Distributed Systems"],
    videos: [{ title: "Cracking the staff loop", duration: "22:05" }],
    resources: [
      { title: "System Design Question Bank", kind: "PDF" },
      { title: "Behavioral Rubric", kind: "PDF" },
    ],
    plans: [
      {
        id: "mp6",
        name: "Interview Sprint",
        price: 200,
        blurb: "4-week intensive interview prep",
        recommended: true,
        features: ["Weekly mock interviews", "Scored feedback", "Referral network"],
      },
    ],
    reviews: [
      {
        name: "Tom H.",
        role: "Backend Engineer",
        ago: "1 month ago",
        rating: 5,
        text: "Passed Google L6 loop after 4 weeks of prep. Worth every rupee.",
      },
    ],
  },
]

export const communityPosts: CommunityPost[] = [
  {
    id: "cp1",
    author: "Neha Gupta",
    initials: "NG",
    role: "Full Stack Developer",
    ago: "2h",
    tag: "Career",
    title: "Just cleared the Stripe onsite — AMA",
    body: "Three rounds: React deep-dive, system design on payment dashboards, and values fit. Happy to share prep notes.",
    likes: 128,
    comments: 34,
  },
  {
    id: "cp2",
    author: "David Kim",
    initials: "DK",
    role: "Backend Engineer",
    ago: "5h",
    tag: "Interview Prep",
    title: "System design framework that finally clicked",
    body: "Requirements → Estimation → API → Data model → Scale. Writing it out loud before drawing boxes changed everything.",
    likes: 89,
    comments: 21,
  },
  {
    id: "cp3",
    author: "Lisa Kumar",
    initials: "LK",
    role: "Frontend Dev",
    ago: "1d",
    tag: "Resume",
    title: "AI resume enhance doubled my callback rate",
    body: "Ran my resume through the enhancer for each application — callbacks went from ~8% to ~20% over six weeks.",
    likes: 210,
    comments: 56,
  },
  {
    id: "cp4",
    author: "Jordan Lee",
    initials: "JL",
    role: "Backend Engineer",
    ago: "2d",
    tag: "Salary",
    title: "Negotiated +$25k using the Salary Oracle data",
    body: "Brought the market-median printout to the offer call. Recruiter matched in one round — no back-and-forth needed.",
    likes: 167,
    comments: 42,
  },
]

export const creditTransactions: CreditTransaction[] = [
  { id: "ct1", label: "AI Resume Enhance — Stripe", date: "Mar 12", amount: -50, kind: "spend" },
  { id: "ct2", label: "Referral bonus — Neha joined", date: "Mar 8", amount: 500, kind: "earn" },
  { id: "ct3", label: "AI Interview Prep session", date: "Mar 5", amount: -30, kind: "spend" },
  { id: "ct4", label: "Monthly Pro credits", date: "Mar 1", amount: 300, kind: "earn" },
  { id: "ct5", label: "Skill verification — React", date: "Feb 24", amount: -20, kind: "spend" },
]

export const invoices: Invoice[] = [
  { id: "i1", date: "Mar 1, 2026", amount: "$29.00", status: "paid", plan: "Pro monthly" },
  { id: "i2", date: "Feb 1, 2026", amount: "$29.00", status: "paid", plan: "Pro monthly" },
  { id: "i3", date: "Jan 1, 2026", amount: "$0.00", status: "paid", plan: "Free" },
]

export const seekerChecklist: ChecklistStep[] = [
  {
    id: "sc1",
    title: "Complete your profile",
    description: "Add your title, location, and skills so employers can find you.",
    done: false,
  },
  {
    id: "sc2",
    title: "Upload your resume",
    description: "Upload a resume to auto-fill applications and get AI feedback.",
    done: false,
  },
  {
    id: "sc3",
    title: "Verify your skills",
    description: "Take skill assessments to earn verified badges.",
    done: false,
  },
  {
    id: "sc4",
    title: "Practice interviews",
    description: "Run a mock interview with AI and get scored feedback.",
    done: false,
  },
  {
    id: "sc5",
    title: "Benchmark your salary",
    description: "See how your compensation compares to the market.",
    done: false,
  },
]

export const seekerSettings: SeekerSettings = {
  profileVisibility: true,
  openToWork: true,
  jobAlerts: true,
  aiAutoApply: false,
  twoFactor: false,
  notifications: {
    jobMatches: true,
    applicationUpdates: true,
    messages: true,
    weeklyDigest: false,
    productUpdates: true,
  },
}

export const seekerNotifications: AppNotification[] = [
  { id: "sn1", text: "AI found 3 new job matches with 90%+ fit", ago: "10 min ago", read: false },
  { id: "sn2", text: "Your application to Stripe was viewed", ago: "1h ago", read: false },
  { id: "sn3", text: "You earned the 'React Expert' badge!", ago: "3h ago", read: true },
  { id: "sn4", text: "Saved job at Linear has been updated", ago: "5h ago", read: true },
  { id: "sn5", text: "Interview prep session results are ready", ago: "1d ago", read: true },
  { id: "sn6", text: "Application to Figma moved to next stage", ago: "1d ago", read: true },
]

export const seekerConversations: Conversation[] = [
  {
    id: "cv1",
    candidateId: "r1",
    subject: "Priya Sharma · TechCorp",
    preview: "We'd love to move forward with a system design round",
    ago: "2m",
    unread: 1,
    messages: [
      { id: "m1", from: "them", text: "Hi Alex — your profile stood out. Are you open to chat?", ago: "10:04 AM" },
      { id: "m2", from: "us", text: "Hi Priya! Definitely — I'd love to hear more about the role.", ago: "10:09 AM" },
      { id: "m3", from: "them", text: "We'd love to move forward with a system design round", ago: "10:24 AM" },
    ],
  },
  {
    id: "cv2",
    candidateId: "m1",
    subject: "Sarah Chen · Mentor",
    preview: "Let's tackle partitioning vs sharding on our call",
    ago: "1h",
    unread: 0,
    messages: [
      { id: "m1", from: "us", text: "Wanted to ask about partitioning vs sharding tradeoffs.", ago: "9:25 AM" },
      { id: "m2", from: "them", text: "Let's tackle partitioning vs sharding on our call — I'll send a primer.", ago: "10:32 AM" },
    ],
  },
  {
    id: "cv3",
    candidateId: "r3",
    subject: "Tom Becker · Linear",
    preview: "Following up on your application",
    ago: "3d",
    unread: 0,
    messages: [
      { id: "m1", from: "them", text: "Following up on your application — still interested?", ago: "Mon" },
    ],
  },
]

// career path
export const careerPath = {
  current: { title: "Senior Frontend Engineer", level: "IC3", tenure: "2 years" },
  next: {
    title: "Staff Engineer",
    level: "IC4",
    eta: "1-2 years",
    requirements: [
      "Lead cross-team initiatives",
      "System design expertise",
      "Mentor engineers across teams",
      "Drive technical strategy",
      "Ship org-level impact projects",
    ],
  },
  trajectory: [
    { title: "Senior Frontend Engineer", level: "IC3", eta: "Now", salary: "$180-220k" },
    { title: "Staff Engineer", level: "IC4", eta: "1-2 years", salary: "$220-280k" },
    { title: "Principal Engineer", level: "IC5", eta: "3-5 years", salary: "$280-350k" },
    { title: "Distinguished Engineer", level: "IC6", eta: "5-8 years", salary: "$350-450k" },
  ],
}

export const learningPlan = [
  { id: "lp1", title: "System Design Masterclass", kind: "Course", progress: 60 },
  { id: "lp2", title: "Distributed Systems Reading List", kind: "Reading", progress: 30 },
  { id: "lp3", title: "Lead a cross-team RFC", kind: "Project", progress: 0 },
  { id: "lp4", title: "Staff Engineer mock interview", kind: "Practice", progress: 0 },
]

export const compatibilityCompanies = [
  {
    name: "Stripe",
    industry: "FinTech",
    score: 94,
    note: "Strong culture fit — your collaborative style and fintech interest align perfectly",
    top: true,
  },
  { name: "Linear", industry: "Dev Tools", score: 91, note: "Craft-focused culture matches your design-system background" },
  { name: "Notion", industry: "Productivity", score: 87, note: "Docs-as-product teams value your DX experience" },
  { name: "Vercel", industry: "Cloud Platform", score: 83, note: "Open-source first — your OSS profile stands out" },
  { name: "Airbnb", industry: "Travel", score: 76, note: "Larger org, slower pace than your preference" },
]

export const salaryBenchmark = {
  low: 160,
  median: 195,
  you: 210,
  high: 260,
  factors: [
    { label: "Experience", detail: "5+ years in frontend", delta: "+12%" },
    { label: "Skills", detail: "React, TypeScript, System Design", delta: "+8%" },
    { label: "Location", detail: "SF Bay Area premium", delta: "+15%" },
    { label: "Market Demand", detail: "High demand for senior FE", delta: "+5%" },
  ],
  companies: [
    { name: "Google", range: "$190-250k" },
    { name: "Meta", range: "$185-240k" },
    { name: "Stripe", range: "$180-230k" },
    { name: "Vercel", range: "$170-220k" },
    { name: "Linear", range: "$175-225k" },
  ],
}
