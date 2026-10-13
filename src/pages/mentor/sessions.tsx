import { useState } from "react"
import { CalendarClock, Plus, Video, X } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useMentor } from "@/lib/mentor-store"
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

export default function MentorSessions() {
  const { state, addSession, rescheduleSession, cancelSession } = useMentor()
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming")
  const [menteeFilter, setMenteeFilter] = useState("all")
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [resched, setResched] = useState<string | null>(null)
  const [form, setForm] = useState({ title: "", menteeId: "", date: "", time: "" })
  const [rs, setRs] = useState({ date: "", time: "" })

  const sessions = state.sessions
    .filter(s => s.status === tab)
    .filter(s => menteeFilter === "all" || s.menteeId === menteeFilter)
    .sort((a, b) => a.date.localeCompare(b.date))

  const menteeName = (id: string) => state.mentees.find(m => m.id === id)?.name ?? "—"

  return (
    <div className="space-y-5">
      <Seo title="Sessions" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Sessions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upcoming and past mentorship sessions.
          </p>
        </div>
        <Button onClick={() => setScheduleOpen(true)}>
          <Plus className="size-4" /> Schedule new
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["upcoming", "past"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-medium capitalize transition-colors",
              tab === t
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-border" />
        {["all", ...state.mentees.map(m => m.id)].map(id => (
          <button
            key={id}
            onClick={() => setMenteeFilter(id)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs transition-colors",
              menteeFilter === id
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border text-muted-foreground"
            )}
          >
            {id === "all" ? "All mentees" : menteeName(id).split(" ")[0]}
          </button>
        ))}
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title={`No ${tab} sessions`}
          description={tab === "upcoming" ? "Schedule a session with a mentee." : "Past sessions will appear here."}
        />
      ) : (
        <div className="space-y-2">
          {sessions.map(s => (
            <Card key={s.id} className="flex flex-wrap items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Video className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{s.title}</p>
                <p className="text-xs text-muted-foreground">
                  {menteeName(s.menteeId)} · {s.date} · {s.time}
                </p>
                {s.notes && <p className="mt-1 text-xs text-muted-foreground/80">Notes: {s.notes}</p>}
              </div>
              {s.status === "upcoming" ? (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setResched(s.id); setRs({ date: s.date, time: s.time }) }}>
                    Reschedule
                  </Button>
                  <Button size="sm" onClick={() => toast.success("Joining session (demo)")}>Join</Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Cancel session"
                    onClick={() => { cancelSession(s.id); toast.success("Session cancelled") }}
                  >
                    <X className="size-4 text-muted-foreground" />
                  </Button>
                </div>
              ) : (
                <Badge variant="secondary">Completed</Badge>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* schedule dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule new session</DialogTitle>
            <DialogDescription>Pick a mentee, title, and time.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. System design deep dive" />
            </div>
            <div className="space-y-1.5">
              <Label>Mentee</Label>
              <Select value={form.menteeId} onValueChange={v => setForm(f => ({ ...f, menteeId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select mentee" /></SelectTrigger>
                <SelectContent>
                  {state.mentees.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Time</Label>
                <Input value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} placeholder="10:00 AM" />
              </div>
            </div>
            <Button
              className="w-full"
              disabled={!form.title || !form.menteeId || !form.date || !form.time}
              onClick={() => {
                addSession({ title: form.title, menteeId: form.menteeId, date: form.date, time: form.time, status: "upcoming" })
                setScheduleOpen(false)
                setForm({ title: "", menteeId: "", date: "", time: "" })
                toast.success("Session scheduled", { description: "Mentee was notified." })
              }}
            >
              Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* reschedule dialog */}
      <Dialog open={!!resched} onOpenChange={o => !o && setResched(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reschedule session</DialogTitle>
            <DialogDescription>Pick a new date and time.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={rs.date} onChange={e => setRs(r => ({ ...r, date: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Input value={rs.time} onChange={e => setRs(r => ({ ...r, time: e.target.value }))} />
            </div>
          </div>
          <Button
            className="w-full"
            disabled={!rs.date || !rs.time}
            onClick={() => {
              rescheduleSession(resched!, rs.date, rs.time)
              setResched(null)
              toast.success("Session rescheduled")
            }}
          >
            Save
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
