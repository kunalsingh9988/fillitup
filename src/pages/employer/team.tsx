import { useMemo, useState } from "react"
import { Activity, MoreHorizontal, Search, UserPlus, Users } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useEmployer } from "@/lib/employer-store"
import type { TeamRole } from "@/lib/employer-types"
import { Seo } from "@/components/seo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const TEAM_ROLES: TeamRole[] = [
  "Super Admin",
  "Admin",
  "Hiring Manager",
  "Interviewer",
  "Vendor",
]

const roleStyle: Record<TeamRole, string> = {
  "Super Admin": "bg-primary/15 text-primary border-primary/30",
  Admin: "bg-accent-indigo/15 text-indigo-300 border-accent-indigo/30",
  "Hiring Manager": "bg-success/15 text-success border-success/30",
  Interviewer: "bg-secondary text-secondary-foreground border-border",
  Vendor: "bg-warning/15 text-warning border-warning/30",
}

function AddUserDialog() {
  const { addTeamMember, setStepDone } = useEmployer()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<TeamRole>("Interviewer")

  const submit = () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required")
      return
    }
    addTeamMember({
      id: `t-${Date.now().toString(36)}`,
      name: name.trim(),
      initials: name
        .trim()
        .split(" ")
        .map(w => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      email: email.trim(),
      phone: "—",
      role,
      pending: true,
    })
    setStepDone("os3", true)
    toast.success("Invite sent", { description: `${email} added as ${role} (pending)` })
    setOpen(false)
    setName("")
    setEmail("")
    setRole("Interviewer")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="size-4" /> Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add user</DialogTitle>
          <DialogDescription>
            Invite a teammate to your hiring workspace. They'll get an email invite.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="au-name">Full name</Label>
            <Input
              id="au-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Nikhil Rao"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="au-email">Work email</Label>
            <Input
              id="au-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={v => setRole(v as TeamRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEAM_ROLES.map(r => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button className="w-full" onClick={submit}>
          Send invite
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default function EmployerTeam() {
  const { state, removeTeamMember } = useEmployer()
  const [tab, setTab] = useState<"staff" | "activity">("staff")
  const [roleFilter, setRoleFilter] = useState("all")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const perPage = 6

  const active = state.team.filter(t => !t.pending).length
  const pending = state.team.filter(t => t.pending).length

  const filtered = useMemo(() => {
    let list = state.team
    if (roleFilter !== "all") list = list.filter(t => t.role === roleFilter)
    if (query) {
      const q = query.toLowerCase()
      list = list.filter(
        t => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q)
      )
    }
    return list
  }, [state.team, roleFilter, query])

  const pages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="space-y-5">
      <Seo title="Team" />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Team
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {active} active · {pending} pending
          </p>
        </div>
        <AddUserDialog />
      </div>

      {/* tabs */}
      <div className="flex w-fit rounded-lg border border-border bg-secondary/40 p-1">
        {(
          [
            { key: "staff", label: "My Staff", icon: Users },
            { key: "activity", label: "Activity Log", icon: Activity },
          ] as const
        ).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === t.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="size-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "staff" ? (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={roleFilter}
              onValueChange={v => {
                setRoleFilter(v)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {TEAM_ROLES.map(r => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative min-w-56 flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={e => {
                  setQuery(e.target.value)
                  setPage(1)
                }}
                placeholder="Search by name or email..."
                className="pl-9"
              />
            </div>
          </div>

          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead>User Type</TableHead>
                  <TableHead className="w-12 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map(m => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold">
                          {m.initials}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{m.name}</p>
                          {m.pending && (
                            <Badge variant="outline" className="mt-0.5 text-[10px]">
                              Invite pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                      {m.email}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {m.phone}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[10px]", roleStyle[m.role])}>
                        {m.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Member actions">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            disabled={m.role === "Super Admin"}
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              removeTeamMember(m.id)
                              toast.success(`${m.name} removed from team`)
                            }}
                          >
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {pageRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                      No members match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

          {pages > 1 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Page {page} of {pages}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: pages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={cn(
                      "flex size-7 items-center justify-center rounded-md text-xs font-medium",
                      page === i + 1
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <Card className="p-5">
          <ul className="space-y-3">
            {state.activity.map(a => (
              <li
                key={a.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-3"
              >
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                  {a.actor
                    .split(" ")
                    .map(w => w[0])
                    .join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{a.actor}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{a.ago}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
