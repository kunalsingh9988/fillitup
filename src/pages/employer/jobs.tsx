import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Briefcase, MoreHorizontal, Plus, Search } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useEmployer } from "@/lib/employer-store"
import type { JobStatus } from "@/lib/employer-types"
import { Seo } from "@/components/seo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

const TABS: { key: JobStatus | "all"; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "draft", label: "Draft" },
  { key: "closed", label: "Closed" },
]

const statusStyle: Record<JobStatus, string> = {
  active: "bg-success/15 text-success border-success/30",
  draft: "bg-warning/15 text-warning border-warning/30",
  closed: "bg-muted text-muted-foreground border-border",
}

export default function EmployerJobs() {
  const { state, updateJob } = useEmployer()
  const navigate = useNavigate()
  const [tab, setTab] = useState<JobStatus>("active")
  const [query, setQuery] = useState("")

  const counts = useMemo(
    () => ({
      active: state.jobs.filter(j => j.status === "active").length,
      draft: state.jobs.filter(j => j.status === "draft").length,
      closed: state.jobs.filter(j => j.status === "closed").length,
    }),
    [state.jobs]
  )

  const jobs = useMemo(
    () =>
      state.jobs.filter(
        j =>
          j.status === tab &&
          (j.title + j.department + j.location)
            .toLowerCase()
            .includes(query.toLowerCase())
      ),
    [state.jobs, tab, query]
  )

  return (
    <div className="space-y-5">
      <Seo title="Jobs" />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Jobs
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {state.jobs.length} total jobs
          </p>
        </div>
        <Button size="sm" asChild>
          <Link to="/employer/jobs/new">
            <Plus className="size-4" /> Post a New Job
          </Link>
        </Button>
      </div>

      {/* tabs + search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-border bg-secondary/40 p-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as JobStatus)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                tab === t.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
              <span className="rounded-full bg-secondary px-1.5 font-mono text-[10px] text-muted-foreground">
                {counts[t.key as JobStatus]}
              </span>
            </button>
          ))}
        </div>
        <div className="relative min-w-56 flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search jobs..."
            className="pl-9"
          />
        </div>
      </div>

      {/* job rows */}
      <Card className="divide-y divide-border overflow-hidden">
        {jobs.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <Briefcase className="size-8 text-muted-foreground/50" />
            <p className="text-sm font-medium">No {tab} jobs</p>
            <p className="text-xs text-muted-foreground">
              {query ? "Try a different search." : "Post a new job to get started."}
            </p>
          </div>
        )}
        {jobs.map(job => (
          <div
            key={job.id}
            className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-secondary/30"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => navigate(`/employer/candidates?job=${job.id}`)}
                  className="truncate text-sm font-semibold hover:text-primary"
                >
                  {job.title}
                </button>
                <Badge
                  variant="outline"
                  className={cn("capitalize", statusStyle[job.status])}
                >
                  {job.status}
                </Badge>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {job.department} · {job.location} · {job.workplace} · {job.type}
              </p>
            </div>

            {job.status !== "draft" ? (
              <div className="hidden shrink-0 items-center gap-6 text-xs text-muted-foreground sm:flex">
                <span>
                  <span className="font-mono font-medium text-foreground">
                    {job.applicants}
                  </span>{" "}
                  applicants
                </span>
                <span>
                  <span className="font-mono font-medium text-foreground">
                    {job.views.toLocaleString()}
                  </span>{" "}
                  views
                </span>
              </div>
            ) : (
              <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                Unpublished
              </span>
            )}

            <div className="flex shrink-0 items-center gap-1">
              {job.status === "active" && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/employer/candidates?job=${job.id}`}>View</Link>
                </Button>
              )}
              {job.status === "draft" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/employer/jobs/new?draft=${job.id}`)}
                >
                  Edit
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Job actions">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => navigate(`/employer/candidates?job=${job.id}`)}
                  >
                    View candidates
                  </DropdownMenuItem>
                  {job.status === "draft" && (
                    <DropdownMenuItem
                      onClick={() => navigate(`/employer/jobs/new?draft=${job.id}`)}
                    >
                      Continue editing
                    </DropdownMenuItem>
                  )}
                  {job.status !== "closed" && job.status !== "draft" && (
                    <DropdownMenuItem
                      onClick={() => {
                        updateJob(job.id, { status: "closed" })
                        toast.success(`"${job.title}" closed`)
                      }}
                    >
                      Close job
                    </DropdownMenuItem>
                  )}
                  {job.status === "closed" && (
                    <DropdownMenuItem
                      onClick={() => {
                        updateJob(job.id, { status: "active" })
                        toast.success(`"${job.title}" reopened`)
                      }}
                    >
                      Reopen job
                    </DropdownMenuItem>
                  )}
                  {job.status === "draft" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          updateJob(job.id, { status: "closed" })
                          toast.success(`Draft "${job.title}" discarded`)
                        }}
                      >
                        Discard draft
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}
