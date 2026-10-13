import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, ArrowRight, BadgeCheck, ChevronDown, GitBranch, Pencil } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useSeeker } from "@/lib/seeker-store"
import { careerPath, learningPlan } from "@/lib/seeker-data"
import { Seo } from "@/components/seo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

export default function CareerPath() {
  const { state } = useSeeker()
  const [showAllReqs, setShowAllReqs] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [goal, setGoal] = useState(careerPath.next.title)
  const [path, setPath] = useState(careerPath)

  const reqs = showAllReqs ? path.next.requirements : path.next.requirements.slice(0, 2)
  const gapSkills = ["System Design", "GraphQL", "Team Leadership"]

  return (
    <div className="space-y-5">
      <Seo title="Career Path" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Career Path</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI mapped your ideal career trajectory based on your skills, experience, and goals
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="size-3.5" /> Edit Career Path
        </Button>
      </div>

      {/* current → next */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <Badge variant="secondary" className="mb-2">Current</Badge>
          <p className="font-display text-lg font-semibold">{state.profile.title}</p>
          <p className="text-sm text-muted-foreground">
            {path.current.level} · {path.current.tenure}
          </p>
        </Card>
        <Card className="border-primary/30 bg-primary/5 p-5">
          <Badge className="mb-2 bg-primary/15 text-primary hover:bg-primary/15">Next</Badge>
          <p className="font-display text-lg font-semibold">{path.next.title}</p>
          <p className="text-sm text-muted-foreground">
            {path.next.level} · {path.next.eta}
          </p>
        </Card>
      </div>

      {/* next requirements */}
      <Card className="p-5">
        <h2 className="font-display text-base font-semibold">Next: {path.next.title}</h2>
        <ul className="mt-3 space-y-2">
          {reqs.map(r => (
            <li key={r} className="flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowRight className="size-3.5 text-primary" /> {r}
            </li>
          ))}
        </ul>
        <Button variant="ghost" size="sm" className="mt-2" onClick={() => setShowAllReqs(v => !v)}>
          {showAllReqs ? "Show less" : `Show all ${path.next.requirements.length} requirements`}
          <ChevronDown className={cn("size-4 transition-transform", showAllReqs && "rotate-180")} />
        </Button>
        <div className="mt-3 flex gap-2">
          <Button size="sm" asChild>
            <Link to="/app/skills">
              <BadgeCheck className="size-4" /> Verify Skills
            </Link>
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.success("Learning plan opened below")}>
            Curated learning plan
          </Button>
        </div>
      </Card>

      {/* skill gaps */}
      <Card className="p-5">
        <h2 className="font-display text-base font-semibold">Skill Gaps to Close</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {gapSkills
            .filter(g => !state.profile.skills.includes(g))
            .map(g => (
              <Badge key={g} variant="outline" className="border-warning/40 text-warning">
                {g}
              </Badge>
            ))}
          {state.profile.skills.filter(s => ["System Design", "GraphQL"].includes(s)).length > 0 && (
            <Badge variant="secondary" className="text-success">
              GraphQL learned ✓
            </Badge>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Closing these gaps raises your estimated match for {path.next.title} roles by ~14%.
        </p>
      </Card>

      {/* trajectory */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">Full Career Trajectory</h2>
          <Badge variant="secondary">{path.trajectory.length} milestones</Badge>
        </div>
        <ol className="relative space-y-5 border-l border-border pl-6">
          {path.trajectory.map((m, i) => (
            <li key={m.level} className="relative">
              <span
                className={cn(
                  "absolute -left-[29px] flex size-4 items-center justify-center rounded-full border-2",
                  i === 0 ? "border-success bg-success/20" : "border-border bg-background"
                )}
              >
                {i === 0 && <span className="size-1.5 rounded-full bg-success" />}
              </span>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{m.level} · {m.eta}</p>
                </div>
                <span className="font-mono text-xs text-primary">{m.salary}</span>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      {/* learning plan */}
      <Card className="p-5">
        <h2 className="mb-1 font-display text-base font-semibold">
          Learning roadmap for {path.next.title}
        </h2>
        <p className="text-xs text-muted-foreground">Curated by AI from 1,200+ resources</p>
        <ul className="mt-4 space-y-3">
          {learningPlan.map(l => (
            <li key={l.id} className="rounded-lg border border-border p-3.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{l.title}</span>
                <Badge variant="secondary" className="text-[10px]">{l.kind}</Badge>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <Progress value={l.progress} className="h-1.5 flex-1" />
                <span className="font-mono text-xs text-muted-foreground">{l.progress}%</span>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Button variant="ghost" size="sm" asChild>
        <Link to="/app/ai"><ArrowLeft className="size-4" /> Back to AI Hub</Link>
      </Button>

      {/* edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Career Path</DialogTitle>
            <DialogDescription>Change your next-level goal and AI remaps the path.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Target role</Label>
              <Input value={goal} onChange={e => setGoal(e.target.value)} />
            </div>
            <Button
              className="w-full"
              disabled={!goal.trim()}
              onClick={() => {
                setPath(p => ({ ...p, next: { ...p.next, title: goal.trim() } }))
                setEditOpen(false)
                toast.success("Career path updated", { description: `Targeting ${goal.trim()} now.` })
              }}
            >
              <GitBranch className="size-4" /> Remap path
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
