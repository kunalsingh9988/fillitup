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
import type { AppNotification, Conversation } from "./employer-types"

export const mentorProfile: MentorProfile = {
  name: "Sarah Chen",
  initials: "SC",
  email: "sarah@chen.dev",
  headline: "Staff Engineer at Google — helping seniors reach staff+",
  bio: "Staff Engineer at Google with 12+ years of experience building large-scale web applications. I specialize in helping engineers transition from senior to staff level roles, navigate system design interviews, and develop leadership skills within engineering organizations.",
  expertise: ["System Design", "Staff+ Career Growth", "React", "Leadership"],
  company: "Google",
  hourlyRate: 960,
  languages: ["English", "Mandarin"],
  timezone: "PST (UTC-8)",
  linkedin: "https://linkedin.com/in/sarah-chen",
  website: "https://sarahchen.dev",
}

export const mentorPlans: MentorPlan[] = [
  {
    id: "p1",
    name: "Starter",
    price: 8000,
    blurb: "Monthly guidance for career transitions",
    features: ["1 call/month (30 min)", "Async chat support", "48hr response time"],
    published: true,
    menteeCount: 2,
  },
  {
    id: "p2",
    name: "Growth",
    price: 16000,
    blurb: "Active coaching for aspiring engineers",
    features: ["3 calls/month (45 min)", "Resume review", "Priority response", "Goal tracking"],
    published: true,
    menteeCount: 2,
  },
  {
    id: "p3",
    name: "Premium",
    price: 28000,
    blurb: "Intensive transformation coaching",
    features: ["4 calls/month (60 min)", "Mock interviews", "Job referrals", "Salary negotiation help"],
    published: false,
    menteeCount: 0,
    paused: true,
  },
]

export const mentees: Mentee[] = [
  { id: "mn1", name: "Alex Johnson", initials: "AJ", role: "Senior Frontend Engineer", plan: "Growth", since: "Jan 15, 2026", renews: "Apr 15, 2026" },
  { id: "mn2", name: "Neha Gupta", initials: "NG", role: "Full Stack Developer", plan: "Starter", since: "Feb 10, 2026", renews: "Apr 10, 2026" },
  { id: "mn3", name: "Jordan Lee", initials: "JL", role: "Backend Engineer", plan: "Growth", since: "Dec 1, 2025", renews: "Apr 1, 2026" },
  { id: "mn4", name: "Mia Chen", initials: "MC", role: "Junior Developer", plan: "Starter", since: "Mar 5, 2026", renews: "Apr 5, 2026" },
]

export const mentorSessions: MentorSession[] = [
  { id: "ms1", title: "Career transition roadmap", menteeId: "mn1", date: "2026-03-28", time: "10:00 AM", status: "upcoming" },
  { id: "ms2", title: "1:1 coaching — leadership skills", menteeId: "mn1", date: "2026-04-04", time: "10:00 AM", status: "upcoming" },
  { id: "ms3", title: "System design deep dive", menteeId: "mn2", date: "2026-03-30", time: "2:00 PM", status: "upcoming" },
  { id: "ms4", title: "API architecture review", menteeId: "mn2", date: "2026-04-06", time: "2:00 PM", status: "upcoming" },
  { id: "ms5", title: "Resume review — staff packet", menteeId: "mn3", date: "2026-03-20", time: "11:00 AM", status: "past", notes: "Covered promotion packet structure; follow up on metrics." },
  { id: "ms6", title: "Intro & goals kickoff", menteeId: "mn4", date: "2026-03-08", time: "3:00 PM", status: "past" },
]

export const mentorReviews: MentorReview[] = [
  {
    id: "rv1",
    author: "Arjun M.",
    initials: "AM",
    role: "Senior Engineer",
    ago: "2 weeks ago",
    rating: 5,
    text: "Sarah helped me land my staff engineer promotion. Her system design guidance was invaluable.",
  },
  {
    id: "rv2",
    author: "Lisa K.",
    initials: "LK",
    role: "Frontend Dev",
    ago: "1 month ago",
    rating: 5,
    text: "Incredible mentor. She gives very actionable feedback and genuinely cares about your growth.",
  },
  {
    id: "rv3",
    author: "David P.",
    initials: "DP",
    role: "Tech Lead",
    ago: "2 months ago",
    rating: 4,
    text: "Great at breaking down complex problems. Helped me navigate a difficult team restructuring.",
    reply: "Thanks David — glad we got the team healthy again. Keep me posted on the Q2 reorg.",
  },
]

export const mentorResources: MentorResource[] = [
  { id: "r1", title: "System Design Fundamentals", kind: "video", meta: "12:30", category: "System Design", views: 142, downloads: 4 },
  { id: "r2", title: "From Senior to Staff Engineer", kind: "video", meta: "18:45", category: "Career", views: 88, downloads: 4 },
  { id: "r3", title: "Staff Engineer Promotion Checklist", kind: "pdf", meta: "1.2 MB", category: "Career", views: 63, downloads: 3 },
  { id: "r4", title: "System Design Template", kind: "template", meta: "640 KB", category: "Interview Prep", views: 110, downloads: 4 },
]

export const mentorPayouts: MentorPayout[] = [
  { id: "po1", label: "Growth subscription · Marcus Williams", date: "Mar 15, 2026", amount: 16000, status: "paid" },
  { id: "po2", label: "Advanced subscription · David Kim", date: "Mar 1, 2026", amount: 17600, status: "paid" },
  { id: "po3", label: "Growth subscription · Marcus Williams", date: "Feb 15, 2026", amount: 16000, status: "paid" },
  { id: "po4", label: "Advanced subscription · David Kim", date: "Feb 1, 2026", amount: 17600, status: "paid" },
  { id: "po5", label: "Growth subscription · Marcus Williams", date: "Jan 15, 2026", amount: 16000, status: "paid" },
]

export const monthlyRevenue = [
  { month: "Oct", amount: 24000 },
  { month: "Nov", amount: 32000 },
  { month: "Dec", amount: 40000 },
  { month: "Jan", amount: 49600 },
  { month: "Feb", amount: 48000 },
  { month: "Mar", amount: 56000 },
]

export const mentorAvailability: AvailabilityState = {
  weekly: {
    Mon: ["09:00", "10:00", "14:00", "15:00"],
    Tue: ["09:00", "10:00", "16:00"],
    Wed: ["14:00", "15:00", "16:00", "17:00"],
    Thu: ["09:00", "11:00"],
    Fri: ["09:00", "10:00", "11:00"],
    Sat: [],
    Sun: [],
  },
  sessionLength: 30,
  buffer: 10,
  blockedDates: ["2026-04-12", "2026-04-13"],
}

export const mentorSettings: MentorSettings = {
  acceptMentees: true,
  profileVisibility: true,
  calendarConnected: "",
  twoFactor: false,
  notifications: {
    messages: true,
    sessionReminders: true,
    productUpdates: false,
    payoutAlerts: true,
  },
}

export const mentorChecklist: MentorChecklistStep[] = [
  { id: "mk1", title: "Complete public profile", done: true },
  { id: "mk2", title: "Create your first plan", done: true },
  { id: "mk3", title: "Set your availability", done: true },
  { id: "mk4", title: "Upload a sample resource", done: true },
  { id: "mk5", title: "Add UPI for payouts", done: false },
]

export const mentorNotifications: AppNotification[] = [
  { id: "mn1", text: "New mentee subscribed to Growth plan", ago: "20 min ago", read: false },
  { id: "mn2", text: "Session with Alex Johnson in 2 hours", ago: "1h ago", read: false },
  { id: "mn3", text: "Mia Chen sent you a message", ago: "3h ago", read: true },
  { id: "mn4", text: "Payout of ₹16,000 processed", ago: "1d ago", read: true },
  { id: "mn5", text: "New review from Arjun M. (5★)", ago: "2d ago", read: true },
]

export const mentorConversations: Conversation[] = [
  {
    id: "mc1",
    candidateId: "mn1",
    subject: "Alex Johnson",
    preview: "Thanks for the feedback on the system design doc!",
    ago: "2m",
    unread: 2,
    messages: [
      { id: "m1", from: "them", text: "Hey Sarah, thanks for the feedback on the system design doc!", ago: "10:24 AM" },
      { id: "m2", from: "them", text: "Wanted to ask about how to think about partitioning vs sharding tradeoffs.", ago: "10:25 AM" },
      { id: "m3", from: "us", text: "Great question. Let's tackle it on the call this week — I'll send a primer in the meantime.", ago: "10:32 AM" },
    ],
  },
  {
    id: "mc2",
    candidateId: "mn2",
    subject: "Neha Gupta",
    preview: "Could we move tomorrow's call?",
    ago: "1h",
    unread: 1,
    messages: [
      { id: "m1", from: "them", text: "Could we move tomorrow's call to 3pm instead?", ago: "9:40 AM" },
    ],
  },
  {
    id: "mc3",
    candidateId: "mn3",
    subject: "Jordan Lee",
    preview: "I got the offer! 🎉",
    ago: "yesterday",
    unread: 0,
    messages: [
      { id: "m1", from: "them", text: "I got the offer! 🎉 Stripe senior backend. Thank you so much.", ago: "Yesterday" },
      { id: "m2", from: "us", text: "Amazing news Jordan — congrats! Let's do a debrief call next week.", ago: "Yesterday" },
    ],
  },
  {
    id: "mc4",
    candidateId: "mn4",
    subject: "Mia Chen",
    preview: "Sharing my latest portfolio update.",
    ago: "3d",
    unread: 0,
    messages: [
      { id: "m1", from: "them", text: "Sharing my latest portfolio update — would love your eyes on it.", ago: "Mon" },
    ],
  },
]

export const insightsData = {
  profileViews: 1284,
  planVisits: 664,
  conversion: 3.4,
  repeatMentees: 62,
  weeklyViews: [42, 55, 61, 58, 74, 80, 92, 88, 101, 96, 112, 128],
  sources: [
    { label: "Search", pct: 42 },
    { label: "Companies", pct: 26 },
    { label: "Direct", pct: 18 },
    { label: "Referrals", pct: 14 },
  ],
  planPerformance: [
    { plan: "Starter", views: 320, subs: 12, revenue: 96000 },
    { plan: "Growth", views: 248, subs: 8, revenue: 128000 },
    { plan: "Premium", views: 96, subs: 3, revenue: 60000 },
  ],
}
