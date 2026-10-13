import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { MessageSquare, Search, Send } from "lucide-react"

import { cn } from "@/lib/utils"
import { useEmployer } from "@/lib/employer-store"
import { Seo } from "@/components/seo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function EmployerMessages() {
  const { state, sendMessage, markConversationRead } = useEmployer()
  const [params] = useSearchParams()
  const [query, setQuery] = useState("")
  const [activeId, setActiveId] = useState<string | null>(
    params.get("c") ?? state.conversations[0]?.id ?? null
  )
  const [draft, setDraft] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  const blind = state.settings.blindHiring
  const active = state.conversations.find(c => c.id === activeId) ?? null
  const activeCandidate = state.candidates.find(c => c.id === active?.candidateId)

  const list = state.conversations.filter(c => {
    if (!query) return true
    const cand = state.candidates.find(x => x.id === c.candidateId)
    const hay = `${cand?.name ?? ""} ${c.subject} ${c.preview}`.toLowerCase()
    return hay.includes(query.toLowerCase())
  })

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

  return (
    <div className="space-y-5">
      <Seo title="Messages" />
      <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
        Messages
      </h1>

      <div className="flex h-[calc(100vh-13rem)] min-h-96 overflow-hidden rounded-2xl border border-border bg-card">
        {/* conversation list */}
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
                placeholder="Search candidates..."
                className="pl-9"
              />
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto">
            {list.map(c => {
              const cand = state.candidates.find(x => x.id === c.candidateId)
              return (
                <li key={c.id}>
                  <button
                    onClick={() => open(c.id)}
                    className={cn(
                      "block w-full border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-secondary/50",
                      activeId === c.id && "bg-secondary/60"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">
                        {blind && cand ? `Candidate #${cand.id.toUpperCase()}` : (cand?.name ?? "Candidate")}
                      </p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {c.ago}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{c.subject}</p>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-muted-foreground/80">
                        {c.preview}
                      </p>
                      {c.unread > 0 && (
                        <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              )
            })}
            {list.length === 0 && (
              <li className="p-6 text-center text-sm text-muted-foreground">
                No conversations found.
              </li>
            )}
          </ul>
        </div>

        {/* chat pane */}
        {active ? (
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Button
                variant="ghost"
                size="sm"
                className="px-2 sm:hidden"
                onClick={() => setActiveId(null)}
              >
                Back
              </Button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {blind && activeCandidate
                    ? `Candidate #${activeCandidate.id.toUpperCase()}`
                    : (activeCandidate?.name ?? "Candidate")}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {activeCandidate?.title} · Applied for{" "}
                  {state.jobs.find(j => j.id === activeCandidate?.appliedFor)?.title} ·{" "}
                  <span className="text-success">Online</span>
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {active.messages.map(m => (
                <div
                  key={m.id}
                  className={cn(
                    "flex flex-col",
                    m.from === "us" ? "items-end" : "items-start"
                  )}
                >
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
            <p className="text-sm text-muted-foreground">
              Select a conversation to start messaging
            </p>
            <Badge variant="secondary" className="font-mono text-[10px]">
              {state.conversations.reduce((n, c) => n + c.unread, 0)} unread
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
}
