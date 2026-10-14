// Row → UI-model mappers + loaders for all three role dashboards.
// Each loadXState() returns the same shape the old localStorage seeds produced,
// so pages don't change when the stores hydrate from Supabase.

import { supabase } from "./client"
import type {
  SeekerProfile,
  SeekerJob,
  TrackedApplication,
  ResumeDoc,
  PrepSession,
  SkillAssessment,
  MentorListing,
  CommunityPost,
  CreditTransaction,
  Invoice,
  SeekerSettings,
  ChecklistStep,
  ApplicationStage,
  Experience,
  Education,
  Project,
  Certification,
  AchievementBadge,
} from "../seeker-types"
import type { SeekerState } from "../seeker-store"
import type {
  EmployerJob,
  Candidate,
  TeamMember,
  CompanyProfile,
  EmployerSettings,
  AppNotification,
  Conversation,
  ChatMessage,
  CandidateStatus,
} from "../employer-types"
import type { EmployerState } from "../employer-store"
import type {
  MentorProfile,
  MentorPlan,
  Mentee,
  MentorSession,
  MentorReview,
  MentorResource,
  MentorPayout,
  AvailabilityState,
  MentorSettings,
  MentorChecklistStep,
} from "../mentor-types"
import type { MentorState } from "../mentor-store"
import * as seekerSeed from "../seeker-data"

/* ---------- shared helpers ---------- */

export function timeAgo(iso: string): string {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return "just now"
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`
  if (s < 86400 * 30) return `${Math.floor(s / 86400 / 7)}w ago`
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function initials(name: string): string {
  return name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase() || "??"
}

const fmtSalary = (min: number | null, max: number | null, cur: string) => {
  if (!min && !max) return "Competitive"
  const f = (n: number) => (cur === "INR" ? `₹${(n / 100000).toFixed(n % 100000 ? 1 : 0)}L` : `$${Math.round(n / 1000)}K`)
  if (min && max) return `${f(min)} – ${f(max)}`
  return `${f((min ?? max)!)}+`
}

/* ---------- seeker ---------- */

// denormalized AI copy lives in match_scores.breakdown; fall back to sensible defaults
function jobRowToSeekerJob(r: any, match: any): SeekerJob {
  const company = r.companies?.name ?? "Company"
  const b = match?.breakdown ?? {}
  const skills: string[] = r.skills ?? []
  return {
    id: r.id,
    company,
    logoInitials: initials(company),
    title: r.title,
    location: r.location,
    type: r.type,
    salary: fmtSalary(r.comp_min, r.comp_max, r.currency),
    posted: timeAgo(r.created_at),
    matchScore: match?.score ?? 0,
    tags: skills.slice(0, 4),
    about: r.description ?? "",
    responsibilities: r.responsibilities ?? [],
    requirements: r.requirements ?? [],
    benefits: r.perks ?? [],
    applyType: "standard",
    aiSummary: b.aiSummary ?? "",
    skillsMatched: b.skillsMatched ?? [0, skills.length],
    fitPoints: b.fitPoints ?? [],
    gaps: b.gaps ?? [],
    salaryContext: b.salaryContext ?? "",
    resumeTips: b.resumeTips ?? [],
    prepPoints: b.prepPoints ?? [],
    growth: b.growth ?? "",
    teamSize: b.teamSize ?? "",
    reportsTo: b.reportsTo ?? "",
  }
}

export async function loadSeekerState(userId: string, email: string): Promise<SeekerState> {
  const [
    profileRes, seekerRes, expRes, eduRes, projRes, certRes,
    resumesRes, appsRes, jobsRes, matchRes,
    prepRes, assessRes, subsRes,
    postsRes, likesRes, commentsRes,
    txnsRes, invoicesRes, settingsRes, notifsRes, convRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("seeker_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("seeker_experience").select("*").eq("seeker_id", userId).order("sort_order"),
    supabase.from("seeker_education").select("*").eq("seeker_id", userId).order("sort_order"),
    supabase.from("seeker_projects").select("*").eq("seeker_id", userId).order("sort_order"),
    supabase.from("seeker_certifications").select("*").eq("seeker_id", userId).order("sort_order"),
    supabase.from("resumes").select("*").eq("seeker_id", userId).order("created_at", { ascending: false }),
    supabase.from("applications").select("*, jobs(*, companies(name))").eq("seeker_id", userId),
    supabase.from("jobs").select("*, companies(name)").eq("status", "active").order("created_at", { ascending: false }).limit(50),
    supabase.from("match_scores").select("*").eq("seeker_id", userId),
    supabase.from("interview_sessions").select("*").eq("seeker_id", userId).order("taken_at", { ascending: false }),
    supabase.from("skill_assessments").select("*").eq("seeker_id", userId),
    supabase.from("mentor_subscriptions").select("plan_id").eq("mentee_id", userId).eq("status", "active"),
    supabase.from("community_posts").select("*, profiles!community_posts_author_id_fkey(full_name, role)").order("created_at", { ascending: false }).limit(50),
    supabase.from("community_likes").select("post_id").eq("user_id", userId),
    supabase.from("community_comments").select("post_id"),
    supabase.from("credit_transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("invoices").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("user_settings").select("data").eq("user_id", userId).maybeSingle(),
    supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
    supabase.from("conversation_participants").select("conversation_id, last_read_at").eq("user_id", userId),
  ])

  const sp = seekerRes.data
  const name = profileRes.data?.full_name || email.split("@")[0]

  const matchByJob = new Map((matchRes.data ?? []).map((m: any) => [m.job_id, m]))
  const jobs: SeekerJob[] = (jobsRes.data ?? []).map((r: any) => jobRowToSeekerJob(r, matchByJob.get(r.id)))
  const jobsById = new Map(jobs.map(j => [j.id, j]))
  ;(appsRes.data ?? []).forEach((a: any) => {
    if (!jobsById.has(a.job_id) && a.jobs) jobsById.set(a.job_id, jobRowToSeekerJob(a.jobs, matchByJob.get(a.job_id)))
  })

  const tracker: TrackedApplication[] = (appsRes.data ?? []).map((a: any) => ({
    id: a.id,
    jobId: a.job_id,
    stage: a.stage as ApplicationStage,
    appliedOn: timeAgo(a.created_at),
  }))

  const conversations = await loadConversations(userId, convRes.data ?? [])

  const credits = (txnsRes.data ?? []).reduce((s: number, t: any) => s + t.delta, 0) + (sp?.credits ?? 0)

  const myLikes = new Set((likesRes.data ?? []).map((l: any) => l.post_id))
  const commentCounts = new Map<string, number>()
  ;(commentsRes.data ?? []).forEach((c: any) => commentCounts.set(c.post_id, (commentCounts.get(c.post_id) ?? 0) + 1))

  // mentors: visible profiles + their plans/reviews/resources
  const mentorRes = await supabase
    .from("mentor_profiles")
    .select("*, profiles!mentor_profiles_user_id_fkey(full_name)")
    .eq("visible", true)
  const mentorIds = (mentorRes.data ?? []).map((m: any) => m.user_id)
  const [plansRes, reviewsRes, resourcesRes, menteeCounts] = await Promise.all([
    supabase.from("mentor_plans").select("*").in("mentor_id", mentorIds).eq("published", true),
    supabase.from("mentor_reviews").select("*, profiles!mentor_reviews_author_id_fkey(full_name, role)").in("mentor_id", mentorIds),
    supabase.from("mentor_resources").select("*").in("mentor_id", mentorIds),
    supabase.from("mentor_subscriptions").select("mentor_id").in("mentor_id", mentorIds).eq("status", "active"),
  ])
  const menteeCountMap = new Map<string, number>()
  ;(menteeCounts.data ?? []).forEach((s: any) => menteeCountMap.set(s.mentor_id, (menteeCountMap.get(s.mentor_id) ?? 0) + 1))

  const mentors: MentorListing[] = (mentorRes.data ?? []).map((m: any) => {
    const plans = (plansRes.data ?? []).filter((p: any) => p.mentor_id === m.user_id)
    const reviews = (reviewsRes.data ?? []).filter((r: any) => r.mentor_id === m.user_id)
    const resources = (resourcesRes.data ?? []).filter((r: any) => r.mentor_id === m.user_id)
    const rating = reviews.length ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length : 0
    const mName = m.profiles?.full_name ?? "Mentor"
    return {
      id: m.user_id,
      name: mName,
      initials: initials(mName),
      role: m.headline.split("—")[0]?.split(" at ")[0]?.trim() ?? "Mentor",
      company: m.company,
      rating: Math.round(rating * 10) / 10,
      mentees: menteeCountMap.get(m.user_id) ?? 0,
      responseTime: "< 24h",
      about: m.bio,
      expertise: m.expertise ?? [],
      videos: resources.filter((r: any) => r.kind === "video").map((r: any) => ({ title: r.title, duration: r.meta })),
      resources: resources.map((r: any) => ({ title: r.title, kind: r.kind })),
      plans: plans.map((p: any) => ({ id: p.id, name: p.name, price: p.price, blurb: p.blurb, features: p.features })),
      reviews: reviews.slice(0, 5).map((r: any) => ({
        name: r.profiles?.full_name ?? "Mentee",
        role: r.profiles?.role ?? "Mentee",
        ago: timeAgo(r.created_at),
        text: r.body,
        rating: r.rating,
      })),
    }
  })

  const profile: SeekerProfile = {
    name,
    initials: initials(name),
    title: sp?.title ?? "",
    location: sp?.location ?? "",
    joined: profileRes.data ? new Date(profileRes.data.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "",
    email,
    phone: "",
    availability: sp?.availability ?? "",
    about: sp?.about ?? "",
    skills: sp?.skills ?? [],
    aiSuggestedSkills: [],
    portfolio: sp?.portfolio ?? "",
    github: sp?.github ?? "",
    linkedin: sp?.linkedin ?? "",
    readiness: sp?.readiness ?? 0,
    profileStrength: sp?.readiness ?? 0,
    experience: (expRes.data ?? []).map((e: any): Experience => ({ id: e.id, role: e.role, company: e.company, initials: initials(e.company), period: e.period, description: e.description })),
    education: (eduRes.data ?? []).map((e: any): Education => ({ id: e.id, degree: e.degree, school: e.school, period: e.period })),
    projects: (projRes.data ?? []).map((p: any): Project => ({ id: p.id, name: p.name, description: p.description, link: p.link ?? undefined })),
    certifications: (certRes.data ?? []).map((c: any): Certification => ({ id: c.id, name: c.name, issuer: c.issuer, year: c.year })),
    badges: (sp?.badges ?? []) as AchievementBadge[],
  }

  // merge DB assessment status into the seed quiz catalog (questions live client-side)
  const assessBySkill = new Map((assessRes.data ?? []).map((a: any) => [a.skill, a]))
  const assessments: SkillAssessment[] = seekerSeed.skillAssessments.map(s => {
    const row = assessBySkill.get(s.skill)
    return row
      ? { ...s, status: row.status === "passed" ? "passed" : "failed", score: row.score }
      : s
  })

  const checklist: ChecklistStep[] = (sp?.checklist?.length ? sp.checklist : seekerSeed.seekerChecklist) as ChecklistStep[]

  return {
    profile,
    jobs,
    tracker,
    resumes: (resumesRes.data ?? []).map((r: any): ResumeDoc => ({
      id: r.id, name: r.name, updated: timeAgo(r.created_at),
      size: "—", primary: r.is_primary, score: r.score ?? 0,
    })),
    prepSessions: (prepRes.data ?? []).map((p: any): PrepSession => ({
      id: p.id, topic: p.detail?.topic ?? p.kind, category: p.kind,
      duration: p.detail?.duration ?? "—", date: timeAgo(p.taken_at),
      score: p.score ?? 0, feedback: p.detail?.feedback ?? [],
    })),
    assessments,
    mentors,
    subscribedPlans: (subsRes.data ?? []).map((s: any) => s.plan_id),
    posts: (postsRes.data ?? []).map((p: any): CommunityPost => ({
      id: p.id, author: p.profiles?.full_name ?? "Member",
      initials: initials(p.profiles?.full_name ?? "?"),
      role: p.profiles?.role ?? "member", ago: timeAgo(p.created_at),
      tag: p.tag, title: "", body: p.body,
      likes: 0, comments: commentCounts.get(p.id) ?? 0,
      liked: myLikes.has(p.id),
    })),
    credits,
    creditTxns: (txnsRes.data ?? []).map((t: any): CreditTransaction => ({
      id: t.id, label: t.reason, date: timeAgo(t.created_at),
      amount: t.delta, kind: t.delta >= 0 ? "earn" : "spend",
    })),
    invoices: (invoicesRes.data ?? []).map((i: any): Invoice => ({
      id: i.id, date: new Date(i.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      amount: `₹${i.amount.toLocaleString("en-IN")}`, status: i.status as "paid" | "pending", plan: i.label,
    })),
    checklist,
    settings: { ...seekerSeed.seekerSettings, ...(settingsRes.data?.data ?? {}) } as SeekerSettings,
    notifications: (notifsRes.data ?? []).map((n: any): AppNotification => ({
      id: n.id, text: n.text, ago: timeAgo(n.created_at), read: n.read,
    })),
    conversations,
    appliedJobs: (appsRes.data ?? []).map((a: any) => a.job_id),
  }
}

async function loadConversations(userId: string, parts: any[]): Promise<Conversation[]> {
  if (!parts.length) return []
  const ids = parts.map((p: any) => p.conversation_id)
  const [convRes, msgsRes, othersRes] = await Promise.all([
    supabase.from("conversations").select("*").in("id", ids),
    supabase.from("messages").select("*").in("conversation_id", ids).order("created_at"),
    supabase.from("conversation_participants").select("conversation_id, user_id, profiles(full_name, role)").in("conversation_id", ids).neq("user_id", userId),
  ])
  const convById = new Map((convRes.data ?? []).map((c: any) => [c.id, c]))
  const otherByConv = new Map<string, any>()
  ;(othersRes.data ?? []).forEach((o: any) => { if (!otherByConv.has(o.conversation_id)) otherByConv.set(o.conversation_id, o) })
  const msgsByConv = new Map<string, any[]>()
  ;(msgsRes.data ?? []).forEach((m: any) => {
    const arr = msgsByConv.get(m.conversation_id) ?? []
    arr.push(m)
    msgsByConv.set(m.conversation_id, arr)
  })
  const lastRead = new Map(parts.map((p: any) => [p.conversation_id, new Date(p.last_read_at)]))

  return ids.map((id: string): Conversation => {
    const msgs = msgsByConv.get(id) ?? []
    const last = msgs[msgs.length - 1]
    const readAt = lastRead.get(id) ?? new Date(0)
    const other = otherByConv.get(id)
    return {
      id,
      candidateId: other?.user_id ?? "",
      subject: other?.profiles?.full_name ?? convById.get(id)?.subject ?? "Conversation",
      preview: last?.body ?? "",
      ago: last ? timeAgo(last.created_at) : "",
      unread: msgs.filter(m => m.sender_id !== userId && new Date(m.created_at) > readAt).length,
      messages: msgs.map((m): ChatMessage => ({
        id: m.id, from: m.sender_id === userId ? "us" : "them",
        text: m.body, ago: timeAgo(m.created_at),
      })),
    }
  }).filter(c => c.subject || c.messages.length)
}

/* ---------- employer ---------- */

const workplaceMap: Record<string, EmployerJob["workplace"]> = {
  remote: "Remote", hybrid: "Hybrid", onsite: "On-site",
}

export async function loadEmployerState(
  userId: string
): Promise<Partial<EmployerState> & { companyId?: string }> {
  const memberRes = await supabase
    .from("company_members")
    .select("company_id, member_role, title, status")
    .eq("user_id", userId)
  const companyId = memberRes.data?.[0]?.company_id
  if (!companyId) return {}

  const jobIds = (await supabase.from("jobs").select("id").eq("company_id", companyId)).data?.map((j: any) => j.id) ?? []

  const [
    companyRes, membersRes, jobsRes, appsRes, notesRes, activityRes,
    notifsRes, convRes,
  ] = await Promise.all([
    supabase.from("companies").select("*").eq("id", companyId).single(),
    supabase.from("company_members").select("*, profiles(full_name)").eq("company_id", companyId),
    supabase.from("jobs").select("*, applications(count)").eq("company_id", companyId).order("created_at", { ascending: false }),
    jobIds.length
      ? supabase.from("applications").select("*, seeker_profiles(*, profiles!seeker_profiles_user_id_fkey(full_name)), jobs(title)").in("job_id", jobIds)
      : Promise.resolve({ data: [] }),
    jobIds.length
      ? supabase.from("application_notes").select("*, applications!inner(job_id)").in("applications.job_id", jobIds).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    supabase.from("company_activity").select("*, profiles(full_name)").eq("company_id", companyId).order("created_at", { ascending: false }).limit(20),
    supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
    supabase.from("conversation_participants").select("conversation_id, last_read_at").eq("user_id", userId),
  ])

  const c = companyRes.data
  const notesByApp = new Map<string, any[]>()
  ;(notesRes.data ?? []).forEach((n: any) => {
    const arr = notesByApp.get(n.application_id) ?? []
    arr.push(n)
    notesByApp.set(n.application_id, arr)
  })

  const company: CompanyProfile = {
    name: c.name,
    initials: initials(c.name),
    industry: c.industry, location: c.hq, size: c.size,
    openRoles: (jobsRes.data ?? []).filter((j: any) => j.status === "active").length,
    plan: c.plan, website: c.website, linkedin: c.linkedin, twitter: c.twitter,
    about: c.about, founded: c.founded, headquarters: c.hq, funding: c.funding, revenue: c.revenue,
    techStack: c.tech_stack ?? [], benefits: c.benefits ?? [], values: c.values ?? [],
    locations: c.locations ?? [],
  }

  const settings = (c.settings ?? {}) as EmployerSettings

  return {
    companyId,
    company,
    jobs: (jobsRes.data ?? []).map((j: any): EmployerJob => ({
      id: j.id, title: j.title, department: j.department, location: j.location,
      workplace: workplaceMap[j.workplace] ?? "Remote",
      type: j.type as EmployerJob["type"], level: j.level as EmployerJob["level"],
      status: j.status as EmployerJob["status"],
      applicants: (j.applications?.[0]?.count as number) ?? 0,
      views: j.views, shortlisted: 0, hired: 0,
      salaryMin: j.comp_min ?? undefined, salaryMax: j.comp_max ?? undefined,
      currency: j.currency, description: j.description,
      responsibilities: j.responsibilities ?? [], qualifications: j.requirements ?? [],
      skills: j.skills ?? [], screening: j.screening ?? [],
      education: j.education as EmployerJob["education"],
    })),
    candidates: (appsRes.data ?? []).map((a: any): Candidate => ({
      id: a.id,
      name: a.seeker_profiles?.profiles?.full_name ?? "Candidate",
      initials: initials(a.seeker_profiles?.profiles?.full_name ?? "?"),
      title: a.seeker_profiles?.title ?? "", location: a.seeker_profiles?.location ?? "",
      years: 0, skills: a.seeker_profiles?.skills ?? [],
      match: 0, matchBreakdown: { skills: 0, experience: 0, culture: 0 }, rationale: "",
      status: a.candidate_stage as CandidateStatus,
      appliedFor: a.job_id, appliedAgo: timeAgo(a.created_at),
      source: (a.source as Candidate["source"]) ?? "Fill-it-up",
      isAiPick: a.is_ai_pick,
      assignedTo: a.assigned_to ?? undefined,
      notes: (notesByApp.get(a.id) ?? []).map((n: any) => ({ id: n.id, text: n.body, ago: timeAgo(n.created_at) })),
    })),
    team: (membersRes.data ?? []).map((m: any): TeamMember => ({
      id: m.user_id, name: m.profiles?.full_name ?? "Member",
      initials: initials(m.profiles?.full_name ?? "?"),
      email: m.email ?? "", phone: m.phone ?? "",
      role: (m.title || m.member_role) as TeamMember["role"],
      pending: m.status === "invited",
    })),
    activity: (activityRes.data ?? []).map((a: any) => ({
      id: a.id, actor: a.profiles?.full_name ?? "System", action: a.text, ago: timeAgo(a.created_at),
    })),
    settings,
    notifications: (notifsRes.data ?? []).map((n: any): AppNotification => ({
      id: n.id, text: n.text, ago: timeAgo(n.created_at), read: n.read,
    })),
    conversations: await loadConversations(userId, convRes.data ?? []),
  }
}

/* ---------- mentor ---------- */

export async function loadMentorState(userId: string, email: string): Promise<Partial<MentorState>> {
  const [
    profileRes, mpRes, plansRes, subsRes, sessionsRes, reviewsRes,
    resourcesRes, payoutsRes, avRes, blockedRes, settingsRes, notifsRes, convRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("mentor_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("mentor_plans").select("*").eq("mentor_id", userId).order("sort_order"),
    supabase.from("mentor_subscriptions").select("*, seeker_profiles(*, profiles!seeker_profiles_user_id_fkey(full_name)), mentor_plans(name, price)").eq("mentor_id", userId).eq("status", "active"),
    supabase.from("mentor_sessions").select("*").eq("mentor_id", userId).order("scheduled_at"),
    supabase.from("mentor_reviews").select("*, profiles!mentor_reviews_author_id_fkey(full_name, role)").eq("mentor_id", userId).order("created_at", { ascending: false }),
    supabase.from("mentor_resources").select("*").eq("mentor_id", userId).order("created_at", { ascending: false }),
    supabase.from("payouts").select("*").eq("mentor_id", userId).order("created_at", { ascending: false }),
    supabase.from("mentor_availability").select("*").eq("mentor_id", userId).maybeSingle(),
    supabase.from("mentor_blocked_dates").select("day").eq("mentor_id", userId),
    supabase.from("user_settings").select("data").eq("user_id", userId).maybeSingle(),
    supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
    supabase.from("conversation_participants").select("conversation_id, last_read_at").eq("user_id", userId),
  ])

  const mp = mpRes.data
  const name = profileRes.data?.full_name || email.split("@")[0]

  const profile: MentorProfile = {
    name, initials: initials(name), email,
    headline: mp?.headline ?? "", bio: mp?.bio ?? "",
    expertise: mp?.expertise ?? [], company: mp?.company ?? "",
    hourlyRate: mp?.hourly_rate ?? 0, languages: mp?.languages ?? [],
    timezone: mp?.timezone ?? "", linkedin: mp?.linkedin ?? "", website: mp?.website ?? "",
  }

  const plans: MentorPlan[] = (plansRes.data ?? []).map((p: any) => ({
    id: p.id, name: p.name, price: p.price, blurb: p.blurb,
    features: p.features, published: p.published, paused: p.paused,
    menteeCount: (subsRes.data ?? []).filter((s: any) => s.plan_id === p.id).length,
  }))

  const mentees: Mentee[] = (subsRes.data ?? []).map((s: any): Mentee => ({
    id: s.mentee_id,
    name: s.seeker_profiles?.profiles?.full_name ?? "Mentee",
    initials: initials(s.seeker_profiles?.profiles?.full_name ?? "?"),
    role: s.seeker_profiles?.title ?? "",
    plan: s.mentor_plans?.name ?? "",
    since: new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    renews: s.current_period_end ? new Date(s.current_period_end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
  }))

  const availability: AvailabilityState = {
    weekly: avRes.data?.weekly ?? {},
    sessionLength: avRes.data?.session_length ?? 30,
    buffer: avRes.data?.buffer_minutes ?? 10,
    blockedDates: (blockedRes.data ?? []).map((b: any) => b.day),
  }

  return {
    profile, plans, mentees,
    sessions: (sessionsRes.data ?? []).map((s: any): MentorSession => ({
      id: s.id, title: s.title, menteeId: s.mentee_id,
      date: s.scheduled_at.slice(0, 10),
      time: new Date(s.scheduled_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      status: s.status === "scheduled" ? "upcoming" : "past",
      notes: s.notes ?? undefined,
    })),
    reviews: (reviewsRes.data ?? []).map((r: any): MentorReview => ({
      id: r.id, author: r.profiles?.full_name ?? "Mentee",
      initials: initials(r.profiles?.full_name ?? "?"),
      role: r.profiles?.role ?? "Mentee", ago: timeAgo(r.created_at),
      rating: r.rating, text: r.body, reply: r.reply ?? undefined,
    })),
    resources: (resourcesRes.data ?? []).map((r: any): MentorResource => ({
      id: r.id, title: r.title, kind: r.kind, category: r.category,
      meta: r.meta, views: r.views, downloads: r.downloads,
    })),
    payouts: (payoutsRes.data ?? []).map((p: any): MentorPayout => ({
      id: p.id, label: p.label,
      date: new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      amount: p.amount, status: p.status,
    })),
    availability,
    settings: { ...(settingsRes.data?.data ?? {}) } as MentorSettings,
    checklist: (mp?.checklist?.length ? mp.checklist : []) as MentorChecklistStep[],
    notifications: (notifsRes.data ?? []).map((n: any): AppNotification => ({
      id: n.id, text: n.text, ago: timeAgo(n.created_at), read: n.read,
    })),
    conversations: await loadConversations(userId, convRes.data ?? []),
  }
}
