import { useEffect, useRef, useState } from "react"
import { MessageSquare, Search, Send } from "lucide-react"

import { cn } from "@/lib/utils"
import { useSeeker } from "@/lib/seeker-store"
import { Seo } from "@/components/seo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SeekerMessages() {
  const { state, sendMessage, markConversationRead } = useSeeker()
  const [query, setQuery] = useState("")
  const [activeId, setActiveId] = useState<string | null>(state.conversations[0]?.id ?? null)
  const [draft, setDraft] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  const active = state.conversations.find(c => c.id === activeId) ?? null
  const list = state.conversations.filter(c =>
    `${c.subject} ${c.preview}`.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" })
  }, [active?.messages.length, activeId])

  const open = (id: string) => {
    setActiveId(id)
    markConversationRead(id)
  }

  const send = () => {
    const text = draft.trim()
    if (!text || !active) return
    sendMessage(active.id, text)
    setDraft("")
  }

  const initials = (s: string) =>
    s.split("·")[0].trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div className="space-y-5">
      <Seo title="Messages" />
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Conversations with recruiters and mentors
        </p>
      </div>

      <div className="flex h-[calc(100vh-15rem)] min-h-96 overflow-hidden rounded-2xl border border-border bg-card">
        {/* list */}
        <div
          className={cn(
            "w-full flex-col border-r border-border sm:flex sm:w-72 sm:shrink-0",
            active && "hidden sm:flex"
          )}
        >
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search…"
                className="pl-9"
              />
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto">
            {list.map(c => (
              <li key={c.id}>
                <button
                  onClick={() => open(c.id)}
                  className={cn(
                    "block w-full border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-secondary/50",
                    activeId === c.id && "bg-secondary/60"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-bold">
                      {initials(c.subject)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium">{c.subject}</p>
                        <span className="shrink-0 text-[10px] text-muted-foreground">{c.ago}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs text-muted-foreground">{c.preview}</p>
                        {c.unread > 0 && (
                          <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                            {c.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            ))}
            {list.length === 0 && (
              <li className="p-6 text-center text-sm text-muted-foreground">No conversations found.</li>
            )}
          </ul>
        </div>

        {/* chat */}
        {active ? (
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Button variant="ghost" size="sm" className="px-2 sm:hidden" onClick={() => setActiveId(null)}>
                Back
              </Button>
              <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                {initials(active.subject)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{active.subject}</p>
                <p className="text-xs text-success">Online</p>
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {active.messages.map(m => (
                <div key={m.id} className={cn("flex flex-col", m.from === "us" ? "items-end" : "items-start")}>
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      m.from === "us"
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md bg-secondary text-foreground"
                    )}
                  >
                    {m.text}
                  </div>
                  <span className="mt-1 text-[10px] text-muted-foreground">{m.ago}</span>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="flex items-center gap-2 border-t border-border p-3">
              <Input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send()}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button size="icon" onClick={send} disabled={!draft.trim()} aria-label="Send">
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="hidden flex-1 flex-col items-center justify-center gap-2 sm:flex">
            <MessageSquare className="size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Select a conversation</p>
            <Badge variant="secondary" className="font-mono text-[10px]">
              {state.conversations.reduce((n, c) => n + c.unread, 0)} unread
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
}
