import { useState } from "react"
import { X } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useMentor } from "@/lib/mentor-store"
import { Seo } from "@/components/seo"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const SLOTS = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"]

export default function MentorAvailability() {
  const { state, toggleSlot, setAvailability, addBlockedDate, removeBlockedDate } = useMentor()
  const av = state.availability
  const [newDate, setNewDate] = useState("")
  const slotCount = Object.values(av.weekly).reduce((a, d) => a + d.length, 0)

  return (
    <div className="space-y-5">
      <Seo title="Availability" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Availability</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {slotCount} weekly slots · {state.profile.timezone}
          </p>
        </div>
        <Button onClick={() => toast.success("Availability saved")}>Save changes</Button>
      </div>

      {/* session settings */}
      <Card className="p-5">
        <h2 className="mb-3 font-display text-base font-semibold">Session settings</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Session length</Label>
            <Select
              value={String(av.sessionLength)}
              onValueChange={v => setAvailability({ sessionLength: Number(v) })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[30, 45, 60, 90].map(m => (
                  <SelectItem key={m} value={String(m)}>{m} minutes</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Buffer between sessions</Label>
            <Select
              value={String(av.buffer)}
              onValueChange={v => setAvailability({ buffer: Number(v) })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[0, 10, 15, 30].map(m => (
                  <SelectItem key={m} value={String(m)}>{m} minutes</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* weekly grid */}
      <Card className="p-5">
        <h2 className="mb-3 font-display text-base font-semibold">Weekly hours</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-separate border-spacing-1">
            <thead>
              <tr>
                {DAYS.map(d => (
                  <th key={d} className="pb-2 text-center text-xs font-semibold text-muted-foreground">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {DAYS.map(day => (
                  <td key={day} className="align-top">
                    <div className="space-y-1">
                      {SLOTS.map(slot => {
                        const on = (av.weekly[day] ?? []).includes(slot)
                        return (
                          <button
                            key={slot}
                            onClick={() => toggleSlot(day, slot)}
                            className={cn(
                              "block w-full rounded-md border px-2 py-1.5 font-mono text-[11px] transition-colors",
                              on
                                ? "border-primary/50 bg-primary/15 text-primary"
                                : "border-border/60 text-muted-foreground/60 hover:border-border hover:text-muted-foreground"
                            )}
                          >
                            {slot}
                          </button>
                        )
                      })}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* blocked dates */}
      <Card className="p-5">
        <h2 className="mb-3 font-display text-base font-semibold">Blocked dates</h2>
        <div className="flex gap-2">
          <Input
            type="date"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
            className="w-44"
          />
          <Button
            variant="outline"
            disabled={!newDate}
            onClick={() => { addBlockedDate(newDate); setNewDate(""); toast.success("Date blocked") }}
          >
            Add
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {av.blockedDates.map(d => (
            <span
              key={d}
              className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs"
            >
              {d}
              <button onClick={() => removeBlockedDate(d)} aria-label={`Unblock ${d}`}>
                <X className="size-3 text-muted-foreground hover:text-foreground" />
              </button>
            </span>
          ))}
          {av.blockedDates.length === 0 && (
            <p className="text-xs text-muted-foreground">No blocked dates.</p>
          )}
        </div>
      </Card>
    </div>
  )
}
