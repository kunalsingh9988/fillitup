import { Link } from "react-router-dom"
import {
  BadgeCheck,
  Compass,
  DollarSign,
  GitBranch,
  Mic,
  Sparkles,
  Target,
} from "lucide-react"

import { useSeeker } from "@/lib/seeker-store"
import { Seo } from "@/components/seo"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

export default function AIHub() {
  const { state } = useSeeker()
  const passed = state.assessments.filter(a => a.status === "passed").length
  const avgPrep =
    state.prepSessions.length > 0
      ? Math.round(state.prepSessions.reduce((a, s) => a + s.score, 0) / state.prepSessions.length)
      : 0

  const tools = [
    {
      icon: Mic,
      title: "AI Interview Prep",
      desc: "AI simulates real interviews, scores your answers, and shows exactly how to improve",
      stat: `${avgPrep || "—"}% avg score · ${state.prepSessions.length} sessions`,
      to: "/app/ai/interview-prep",
    },
    {
      icon: DollarSign,
      title: "Salary Oracle",
      desc: "See how your compensation compares to 50,000+ real market offers",
      stat: "$185K median for your role",
      to: "/app/ai/salary-oracle",
    },
    {
      icon: Compass,
      title: "Compatibility Index",
      desc: "AI matches your values and work style against company cultures",
      stat: "94% top match",
      to: "/app/ai/compatibility",
    },
    {
      icon: GitBranch,
      title: "Career Path",
      desc: "Your ideal trajectory mapped from skills, experience, and goals",
      stat: "IC3 → IC4 · 4 milestones",
      to: "/app/ai/career-path",
    },
    {
      icon: BadgeCheck,
      title: "Skill Verification",
      desc: "Take assessments to earn verified skill badges employers trust",
      stat: `${passed} badges earned`,
      to: "/app/skills",
    },
    {
      icon: Target,
      title: "Skill Gap Analysis",
      desc: "See exactly which skills to learn for your target role",
      stat: "3 gaps identified",
      to: "/app/ai/career-path",
    },
  ]

  return (
    <div className="space-y-5">
      <Seo title="AI Hub" />
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          <Sparkles className="size-6 text-primary" /> AI Hub
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-powered tools to accelerate your career
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tools.map(t => (
          <Link key={t.title} to={t.to}>
            <Card className="h-full p-5 transition-colors hover:border-primary/40 hover:bg-secondary/30">
              <div className="flex items-start justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <t.icon className="size-5" />
                </span>
                <Badge variant="secondary" className="text-[10px]">Pro</Badge>
              </div>
              <h2 className="mt-3 font-display text-base font-semibold">{t.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.desc}</p>
              <p className="mt-3 text-xs font-medium text-primary">{t.stat}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
