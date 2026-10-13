import { useState } from "react"
import { MessageSquare, Search, Send } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMentor } from "@/lib/mentor-store"
import { Seo } from "@/components/seo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function MentorMessages() {
  const { state, sendMessage, markConversationRead } = useMentor()
  const [q, setQ] = useState("")
  const [activeId, setActiveId] = useState(state.conversations[0]?.id ?? "")
  const [draft, setDraft] = useState("")

  const active = state.conversations.find(c => c.id === activeId)
  const filtered = state.conversations.filter(c =>
    c.subject.toLowerCase().includes(q.toLowerCase())
  )

  const open = (id: string) => {
    setActiveId(id)
    markConversationRead(id)
  }

  return (
    <div className="space-y-4">
      <Seo title="Messages" />
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">Conversations with your mentees.</p>
      </div>

      <Card className="grid h-[560px] overflow-hidden lg:grid-cols-[280px_1fr]">
        {/* list */}
        <div className="flex min-h-0 flex-col border-r border-border max-lg:hidden">
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search"
                className="pl-9"
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            {filtered.map(c => (
              <button
                key={c.id}
                onClick={() => open(c.id)}
                className={cn(
                  "flex w-full items-center gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors",
                  c.id === activeId ? "bg-secondary/60" : "hover:bg-secondary/30"
                )}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                  {c.subject.split(" ").map(x => x[0]).join("")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between">
                    <span className="truncate text-sm font-medium">{c.subject}</span>
                    <span className="text-[10px] text-muted-foreground">{c.ago}</span>
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{c.preview}</span>
                </span>
                {c.unread > 0 && (
                  <Badge className="size-5 justify-center rounded-full p-0 text-[10px]">{c.unread}</Badge>
                )}
              </button>
            ))}
          </ScrollArea>
        </div>

        {/* mobile picker */}
        <div className="border-b border-border p-3 lg:hidden">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {filtered.map(c => (
              <button
                key={c.id}
                onClick={() => open(c.id)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs",
                  c.id === activeId
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                )}
              >
                {c.subject.split(" ")[0]}
                {c.unread > 0 && ` (${c.unread})`}
              </button>
            ))}
          </div>
        </div>

        {/* thread */}
        {active ? (
          <div className="flex min-h-0 flex-col">
            <div className="flex items-center gap-3 border-b border-border px-5 py-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                {active.subject.split(" ").map(x => x[0]).join("")}
              </span>
              <div>
                <p className="text-sm font-semibold">{active.subject}</p>
                <p className="text-[11px] text-muted-foreground">
                  {state.mentees.find(m => m.id === active.candidateId)?.role ?? "Mentee"}
                </p>
              </div>
            </div>
            <ScrollArea className="flex-1 px-5 py-4">
              <div className="space-y-3">
                {active.messages.map(m => (
                  <div
                    key={m.id}
                    className={cn("flex", m.from === "us" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                        m.from === "us"
                          ? "rounded-br-sm bg-primary text-primary-foreground"
                          : "rounded-bl-sm bg-secondary"
                      )}
                    >
                      <p>{m.text}</p>
                      <p className={cn(
                        "mt-1 text-[10px]",
                        m.from === "us" ? "text-primary-foreground/60" : "text-muted-foreground"
                      )}>
                        {m.ago}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <form
              className="flex gap-2 border-t border-border p-4"
              onSubmit={e => {
                e.preventDefault()
                if (!draft.trim()) return
                sendMessage(active.id, draft.trim())
                setDraft("")
              }}
            >
              <Input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder={`Message ${active.subject.split(" ")[0]}…`}
              />
              <Button type="submit" size="icon" aria-label="Send">
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <MessageSquare className="size-8" />
            <p className="text-sm">Select a conversation</p>
          </div>
        )}
      </Card>
    </div>
  )
}
