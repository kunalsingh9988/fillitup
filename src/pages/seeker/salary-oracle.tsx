import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, ChevronDown, DollarSign, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { useSeeker } from "@/lib/seeker-store"
import { salaryBenchmark } from "@/lib/seeker-data"
import { Seo } from "@/components/seo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function SalaryOracle() {
  const { state, setStepDone } = useSeeker()
  const [showAll, setShowAll] = useState(false)
  const b = salaryBenchmark
  const pct = (v: number) => ((v - b.low) / (b.high - b.low)) * 100
  const companies = showAll ? b.companies : b.companies.slice(0, 4)

  return (
    <div className="space-y-5">
      <Seo title="Salary Oracle" />
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Salary Oracle</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI analyzed 50,000+ offers for {state.profile.title} in {state.profile.location}
        </p>
      </div>

      {/* range bar */}
      <Card className="p-6">
        <h2 className="font-display text-base font-semibold">Market Salary Range</h2>
        <div className="relative mt-8 pb-6">
          <div className="h-2.5 rounded-full bg-gradient-to-r from-secondary via-primary/40 to-success/50" />
          {/* median marker */}
          <div className="absolute -top-6" style={{ left: `${pct(b.median)}%` }}>
            <span className="block -translate-x-1/2 whitespace-nowrap text-xs text-muted-foreground">
              Median: ${b.median}k
            </span>
            <span className="mx-auto block h-3 w-0.5 bg-muted-foreground" />
          </div>
          {/* you marker */}
          <div className="absolute -top-7" style={{ left: `${pct(b.you)}%` }}>
            <span className="block -translate-x-1/2 whitespace-nowrap rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
              You: ${b.you}k
            </span>
            <span className="mx-auto block h-4 w-0.5 bg-primary" />
          </div>
          <div className="mt-2 flex justify-between font-mono text-xs text-muted-foreground">
            <span>${b.low}k</span>
            <span>${b.high}k</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          You're earning {Math.round(((b.you - b.median) / b.median) * 100)}% above the market median.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* factors */}
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <Sparkles className="size-4 text-primary" /> AI Salary Factors
            </h2>
            <Badge variant="secondary">{b.factors.length} factors analyzed</Badge>
          </div>
          <ul className="space-y-3">
            {b.factors.map(f => (
              <li key={f.label} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.detail}</p>
                </div>
                <span className="font-mono text-sm font-semibold text-success">{f.delta}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* company benchmarks */}
        <Card className="p-5">
          <h2 className="mb-3 font-display text-base font-semibold">Company Benchmarks</h2>
          <ul className="space-y-3">
            {companies.map(c => (
              <li key={c.name} className="flex items-center justify-between text-sm">
                <span className="font-medium">{c.name}</span>
                <span className="font-mono text-muted-foreground">{c.range}</span>
              </li>
            ))}
          </ul>
          <Button variant="ghost" size="sm" className="mt-3" onClick={() => setShowAll(v => !v)}>
            {showAll ? "Show less" : "Show more"} <ChevronDown className={cn("size-4 transition-transform", showAll && "rotate-180")} />
          </Button>
        </Card>
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-3 border-primary/20 bg-primary/5 p-5">
        <div>
          <h3 className="font-display text-sm font-semibold">Negotiation-ready report</h3>
          <p className="text-xs text-muted-foreground">
            Export a market-data PDF to bring to your offer call.
          </p>
        </div>
        <Button
          onClick={() => {
            setStepDone("sc5", true)
            toast.success("Salary report generated", { description: "Saved to your documents." })
          }}
        >
          <DollarSign className="size-4" /> Export report
        </Button>
      </Card>

      <Button variant="ghost" size="sm" asChild>
        <Link to="/app/ai"><ArrowLeft className="size-4" /> Back to AI Hub</Link>
      </Button>
    </div>
  )
}
