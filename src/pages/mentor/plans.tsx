import { useState } from "react"
import { Check, IndianRupee, Package, Pause, Play, Plus, X } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useMentor } from "@/lib/mentor-store"
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

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`

export default function MentorPlans() {
  const { state, addPlan, updatePlan, togglePlanPaused } = useMentor()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: "", price: "", blurb: "", features: "" })

  return (
    <div className="space-y-5">
      <Seo title="My Plans" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">My Plans</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create offerings mentees can subscribe to. Max 3 plans.
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          disabled={state.plans.length >= 3}
        >
          <Plus className="size-4" /> New plan
        </Button>
      </div>

      {state.plans.length >= 3 && (
        <p className="text-xs text-warning">You've reached the 3-plan limit.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {state.plans.map(p => (
          <Card key={p.id} className={cn("p-5", p.paused && "opacity-70")}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold">{p.name}</h2>
              <Badge
                className={cn(
                  "text-[10px]",
                  p.paused
                    ? "bg-warning/15 text-warning hover:bg-warning/15"
                    : "bg-success/15 text-success hover:bg-success/15"
                )}
              >
                {p.paused ? "Paused" : "Published"}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{p.blurb}</p>
            <p className="mt-3 font-mono text-2xl font-bold">
              {inr(p.price)}<span className="text-xs font-normal text-muted-foreground">/mo</span>
            </p>
            <ul className="mt-3 space-y-1.5">
              {p.features.map(f => (
                <li key={f} className="flex gap-2 text-xs text-muted-foreground">
                  <Check className="size-3.5 shrink-0 text-success" /> {f}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              {p.menteeCount} mentees · {inr(p.menteeCount * p.price)}/mo MRR
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  togglePlanPaused(p.id)
                  toast.success(p.paused ? "Plan resumed" : "Plan paused")
                }}
              >
                {p.paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
                {p.paused ? "Resume" : "Pause"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  updatePlan(p.id, { published: false })
                  toast.success("Plan unpublished (hidden from profile)")
                }}
              >
                <X className="size-3.5" /> Unpublish
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {state.plans.length === 0 && (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <Package className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No plans yet — create your first offering.</p>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create plan</DialogTitle>
            <DialogDescription>A subscription mentees can buy on your public profile.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Plan name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Growth" />
            </div>
            <div className="space-y-1.5">
              <Label>Price (₹/mo)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="number"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="16000"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Short description</Label>
              <Input value={form.blurb} onChange={e => setForm(f => ({ ...f, blurb: e.target.value }))} placeholder="Who this plan is for" />
            </div>
            <div className="space-y-1.5">
              <Label>Features (one per line)</Label>
              <Textarea
                rows={4}
                value={form.features}
                onChange={e => setForm(f => ({ ...f, features: e.target.value }))}
                placeholder={"3 calls/month (45 min)\nResume review\nPriority chat"}
              />
            </div>
            <Button
              className="w-full"
              disabled={!form.name.trim() || !form.price}
              onClick={() => {
                addPlan({
                  name: form.name.trim(),
                  price: Number(form.price),
                  blurb: form.blurb.trim(),
                  features: form.features.split("\n").map(x => x.trim()).filter(Boolean),
                  published: true,
                })
                setOpen(false)
                setForm({ name: "", price: "", blurb: "", features: "" })
                toast.success("Plan published", { description: "It's live on your public profile." })
              }}
            >
              Publish plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
