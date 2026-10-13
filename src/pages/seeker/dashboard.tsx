import { Link } from "react-router-dom"
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Check,
  CircleCheck,
  Compass,
  DollarSign,
  FileText,
  GitBranch,
  Mic,
  Sparkles,
  Target,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useSeeker } from "@/lib/seeker-store"
import { Seo } from "@/components/seo"
import { StatCard } from "@/components/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const STEP_ROUTE: Record<string, string> = {
  sc1: "/app/profile",
  sc2: "/app/resumes",
  sc3: "/app/skills",
  sc4: "/app/ai/interview-prep",
  sc5: "/app/ai/salary-oracle",
}

const INSIGHTS = [
  { icon: Target, label: "Skill Gaps", stat: "3 gaps identified", to: "/app/ai/career-path" },
  { icon: Mic, label: "Interview Prep", stat: "85% avg score", to: "/app/ai/interview-prep" },
  { icon: DollarSign, label: "Salary Oracle", stat: "$185K median", to: "/app/ai/salary-oracle" },
  { icon: Compass, label: "Compatibility", stat: "94% top match", to: "/app/ai/compatibility" },
  { icon: GitBranch, label: "Career Path", stat: "IC3 → IC4", to: "/app/ai/career-path" },
  { icon: BadgeCheck, label: "Skill Verify", stat: "2 badges earned", to: "/app/skills" },
]

export default function SeekerDashboard() {
  const { state, resetDemo } = useSeeker()
  const p = state.profile
  const done = state.checklist.filter(c => c.done).length
  const readinessChecklist = [
    { label: "Profile completed", done: state.checklist.find(c => c.id === "sc1")?.done },
    { label: "Resume uploaded", done: state.checklist.find(c => c.id === "sc2")?.done },
    { label: "Skills verified", done: state.assessments.some(a => a.status === "passed") },
    { label: "Interview practice", done: state.prepSessions.length > 3 },
    { label: "Salary benchmarked", done: state.checklist.find(c => c.id === "sc5")?.done },
  ]
  const readinessDone = readinessChecklist.filter(r => r.done).length

  return (
    <div className="space-y-5">
      <Seo title="Dashboard" />

      {/* welcome */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {p.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your career readiness is at {p.readiness}% — {5 - done} tasks remaining
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => {
          resetDemo()
          toast.success("Demo reset")
        }}>
          Restart tour
        </Button>
      </div>

      {/* get started checklist */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">Get Started</h2>
          <Badge variant="secondary">{done}/5 steps complete — let's set things up</Badge>
        </div>
        <ul className="divide-y divide-border">
          {state.checklist.map(step => (
            <li key={step.id} className="flex items-center gap-4 py-3.5">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border",
                  step.done
                    ? "border-success/40 bg-success/15 text-success"
                    : "border-border bg-secondary text-muted-foreground"
                )}
              >
                {step.done ? <Check className="size-4" /> : <Sparkles className="size-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm font-medium", step.done && "text-muted-foreground line-through")}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
              {!step.done ? (
                <Button size="sm" variant="outline" asChild>
                  <Link to={STEP_ROUTE[step.id] ?? "/app"}>Start</Link>
                </Button>
              ) : (
                <CircleCheck className="size-5 text-success" />
              )}
            </li>
          ))}
        </ul>
      </Card>

      {/* stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Applications" value="12" sublabel="+3 this week" icon={FileText} />
        <StatCard
          label="Saved Jobs"
          value={String(state.tracker.filter(t => t.stage === "saved").length + 20)}
          sublabel="5 new matches"
          icon={Briefcase}
        />
        <StatCard label="AI Score" value={`${p.readiness}%`} sublabel="+4% this month" icon={Sparkles} />
        <StatCard
          label="Resumes"
          value={String(state.resumes.length)}
          sublabel={state.resumes.some(r => r.score < 70) ? "1 needs update" : "All up to date"}
          icon={FileText}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* readiness checklist */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">Career Readiness Checklist</h2>
            <span className="font-mono text-sm text-primary">{readinessDone}/5</span>
          </div>
          <Progress value={(readinessDone / 5) * 100} className="mb-4 h-1.5" />
          <ul className="space-y-2.5">
            {readinessChecklist.map(r => (
              <li key={r.label} className="flex items-center gap-2.5 text-sm">
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full border text-[10px]",
                    r.done
                      ? "border-success/40 bg-success/15 text-success"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {r.done ? <Check className="size-3" /> : ""}
                </span>
                <span className={cn(r.done ? "text-muted-foreground" : "text-foreground")}>
                  {r.label}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {/* AI insights */}
        <Card className="p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">AI Insights</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/ai">
                Open AI Hub <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {INSIGHTS.map(t => (
              <Link
                key={t.label}
                to={t.to}
                className="group rounded-xl border border-border bg-secondary/30 p-4 transition-colors hover:border-primary/40 hover:bg-secondary/60"
              >
                <t.icon className="size-5 text-primary" />
                <p className="mt-2.5 text-sm font-medium">{t.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t.stat}</p>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
