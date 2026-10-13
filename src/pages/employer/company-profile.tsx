import { useState, type ReactNode } from "react"
import { Globe, Pencil, Plus, X } from "lucide-react"
import { toast } from "sonner"

import { useEmployer } from "@/lib/employer-store"
import type { CompanyProfile } from "@/lib/employer-types"
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
import { Textarea } from "@/components/ui/textarea"

function LinkedInIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41z" />
    </svg>
  )
}

function Section({
  title,
  onEdit,
  children,
}: {
  title: string
  onEdit: () => void
  children: ReactNode
}) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold">{title}</h2>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="size-3.5" /> Edit
        </Button>
      </div>
      {children}
    </Card>
  )
}

function ListEditor({
  values,
  onChange,
  placeholder,
}: {
  values: string[]
  onChange: (v: string[]) => void
  placeholder: string
}) {
  const [text, setText] = useState("")
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
              onClick={() => onChange(values.filter((_, x) => x !== i))}
              aria-label={`Remove ${v}`}
            >
              <X className="size-3 text-muted-foreground hover:text-foreground" />
            </button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && text.trim()) {
              onChange([...values, text.trim()])
              setText("")
            }
          }}
          placeholder={placeholder}
        />
        <Button
          variant="outline"
          size="sm"
          disabled={!text.trim()}
          onClick={() => {
            onChange([...values, text.trim()])
            setText("")
          }}
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  )
}

type EditKey =
  | "details"
  | "about"
  | "tech"
  | "benefits"
  | "values"
  | "locations"
  | null

export default function EmployerCompanyProfile() {
  const { state, updateCompany, setStepDone } = useEmployer()
  const company = state.company
  const [editing, setEditing] = useState<EditKey>(null)
  const [draft, setDraft] = useState<CompanyProfile>(company)

  const openEdit = (key: EditKey) => {
    setDraft(company)
    setEditing(key)
  }

  const save = (patch: Partial<CompanyProfile>) => {
    updateCompany(patch)
    setStepDone("os1", true)
    setEditing(null)
    toast.success("Company profile updated")
  }

  const field = (label: string, value: string) => (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  )

  return (
    <div className="space-y-5">
      <Seo title="Company Profile" />

      {/* header card */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/15 font-display text-xl font-bold text-primary">
            {company.initials}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-bold">{company.name}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {company.industry} · {company.location}
            </p>
            <p className="text-xs text-muted-foreground/80">
              {company.size} employees · {company.openRoles} open roles
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`https://${company.website}`} target="_blank" rel="noreferrer">
                <Globe className="size-4" /> Website
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`https://${company.linkedin}`} target="_blank" rel="noreferrer">
                <LinkedInIcon /> LinkedIn
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`https://x.com/${company.twitter.replace("@", "")}`} target="_blank" rel="noreferrer">
                <XIcon /> X / Twitter
              </a>
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* about */}
        <Section title="About" onEdit={() => openEdit("about")}>
          <p className="text-sm leading-relaxed text-muted-foreground">{company.about}</p>
        </Section>

        {/* company details */}
        <Section title="Company Details" onEdit={() => openEdit("details")}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {field("Founded", company.founded)}
            {field("Headquarters", company.headquarters)}
            {field("Industry", company.industry)}
            {field("Team Size", company.size)}
            {field("Funding", company.funding)}
            {field("Revenue", company.revenue)}
          </div>
        </Section>

        {/* tech stack */}
        <Section title="Tech Stack" onEdit={() => openEdit("tech")}>
          <div className="flex flex-wrap gap-2">
            {company.techStack.map(t => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
          </div>
        </Section>

        {/* benefits */}
        <Section title="Benefits & Perks" onEdit={() => openEdit("benefits")}>
          <div className="flex flex-wrap gap-2">
            {company.benefits.map(b => (
              <Badge key={b} variant="outline">
                {b}
              </Badge>
            ))}
          </div>
        </Section>

        {/* culture */}
        <Section title="Culture & Values" onEdit={() => openEdit("values")}>
          <div className="flex flex-wrap gap-2">
            {company.values.map(v => (
              <Badge key={v} variant="secondary" className="bg-primary/10 text-primary">
                {v}
              </Badge>
            ))}
          </div>
        </Section>

        {/* locations */}
        <Section title="Office Locations" onEdit={() => openEdit("locations")}>
          <div className="flex flex-wrap gap-2">
            {company.locations.map(l => (
              <Badge key={l.name} variant="outline" className="gap-1.5">
                {l.name}
                {l.hq && (
                  <span className="rounded-sm bg-primary/20 px-1 text-[9px] font-bold text-primary">
                    HQ
                  </span>
                )}
              </Badge>
            ))}
          </div>
        </Section>
      </div>

      {/* -------- edit dialogs -------- */}
      <Dialog open={editing === "about"} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit About</DialogTitle>
            <DialogDescription>Your public company description.</DialogDescription>
          </DialogHeader>
          <Textarea
            rows={6}
            value={draft.about}
            onChange={e => setDraft(d => ({ ...d, about: e.target.value }))}
          />
          <Button onClick={() => save({ about: draft.about })}>Save</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={editing === "details"} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Company Details</DialogTitle>
            <DialogDescription>Key facts shown to candidates.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ["founded", "Founded"],
                ["headquarters", "Headquarters"],
                ["industry", "Industry"],
                ["size", "Team Size"],
                ["funding", "Funding"],
                ["revenue", "Revenue"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-1.5">
                <Label>{label}</Label>
                <Input
                  value={draft[key]}
                  onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <Button
            onClick={() =>
              save({
                founded: draft.founded,
                headquarters: draft.headquarters,
                industry: draft.industry,
                size: draft.size,
                funding: draft.funding,
                revenue: draft.revenue,
              })
            }
          >
            Save
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={editing === "tech"} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Tech Stack</DialogTitle>
            <DialogDescription>Technologies your team works with.</DialogDescription>
          </DialogHeader>
          <ListEditor
            values={draft.techStack}
            onChange={v => setDraft(d => ({ ...d, techStack: v }))}
            placeholder="Add a technology"
          />
          <Button onClick={() => save({ techStack: draft.techStack })}>Save</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={editing === "benefits"} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Benefits & Perks</DialogTitle>
            <DialogDescription>What you offer employees.</DialogDescription>
          </DialogHeader>
          <ListEditor
            values={draft.benefits}
            onChange={v => setDraft(d => ({ ...d, benefits: v }))}
            placeholder="Add a benefit"
          />
          <Button onClick={() => save({ benefits: draft.benefits })}>Save</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={editing === "values"} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Culture & Values</DialogTitle>
            <DialogDescription>Your core company values.</DialogDescription>
          </DialogHeader>
          <ListEditor
            values={draft.values}
            onChange={v => setDraft(d => ({ ...d, values: v }))}
            placeholder="Add a value"
          />
          <Button onClick={() => save({ values: draft.values })}>Save</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={editing === "locations"} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Office Locations</DialogTitle>
            <DialogDescription>Where your team is based.</DialogDescription>
          </DialogHeader>
          <ListEditor
            values={draft.locations.map(l => l.name)}
            onChange={v =>
              setDraft(d => ({
                ...d,
                locations: v.map(name => ({ name, hq: name === "Bangalore" })),
              }))
            }
            placeholder="Add a location"
          />
          <Button
            onClick={() =>
              save({
                locations: draft.locations,
              })
            }
          >
            Save
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
