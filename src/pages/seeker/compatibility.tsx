import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { compatibilityCompanies } from "@/lib/seeker-data"
import { Seo } from "@/components/seo"
import { MatchScoreRing } from "@/components/match-score-ring"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function CompatibilityIndex() {
  const [showAll, setShowAll] = useState(false)
  const companies = showAll ? compatibilityCompanies : compatibilityCompanies.slice(0, 3)
  const best = compatibilityCompanies[0]

  return (
    <div className="space-y-5">
      <Seo title="Compatibility Index" />
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Compatibility Index
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI analyzed your profile, values, and work style to find companies where you'll thrive.
        </p>
      </div>

      <Card className="flex items-center gap-5 border-primary/20 bg-primary/5 p-6">
        <MatchScoreRing score={best.score} size={84} strokeWidth={7} />
        <div>
          <p className="font-display text-lg font-semibold">Your Best Match: {best.score}%</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Analyzed {compatibilityCompanies.length} companies across culture, work style, values,
            growth, and team fit
          </p>
        </div>
      </Card>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Company Matches</h2>
        <div className="space-y-2">
          {companies.map(c => (
            <Card key={c.name} className="flex items-center gap-4 p-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary font-display text-sm font-bold">
                {c.name[0]}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{c.name}</p>
                  <Badge variant="secondary" className="text-[10px]">{c.industry}</Badge>
                  {c.top && (
                    <Badge className="bg-success/15 text-[10px] text-success hover:bg-success/15">
                      Top Match
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{c.note}</p>
                <Progress value={c.score} className="mt-2 h-1.5" />
              </div>
              <span
                className={cn(
                  "font-mono text-lg font-bold",
                  c.score >= 85 ? "text-success" : "text-primary"
                )}
              >
                {c.score}%
              </span>
            </Card>
          ))}
        </div>
        <Button variant="ghost" size="sm" className="mt-3" onClick={() => setShowAll(v => !v)}>
          {showAll ? "Show less" : `Show all ${compatibilityCompanies.length}`}
          <ChevronDown className={cn("size-4 transition-transform", showAll && "rotate-180")} />
        </Button>
      </div>

      <Button variant="ghost" size="sm" asChild>
        <Link to="/app/ai"><ArrowLeft className="size-4" /> Back to AI Hub</Link>
      </Button>
    </div>
  )
}
