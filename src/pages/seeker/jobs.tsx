import { useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Clock,
  FileText,
  Paperclip,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useSeeker } from "@/lib/seeker-store"
import { STAGE_LABEL, type ApplicationStage, type SeekerJob } from "@/lib/seeker-types"
import { Seo } from "@/components/seo"
import { EmptyState } from "@/components/empty-state"
import { MatchScoreRing } from "@/components/match-score-ring"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const TRACKER_TABS: { key: ApplicationStage | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "saved", label: "Saved" },
  { key: "in_progress", label: "In Progress" },
  { key: "applied", label: "Applied" },
  { key: "interview", label: "Interview" },
  { key: "archived", label: "Archived" },
]

function JobCard({
  job,
  selected,
  onSelect,
  saved,
  onToggleSave,
}: {
  job: SeekerJob
  selected?: boolean
  onSelect: () => void
  saved: boolean
  onToggleSave: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full rounded-xl border p-4 text-left transition-colors",
        selected
          ? "border-primary/60 bg-primary/5"
          : "border-border bg-card hover:border-primary/30 hover:bg-secondary/40"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary font-display text-sm font-bold">
          {job.logoInitials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium text-muted-foreground">{job.company}</p>
            <span className="shrink-0 text-[11px] text-muted-foreground">{job.posted}</span>
          </div>
          <p className="mt-0.5 truncate text-[15px] font-semibold">{job.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {job.location} · {job.type}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono text-xs text-primary">{job.salary}</span>
            <span className="flex items-center gap-2">
              {job.applyType !== "standard" && (
                <Badge variant="secondary" className="text-[10px]">
                  {job.applyType === "quick" ? "Quick Apply" : "Easy Apply"}
                </Badge>
              )}
              <span onClick={e => { e.stopPropagation(); onToggleSave() }}>
                {saved ? (
                  <BookmarkCheck className="size-4 text-primary" />
                ) : (
                  <Bookmark className="size-4 text-muted-foreground hover:text-foreground" />
                )}
              </span>
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

function JobDetail({ job }: { job: SeekerJob }) {
  const { state, trackJob } = useSeeker()
  const navigate = useNavigate()
  const applied = state.appliedJobs.includes(job.id)
  const saved = state.tracker.some(t => t.jobId === job.id && t.stage === "saved")

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <span className="flex size-14 items-center justify-center rounded-xl bg-secondary font-display text-lg font-bold">
          {job.logoInitials}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl font-bold">{job.title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {job.company} · {job.location} · {job.type} · {job.posted}
          </p>
          <p className="mt-1 font-mono text-sm text-primary">{job.salary}</p>
        </div>
        <MatchScoreRing score={job.matchScore} size={64} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          className="flex-1 sm:flex-none"
          onClick={() => (applied ? navigate("/app/jobs?tab=tracker") : navigate(`/app/apply/${job.id}`))}
        >
          {applied ? "View application" : "Apply Now"}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const ok = state.credits >= 50
            if (!ok) {
              toast.error("Not enough credits", { description: "AI enhance costs 50 credits." })
              return
            }
            toast.success("Resume enhanced for this role", {
              description: "AI tailored your resume to this job description. −50 credits",
            })
          }}
        >
          <Sparkles className="size-4" /> Enhance with AI
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            trackJob(job.id, saved ? "in_progress" : "saved")
            toast.success(saved ? "Moved to In Progress" : "Saved to tracker")
          }}
        >
          {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
          {saved ? "Saved" : "Save"}
        </Button>
      </div>

      {/* AI match analysis */}
      <Card className="border-primary/20 bg-primary/5 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h3 className="font-display text-sm font-semibold">AI Match Analysis</h3>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{job.aiSummary}</p>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-background/60 p-3">
            <p className="font-mono text-lg font-semibold text-primary">{job.matchScore}%</p>
            <p className="text-[11px] text-muted-foreground">Profile Match</p>
          </div>
          <div className="rounded-lg bg-background/60 p-3">
            <p className="font-mono text-lg font-semibold">
              {job.skillsMatched[0]}/{job.skillsMatched[1]}
            </p>
            <p className="text-[11px] text-muted-foreground">Skills Matched</p>
          </div>
          <div className="rounded-lg bg-background/60 p-3">
            <p className="font-mono text-lg font-semibold">5-8 yrs</p>
            <p className="text-[11px] text-muted-foreground">Experience Band</p>
          </div>
        </div>
        <div className="mt-4 space-y-3 text-sm">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-success">Where you fit</p>
            <ul className="space-y-1 text-muted-foreground">
              {job.fitPoints.map(x => (
                <li key={x} className="flex gap-2"><span className="text-success">✓</span>{x}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-warning">Gaps to close</p>
            <ul className="space-y-1 text-muted-foreground">
              {job.gaps.map(x => (
                <li key={x} className="flex gap-2"><span className="text-warning">!</span>{x}</li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-muted-foreground/80">{job.salaryContext}</p>
        </div>
      </Card>

      <div>
        <h3 className="mb-2 font-display text-sm font-semibold">About the Role</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{job.about}</p>
        <div className="mt-3 grid gap-3 text-xs text-muted-foreground sm:grid-cols-2">
          <p><span className="text-foreground">Team size:</span> {job.teamSize}</p>
          <p><span className="text-foreground">Reports to:</span> {job.reportsTo}</p>
        </div>
      </div>

      <div>
        <h3 className="mb-2 font-display text-sm font-semibold">Requirements</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {job.requirements.map(r => <li key={r}>{r}</li>)}
        </ul>
      </div>
      <div>
        <h3 className="mb-2 font-display text-sm font-semibold">Benefits</h3>
        <div className="flex flex-wrap gap-2">
          {job.benefits.map(b => <Badge key={b} variant="secondary">{b}</Badge>)}
        </div>
      </div>
    </div>
  )
}

export default function SeekerJobs() {
  const { state, trackJob, setStage, removeTracked } = useSeeker()
  const [params, setParams] = useSearchParams()
  const tab = params.get("tab") ?? "foryou"
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [trackerTab, setTrackerTab] = useState<"all" | ApplicationStage>("all")
  const [searches, setSearches] = useState<string[]>([
    "UI UX Designer",
    "React developer",
    "Staff engineer remote",
  ])

  const tracked = useMemo(
    () =>
      state.tracker
        .map(t => ({ t, job: state.jobs.find(j => j.id === t.jobId) }))
        .filter((x): x is { t: (typeof state.tracker)[0]; job: SeekerJob } => !!x.job),
    [state.tracker, state.jobs]
  )

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return state.jobs.filter(
      j =>
        !q ||
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.tags.some(t => t.toLowerCase().includes(q))
    )
  }, [state.jobs, query])

  const selected = filtered.find(j => j.id === selectedId) ?? filtered[0]
  const savedIds = new Set(state.tracker.filter(t => t.stage === "saved").map(t => t.jobId))
  const trackerFiltered =
    trackerTab === "all" ? tracked : tracked.filter(x => x.t.stage === trackerTab)

  const trending = [
    { title: "Senior Product Designer", meta: "Remote · $180–220K", forWho: "Top Design Companies", ago: "2h ago" },
    { title: "Frontend Engineer", meta: "San Francisco · $160–200K", forWho: "Leading Tech Firms", ago: "5h ago" },
    { title: "Data Scientist", meta: "New York · $170–210K", forWho: "Data-Driven Companies", ago: "1d ago" },
    { title: "Engineering Manager", meta: "Remote · $200–260K", forWho: "Scaling Startups", ago: "3h ago" },
  ]

  return (
    <div className="space-y-5">
      <Seo title="Jobs" />
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Jobs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Discover, save, and track opportunities
        </p>
      </div>

      <Tabs value={tab} onValueChange={v => setParams({ tab: v })}>
        <TabsList>
          <TabsTrigger value="foryou">For You</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="tracker">
            Job Tracker{" "}
            <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 text-[10px] text-primary">
              {tracked.length}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* ── For You ─────────────────────────────── */}
        <TabsContent value="foryou" className="mt-5 space-y-5">
          <div>
            <h2 className="font-display text-lg font-semibold">Top picks for you</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {state.jobs
                .slice()
                .sort((a, b) => b.matchScore - a.matchScore)
                .slice(0, 6)
                .map(j => (
                  <Card key={j.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-lg bg-secondary font-display text-sm font-bold">
                          {j.logoInitials}
                        </span>
                        <div>
                          <p className="text-xs text-muted-foreground">{j.company} · {j.posted}</p>
                          <p className="text-sm font-semibold">{j.title}</p>
                        </div>
                      </div>
                      <MatchScoreRing score={j.matchScore} size={44} strokeWidth={4} />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{j.location} · {j.type}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-mono text-xs text-primary">{j.salary}</span>
                      <Button size="sm" variant="outline" onClick={() => { setParams({ tab: "search" }); setSelectedId(j.id) }}>
                        View
                      </Button>
                    </div>
                  </Card>
                ))}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              <h2 className="font-display text-lg font-semibold">Trending opportunities</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {trending.map(t => (
                <Card key={t.title} className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-semibold">{t.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{t.meta} · {t.ago}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground/70">
                      Hiring for '{t.forWho}'
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setParams({ tab: "search" })}
                  >
                    View opportunity
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Search ──────────────────────────────── */}
        <TabsContent value="search" className="mt-5 space-y-5">
          <Card className="p-5">
            <h2 className="font-display text-lg font-semibold">Find your next role</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Describe what you're looking for — AI will match you with the best opportunities
            </p>
            <div className="mt-3 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && query.trim() && !searches.includes(query.trim())) {
                      setSearches(s => [query.trim(), ...s].slice(0, 6))
                    }
                  }}
                  placeholder="e.g. Senior product designer, remote, at a Series B+ startup..."
                  className="pl-9"
                />
              </div>
              <Button variant="outline" onClick={() => toast.success("Resume attached to search context")}>
                <Paperclip className="size-4" /> Attach resume
              </Button>
              <Button onClick={() => query.trim() && setSearches(s => [query.trim(), ...s.filter(x => x !== query.trim())].slice(0, 6))}>
                Search jobs
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Recent searches</span>
              {searches.map(s => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
              <button
                className="text-xs text-primary hover:underline"
                onClick={() => setSearches([])}
              >
                Clear all
              </button>
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-5">
            <div className="space-y-2 lg:col-span-2">
              <p className="text-xs text-muted-foreground">{filtered.length} jobs · AI ranked</p>
              {filtered.map(j => (
                <JobCard
                  key={j.id}
                  job={j}
                  selected={selected?.id === j.id}
                  saved={savedIds.has(j.id)}
                  onSelect={() => setSelectedId(j.id)}
                  onToggleSave={() => {
                    trackJob(j.id, "saved")
                    toast.success(savedIds.has(j.id) ? "Already saved" : "Saved to tracker")
                  }}
                />
              ))}
              {filtered.length === 0 && (
                <EmptyState icon={Search} title="No matches" description="Try a broader search query." />
              )}
            </div>
            <Card className="p-5 lg:col-span-3">
              {selected ? (
                <JobDetail job={selected} />
              ) : (
                <EmptyState icon={Briefcase} title="Select a job" description="Pick a listing to see AI match analysis." />
              )}
            </Card>
          </div>
        </TabsContent>

        {/* ── Job Tracker ─────────────────────────── */}
        <TabsContent value="tracker" className="mt-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            {TRACKER_TABS.map(t => {
              const count =
                t.key === "all" ? tracked.length : tracked.filter(x => x.t.stage === t.key).length
              return (
                <button
                  key={t.key}
                  onClick={() => setTrackerTab(t.key)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                    trackerTab === t.key
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label} · {count}
                </button>
              )
            })}
          </div>

          {trackerFiltered.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Nothing here yet"
              description="Save jobs from Search or For You to start tracking them."
              action={<Button size="sm" onClick={() => setParams({ tab: "search" })}>Browse jobs</Button>}
            />
          ) : (
            <div className="space-y-2">
              {trackerFiltered.map(({ t, job }) => (
                <Card key={t.id} className="flex flex-wrap items-center gap-3 p-4">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-secondary font-display text-sm font-bold">
                    {job.logoInitials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{job.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.company} · {job.location} · {job.type}
                      {t.appliedOn ? ` · Applied ${t.appliedOn}` : ""}
                    </p>
                    {t.nextStep && (
                      <p className="mt-0.5 text-xs text-primary">Next: {t.nextStep}</p>
                    )}
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      t.stage === "interview" && "bg-primary/15 text-primary",
                      t.stage === "offer" && "bg-success/15 text-success",
                      t.stage === "rejected" && "bg-destructive/15 text-destructive"
                    )}
                  >
                    {STAGE_LABEL[t.stage]}
                  </Badge>
                  <Select value={t.stage} onValueChange={v => setStage(t.id, v as ApplicationStage)}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STAGE_LABEL).map(([k, l]) => (
                        <SelectItem key={k} value={k}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setParams({ tab: "search" })
                      setSelectedId(job.id)
                    }}
                  >
                    <FileText className="size-3.5" /> View
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Remove from tracker"
                    onClick={() => {
                      removeTracked(t.id)
                      toast.success("Removed from tracker")
                    }}
                  >
                    <Trash2 className="size-4 text-muted-foreground" />
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
