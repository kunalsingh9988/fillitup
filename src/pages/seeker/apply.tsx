import { useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { ArrowLeft, ArrowRight, CircleCheck, FileText, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"
import { useSeeker } from "@/lib/seeker-store"
import { Seo } from "@/components/seo"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ApplyFlow() {
  const { jobId } = useParams()
  const { state, applyToJob } = useSeeker()
  const navigate = useNavigate()
  const job = state.jobs.find(j => j.id === jobId)
  const p = state.profile
  const resume = state.resumes.find(r => r.primary) ?? state.resumes[0]

  const [step, setStep] = useState(0)
  const [coverLetter, setCoverLetter] = useState(
    `I'm excited to apply for the ${job?.title ?? "role"} at ${job?.company ?? "your company"}. My experience with ${p.skills.slice(0, 3).join(", ")} aligns well with your team's needs.`
  )
  const [availability, setAvailability] = useState(p.availability)
  const [relocate, setRelocate] = useState<string>("")
  const [notes, setNotes] = useState("")

  if (!job) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">Job not found.</p>
        <Button className="mt-4" asChild>
          <Link to="/app/jobs?tab=search">Back to search</Link>
        </Button>
      </Card>
    )
  }

  const steps = ["Review", "Final details", "Done"]

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Seo title={`Apply — ${job.title}`} />

      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/app/jobs?tab=search">
            <ArrowLeft className="size-4" /> Back to jobs
          </Link>
        </Button>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-xl bg-secondary font-display text-base font-bold">
            {job.logoInitials}
          </span>
          <div>
            <h1 className="font-display text-xl font-bold">{job.title}</h1>
            <p className="text-sm text-muted-foreground">
              {job.company} · {job.location}
            </p>
          </div>
        </div>
        {/* stepper */}
        <div className="mt-5 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                  i < step
                    ? "border-success bg-success/15 text-success"
                    : i === step
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-muted-foreground"
                )}
              >
                {i + 1}
              </span>
              <span
                className={cn(
                  "text-xs",
                  i === step ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {s}
              </span>
              {i < steps.length - 1 && <span className="h-px flex-1 bg-border" />}
            </div>
          ))}
        </div>
      </div>

      {step === 0 && (
        <Card className="space-y-5 p-6">
          <h2 className="font-display text-lg font-semibold">Review & submit</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={p.name} readOnly />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={p.email} readOnly />
            </div>
            <div className="space-y-1.5">
              <Label>Availability</Label>
              <Input value={availability} onChange={e => setAvailability(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Resume</Label>
              <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
                <FileText className="size-4 text-primary" />
                <span className="flex-1 truncate text-sm">{resume?.name ?? "No resume"}</span>
                <span className="rounded-sm bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  {resume?.enhancedFor === job.company ? "Enhanced" : "Primary"}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Cover Letter</Label>
            <Textarea rows={5} value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
          </div>
          <p className="text-xs text-muted-foreground">
            By proceeding, you agree to our Terms of Service and Privacy Policy. Your data will be
            shared with {job.company}.
          </p>
          <div className="flex justify-between">
            <Button variant="ghost" asChild>
              <Link to="/app/jobs?tab=search">Back</Link>
            </Button>
            <Button onClick={() => setStep(1)}>
              Continue <ArrowRight className="size-4" />
            </Button>
          </div>
        </Card>
      )}

      {step === 1 && (
        <Card className="space-y-5 p-6">
          <div>
            <h2 className="font-display text-lg font-semibold">Final details</h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-primary">
              <Sparkles className="size-3.5" /> AI pre-filled this for you
            </p>
          </div>
          <div className="rounded-lg border border-border bg-secondary/40 p-3 text-sm">
            {p.name} · {p.email}
            <br />
            <span className="text-muted-foreground">{p.phone}</span>
          </div>
          <div className="space-y-1.5">
            <Label>
              Cover Letter{" "}
              <span className="ml-1 rounded-sm bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                AI POWERED
              </span>
            </Label>
            <Textarea rows={5} value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Availability</Label>
            <Input value={availability} onChange={e => setAvailability(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Are you willing to relocate for this role?</Label>
            <div className="flex gap-2">
              {["Yes", "No", "Open to discuss"].map(o => (
                <button
                  key={o}
                  onClick={() => setRelocate(o)}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-sm transition-colors",
                    relocate === o
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Anything else you'd like us to know? (optional)</Label>
            <Input
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. visa status, preferred team, etc."
            />
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button
              onClick={() => {
                applyToJob(job.id)
                setStep(2)
              }}
            >
              Submit application
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-success/15">
            <CircleCheck className="size-8 text-success" />
          </span>
          <h2 className="font-display text-2xl font-bold">Application submitted</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Your application for {job.title} at {job.company} was sent. Track its progress in your
            Job Tracker.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/app/jobs?tab=tracker")}>Open Job Tracker</Button>
            <Button variant="outline" onClick={() => navigate("/app/jobs?tab=search")}>
              Keep browsing
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
