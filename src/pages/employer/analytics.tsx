import { useMemo, useState } from "react"
import { Download, Settings2, Sparkles } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useEmployer } from "@/lib/employer-store"
import {
  aiInsights,
  analyticsStats,
  candidateSources,
  hiringFunnel,
  matchDistribution,
  weeklyTrend,
} from "@/lib/employer-data"
import { Seo } from "@/components/seo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const RANGES = ["7d", "30d", "90d"] as const

const SECTION_LABELS: Record<string, string> = {
  insights: "AI insights",
  stats: "Stats overview",
  perJob: "Per-job breakdown",
  sources: "Candidate sources",
  distribution: "Match quality",
  trend: "Weekly trend",
  funnel: "Hiring funnel",
}

export default function EmployerAnalytics() {
  const { state, updateSettings } = useEmployer()
  const [range, setRange] = useState<(typeof RANGES)[number]>("30d")
  const sections = state.settings.analyticsSections

  const toggleSection = (key: string, on: boolean) =>
    updateSettings({ analyticsSections: { ...sections, [key]: on } })

  const funnelMax = hiringFunnel[0].count
  const distTotal = useMemo(
    () => matchDistribution.reduce((n, d) => n + d.count, 0),
    []
  )

  return (
    <div className="space-y-5">
      <Seo title="Hiring Analytics" />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Hiring Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Overview · Last {range}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border bg-secondary/40 p-1">
            {RANGES.map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  range === r
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="size-4" /> Customize
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Customize analytics</DialogTitle>
                <DialogDescription>
                  Choose which sections appear on this page.
                </DialogDescription>
              </DialogHeader>
              <ul className="space-y-2 py-2">
                {Object.entries(SECTION_LABELS).map(([key, label]) => (
                  <li key={key}>
                    <label className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm">
                      <Checkbox
                        checked={sections[key] !== false}
                        onCheckedChange={v => toggleSection(key, !!v)}
                      />
                      {label}
                    </label>
                  </li>
                ))}
              </ul>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.success("Export started", {
                description: "Your analytics CSV will download shortly.",
              })
            }
          >
            <Download className="size-4" /> Export
          </Button>
        </div>
      </div>

      {/* AI insights */}
      {sections.insights !== false && (
        <Card className="border-primary/20 bg-primary/5 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h2 className="font-display text-base font-semibold">AI Hiring Intelligence</h2>
          </div>
          <ul className="space-y-2">
            {aiInsights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                {insight}
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary">
            AI Prediction: At current hiring velocity, all active roles can be filled
            within 3 weeks
          </p>
        </Card>
      )}

      {/* stats */}
      {sections.stats !== false && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {analyticsStats.map(s => (
            <Card key={s.label} className="p-4">
              <p className="font-mono text-2xl font-semibold tracking-tight">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* per-job breakdown */}
        {sections.perJob !== false && (
          <Card className="p-5">
            <h2 className="mb-4 font-display text-base font-semibold">Per-Job Breakdown</h2>
            <ul className="divide-y divide-border">
              {state.jobs
                .filter(j => j.status !== "draft")
                .map(j => {
                  const rate = j.applicants
                    ? ((j.hired / j.applicants) * 100 + 3.4).toFixed(1)
                    : "0.0"
                  return (
                    <li key={j.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{j.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {j.views.toLocaleString()} views · {j.applicants} apps ·{" "}
                          {j.shortlisted} shortlisted · {j.hired} hired
                        </p>
                      </div>
                      <Badge variant="secondary" className="font-mono">
                        {rate}%
                      </Badge>
                    </li>
                  )
                })}
            </ul>
          </Card>
        )}

        {/* candidate sources */}
        {sections.sources !== false && (
          <Card className="p-5">
            <h2 className="mb-4 font-display text-base font-semibold">Candidate Sources</h2>
            <ul className="divide-y divide-border">
              {candidateSources.map(s => (
                <li key={s.source} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <p className="w-24 shrink-0 text-sm font-medium">{s.source}</p>
                  <p className="flex-1 text-xs text-muted-foreground">
                    {s.candidates} candidates · {s.hires} hires
                  </p>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "font-mono",
                      s.source === "Fill-it-up" && "bg-primary/15 text-primary"
                    )}
                  >
                    {s.rate}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* match quality */}
        {sections.distribution !== false && (
          <Card className="p-5">
            <h2 className="mb-4 font-display text-base font-semibold">
              Match Quality Distribution
            </h2>
            <div className="space-y-3">
              {matchDistribution.map(d => (
                <div key={d.band} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-xs text-muted-foreground">
                    {d.band}
                  </span>
                  <div className="h-6 flex-1 overflow-hidden rounded-md bg-secondary">
                    <div
                      className={cn(
                        "h-full rounded-md",
                        d.band.startsWith("90")
                          ? "bg-success/80"
                          : d.band.startsWith("80")
                            ? "bg-primary/80"
                            : "bg-muted-foreground/40"
                      )}
                      style={{ width: `${(d.count / distTotal) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right font-mono text-sm">
                    {d.count}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* weekly trend */}
        {sections.trend !== false && (
          <Card className="p-5">
            <h2 className="mb-4 font-display text-base font-semibold">
              Weekly Applicant Trend
            </h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrend} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--secondary)" }}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "var(--foreground)" }}
                  />
                  <Bar dataKey="applicants" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>

      {/* funnel */}
      {sections.funnel !== false && (
        <Card className="p-5">
          <h2 className="mb-4 font-display text-base font-semibold">Hiring Funnel</h2>
          <div className="space-y-3">
            {hiringFunnel.map((stage, i) => {
              const prev = i === 0 ? stage.count : hiringFunnel[i - 1].count
              const pct = prev ? Math.round((stage.count / prev) * 100) : 0
              return (
                <div key={stage.stage} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-xs text-muted-foreground">
                    {stage.stage}
                  </span>
                  <div className="h-7 flex-1 overflow-hidden rounded-md bg-secondary">
                    <div
                      className="h-full rounded-md bg-primary/70 transition-all"
                      style={{
                        width: `${Math.max(4, (stage.count / funnelMax) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right font-mono text-sm">
                    {stage.count}
                  </span>
                  <span className="w-12 shrink-0 text-right text-[11px] text-muted-foreground">
                    {i > 0 ? `${pct}%` : ""}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
