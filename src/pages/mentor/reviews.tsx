import { useState } from "react"
import { Star } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useMentor } from "@/lib/mentor-store"
import { Seo } from "@/components/seo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

function Stars({ n, size = "size-4" }: { n: number; size?: string }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={cn(size, i <= n ? "fill-warning text-warning" : "text-muted-foreground/30")}
        />
      ))}
    </span>
  )
}

export default function MentorReviews() {
  const { state, replyReview } = useMentor()
  const [filter, setFilter] = useState<"all" | "unreplied">("all")
  const [replying, setReplying] = useState<string | null>(null)
  const [draft, setDraft] = useState("")

  const reviews = state.reviews.filter(r => filter === "all" || !r.reply)
  const avg = state.reviews.reduce((a, r) => a + r.rating, 0) / (state.reviews.length || 1)
  const dist = [5, 4, 3, 2, 1].map(n => ({
    n,
    count: state.reviews.filter(r => r.rating === n).length,
  }))

  return (
    <div className="space-y-5">
      <Seo title="Reviews" />
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          What mentees say about your sessions.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6 text-center">
          <p className="font-mono text-4xl font-bold">{avg.toFixed(1)}</p>
          <Stars n={Math.round(avg)} />
          <p className="mt-1 text-xs text-muted-foreground">{state.reviews.length} reviews</p>
          <div className="mt-4 space-y-1.5">
            {dist.map(d => (
              <div key={d.n} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-3">{d.n}★</span>
                <div className="h-1.5 flex-1 rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-warning"
                    style={{ width: `${(d.count / (state.reviews.length || 1)) * 100}%` }}
                  />
                </div>
                <span className="w-4">{d.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-3">
          <div className="flex gap-2">
            {(["all", "unreplied"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs capitalize",
                  filter === f
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                )}
              >
                {f === "all" ? `All (${state.reviews.length})` : "Needs reply"}
              </button>
            ))}
          </div>

          {reviews.map(r => (
            <Card key={r.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-[10px] font-bold">
                    {r.initials}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{r.author} <span className="font-normal text-muted-foreground">· {r.role}</span></p>
                    <p className="text-[11px] text-muted-foreground">{r.ago}</p>
                  </div>
                </div>
                <Stars n={r.rating} size="size-3.5" />
              </div>
              <p className="mt-2.5 text-sm text-muted-foreground">{r.text}</p>

              {r.reply ? (
                <div className="mt-3 rounded-lg bg-secondary/40 p-3">
                  <Badge variant="secondary" className="mb-1 text-[10px]">Your reply</Badge>
                  <p className="text-xs text-muted-foreground">{r.reply}</p>
                </div>
              ) : replying === r.id ? (
                <div className="mt-3 space-y-2">
                  <Textarea
                    rows={3}
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    placeholder="Write a reply…"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={!draft.trim()}
                      onClick={() => {
                        replyReview(r.id, draft.trim())
                        setReplying(null)
                        setDraft("")
                        toast.success("Reply posted")
                      }}
                    >
                      Post reply
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setReplying(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() => { setReplying(r.id); setDraft("") }}
                >
                  Reply
                </Button>
              )}
            </Card>
          ))}

          {reviews.length === 0 && (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              Nothing to show — all reviews have replies.
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
