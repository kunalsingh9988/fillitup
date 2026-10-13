import { useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ArrowLeft, Check, Plus, Sparkles, Trash2, X } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useEmployer } from "@/lib/employer-store"
import { companyProfile } from "@/lib/employer-data"
import type {
  EmployerJob,
  EmploymentType,
  ExperienceLevel,
  ScreeningQuestion,
  WorkplaceType,
} from "@/lib/employer-types"
import { Seo } from "@/components/seo"
import { Stepper } from "@/components/stepper"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const STEPS = ["Job basics", "Description", "Skills & screening", "Compensation", "Preview"]

const EMPLOYMENT_TYPES: EmploymentType[] = ["Full-time", "Part-time", "Contract", "Internship"]
const EXPERIENCE_LEVELS: ExperienceLevel[] = ["Entry", "Mid", "Senior", "Lead", "Executive"]
const WORKPLACES: WorkplaceType[] = ["Remote", "Hybrid", "On-site"]
const EDUCATION = ["Any", "Bachelor's", "Master's", "PhD"] as const

interface FormState {
  title: string
  department: string
  location: string
  workplace: WorkplaceType
  type: EmploymentType
  level: ExperienceLevel
  description: string
  responsibilities: string[]
  qualifications: string[]
  skills: string[]
  education: (typeof EDUCATION)[number]
  screening: ScreeningQuestion[]
  salaryMin: string
  salaryMax: string
}

const emptyForm: FormState = {
  title: "",
  department: "",
  location: "Bangalore, India",
  workplace: "Hybrid",
  type: "Full-time",
  level: "Mid",
  description: "",
  responsibilities: [],
  qualifications: [],
  skills: [],
  education: "Any",
  screening: [],
  salaryMin: "",
  salaryMax: "",
}

/* small labelled chip group used across steps */
function ChipGroup({
  options,
  value,
  onChange,
}: {
  options: readonly string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            value === o
              ? "border-primary bg-primary/15 text-primary"
              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
          )}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

/* tag input — chips + inline text input */
function TagInput({
  values,
  onAdd,
  onRemove,
  placeholder,
}: {
  values: string[]
  onAdd: (v: string) => void
  onRemove: (i: number) => void
  placeholder: string
}) {
  const [text, setText] = useState("")
  const commit = () => {
    const v = text.trim()
    if (v) {
      onAdd(v)
      setText("")
    }
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {values.map((v, i) => (
          <span
            key={`${v}-${i}`}
            className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs"
          >
            {v}
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label={`Remove ${v}`}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault()
              commit()
            }
          }}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button type="button" variant="outline" size="sm" onClick={commit} disabled={!text.trim()}>
          <Plus className="size-4" /> Add
        </Button>
      </div>
    </div>
  )
}

function AiButton({ onClick, busy, label }: { onClick: () => void; busy: boolean; label: string }) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick} disabled={busy}>
      <Sparkles className="size-3.5 text-primary" />
      {busy ? "Generating…" : label}
    </Button>
  )
}

export default function PostJobWizard() {
  const { state, addJob, updateJob, setStepDone } = useEmployer()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const draftId = params.get("draft")

  const editing = useMemo(
    () => state.jobs.find(j => j.id === draftId),
    [state.jobs, draftId]
  )

  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(() =>
    editing
      ? {
          title: editing.title,
          department: editing.department,
          location: editing.location,
          workplace: editing.workplace,
          type: editing.type,
          level: editing.level,
          description: editing.description,
          responsibilities: editing.responsibilities,
          qualifications: editing.qualifications,
          skills: editing.skills,
          education: editing.education,
          screening: editing.screening,
          salaryMin: editing.salaryMin ? String(editing.salaryMin) : "",
          salaryMax: editing.salaryMax ? String(editing.salaryMax) : "",
        }
      : emptyForm
  )
  const [done, setDone] = useState(false)
  const [exitOpen, setExitOpen] = useState(false)
  const [aiBusy, setAiBusy] = useState<string | null>(null)
  const [newQ, setNewQ] = useState("")

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const simulateAi = (key: string, apply: () => void) => {
    setAiBusy(key)
    window.setTimeout(() => {
      apply()
      setAiBusy(null)
      toast.success("Generated by AI", { description: "Review and edit before publishing." })
    }, 900)
  }

  const aiDescription = () =>
    simulateAi("desc", () =>
      setForm(f => ({
        ...f,
        description: `We are looking for a talented ${f.title || "professional"} to join our ${f.department || "team"}. This is a ${f.level}-level ${f.type} position based in ${f.location} (${f.workplace.toLowerCase()}).\n\nAs a ${f.title || "team member"}, you will work on cutting-edge technology, collaborate with cross-functional teams, and contribute to products used by millions of users worldwide.`,
        responsibilities: [
          "Design, develop, and maintain high-quality software solutions",
          "Collaborate with product managers and designers to define feature requirements",
          "Write clean, testable, and well-documented code",
          "Participate in code reviews and mentor junior developers",
          "Contribute to architectural decisions and technical roadmap",
        ],
        qualifications: [
          `${f.level === "Entry" ? "0-2" : f.level === "Mid" ? "3-5" : "5+"} years of relevant experience`,
          "Strong communication and collaboration skills",
          "Bachelor's degree in a related field or equivalent experience",
        ],
      }))
    )

  const aiSkills = () =>
    simulateAi("skills", () =>
      setForm(f => ({
        ...f,
        skills: Array.from(
          new Set([...f.skills, "JavaScript", "Python", "SQL", "Git", "Communication"])
        ),
        screening: [
          { question: `How many years of experience do you have as a ${f.title || "developer"}?`, mustHave: true },
          { question: "Describe a challenging project you've worked on.", mustHave: false },
          { question: `Are you comfortable working in a ${f.workplace.toLowerCase()} environment?`, mustHave: true },
        ],
      }))
    )

  const aiBenchmark = () =>
    simulateAi("bench", () =>
      setForm(f => ({ ...f, salaryMin: "15", salaryMax: "30" }))
    )

  const next = () => {
    if (step === 0 && !form.title.trim()) {
      toast.error("Job title is required")
      return
    }
    setStep(s => Math.min(STEPS.length - 1, s + 1))
  }
  const back = () => (step === 0 ? setExitOpen(true) : setStep(s => s - 1))

  const buildJob = (status: "active" | "draft"): EmployerJob => ({
    id: editing?.id ?? `ej-${Date.now().toString(36)}`,
    title: form.title.trim() || "Untitled Job",
    department: form.department.trim() || "General",
    location: form.location,
    workplace: form.workplace,
    type: form.type,
    level: form.level,
    status,
    applicants: editing?.applicants ?? 0,
    views: editing?.views ?? 0,
    shortlisted: editing?.shortlisted ?? 0,
    hired: editing?.hired ?? 0,
    salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
    salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
    currency: "₹L",
    description: form.description,
    responsibilities: form.responsibilities,
    qualifications: form.qualifications,
    skills: form.skills,
    screening: form.screening,
    education: form.education,
  })

  const postJob = () => {
    const job = buildJob("active")
    if (editing) updateJob(editing.id, job)
    else addJob(job)
    setStepDone("os2", true)
    setDone(true)
  }

  const saveDraft = () => {
    const job = buildJob("draft")
    if (editing) updateJob(editing.id, job)
    else addJob(job)
    toast.success("Saved as draft")
    navigate("/employer/jobs")
  }

  /* -------- success state -------- */
  if (done) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Seo title="Job posted" />
        <Card className="w-full max-w-md p-10 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
            <Check className="size-7" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold">Job posted!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            "{form.title}" is now live. Our AI is ranking applicants as they arrive.
          </p>
          <Button className="mt-6" onClick={() => navigate("/employer/jobs")}>
            View My Jobs
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Seo title="Post a new job" />

      {/* header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={back} aria-label="Back">
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="font-display text-xl font-bold sm:text-2xl">Post a new job</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setExitOpen(true)} aria-label="Close">
          <X className="size-5" />
        </Button>
      </div>

      <Stepper steps={STEPS} current={step} className="mb-8" />

      {/* -------- step 1: basics -------- */}
      {step === 0 && (
        <Card className="space-y-5 p-6">
          <h2 className="font-display text-lg font-semibold">Job basics</h2>
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dept">Department</Label>
              <Input
                id="dept"
                value={form.department}
                onChange={e => set("department", e.target.value)}
                placeholder="e.g. Engineering"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loc">Location</Label>
              <Input
                id="loc"
                value={form.location}
                onChange={e => set("location", e.target.value)}
                placeholder="e.g. Bangalore, India"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Workplace</Label>
            <ChipGroup
              options={WORKPLACES}
              value={form.workplace}
              onChange={v => set("workplace", v as WorkplaceType)}
            />
          </div>
          <div className="space-y-2">
            <Label>Employment Type</Label>
            <ChipGroup
              options={EMPLOYMENT_TYPES}
              value={form.type}
              onChange={v => set("type", v as EmploymentType)}
            />
          </div>
          <div className="space-y-2">
            <Label>Experience Level</Label>
            <ChipGroup
              options={EXPERIENCE_LEVELS}
              value={form.level}
              onChange={v => set("level", v as ExperienceLevel)}
            />
          </div>
        </Card>
      )}

      {/* -------- step 2: description -------- */}
      {step === 1 && (
        <Card className="space-y-5 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Job description</h2>
            <AiButton onClick={aiDescription} busy={aiBusy === "desc"} label="AI Generate" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="Describe the role, the team, and what success looks like…"
              rows={6}
            />
          </div>
          <div className="space-y-2">
            <Label>Responsibilities</Label>
            <TagInput
              values={form.responsibilities}
              onAdd={v => set("responsibilities", [...form.responsibilities, v])}
              onRemove={i =>
                set("responsibilities", form.responsibilities.filter((_, x) => x !== i))
              }
              placeholder="Add a responsibility"
            />
          </div>
          <div className="space-y-2">
            <Label>Qualifications</Label>
            <TagInput
              values={form.qualifications}
              onAdd={v => set("qualifications", [...form.qualifications, v])}
              onRemove={i =>
                set("qualifications", form.qualifications.filter((_, x) => x !== i))
              }
              placeholder="Add a qualification"
            />
          </div>
        </Card>
      )}

      {/* -------- step 3: skills & screening -------- */}
      {step === 2 && (
        <Card className="space-y-5 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Skills & screening</h2>
            <AiButton onClick={aiSkills} busy={aiBusy === "skills"} label="AI Suggest" />
          </div>
          <div className="space-y-2">
            <Label>Required skills</Label>
            <TagInput
              values={form.skills}
              onAdd={v => set("skills", [...form.skills, v])}
              onRemove={i => set("skills", form.skills.filter((_, x) => x !== i))}
              placeholder="Add a skill"
            />
          </div>
          <div className="space-y-2">
            <Label>Minimum education</Label>
            <ChipGroup
              options={EDUCATION}
              value={form.education}
              onChange={v => set("education", v as FormState["education"])}
            />
          </div>
          <div className="space-y-3">
            <Label>
              Screening questions{" "}
              <span className="text-xs text-muted-foreground">
                ({form.screening.length} questions,{" "}
                {form.screening.filter(q => q.mustHave).length} must-have)
              </span>
            </Label>
            <ul className="space-y-2">
              {form.screening.map((q, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-3"
                >
                  <span className="mt-0.5 font-mono text-xs text-muted-foreground">
                    Q{i + 1}.
                  </span>
                  <p className="flex-1 text-sm">{q.question}</p>
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "screening",
                        form.screening.map((x, xi) =>
                          xi === i ? { ...x, mustHave: !x.mustHave } : x
                        )
                      )
                    }
                    className={cn(
                      "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                      q.mustHave
                        ? "border-primary/40 bg-primary/15 text-primary"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    {q.mustHave ? "must-have" : "optional"}
                  </button>
                  <button
                    type="button"
                    aria-label="Remove question"
                    onClick={() =>
                      set("screening", form.screening.filter((_, x) => x !== i))
                    }
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Input
                value={newQ}
                onChange={e => setNewQ(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && newQ.trim()) {
                    set("screening", [...form.screening, { question: newQ.trim(), mustHave: false }])
                    setNewQ("")
                  }
                }}
                placeholder="Add a screening question"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!newQ.trim()}
                onClick={() => {
                  set("screening", [...form.screening, { question: newQ.trim(), mustHave: false }])
                  setNewQ("")
                }}
              >
                <Plus className="size-4" /> Add
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* -------- step 4: compensation -------- */}
      {step === 3 && (
        <Card className="space-y-5 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Compensation & benefits</h2>
            <AiButton onClick={aiBenchmark} busy={aiBusy === "bench"} label="AI Benchmark" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="min">Min salary (₹L / year)</Label>
              <Input
                id="min"
                type="number"
                inputMode="numeric"
                value={form.salaryMin}
                onChange={e => set("salaryMin", e.target.value)}
                placeholder="e.g. 15"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max">Max salary (₹L / year)</Label>
              <Input
                id="max"
                type="number"
                inputMode="numeric"
                value={form.salaryMax}
                onChange={e => set("salaryMax", e.target.value)}
                placeholder="e.g. 30"
              />
            </div>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Benchmarked against {companyProfile.industry} roles in {form.location}. Jobs with
            visible salary get ~40% more qualified applicants.
          </p>
        </Card>
      )}

      {/* -------- step 5: preview -------- */}
      {step === 4 && (
        <div className="space-y-5">
          <h2 className="font-display text-lg font-semibold">Preview & publish</h2>
          <Card className="space-y-5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-bold">
                  {form.title || "Untitled Job"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {companyProfile.name} · {form.department || "General"} · {form.location}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{form.type}</Badge>
                <Badge variant="secondary">{form.level}</Badge>
                <Badge variant="secondary">{form.workplace}</Badge>
              </div>
            </div>
            {(form.salaryMin || form.salaryMax) && (
              <p className="font-mono text-lg font-semibold text-primary">
                ₹{form.salaryMin || "?"}L – ₹{form.salaryMax || "?"}L
              </p>
            )}
            {form.description && (
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {form.description}
              </p>
            )}
            {form.responsibilities.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold">Responsibilities</p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {form.responsibilities.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            {form.skills.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {form.skills.map(s => (
                    <Badge key={s} variant="outline">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {form.screening.length > 0 && (
              <div className="border-t border-border pt-4">
                <p className="mb-2 text-sm font-semibold">
                  Screening ({form.screening.length} questions,{" "}
                  {form.screening.filter(q => q.mustHave).length} must-have)
                </p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {form.screening.map((q, i) => (
                    <li key={i}>
                      <span className="font-mono text-xs">Q{i + 1}.</span> {q.question}
                      {q.mustHave && (
                        <Badge variant="outline" className="ml-2 text-[10px]">
                          must-have
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
          <p className="text-center text-xs text-muted-foreground">
            By posting, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      )}

      {/* footer */}
      <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
        <Button variant="outline" onClick={back}>
          <ArrowLeft className="size-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={saveDraft}>
            Save Draft
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next}>Next</Button>
          ) : (
            <Button onClick={postJob}>Post Job</Button>
          )}
        </div>
      </div>

      {/* exit dialog */}
      <Dialog open={exitOpen} onOpenChange={setExitOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Save your progress?</DialogTitle>
            <DialogDescription>
              You have unsaved changes on this job post.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              className="w-full"
              onClick={() => {
                saveDraft()
              }}
            >
              Save as draft
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/employer/jobs")}
            >
              Discard
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setExitOpen(false)}>
              Continue editing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
