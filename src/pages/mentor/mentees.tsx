import { useState } from "react"
import { Link } from "react-router-dom"
import { MessageSquare, Search, Users } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMentor } from "@/lib/mentor-store"
import { Seo } from "@/components/seo"
import { EmptyState } from "@/components/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`

export default function MentorMentees() {
  const { state } = useMentor()
  const [q, setQ] = useState("")
  const [plan, setPlan] = useState("all")

  const planNames = [...new Set(state.mentees.map(m => m.plan))]
  const planPrice = (name: string) => state.plans.find(p => p.name === name)?.price ?? 0
  const mrr = state.mentees.reduce((a, m) => a + planPrice(m.plan), 0)
  const filtered = state.mentees
    .filter(m => plan === "all" || m.plan === plan)
    .filter(m => [m.name, m.role, m.plan].join(" ").toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="space-y-5">
      <Seo title="Mentees" />
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Mentees</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {state.mentees.length} active · {inr(mrr)}/mo MRR
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search mentees" className="pl-9" />
        </div>
        {["all", ...planNames].map(p => (
          <button
            key={p}
            onClick={() => setPlan(p)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs transition-colors",
              plan === p
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border text-muted-foreground"
            )}
          >
            {p === "all" ? "All plans" : p}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No mentees found" description="Try a different search or filter." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Mentee</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Since</th>
                  <th className="px-4 py-3 font-medium">Renews</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-[10px] font-bold">
                          {m.initials}
                        </span>
                        <div>
                          <p className="font-medium">{m.name}</p>
                          <p className="text-xs text-muted-foreground">{m.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{m.plan}</Badge>
                      <span className="ml-2 font-mono text-xs text-muted-foreground">
                        {inr(planPrice(m.plan))}/mo
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{m.since}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{m.renews}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="ghost" asChild>
                          <Link to="/mentor/messages"><MessageSquare className="size-3.5" /> Message</Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link to="/mentor/sessions">Session</Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
