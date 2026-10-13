import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, ChevronRight, Mic, Sparkles, Timer } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useSeeker } from "@/lib/seeker-store"
import { prepCategories } from "@/lib/seeker-data"
import { Seo } from "@/components/seo"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"

const QUESTION_BANK: Record<string, string[]> = {
  "Tell me about yourself": [
    "Walk me through your background in 90 seconds.",
    "What's the project you're most proud of and why?",
    "Where do you want to grow in the next 2 years?",
  ],
  default: [
    "Describe a difficult problem you solved recently.",
    "How do you handle disagreement with a teammate?",
    "What would your last manager say is your biggest strength?",
  ],
}

const FEEDBACK = [
  "Strong structure — you framed the situation before the action.",
  "Add a concrete metric to quantify the outcome.",
  "Slightly long answer — aim for under 2 minutes per response.",
  "Good confidence; reduce filler words like 'um' and 'like'.",
]

export default function InterviewPrep() {
  const { state, addPrepSession, setStepDone } = useSeeker()
  const [session, setSession] = useState<{ topic: string; category: string } | null>(null)
  const [qIndex, setQIndex] = useState(0)
  const [answer, setAnswer] = useState("")
  const [answers, setAnswers] = useState<string[]>([])
  const [done, setDone] = useState<number | null>(null)

  const questions = session ? QUESTION_BANK[session.topic] ?? QUESTION_BANK.default : []

  const finish = (all: string[]) => {
    const score = 60 + Math.min(35, all.reduce((a, x) => a + Math.min(12, Math.floor(x.length / 30)), 0))
    setDone(score)
    addPrepSession({
      topic: session!.topic,
      category: session!.category,
      duration: "~15 min",
      date: "Today",
      score,
      feedback: FEEDBACK.slice(0, 3),
    })
    setStepDone("sc4", true)
    toast.success("Session scored", { description: `AI score: ${score}` })
  }

  /* ── in-session view ── */
  if (session && done === null) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <Seo title="Interview Prep Session" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{session.category}</p>
            <h1 className="font-display text-xl font-bold">{session.topic}</h1>
          </div>
          <Badge variant="secondary" className="gap-1.5">
            <Timer className="size-3.5" /> Question {qIndex + 1}/{questions.length}
          </Badge>
        </div>
        <Progress value={((qIndex + 1) / questions.length) * 100} className="h-1.5" />
        <Card className="space-y-4 p-6">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Mic className="size-4" />
            </span>
            <p className="pt-1.5 font-display text-lg font-semibold">{questions[qIndex]}</p>
          </div>
          <Textarea
            rows={6}
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Type your answer — in production this would be voice/video with live AI feedback…"
          />
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setSession(null)}>End session</Button>
            <Button
              disabled={answer.trim().length < 10}
              onClick={() => {
                const all = [...answers, answer]
                if (qIndex + 1 >= questions.length) finish(all)
                else {
                  setAnswers(all)
                  setAnswer("")
                  setQIndex(i => i + 1)
                }
              }}
            >
              {qIndex + 1 >= questions.length ? "Finish & score" : "Next question"}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  /* ── result view ── */
  if (session && done !== null) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <Seo title="Session Results" />
        <Card className="flex flex-col items-center gap-4 p-8 text-center">
          <div
            className={cn(
              "flex size-20 items-center justify-center rounded-full border-4 font-mono text-2xl font-bold",
              done >= 80 ? "border-success text-success" : done >= 60 ? "border-primary text-primary" : "border-warning text-warning"
            )}
          >
            {done}
          </div>
          <h2 className="font-display text-2xl font-bold">
            {done >= 80 ? "Great session" : done >= 60 ? "Solid — keep practicing" : "Needs work"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {session.topic} · {session.category} · saved to your history
          </p>
        </Card>
        <Card className="p-5">
          <h3 className="mb-3 font-display text-sm font-semibold">AI Feedback</h3>
          <ul className="space-y-2">
            {FEEDBACK.slice(0, 3).map(f => (
              <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" /> {f}
              </li>
            ))}
          </ul>
        </Card>
        <div className="flex justify-center gap-2">
          <Button onClick={() => { setSession(null); setDone(null); setQIndex(0); setAnswers([]) }}>
            Practice again
          </Button>
          <Button variant="outline" asChild>
            <Link to="/app">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  /* ── hub view ── */
  return (
    <div className="space-y-5">
      <Seo title="AI Interview Prep" />
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">AI Interview Prep</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI simulates real interviews, scores your answers, and shows exactly how to improve
        </p>
      </div>

      {/* quick practice */}
      <Card className="flex flex-wrap items-center justify-between gap-3 border-primary/20 bg-primary/5 p-5">
        <div>
          <h2 className="font-display text-base font-semibold">Quick Practice</h2>
          <p className="text-sm text-muted-foreground">
            {state.profile.title} · 3 questions · ~15 min
          </p>
        </div>
        <Button onClick={() => setSession({ topic: "Tell me about yourself", category: "Behavioral" })}>
          <Mic className="size-4" /> Start Session
        </Button>
      </Card>

      {/* categories */}
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Practice by Category</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {prepCategories.map(c => (
            <Card key={c.id} className="p-5">
              <h3 className="font-display text-sm font-semibold">{c.name}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{c.topics.length} topics</p>
              <ul className="mt-3 space-y-1">
                {c.topics.map(t => (
                  <li key={t}>
                    <button
                      onClick={() => setSession({ topic: t, category: c.name })}
                      className="group flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      {t}
                      <ChevronRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>

      {/* recent sessions */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent Sessions</h2>
          <span className="text-xs text-muted-foreground">{state.prepSessions.length} sessions</span>
        </div>
        <div className="space-y-2">
          {state.prepSessions.map(s => (
            <Card key={s.id} className="flex items-center gap-4 p-4">
              <span
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-full border-2 font-mono text-sm font-bold",
                  s.score >= 80 ? "border-success/50 text-success" : "border-primary/50 text-primary"
                )}
              >
                {s.score}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{s.topic}</p>
                <p className="text-xs text-muted-foreground">
                  {s.category} · {s.duration} · {s.date}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  toast.info(s.topic, { description: s.feedback[0] ?? "No feedback recorded." })
                }
              >
                Feedback
              </Button>
            </Card>
          ))}
        </div>
      </div>

      <Button variant="ghost" size="sm" asChild>
        <Link to="/app/ai"><ArrowLeft className="size-4" /> Back to AI Hub</Link>
      </Button>
    </div>
  )
}
