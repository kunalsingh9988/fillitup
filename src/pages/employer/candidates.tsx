import { useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Check, EyeOff, Search, Send, Sparkles, Users } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useEmployer } from "@/lib/employer-store"
import { CANDIDATE_STATUS_LABEL, type Candidate } from "@/lib/employer-types"
import { Seo } from "@/components/seo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const statusStyle: Record<string, string> = {
  new: "bg-primary/15 text-primary border-primary/30",
  screened: "bg-secondary text-secondary-foreground border-border",
  shortlisted: "bg-success/15 text-success border-success/30",
  interview: "bg-accent-indigo/15 text-indigo-300 border-accent-indigo/30",
  offer: "bg-warning/15 text-warning border-warning/30",
  hired: "bg-success/20 text-success border-success/40",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
}

function displayName(c: Candidate, blind: boolean, index: number) {
  return blind ? `Candidate #A${index + 1}` : c.name
}

function InviteCandidatesDialog() {
  const { state, inviteCandidate } = useEmployer()
  const [jobId, setJobId] = useState(state.jobs.find(j => j.status === "active")?.id ?? "")
  const [open, setOpen] = useState(false)

  const ranked = useMemo(
    () => [...state.candidates].sort((a, b) => b.match - a.match),
    [state.candidates]
  )
  const job = state.jobs.find(j => j.id === jobId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Send className="size-4" /> Invite Candidates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg p-0">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle>Invite Candidates</DialogTitle>
          <DialogDescription>
            Shortlist from the Fill-it-up talent pool · ranked by match
          </DialogDescription>
        </DialogHeader>
        <div className="px-5 pt-3">
          <Select value={jobId} onValueChange={setJobId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a role" />
            </SelectTrigger>
            <SelectContent>
              {state.jobs
                .filter(j => j.status === "active")
                .map(j => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.title}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="px-5 py-3">
          <p className="text-xs text-muted-foreground">
            {ranked.length} shortlisted candidates for this role
          </p>
        </div>
        <ul className="max-h-80 divide-y divide-border overflow-y-auto border-t border-border">
          {ranked.map(c => {
            const invited = state.invited.includes(c.id)
            return (
              <li key={c.id} className="flex items-center gap-3 px-5 py-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                  {state.settings.blindHiring ? "#" : c.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">
                      {state.settings.blindHiring ? `Candidate #${c.id.toUpperCase()}` : c.name}
                    </p>
                    <span
                      className={cn(
                        "font-mono text-xs font-semibold",
                        c.match >= 90 ? "text-success" : "text-primary"
                      )}
                    >
                      {c.match}% match
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.title} · {state.settings.blindHiring ? "—" : c.location} · {c.years}{" "}
                    years
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {c.skills.slice(0, 3).map(s => (
                      <span
                        key={s}
                        className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={invited ? "outline" : "default"}
                  disabled={invited}
                  onClick={() => {
                    inviteCandidate(c.id)
                    toast.success(`Invited ${c.name}`, {
                      description: job ? `for ${job.title}` : undefined,
                    })
                  }}
                >
                  {invited ? (
                    <>
                      <Check className="size-3.5" /> Invited
                    </>
                  ) : (
                    "Invite"
                  )}
                </Button>
              </li>
            )
          })}
        </ul>
      </DialogContent>
    </Dialog>
  )
}

export default function EmployerCandidates() {
  const { state, setCandidateStatus, setStepDone } = useEmployer()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const blind = state.settings.blindHiring
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState(params.get("job") ?? "all")
  const [picksOnly, setPicksOnly] = useState(params.get("picks") === "1")
  const [picksOpen, setPicksOpen] = useState(true)
  const [selected, setSelected] = useState<string[]>([])

  const activeJobs = state.jobs.filter(j => j.status === "active")

  const filtered = useMemo(() => {
    let list = state.candidates
    if (roleFilter !== "all") list = list.filter(c => c.appliedFor === roleFilter)
    if (picksOnly) list = list.filter(c => c.isAiPick)
    if (query) {
      const q = query.toLowerCase()
      list = list.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.skills.some(s => s.toLowerCase().includes(q)) ||
          c.location.toLowerCase().includes(q)
      )
    }
    return [...list].sort((a, b) => b.match - a.match)
  }, [state.candidates, roleFilter, picksOnly, query])

  const picks = useMemo(
    () => state.candidates.filter(c => c.isAiPick).sort((a, b) => b.match - a.match).slice(0, 5),
    [state.candidates]
  )

  const toggleAll = () =>
    setSelected(s => (s.length === filtered.length ? [] : filtered.map(c => c.id)))
  const toggle = (id: string) =>
    setSelected(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]))

  const view = (id: string) => {
    setStepDone("os4", true)
    navigate(`/employer/candidates/${id}`)
  }

  return (
    <div className="space-y-5">
      <Seo title="Candidates" />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Candidates
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Browse candidates</p>
        </div>
        <div className="flex items-center gap-2">
          {blind && (
            <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
              <EyeOff className="size-3" /> Blind hiring on
            </Badge>
          )}
          <InviteCandidatesDialog />
        </div>
      </div>

      {/* search + role chips */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search candidates..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setRoleFilter("all")
              params.delete("job")
              setParams(params, { replace: true })
            }}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              roleFilter === "all"
                ? "border-primary bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </button>
          {activeJobs.map(j => (
            <button
              key={j.id}
              onClick={() => setRoleFilter(j.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                roleFilter === j.id
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {j.title}
            </button>
          ))}
        </div>
      </div>

      {/* AI top picks */}
      {picksOpen && (
        <Card className="border-primary/25 bg-primary/5 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">AI Top Picks</p>
                <p className="mt-0.5 max-w-xl text-xs leading-relaxed text-muted-foreground">
                  AI analyzed {state.jobs.reduce((n, j) => n + j.applicants, 0)} applicants
                  across {activeJobs.length} active jobs and identified {picks.length}{" "}
                  highly compatible candidates based on skills, experience, and cultural fit.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={picksOnly ? "default" : "outline"}
                onClick={() => setPicksOnly(p => !p)}
              >
                Show AI Picks Only
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setPicksOpen(false)}>
                Hide
              </Button>
            </div>
          </div>
          <ul className="mt-4 divide-y divide-border/60">
            {picks.map((c, i) => (
              <li key={c.id} className="flex items-center gap-3 py-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold">
                  {blind ? "#" : c.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {displayName(c, blind, i)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{c.rationale}</p>
                </div>
                <span
                  className={cn(
                    "font-mono text-sm font-semibold",
                    c.match >= 90 ? "text-success" : "text-primary"
                  )}
                >
                  {c.match}%
                </span>
                <Button variant="ghost" size="sm" onClick={() => view(c.id)}>
                  View
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* bulk bar */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox
            checked={filtered.length > 0 && selected.length === filtered.length}
            onCheckedChange={toggleAll}
            aria-label="Select all candidates"
          />
          Select all
        </label>
        {selected.length > 0 && (
          <>
            <span className="text-xs text-muted-foreground">{selected.length} selected</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                selected.forEach(id => setCandidateStatus(id, "shortlisted"))
                toast.success(`${selected.length} candidates shortlisted`)
                setSelected([])
              }}
            >
              Shortlist selected
            </Button>
          </>
        )}
        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} of {state.candidates.length} candidates
        </span>
      </div>

      {/* cards grid */}
      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 px-6 py-14 text-center">
          <Users className="size-8 text-muted-foreground/50" />
          <p className="text-sm font-medium">No candidates match</p>
          <p className="text-xs text-muted-foreground">Adjust filters or search.</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((c, i) => (
            <Card key={c.id} className="flex items-start gap-3 p-4">
              <Checkbox
                checked={selected.includes(c.id)}
                onCheckedChange={() => toggle(c.id)}
                aria-label={`Select ${c.name}`}
                className="mt-1"
              />
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                {blind ? "#" : c.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => view(c.id)}
                    className="truncate text-sm font-semibold hover:text-primary"
                  >
                    {displayName(c, blind, i)}
                  </button>
                  <Badge
                    variant="outline"
                    className={cn("shrink-0 text-[10px]", statusStyle[c.status])}
                  >
                    {CANDIDATE_STATUS_LABEL[c.status]}
                  </Badge>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {c.title} · {blind ? "—" : c.location}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.skills.slice(0, 3).map(s => (
                    <span
                      key={s}
                      className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <p className="mt-2 truncate text-[11px] text-muted-foreground/80">
                  Applied for: {state.jobs.find(j => j.id === c.appliedFor)?.title ?? "—"}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span
                  className={cn(
                    "font-mono text-lg font-semibold",
                    c.match >= 90 ? "text-success" : "text-primary"
                  )}
                >
                  {c.match}%
                </span>
                <Button variant="ghost" size="sm" onClick={() => view(c.id)}>
                  View
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
