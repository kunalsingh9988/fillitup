import { ArrowUpRight, MapPin } from "lucide-react"

import type { Job } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { MatchScoreRing } from "@/components/match-score-ring"

interface JobCardProps {
  job: Job
  className?: string
}

export function JobCard({ job, className }: JobCardProps) {
  return (
    <Card
      className={cn(
        "group flex flex-col gap-4 p-5 transition-all hover:border-primary/40 hover:shadow-elevated",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 rounded-lg">
            <AvatarFallback className="rounded-lg bg-secondary text-[13px]">
              {job.companyInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-[15px] font-semibold leading-snug text-foreground">
              {job.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {job.company} · {job.postedAgo}
            </p>
          </div>
        </div>
        {job.matchScore !== undefined && (
          <MatchScoreRing score={job.matchScore} size={44} strokeWidth={4} />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3" />
          {job.location}
        </span>
        <span className="font-mono text-foreground/80">{job.salary}</span>
        <Badge variant="secondary">{job.type}</Badge>
        {job.tags.map((t) => (
          <Badge key={t} variant="outline">
            {t}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3.5">
        <span className="text-xs text-muted-foreground">
          {job.hiringFor ? (
            <>
              Hiring for <span className="text-foreground/90">'{job.hiringFor}'</span>
            </>
          ) : (
            job.company
          )}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-transform group-hover:translate-x-0.5">
          View opportunity
          <ArrowUpRight className="size-3.5" />
        </span>
      </div>
    </Card>
  )
}
