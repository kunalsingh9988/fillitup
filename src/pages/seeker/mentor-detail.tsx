import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Check, Clock, FileText, Play, Star, Users } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useSeeker } from "@/lib/seeker-store"
import { Seo } from "@/components/seo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function MentorDetail() {
  const { id } = useParams()
  const { state, subscribePlan } = useSeeker()
  const m = state.mentors.find(x => x.id === id)

  if (!m) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">Mentor not found.</p>
        <Button className="mt-4" asChild>
          <Link to="/app/mentorship">Back to mentors</Link>
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      <Seo title={m.name} />
      <Button variant="ghost" size="sm" asChild>
        <Link to="/app/mentorship"><ArrowLeft className="size-4" /> Back</Link>
      </Button>

      {/* header */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex size-16 items-center justify-center rounded-full bg-primary/15 font-display text-xl font-bold text-primary">
            {m.initials}
          </span>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold">{m.name}</h1>
            <p className="text-sm text-muted-foreground">{m.role} at {m.company}</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Star className="size-4 fill-warning text-warning" /> {m.rating}</span>
            <span className="flex items-center gap-1"><Users className="size-4" /> {m.mentees} mentees</span>
            <span className="flex items-center gap-1"><Clock className="size-4" /> {m.responseTime}</span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {m.expertise.map(e => <Badge key={e} variant="secondary">{e}</Badge>)}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* left */}
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="mb-2 font-display text-base font-semibold">About</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{m.about}</p>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 font-display text-base font-semibold">Sample Videos</h2>
            <ul className="space-y-2">
              {m.videos.map(v => (
                <li key={v.title} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Play className="size-4" />
                  </span>
                  <span className="flex-1 text-sm font-medium">{v.title}</span>
                  <span className="font-mono text-xs text-muted-foreground">{v.duration}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 font-display text-base font-semibold">Resources</h2>
            <ul className="space-y-2">
              {m.resources.map(r => (
                <li key={r.title} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <FileText className="size-4 text-primary" />
                  <span className="flex-1 text-sm">{r.title}</span>
                  <Badge variant="secondary" className="text-[10px]">{r.kind}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* right: plans + reviews */}
        <div className="space-y-4">
          <div>
            <h2 className="mb-3 font-display text-base font-semibold">Mentorship Plans</h2>
            <div className="space-y-3">
              {m.plans.map(pl => {
                const subscribed = state.subscribedPlans.includes(pl.id)
                return (
                  <Card
                    key={pl.id}
                    className={cn("p-5", pl.recommended && "border-primary/40 bg-primary/5")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="font-display text-base font-semibold">{pl.name}</p>
                        {pl.recommended && (
                          <Badge className="bg-primary/15 text-[10px] text-primary hover:bg-primary/15">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="font-mono text-xl font-bold">
                        ${pl.price}<span className="text-xs font-normal text-muted-foreground">/mo</span>
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{pl.blurb}</p>
                    <ul className="mt-3 space-y-1.5">
                      {pl.features.map(f => (
                        <li key={f} className="flex gap-2 text-xs text-muted-foreground">
                          <Check className="size-3.5 shrink-0 text-success" /> {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="mt-4 w-full"
                      variant={subscribed ? "outline" : "default"}
                      disabled={subscribed}
                      onClick={() => {
                        subscribePlan(pl.id)
                        toast.success(`Subscribed to ${m.name} — ${pl.name}`, {
                          description: "This is a demo subscription. No payment was made.",
                        })
                      }}
                    >
                      {subscribed ? "Subscribed" : "Get Started"}
                    </Button>
                  </Card>
                )
              })}
            </div>
          </div>

          <Card className="p-5">
            <h2 className="mb-3 font-display text-base font-semibold">Reviews</h2>
            <ul className="space-y-4">
              {m.reviews.map(r => (
                <li key={r.name} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-[10px] font-bold">
                      {r.name.split(" ").map(w => w[0]).join("")}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold">{r.name} <span className="font-normal text-muted-foreground">· {r.role}</span></p>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-warning">
                      <Star className="size-3 fill-warning" /> {r.rating}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{r.ago}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
