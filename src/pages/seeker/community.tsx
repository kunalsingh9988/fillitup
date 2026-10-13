import { useState } from "react"
import { Heart, MessageSquare, Send, Users } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useSeeker } from "@/lib/seeker-store"
import { Seo } from "@/components/seo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const TAGS = ["Career", "Interview Prep", "Resume", "Salary", "Job Hunt", "Wins"]

export default function Community() {
  const { state, addPost, toggleLike } = useSeeker()
  const [tag, setTag] = useState<string>("All")
  const [compose, setCompose] = useState(false)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [postTag, setPostTag] = useState(TAGS[0])

  const posts = state.posts.filter(p => tag === "All" || p.tag === tag)

  return (
    <div className="space-y-5">
      <Seo title="Community" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Community</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Wins, advice, and prep notes from fellow job seekers
          </p>
        </div>
        <Button onClick={() => setCompose(v => !v)}>
          <Send className="size-4" /> New post
        </Button>
      </div>

      {compose && (
        <Card className="space-y-3 p-5">
          <div className="flex flex-wrap gap-2">
            {TAGS.map(t => (
              <button
                key={t}
                onClick={() => setPostTag(t)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  postTag === t
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Post title"
          />
          <Textarea
            rows={4}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Share your experience, tips, or questions…"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCompose(false)}>Cancel</Button>
            <Button
              disabled={!title.trim() || !body.trim()}
              onClick={() => {
                addPost({
                  author: state.profile.name,
                  initials: state.profile.initials,
                  role: state.profile.title,
                  ago: "just now",
                  tag: postTag,
                  title: title.trim(),
                  body: body.trim(),
                })
                setCompose(false)
                setTitle("")
                setBody("")
                toast.success("Posted to community")
              }}
            >
              Post
            </Button>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {["All", ...TAGS].map(t => (
          <button
            key={t}
            onClick={() => setTag(t)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              tag === t
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {posts.map(p => (
          <Card key={p.id} className="p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-xs font-bold">
                {p.initials}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {p.author} <span className="font-normal text-muted-foreground">· {p.role}</span>
                </p>
                <p className="text-[11px] text-muted-foreground">{p.ago} ago</p>
              </div>
              <Badge variant="secondary" className="text-[10px]">{p.tag}</Badge>
            </div>
            <h2 className="mt-3 font-display text-base font-semibold">{p.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={() => toggleLike(p.id)}
                className={cn(
                  "flex items-center gap-1.5 text-sm transition-colors",
                  p.liked ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Heart className={cn("size-4", p.liked && "fill-primary")} /> {p.likes}
              </button>
              <button
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                onClick={() => toast.info("Comments coming soon")}
              >
                <MessageSquare className="size-4" /> {p.comments}
              </button>
            </div>
          </Card>
        ))}
        {posts.length === 0 && (
          <Card className="flex flex-col items-center gap-2 p-10 text-center">
            <Users className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No posts in this topic yet.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
