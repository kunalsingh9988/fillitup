import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ArrowRight,
  CalendarClock,
  Check,
  CircleCheck,
  Plus,
  Sparkles,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useEmployer } from "@/lib/employer-store"
import {
  aiInsights,
  companyProfile,
  dashboardFunnel,
  interviews,
} from "@/lib/employer-data"
import { Seo } from "@/components/seo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const stepRoutes: Record<string, string> = {
  os1: "/employer/company",
  os2: "/employer/jobs/new",
  os3: "/employer/team",
  os4: "/employer/candidates",
  os5: "/employer/settings",
}

export default function EmployerDashboard() {
  const { state } = useEmployer()
  const navigate = useNavigate()
  const [checklistOpen, setChecklistOpen] = useState(true)

  const activeJobs = state.jobs.filter(j => j.status === "active")
  const totalApplicants = activeJobs.reduce((n, j) => n + j.applicants, 0)
  const interviewRows = state.candidates.filter(c => c.status === "interview")
  const doneSteps = state.onboarding.filter(s => s.done).length
  const recent = [...state.candidates].sort((a, b) => b.match - a.match).slice(0, 4)
  const blind = state.settings.blindHiring
  const jobTitle = (id: string) => state.jobs.find(j => j.id === id)?.title ?? "—"

  const stats = [
    { label: "Active Jobs", value: String(activeJobs.length) },
    { label: "Total Applicants", value: String(totalApplicants) },
    { label: "Candidates", value: String(state.candidates.length) },
    { label: "Interviews", value: String(interviewRows.length) },
    { label: "Avg Time-to-Hire", value: "18 days" },
  ]

  const intelligence = [
    {
      title: "Top Picks Today",
      stat: "10",
      body: `From ${totalApplicants} applicants, AI found 10 highly compatible (90%+)`,
      cta: "Review",
      to: "/employer/candidates?picks=1",
    },
    {
      title: "Hiring Risk",
      stat: "2",
      body: "2 shortlisted candidates idle 5+ days — may accept other offers",
      cta: "Follow up",
      to: "/employer/candidates",
    },
    {
      title: "Job Health",
      stat: "1 alert",
      body: "Product Designer listing underperforms by 30%. Add 'remote' to boost.",
      cta: "Optimize",
      to: "/employer/jobs",
    },
  ]

  const funnelMax = dashboardFunnel[0]?.count ?? 1

  return (
    <div className="space-y-6">
      <Seo title="Dashboard" />

      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {companyProfile.name.replace(" Solutions", "")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeJobs.length} active jobs · {totalApplicants} total applicants
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/employer/analytics">Customize</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/employer/jobs/new">
              <Plus className="size-4" /> Post a New Job
            </Link>
          </Button>
        </div>
      </div>

      {/* onboarding checklist */}
      {checklistOpen && doneSteps < state.onboarding.length && (
        <Card className="border-primary/20 bg-primary/5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <CircleCheck className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">Get Started</p>
                <p className="text-xs text-muted-foreground">
                  {doneSteps}/{state.onboarding.length} steps complete — let's set things up
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setChecklistOpen(false)}>
              Dismiss
            </Button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {state.onboarding.map(step => (
              <button
                key={step.id}
                onClick={() => navigate(stepRoutes[step.id] ?? "/employer")}
                className={cn(
                  "group flex flex-col rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40",
                  step.done && "opacity-60"
                )}
              >
                <span
                  className={cn(
                    "mb-2 flex size-6 items-center justify-center rounded-full text-[11px] font-bold",
                    step.done
                      ? "bg-success/20 text-success"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {step.done && <Check className="size-3.5" />}
                </span>
                <span className="text-sm font-medium leading-snug">{step.title}</span>
                <span className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                  {step.description}
                </span>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                  {step.done ? "Done" : "Start"}
                  {!step.done && (
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                  )}
                </span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {stats.map(s => (
          <Card key={s.label} className="p-4">
            <p className="font-mono text-2xl font-semibold tracking-tight">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* AI hiring intelligence */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h2 className="font-display text-lg font-semibold">AI Hiring Intelligence</h2>
          <span className="text-xs text-muted-foreground">
            Smart insights from your hiring data
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {intelligence.map(item => (
            <Card key={item.title} className="flex flex-col p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{item.title}</p>
                <Badge variant="secondary" className="font-mono">
                  {item.stat}
                </Badge>
              </div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
              <Button variant="outline" size="sm" className="mt-4 self-start" asChild>
                <Link to={item.to}>{item.cta}</Link>
              </Button>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* upcoming interviews */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="size-4 text-primary" />
              <h2 className="font-display text-base font-semibold">Upcoming Interviews</h2>
            </div>
            <Badge variant="secondary">{interviewRows.length} scheduled</Badge>
          </div>
          <ul className="space-y-3">
            {interviewRows.length === 0 && (
              <li className="text-sm text-muted-foreground">No interviews scheduled.</li>
            )}
            {interviewRows.map(c => {
              const iv = interviews.find(i => i.candidateId === c.id)
              return (
                <li
                  key={c.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-3"
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    {blind ? "#" : c.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <button
                      className="block max-w-full truncate text-sm font-medium hover:text-primary"
                      onClick={() => navigate(`/employer/candidates/${c.id}`)}
                    >
                      {blind ? `Candidate #${c.id.toUpperCase()}` : c.name}
                    </button>
                    <p className="truncate text-xs text-muted-foreground">
                      {iv?.round ?? "Interview"} · {jobTitle(c.appliedFor)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-medium">{iv?.when ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">
                      {iv?.predictedFit ?? c.match}% predicted fit
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>

        {/* hiring pipeline */}
        <Card className="p-5">
          <h2 className="mb-4 font-display text-base font-semibold">Hiring Pipeline</h2>
          <div className="space-y-3">
            {dashboardFunnel.map(stage => (
              <div key={stage.stage} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-xs text-muted-foreground">
                  {stage.stage}
                </span>
                <div className="h-6 flex-1 overflow-hidden rounded-md bg-secondary">
                  <div
                    className="h-full rounded-md bg-primary/70 transition-all"
                    style={{ width: `${Math.max(4, (stage.count / funnelMax) * 100)}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right font-mono text-sm">
                  {stage.count}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* active jobs */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">Active Jobs</h2>
            <Link
              to="/employer/jobs"
              className="text-xs font-medium text-primary hover:underline"
            >
              All jobs
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {activeJobs.slice(0, 3).map(job => (
              <li key={job.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <Link
                    to="/employer/jobs"
                    className="block truncate text-sm font-medium hover:text-primary"
                  >
                    {job.title}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {job.department} · {job.location}
                  </p>
                </div>
                <div className="hidden shrink-0 text-right text-xs text-muted-foreground sm:block">
                  <p className="font-mono">{job.views.toLocaleString()} views</p>
                  <p className="font-mono">{job.applicants} applicants</p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/employer/jobs">View</Link>
                </Button>
              </li>
            ))}
          </ul>
        </Card>

        {/* recent applicants */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">Recent Applicants</h2>
            <Link
              to="/employer/candidates"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {recent.map(c => (
              <li key={c.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                  {blind ? "#" : c.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/employer/candidates/${c.id}`}
                    className="block truncate text-sm font-medium hover:text-primary"
                  >
                    {blind ? `Candidate #${c.id.toUpperCase()}` : c.name}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.status === "interview" ? "interview scheduled" : "applied"} ·{" "}
                    {jobTitle(c.appliedFor)}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 font-mono text-sm font-semibold",
                    c.match >= 90 ? "text-success" : "text-primary"
                  )}
                >
                  {c.match}%
                </span>
                <span className="hidden w-14 shrink-0 text-right text-xs text-muted-foreground sm:block">
                  {c.appliedAgo}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* AI insight ticker */}
      <Card className="flex items-start gap-3 border-primary/20 bg-primary/5 p-4">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">AI insight:</span> {aiInsights[0]}
        </p>
      </Card>
    </div>
  )
}
