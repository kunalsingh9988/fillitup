import { useState } from "react"
import { Download, Eye, FileText, Link2, Play, Plus, Sheet, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useMentor } from "@/lib/mentor-store"
import type { MentorResource } from "@/lib/mentor-types"
import { Seo } from "@/components/seo"
import { EmptyState } from "@/components/empty-state"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const KIND_ICON: Record<MentorResource["kind"], typeof Play> = {
  video: Play,
  pdf: FileText,
  template: Sheet,
  link: Link2,
}

export default function MentorResources() {
  const { state, addResource, removeResource } = useMentor()
  const [cat, setCat] = useState("All")
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    title: "",
    kind: "video" as MentorResource["kind"],
    category: "",
    meta: "",
  })

  const categories = ["All", ...new Set(state.resources.map(r => r.category))]
  const filtered = state.resources.filter(r => cat === "All" || r.category === cat)

  return (
    <div className="space-y-5">
      <Seo title="Resources" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Resources</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Videos, guides, and templates shared with mentees.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Add resource
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs transition-colors",
              cat === c
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border text-muted-foreground"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resources"
          description="Add your first video, guide, or template."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(r => {
            const Icon = KIND_ICON[r.kind]
            return (
              <Card key={r.id} className="overflow-hidden">
                <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-primary/25 via-secondary to-accent/20">
                  <Icon className="size-9 text-foreground/70" />
                  <Badge variant="secondary" className="absolute left-3 top-3 capitalize">{r.kind}</Badge>
                  <button
                    className="absolute right-3 top-3 rounded-md bg-background/60 p-1.5 hover:bg-background"
                    onClick={() => { removeResource(r.id); toast.success("Resource removed") }}
                    aria-label={`Remove ${r.title}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold">{r.title}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {r.category} · {r.meta}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="size-3" /> {r.views}</span>
                    <span className="flex items-center gap-1"><Download className="size-3" /> {r.downloads}</span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add resource</DialogTitle>
            <DialogDescription>Shared with all active mentees.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select
                  value={form.kind}
                  onValueChange={v => setForm(f => ({ ...f, kind: v as MentorResource["kind"] }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["video", "pdf", "template", "link"] as const).map(t => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Career" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Meta (e.g. 12:30 or 1.2 MB)</Label>
              <Input value={form.meta} onChange={e => setForm(f => ({ ...f, meta: e.target.value }))} />
            </div>
            <Button
              className="w-full"
              disabled={!form.title.trim()}
              onClick={() => {
                addResource({
                  title: form.title.trim(),
                  kind: form.kind,
                  category: form.category.trim() || "General",
                  meta: form.meta.trim() || "—",
                })
                setOpen(false)
                setForm({ title: "", kind: "video", category: "", meta: "" })
                toast.success("Resource added")
              }}
            >
              Add resource
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
