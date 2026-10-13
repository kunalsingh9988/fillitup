import {
  BarChart3,
  Briefcase,
  Building2,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
  UsersRound,
} from "lucide-react"

import { EmployerProvider, useEmployer } from "@/lib/employer-store"
import { useAuth } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { DashboardShell, type NavItem } from "@/components/shell/dashboard-shell"

function EmployerShell() {
  const { state, markRead, markAllRead } = useEmployer()
  const { user } = useAuth()
  const company = state.company
  const unreadMessages = state.conversations.reduce((n, c) => n + c.unread, 0)

  const nav: NavItem[] = [
    { label: "Dashboard", to: "/employer", icon: LayoutDashboard, end: true },
    { label: "Company Profile", to: "/employer/company", icon: Building2 },
    { label: "Jobs", to: "/employer/jobs", icon: Briefcase },
    { label: "Candidates", to: "/employer/candidates", icon: Users },
    { label: "Analytics", to: "/employer/analytics", icon: BarChart3 },
    { label: "Team", to: "/employer/team", icon: UsersRound },
    { label: "Messages", to: "/employer/messages", icon: MessageSquare, badge: unreadMessages },
    { label: "Settings", to: "/employer/settings", icon: Settings },
  ]

  const name = user?.name ?? "Priya Sharma"
  const identity = (
    <div className="rounded-xl border border-border bg-card/60 p-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/15 font-display text-sm font-bold text-primary">
          {company.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{company.name}</p>
          <p className="truncate text-xs text-muted-foreground">{company.industry}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{company.location}</span>
        <Badge variant="secondary" className="text-[10px]">
          {company.plan}
        </Badge>
      </div>
      <div className="mt-2 flex gap-3 text-[11px] text-muted-foreground/80">
        <span>Team: {company.size}</span>
        <span>Open: {company.openRoles}</span>
      </div>
    </div>
  )

  return (
    <DashboardShell
      seoTitle="Employer Dashboard"
      identity={identity}
      nav={nav}
      notifications={state.notifications}
      onMarkRead={markRead}
      onMarkAllRead={markAllRead}
      user={{
        name,
        email: user?.email ?? "priya@techcorp.io",
        initials: name
          .split(" ")
          .map(w => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
      }}
      settingsPath="/employer/settings"
    />
  )
}

export default function EmployerLayout() {
  return (
    <EmployerProvider>
      <EmployerShell />
    </EmployerProvider>
  )
}
