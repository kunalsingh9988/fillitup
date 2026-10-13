import { useState } from "react"
import { ArrowLeft, Award, BadgeCheck, CircleCheck, Clock, RotateCcw, XCircle } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useSeeker } from "@/lib/seeker-store"
import type { SkillAssessment } from "@/lib/seeker-types"
import { Seo } from "@/components/seo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type Phase = "list" | "rules" | "quiz" | "result"

export default function SkillVerification() {
  const { state, setAssessmentStatus, setStepDone } = useSeeker()
  const [phase, setPhase] = useState<Phase>("list")
  const [current, setCurrent] = useState<SkillAssessment | null>(null)
  const [qIndex, setQIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null)

  const startQuiz = () => {
    setPhase("quiz")
    setQIndex(0)
    setCorrect(0)
    setPicked(null)
    setAssessmentStatus(current!.id, "in_progress")
  }

  const answer = (i: number) => {
    if (picked !== null || !current) return
    setPicked(i)
    const right = i === current.quiz[qIndex].answer
    const newCorrect = correct + (right ? 1 : 0)
    setTimeout(() => {
      if (qIndex + 1 >= current.quiz.length) {
        const score = Math.round((newCorrect / current.quiz.length) * 100)
        const passed = score >= current.passPct
        setResult({ score, passed })
        setAssessmentStatus(current.id, passed ? "passed" : "failed", score)
        if (passed) {
          setStepDone("sc3", true)
          toast.success(`Badge earned: ${current.skill}`, { description: `Score ${score}%` })
        }
        setPhase("result")
      } else {
        setCorrect(newCorrect)
        setQIndex(qIndex + 1)
        setPicked(null)
      }
    }, 600)
  }

  /* ── list ── */
  if (phase === "list") {
    const earned = state.assessments.filter(a => a.status === "passed")
    return (
      <div className="space-y-5">
        <Seo title="Skill Verification" />
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Skill Verification
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pass AI-proctored assessments to earn verified badges employers trust
          </p>
        </div>

        {earned.length > 0 && (
          <Card className="p-5">
            <h2 className="mb-3 font-display text-base font-semibold">Earned Badges</h2>
            <div className="flex flex-wrap gap-3">
              {earned.map(a => (
                <div
                  key={a.id}
                  className="flex items-center gap-2.5 rounded-xl border border-success/30 bg-success/5 px-4 py-2.5"
                >
                  <BadgeCheck className="size-5 text-success" />
                  <div>
                    <p className="text-sm font-semibold">{a.skill}</p>
                    <p className="text-[11px] text-muted-foreground">Score {a.score}% · Verified</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {state.assessments.map(a => (
            <Card key={a.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-base font-semibold">{a.skill}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {a.questions} questions · ~{a.minutes} min · {a.passPct}% to pass
                  </p>
                </div>
                {a.status === "passed" ? (
                  <Badge className="bg-success/15 text-success hover:bg-success/15">Verified</Badge>
                ) : a.status === "failed" ? (
                  <Badge variant="destructive">Failed · {a.score}%</Badge>
                ) : (
                  <Badge variant="secondary">Not started</Badge>
                )}
              </div>
              <Button
                className="mt-4 w-full"
                variant={a.status === "passed" ? "outline" : "default"}
                onClick={() => { setCurrent(a); setPhase("rules") }}
              >
                {a.status === "passed" ? "Retake" : "Start assessment"}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!current) return null

  /* ── rules ── */
  if (phase === "rules") {
    return (
      <div className="mx-auto max-w-xl space-y-5">
        <Seo title={`${current.skill} Assessment`} />
        <Button variant="ghost" size="sm" onClick={() => setPhase("list")}>
          <ArrowLeft className="size-4" /> Back to Skills
        </Button>
        <Card className="p-6">
          <h1 className="font-display text-xl font-bold">{current.skill}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Quiz Assessment</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              { icon: BadgeCheck, label: `${current.questions} Questions`, sub: "Multiple choice" },
              { icon: Clock, label: `~${current.minutes} Minutes`, sub: "Countdown timer" },
              { icon: Award, label: `${current.passPct}% to Pass`, sub: "Earn a verified badge" },
              { icon: RotateCcw, label: "One Attempt", sub: "Cannot go back" },
            ].map(x => (
              <div key={x.label} className="rounded-lg border border-border p-3 text-center">
                <x.icon className="mx-auto size-5 text-primary" />
                <p className="mt-1.5 text-sm font-medium">{x.label}</p>
                <p className="text-[11px] text-muted-foreground">{x.sub}</p>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rules</p>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Timer starts as soon as you begin</li>
              <li>You cannot return to previous questions</li>
              <li>Select one answer per question</li>
              <li>Results and badge shown at the end</li>
            </ol>
          </div>
          <Button className="mt-5 w-full" onClick={startQuiz}>Start Quiz</Button>
        </Card>
      </div>
    )
  }

  /* ── quiz ── */
  if (phase === "quiz") {
    const q = current.quiz[qIndex]
    return (
      <div className="mx-auto max-w-xl space-y-5">
        <Seo title={`${current.skill} Quiz`} />
        <div className="flex items-center justify-between">
          <p className="font-display text-lg font-semibold">{current.skill}</p>
          <Badge variant="secondary" className="gap-1.5">
            <Clock className="size-3.5" /> {qIndex + 1}/{current.quiz.length}
          </Badge>
        </div>
        <Progress value={((qIndex + 1) / current.quiz.length) * 100} className="h-1.5" />
        <Card className="p-6">
          <p className="font-display text-lg font-semibold">{q.q}</p>
          <div className="mt-4 space-y-2">
            {q.options.map((o, i) => (
              <button
                key={o}
                onClick={() => answer(i)}
                disabled={picked !== null}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                  picked === null && "border-border hover:border-primary/50 hover:bg-secondary/50",
                  picked === i && i === q.answer && "border-success bg-success/10 text-success",
                  picked === i && i !== q.answer && "border-destructive bg-destructive/10 text-destructive",
                  picked !== null && picked !== i && i === q.answer && "border-success/50 text-success",
                  picked !== null && picked !== i && i !== q.answer && "border-border text-muted-foreground"
                )}
              >
                {o}
                {picked !== null && i === q.answer && <CircleCheck className="size-4" />}
                {picked === i && i !== q.answer && <XCircle className="size-4" />}
              </button>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  /* ── result ── */
  const passed = result?.passed ?? false
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Seo title="Assessment Result" />
      <Card className="flex flex-col items-center gap-4 p-10 text-center">
        <div
          className={cn(
            "flex size-20 items-center justify-center rounded-full border-4 font-mono text-2xl font-bold",
            passed ? "border-success text-success" : "border-destructive text-destructive"
          )}
        >
          {result?.score}
        </div>
        <h2 className="font-display text-2xl font-bold">
          {passed ? `${current.skill} — Verified` : "Not quite there"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {passed
            ? `You scored ${result?.score}% — the verified badge is now on your profile.`
            : `You scored ${result?.score}% (needed ${current.passPct}%). Review and retry.`}
        </p>
        {passed && (
          <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/5 px-4 py-2.5">
            <Award className="size-5 text-success" />
            <span className="text-sm font-semibold">{current.skill} badge earned</span>
          </div>
        )}
        <div className="flex gap-2">
          <Button onClick={() => setPhase("list")}>Back to skills</Button>
          {!passed && (
            <Button variant="outline" onClick={() => setPhase("rules")}>
              <RotateCcw className="size-4" /> Retry
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
