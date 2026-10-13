import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, CalendarPlus, Check, Send, X } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useEmployer } from "@/lib/employer-store"
import {
  CANDIDATE_STATUS_LABEL,
  type CandidateStatus,
} from "@/lib/employer-types"
import { MatchScoreRing } from "@/components/match-score-ring"
import { Seo } from "@/components/seo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

const STATUSES = Object.keys(CANDIDATE_STATUS_LABEL) as CandidateStatus[]

const statusStyle: Record<string, string> = {
  new: "bg-primary/15 text-primary border-primary/30",
  screened: "bg-secondary text-secondary-foreground border-border",
  shortlisted: "bg-success/15 text-success border-success/30",
  interview: "bg-accent-indigo/15 text-indigo-300 border-accent-indigo/30",
  offer: "bg-warning/15 text-warning border-warning/30",
  hired: "bg-success/20 text-success border-success/40",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
}

const mockInterviewPrep = [
  "Walk me through a project where you owned the architecture end-to-end.",
  "How do you approach debugging a production issue under pressure?",
  "Describe a time you disagreed with a product decision — what did you do?",
]

export default function CandidateDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    state,
    setCandidateStatus,
    addCandidateNote,
    assignCandidate,
    inviteCandidate,
  } = useEmployer()

  const candidate = state.candidates.find(c => c.id === id)
  const [note, setNote] = useState("")
  const blind = state.settings.blindHiring

  if (!candidate) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <p className="text-sm text-muted-foreground">Candidate not found.</p>
        <Button variant="outline" size="sm" asChild>
          <Link to="/employer/candidates">Back to candidates</Link>
        </Button>
      </div>
    )
  }

  const job = state.jobs.find(j => j.id === candidate.appliedFor)
  const invited = state.invited.includes(candidate.id)
  const name = blind ? `Candidate #${candidate.id.toUpperCase()}` : candidate.name
  const breakdown = [
    { label: "Skills", value: candidate.matchBreakdown.skills },
    { label: "Experience", value: candidate.matchBreakdown.experience },
    { label: "Culture", value: candidate.matchBreakdown.culture },
  ]

  const setStatus = (s: CandidateStatus) => {
    setCandidateStatus(candidate.id, s)
    toast.success(`Moved to ${CANDIDATE_STATUS_LABEL[s]}`, {
      description: candidate.name,
    })
  }

  return (
    <div className="space-y-5">
      <Seo title={blind ? "Candidate" : candidate.name} />

      <Link
        to="/employer/candidates"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back
      </Link>

      {/* header card */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-full bg-primary/15 font-display text-lg font-bold text-primary">
            {blind ? "#" : candidate.initials}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-bold">{name}</h1>
              <Badge variant="outline" className={cn(statusStyle[candidate.status])}>
                {CANDIDATE_STATUS_LABEL[candidate.status]}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {candidate.title} · {candidate.years} years · {blind ? "—" : candidate.location}
            </p>
            <p className="text-xs text-muted-foreground/80">
              Applied for {job?.title ?? "—"} · {candidate.appliedAgo} · via{" "}
              {candidate.source}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={candidate.status}
              onValueChange={v => setStatus(v as CandidateStatus)}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map(s => (
                  <SelectItem key={s} value={s}>
                    {CANDIDATE_STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setStatus("shortlisted")
              }}
            >
              <Check className="size-4" /> Shortlist
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                setStatus("rejected")
                navigate("/employer/candidates")
              }}
            >
              <X className="size-4" /> Reject
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        {/* main column */}
        <Card className="p-5">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="prep">Interview Prep</TabsTrigger>
              <TabsTrigger value="notes">
                Notes{candidate.notes.length > 0 && ` (${candidate.notes.length})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-4">
              <div>
                <p className="mb-1 text-sm font-semibold">AI rationale</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {candidate.rationale}. Ranked against {job?.applicants ?? 0} applicants for{" "}
                  {job?.title ?? "this role"} using skill, experience, and culture signals.
                </p>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map(s => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Experience</p>
                  <p className="font-medium">{candidate.years} years</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium">{blind ? "Hidden" : candidate.location}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Source</p>
                  <p className="font-medium">{candidate.source}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Applied</p>
                  <p className="font-medium">{candidate.appliedAgo}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="experience" className="space-y-4 pt-4">
              <div className="rounded-xl border border-border bg-secondary/30 p-4">
                <p className="text-sm font-medium">{candidate.title}</p>
                <p className="text-xs text-muted-foreground">
                  {candidate.years} years · {blind ? "Company hidden (blind hiring)" : candidate.location}
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  <li>Primary stack: {candidate.skills.join(", ")}</li>
                  <li>Verified {candidate.skills[0]} skill score: {candidate.match}%</li>
                  <li>References available on request</li>
                </ul>
              </div>
              {blind && (
                <p className="text-xs text-muted-foreground">
                  Blind hiring mode is on — employer names and identifying details are hidden
                  during initial review.
                </p>
              )}
            </TabsContent>

            <TabsContent value="prep" className="space-y-3 pt-4">
              <p className="text-sm text-muted-foreground">
                AI-generated questions based on this candidate's profile and the{" "}
                {job?.title ?? "role"} requirements.
              </p>
              <ul className="space-y-2">
                {mockInterviewPrep.map((q, i) => (
                  <li
                    key={i}
                    className="flex gap-3 rounded-lg border border-border bg-secondary/30 p-3 text-sm"
                  >
                    <span className="font-mono text-xs text-muted-foreground">Q{i + 1}.</span>
                    {q}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success("Interview invite sent", { description: `To ${candidate.name}` })}
              >
                <CalendarPlus className="size-4" /> Schedule interview
              </Button>
            </TabsContent>

            <TabsContent value="notes" className="space-y-3 pt-4">
              <Textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add a note..."
                rows={3}
              />
              <Button
                size="sm"
                disabled={!note.trim()}
                onClick={() => {
                  addCandidateNote(candidate.id, note.trim())
                  setNote("")
                  toast.success("Note added")
                }}
              >
                Add note
              </Button>
              <ul className="space-y-2 pt-2">
                {candidate.notes.map(n => (
                  <li
                    key={n.id}
                    className="rounded-lg border border-border bg-secondary/30 p-3"
                  >
                    <p className="text-sm">{n.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{n.ago}</p>
                  </li>
                ))}
                {candidate.notes.length === 0 && (
                  <li className="text-sm text-muted-foreground">No notes yet.</li>
                )}
              </ul>
            </TabsContent>
          </Tabs>
        </Card>

        {/* right rail */}
        <div className="space-y-4">
          <Card className="p-5 text-center">
            <p className="mb-3 text-sm font-semibold">AI Match</p>
            <MatchScoreRing score={candidate.match} size={96} className="mx-auto" />
            <div className="mt-4 space-y-2.5 text-left">
              {breakdown.map(b => (
                <div key={b.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">{b.label}</span>
                    <span className="font-mono">{b.value}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        b.value >= 80 ? "bg-success" : b.value >= 50 ? "bg-primary" : "bg-warning"
                      )}
                      style={{ width: `${b.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-3 p-5">
            <p className="text-sm font-semibold">Assigned To</p>
            <Select
              value={candidate.assignedTo ?? "none"}
              onValueChange={v => assignCandidate(candidate.id, v === "none" ? undefined : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Assign team member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {state.team
                  .filter(t => !t.pending)
                  .map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} — {t.role}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </Card>

          <Card className="space-y-3 p-5">
            <p className="text-sm font-semibold">Actions</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              disabled={invited}
              onClick={() => {
                inviteCandidate(candidate.id)
                toast.success(`Invited ${candidate.name}`)
              }}
            >
              <Send className="size-4" /> {invited ? "Already invited" : "Invite to apply"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => navigate("/employer/messages")}
            >
              Message candidate
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
