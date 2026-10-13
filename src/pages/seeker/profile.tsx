import { useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import {
  Award,
  BadgeCheck,
  Briefcase,
  FileText,
  GraduationCap,
  Link2,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { useSeeker } from "@/lib/seeker-store"
import type { Certification, Education, Experience, Project } from "@/lib/seeker-types"
import { Seo } from "@/components/seo"
import { MatchScoreRing } from "@/components/match-score-ring"
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
import { Textarea } from "@/components/ui/textarea"

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

/* ── generic section wrapper ── */
function Section({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: typeof FileText
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold">
          <Icon className="size-4 text-primary" /> {title}
        </h2>
        {action}
      </div>
      {children}
    </Card>
  )
}

/* ── dialog-driven list editor ── */
type ListKind = "experience" | "education" | "projects" | "certifications"

interface EditorState {
  kind: ListKind | "about" | "basics" | "skills" | null
  id?: string
}

export default function SeekerProfile() {
  const {
    state,
    updateProfile,
    addExperience, updateExperience, removeExperience,
    addEducation, updateEducation, removeEducation,
    addProject, updateProject, removeProject,
    addCertification, updateCertification, removeCertification,
    addSkill, removeSkill,
    setStepDone,
  } = useSeeker()
  const p = state.profile
  const [edit, setEdit] = useState<EditorState>({ kind: null })
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [newSkill, setNewSkill] = useState("")

  const open = (kind: EditorState["kind"], item?: { id: string }) => {
    if (kind === "basics")
      setDraft({ name: p.name, title: p.title, location: p.location, availability: p.availability })
    else if (kind === "about") setDraft({ about: p.about })
    else if (kind === "experience") {
      const e = p.experience.find(x => x.id === item?.id)
      setDraft(e ? { role: e.role, company: e.company, period: e.period, description: e.description } : {})
    } else if (kind === "education") {
      const e = p.education.find(x => x.id === item?.id)
      setDraft(e ? { degree: e.degree, school: e.school, period: e.period } : {})
    } else if (kind === "projects") {
      const x = p.projects.find(y => y.id === item?.id)
      setDraft(x ? { name: x.name, description: x.description, link: x.link ?? "" } : {})
    } else if (kind === "certifications") {
      const c = p.certifications.find(x => x.id === item?.id)
      setDraft(c ? { name: c.name, issuer: c.issuer, year: c.year } : {})
    }
    setEdit({ kind, id: item?.id })
  }

  const close = () => setEdit({ kind: null })
  const d = (k: string) => draft[k] ?? ""
  const setD = (k: string, v: string) => setDraft(x => ({ ...x, [k]: v }))

  const saveList = (kind: ListKind) => {
    const done = () => {
      setStepDone("sc1", true)
      close()
      toast.success("Profile updated")
    }
    if (kind === "experience") {
      const item: Omit<Experience, "id"> = {
        role: d("role"), company: d("company"), period: d("period"),
        description: d("description"),
        initials: (d("company") || "??").slice(0, 2).toUpperCase(),
      }
      if (edit.id) updateExperience(edit.id, item); else addExperience(item)
    } else if (kind === "education") {
      const item: Omit<Education, "id"> = { degree: d("degree"), school: d("school"), period: d("period") }
      if (edit.id) updateEducation(edit.id, item); else addEducation(item)
    } else if (kind === "projects") {
      const item: Omit<Project, "id"> = { name: d("name"), description: d("description"), link: d("link") }
      if (edit.id) updateProject(edit.id, item); else addProject(item)
    } else {
      const item: Omit<Certification, "id"> = { name: d("name"), issuer: d("issuer"), year: d("year") }
      if (edit.id) updateCertification(edit.id, item); else addCertification(item)
    }
    done()
  }

  const suggestions = [
    !p.projects.length && { label: "Add a portfolio project", pts: 8 },
    p.certifications.length < 3 && { label: "Add certifications", pts: 5 },
    p.about.length < 120 && { label: "Complete your bio", pts: 4 },
  ].filter(Boolean) as { label: string; pts: number }[]

  return (
    <div className="space-y-5">
      <Seo title="Profile" />

      {/* header card */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex size-16 items-center justify-center rounded-full bg-primary/15 font-display text-xl font-bold text-primary">
            {p.initials}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-bold">{p.name}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {p.title} · {p.location}
            </p>
            <p className="text-xs text-muted-foreground/80">Joined {p.joined}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { icon: Link2, label: "Portfolio", href: p.portfolio },
              { icon: GithubIcon, label: "GitHub", href: p.github },
              { icon: Link2, label: "LinkedIn", href: p.linkedin },
            ].map(l => (
              <Button key={l.label} variant="outline" size="sm" asChild>
                <a href={l.href} target="_blank" rel="noreferrer">
                  <l.icon className="size-4" /> {l.label}
                </a>
              </Button>
            ))}
            <Button size="sm" onClick={() => open("basics")}>
              <Pencil className="size-3.5" /> Edit
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* left column */}
        <div className="space-y-4">
          {/* profile strength */}
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <MatchScoreRing score={p.profileStrength} size={76} strokeWidth={6} />
              <div>
                <h2 className="font-display text-base font-semibold">Profile Strength</h2>
                <p className="text-xs text-muted-foreground">AI-powered analysis</p>
                <p className="mt-1 font-mono text-lg font-semibold">
                  {p.profileStrength}<span className="text-sm text-muted-foreground">/100</span>
                </p>
              </div>
            </div>
            {suggestions.length > 0 && (
              <ul className="mt-4 space-y-2">
                {suggestions.map(s => (
                  <li key={s.label} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Sparkles className="size-3.5 text-warning" /> {s.label}
                    </span>
                    <span className="font-mono text-xs text-success">+{s.pts} pts</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* skills */}
          <Section
            icon={BadgeCheck}
            title="Skills"
            action={
              <Button variant="ghost" size="sm" onClick={() => open("skills")}>
                <Pencil className="size-3.5" /> Manage
              </Button>
            }
          >
            <div className="flex flex-wrap gap-2">
              {p.skills.map(s => (
                <Badge key={s} variant="secondary">{s}</Badge>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              AI suggests:{" "}
              {p.aiSuggestedSkills
                .filter(s => !p.skills.includes(s))
                .map(s => (
                  <button
                    key={s}
                    onClick={() => { addSkill(s); toast.success(`Added ${s}`) }}
                    className="mr-1 text-primary hover:underline"
                  >
                    {s}
                  </button>
                ))}
            </p>
          </Section>

          {/* resumes */}
          <Section
            icon={FileText}
            title="Resumes"
            action={
              <Button variant="ghost" size="sm" asChild>
                <Link to="/app/resumes">Manage</Link>
              </Button>
            }
          >
            <p className="text-sm text-muted-foreground">
              {state.resumes.length} resumes · {state.resumes.find(r => r.primary)?.name} is primary
            </p>
          </Section>

          {/* badges */}
          <Section icon={Award} title="Achievements">
            <div className="space-y-2.5">
              {p.badges.map(b => (
                <div key={b.id} className="flex items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-warning/15 text-warning">
                    <Award className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{b.title}</p>
                    <p className="text-xs text-muted-foreground">{b.description} · {b.earned}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* right column */}
        <div className="space-y-4 lg:col-span-2">
          {/* about */}
          <Section
            icon={FileText}
            title="About"
            action={
              <Button variant="ghost" size="sm" onClick={() => open("about")}>
                <Pencil className="size-3.5" /> Edit
              </Button>
            }
          >
            <p className="text-sm leading-relaxed text-muted-foreground">{p.about}</p>
          </Section>

          {/* experience */}
          <Section
            icon={Briefcase}
            title="Experience"
            action={
              <Button variant="ghost" size="sm" onClick={() => open("experience")}>
                <Plus className="size-4" /> Add
              </Button>
            }
          >
            <ul className="space-y-4">
              {p.experience.map(e => (
                <li key={e.id} className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-bold">
                    {e.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{e.role}</p>
                        <p className="text-xs text-muted-foreground">{e.company} · {e.period}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => open("experience", e)} aria-label="Edit">
                          <Pencil className="size-3.5 text-muted-foreground hover:text-foreground" />
                        </button>
                        <button
                          onClick={() => { removeExperience(e.id); toast.success("Removed") }}
                          aria-label="Delete"
                        >
                          <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          {/* projects */}
          <Section
            icon={FileText}
            title="Projects"
            action={
              <Button variant="ghost" size="sm" onClick={() => open("projects")}>
                <Plus className="size-4" /> Add
              </Button>
            }
          >
            <ul className="space-y-3">
              {p.projects.map(x => (
                <li key={x.id} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{x.name}</p>
                    <p className="text-xs text-muted-foreground">{x.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => open("projects", x)} aria-label="Edit">
                      <Pencil className="size-3.5 text-muted-foreground hover:text-foreground" />
                    </button>
                    <button onClick={() => { removeProject(x.id); toast.success("Removed") }} aria-label="Delete">
                      <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          {/* education */}
          <Section
            icon={GraduationCap}
            title="Education"
            action={
              <Button variant="ghost" size="sm" onClick={() => open("education")}>
                <Plus className="size-4" /> Add
              </Button>
            }
          >
            <ul className="space-y-3">
              {p.education.map(e => (
                <li key={e.id} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{e.degree}</p>
                    <p className="text-xs text-muted-foreground">{e.school} · {e.period}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => open("education", e)} aria-label="Edit">
                      <Pencil className="size-3.5 text-muted-foreground hover:text-foreground" />
                    </button>
                    <button onClick={() => { removeEducation(e.id); toast.success("Removed") }} aria-label="Delete">
                      <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          {/* certifications */}
          <Section
            icon={BadgeCheck}
            title="Certifications"
            action={
              <Button variant="ghost" size="sm" onClick={() => open("certifications")}>
                <Plus className="size-4" /> Add
              </Button>
            }
          >
            <ul className="space-y-3">
              {p.certifications.map(c => (
                <li key={c.id} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.issuer} · {c.year}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => open("certifications", c)} aria-label="Edit">
                      <Pencil className="size-3.5 text-muted-foreground hover:text-foreground" />
                    </button>
                    <button onClick={() => { removeCertification(c.id); toast.success("Removed") }} aria-label="Delete">
                      <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>

      {/* ══ dialogs ══ */}
      <Dialog open={edit.kind === "basics"} onOpenChange={o => !o && close()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit basic details</DialogTitle>
            <DialogDescription>Name, title, location, availability.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {(["name", "title", "location", "availability"] as const).map(k => (
              <div key={k} className="space-y-1.5">
                <Label className="capitalize">{k}</Label>
                <Input value={d(k)} onChange={e => setD(k, e.target.value)} />
              </div>
            ))}
            <Button
              className="w-full"
              onClick={() => {
                updateProfile({
                  name: d("name"), title: d("title"), location: d("location"),
                  availability: d("availability"),
                  initials: d("name").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || p.initials,
                })
                setStepDone("sc1", true)
                close()
                toast.success("Profile updated")
              }}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={edit.kind === "about"} onOpenChange={o => !o && close()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit About</DialogTitle>
            <DialogDescription>Your professional summary.</DialogDescription>
          </DialogHeader>
          <Textarea rows={6} value={d("about")} onChange={e => setD("about", e.target.value)} />
          <Button
            onClick={() => {
              updateProfile({ about: d("about") })
              setStepDone("sc1", true)
              close()
              toast.success("Profile updated")
            }}
          >
            Save
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={edit.kind === "skills"} onOpenChange={o => !o && close()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Skills</DialogTitle>
            <DialogDescription>Add or remove skills shown on your profile.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2">
            {p.skills.map(s => (
              <span key={s} className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs">
                {s}
                <button onClick={() => removeSkill(s)} aria-label={`Remove ${s}`}>
                  <X className="size-3 text-muted-foreground hover:text-foreground" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && newSkill.trim()) { addSkill(newSkill.trim()); setNewSkill("") }
              }}
              placeholder="Add a skill"
            />
            <Button
              variant="outline"
              size="sm"
              disabled={!newSkill.trim()}
              onClick={() => { addSkill(newSkill.trim()); setNewSkill("") }}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={edit.kind === "experience"} onOpenChange={o => !o && close()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{edit.id ? "Edit" : "Add"} Experience</DialogTitle>
            <DialogDescription>Role, company, period, and description.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Role</Label><Input value={d("role")} onChange={e => setD("role", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Company</Label><Input value={d("company")} onChange={e => setD("company", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Period</Label><Input value={d("period")} onChange={e => setD("period", e.target.value)} placeholder="2023 - Present" /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea rows={3} value={d("description")} onChange={e => setD("description", e.target.value)} /></div>
            <Button className="w-full" disabled={!d("role") || !d("company")} onClick={() => saveList("experience")}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={edit.kind === "education"} onOpenChange={o => !o && close()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{edit.id ? "Edit" : "Add"} Education</DialogTitle>
            <DialogDescription>Degree, school, and period.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Degree</Label><Input value={d("degree")} onChange={e => setD("degree", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>School</Label><Input value={d("school")} onChange={e => setD("school", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Period</Label><Input value={d("period")} onChange={e => setD("period", e.target.value)} placeholder="2015 - 2019" /></div>
            <Button className="w-full" disabled={!d("degree") || !d("school")} onClick={() => saveList("education")}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={edit.kind === "projects"} onOpenChange={o => !o && close()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{edit.id ? "Edit" : "Add"} Project</DialogTitle>
            <DialogDescription>Name, description, and link.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Name</Label><Input value={d("name")} onChange={e => setD("name", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea rows={3} value={d("description")} onChange={e => setD("description", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Link (optional)</Label><Input value={d("link")} onChange={e => setD("link", e.target.value)} /></div>
            <Button className="w-full" disabled={!d("name")} onClick={() => saveList("projects")}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={edit.kind === "certifications"} onOpenChange={o => !o && close()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{edit.id ? "Edit" : "Add"} Certification</DialogTitle>
            <DialogDescription>Name, issuer, and year.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Name</Label><Input value={d("name")} onChange={e => setD("name", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Issuer</Label><Input value={d("issuer")} onChange={e => setD("issuer", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Year</Label><Input value={d("year")} onChange={e => setD("year", e.target.value)} placeholder="2024" /></div>
            <Button className="w-full" disabled={!d("name")} onClick={() => saveList("certifications")}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
