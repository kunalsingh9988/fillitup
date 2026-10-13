import { Link } from "react-router-dom"
import { CalendarClock, Check, Eye, IndianRupee, Star, Users, Video } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMentor } from "@/lib/mentor-store"
import { monthlyRevenue } from "@/lib/mentor-data"
import { Seo } from "@/components/seo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const STEP_ROUTE: Record<string, string> = {
  mk1: "/mentor/profile",
  mk2: "/mentor/plans",
  mk3: "/mentor/availability",
  mk4: "/mentor/resources",
  mk5: "/mentor/settings",
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`

export default function MentorDashboard() {
  const { state } = useMentor()
  const p = state.profile
  const done = state.checklist.filter(c => c.done).length
  const upcoming = state.sessions.filter(s => s.status === "upcoming").slice(0, 3)
  const monthRevenue = monthlyRevenue[monthlyRevenue.length - 1].amount

  const stats = [
    { label: "Monthly revenue", value: inr(monthRevenue), sub: "+13% vs last", icon: IndianRupee },
    { label: "Active mentees", value: String(state.mentees.length), sub: `Across ${state.plans.filter(p2 => p2.published).length} plans`, icon: Users },
    { label: "Sessions this week", value: String(upcoming.length), sub: "All upcoming", icon: CalendarClock },
    { label: "Avg rating", value: "4.9", sub: `${state.reviews.length} reviews`, icon: Star },
    { label: "Profile views", value: "284", sub: "Last 7 days", icon: Eye },
  ]

  return (
    <div className="space-y-5">
      <Seo title="Dashboard" />
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome back, {p.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's what's happening with your mentorship today.
        </p>
      </div>

      {/* getting started */}
      <Card className="p-5">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">Getting started</h2>
          <Badge variant="secondary">{done}/5 done</Badge>
        </div>
        <Progress value={(done / 5) * 100} className="mb-4 h-1.5" />
        <ul className="grid gap-2 sm:grid-cols-2">
          {state.checklist.map(step => (
            <li key={step.id} className="flex items-center gap-2.5 text-sm">
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border",
                  step.done ? "border-success/40 bg-success/15 text-success" : "border-border text-muted-foreground"
                )}
              >
                {step.done ? <Check className="size-3" /> : ""}
              </span>
              {step.done ? (
                <span className="text-muted-foreground line-through">{step.title}</span>
              ) : (
                <Link to={STEP_ROUTE[step.id] ?? "/mentor"} className="text-primary hover:underline">
                  {step.title}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </Card>

      {/* stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {stats.map(s => (
          <Card key={s.label} className="p-4 text-center">
            <s.icon className="mx-auto mb-1.5 size-5 text-primary" />
            <p className="font-mono text-2xl font-semibold">{s.value}</p>
            <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
            <p className="text-[10px] text-muted-foreground/70">{s.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* upcoming sessions */}
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">Upcoming sessions</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/mentor/sessions">View all</Link>
            </Button>
          </div>
          <ul className="space-y-3">
            {upcoming.map(s => {
              const mentee = state.mentees.find(m => m.id === s.menteeId)
              return (
                <li key={s.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Video className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {mentee?.name} · {s.date} · {s.time}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => {}}>Join</Button>
                </li>
              )
            })}
            {upcoming.length === 0 && (
              <li className="py-6 text-center text-sm text-muted-foreground">
                No upcoming sessions
              </li>
            )}
          </ul>
        </Card>

        {/* quick actions + mentees */}
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="mb-3 font-display text-base font-semibold">Quick actions</h2>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" asChild><Link to="/mentor/plans">Create new plan</Link></Button>
              <Button variant="outline" size="sm" asChild><Link to="/mentor/messages">Reply to messages</Link></Button>
              <Button variant="outline" size="sm" asChild><Link to="/mentor/earnings">View earnings</Link></Button>
              <Button variant="outline" size="sm" asChild><Link to="/mentor/profile">Edit public profile</Link></Button>
            </div>
          </Card>
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold">Active mentees</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/mentor/mentees">View all</Link>
              </Button>
            </div>
            <ul className="space-y-2.5">
              {state.mentees.map(m => (
                <li key={m.id} className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-[10px] font-bold">
                    {m.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.role} · Since {m.since}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{m.plan}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
