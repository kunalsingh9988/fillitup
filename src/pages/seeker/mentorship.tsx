import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Clock, Search, Star, Users } from "lucide-react"

import { useSeeker } from "@/lib/seeker-store"
import { Seo } from "@/components/seo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function Mentorship() {
  const { state } = useSeeker()
  const navigate = useNavigate()
  const [query, setQuery] = useState("")

  const mentors = state.mentors.filter(
    m =>
      !query ||
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.expertise.some(e => e.toLowerCase().includes(query.toLowerCase()))
  )

  const subscribed = state.mentors.filter(m =>
    m.plans.some(p => state.subscribedPlans.includes(p.id))
  )

  return (
    <div className="space-y-5">
      <Seo title="Mentorship" />
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Mentorship</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          1:1 guidance from senior engineers at top companies
        </p>
      </div>

      {subscribed.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-3 font-display text-base font-semibold">Your mentors</h2>
          <div className="space-y-2">
            {subscribed.map(m => {
              const plan = m.plans.find(p => state.subscribedPlans.includes(p.id))
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                    {m.initials}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{m.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {plan?.name} plan · renews monthly
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/app/mentorship/${m.id}`)}>
                    View
                  </Button>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search mentors or skills…"
          className="pl-9"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {mentors.map(m => (
          <Card
            key={m.id}
            className="cursor-pointer p-5 transition-colors hover:border-primary/40"
            onClick={() => navigate(`/app/mentorship/${m.id}`)}
          >
            <div className="flex items-start gap-3">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 font-display text-sm font-bold text-primary">
                {m.initials}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{m.name}</p>
                <p className="text-xs text-muted-foreground">
                  {m.role} at {m.company}
                </p>
                <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="size-3 fill-warning text-warning" /> {m.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="size-3" /> {m.mentees} mentees
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" /> {m.responseTime}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {m.expertise.slice(0, 3).map(e => (
                <Badge key={e} variant="secondary" className="text-[10px]">{e}</Badge>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-mono text-sm">
                ${m.plans[0]?.price}<span className="text-xs text-muted-foreground">/mo</span>
              </span>
              <Button size="sm" variant="outline">View profile</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
