import {
  BarChart3,
  Calendar,
  CalendarClock,
  FileText,
  IndianRupee,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  Star,
  TrendingUp,
  User,
  Users,
} from "lucide-react"

import { MentorProvider, useMentor } from "@/lib/mentor-store"
import { useAuth } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { DashboardShell, type NavItem } from "@/components/shell/dashboard-shell"

function MentorShell() {
  const { state, markRead, markAllRead } = useMentor()
  const { user } = useAuth()
  const p = state.profile
  const unreadMessages = state.conversations.reduce((n, c) => n + c.unread, 0)

  const nav: NavItem[] = [
    { label: "Dashboard", to: "/mentor", icon: LayoutDashboard, end: true },
    { label: "My Plans", to: "/mentor/plans", icon: Package },
    { label: "Mentees", to: "/mentor/mentees", icon: Users },
    { label: "Reviews", to: "/mentor/reviews", icon: Star },
    { label: "Sessions", to: "/mentor/sessions", icon: CalendarClock },
    { label: "Availability", to: "/mentor/availability", icon: Calendar },
    { label: "Messages", to: "/mentor/messages", icon: MessageSquare, badge: unreadMessages },
    { label: "Resources", to: "/mentor/resources", icon: FileText },
    { label: "Insights", to: "/mentor/insights", icon: TrendingUp },
    { label: "Earnings", to: "/mentor/earnings", icon: IndianRupee },
    { label: "Public Profile", to: "/mentor/profile", icon: User },
    { label: "Settings", to: "/mentor/settings", icon: Settings },
  ]

  const identity = (
    <div className="rounded-xl border border-border bg-card/60 p-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary/15 font-display text-sm font-bold text-primary">
          {p.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {p.headline.split("—")[0].trim()}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{p.company}</span>
        <Badge variant="secondary" className="text-[10px]">Mentor</Badge>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-warning">
        <BarChart3 className="size-3" /> 4.9 · {state.mentees.length} active mentees
      </div>
    </div>
  )

  return (
    <DashboardShell
      seoTitle="Mentor Dashboard"
      identity={identity}
      nav={nav}
      notifications={state.notifications}
      onMarkRead={markRead}
      onMarkAllRead={markAllRead}
      user={{
        name: p.name,
        email: user?.email ?? p.email,
        initials: p.initials,
      }}
      settingsPath="/mentor/settings"
      footerNote="Fill-it-up Mentors © 2026"
    />
  )
}

export default function MentorLayout() {
  return (
    <MentorProvider>
      <MentorShell />
    </MentorProvider>
  )
}
