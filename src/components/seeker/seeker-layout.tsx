import {
  Briefcase,
  Heart,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Sparkles,
  User,
  Users,
} from "lucide-react"

import { SeekerProvider, useSeeker } from "@/lib/seeker-store"
import { useAuth } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DashboardShell, type NavItem } from "@/components/shell/dashboard-shell"

function SeekerShell() {
  const { state, markRead, markAllRead } = useSeeker()
  const { user } = useAuth()
  const profile = state.profile
  const unreadMessages = state.conversations.reduce((n, c) => n + c.unread, 0)

  const nav: NavItem[] = [
    { label: "Dashboard", to: "/app", icon: LayoutDashboard, end: true },
    { label: "AI Hub", to: "/app/ai", icon: Sparkles },
    { label: "Jobs", to: "/app/jobs", icon: Briefcase },
    { label: "Community", to: "/app/community", icon: Users },
    { label: "Messages", to: "/app/messages", icon: MessageSquare, badge: unreadMessages },
    { label: "Profile", to: "/app/profile", icon: User },
    { label: "Mentorship", to: "/app/mentorship", icon: Heart },
    { label: "Preferences", to: "/app/settings", icon: Settings },
  ]

  const identity = (
    <div className="rounded-xl border border-border bg-card/60 p-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary/15 font-display text-sm font-bold text-primary">
          {profile.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{profile.name}</p>
          <p className="truncate text-xs text-muted-foreground">{profile.title}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{profile.location}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {profile.skills.slice(0, 3).map(s => (
          <Badge key={s} variant="secondary" className="text-[10px]">
            {s}
          </Badge>
        ))}
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Career Readiness</span>
          <span className="font-mono text-primary">{profile.readiness}%</span>
        </div>
        <Progress value={profile.readiness} className="mt-1 h-1.5" />
      </div>
    </div>
  )

  return (
    <DashboardShell
      seoTitle="Job Seeker Dashboard"
      identity={identity}
      nav={nav}
      notifications={state.notifications}
      onMarkRead={markRead}
      onMarkAllRead={markAllRead}
      user={{
        name: profile.name,
        email: user?.email ?? profile.email,
        initials: profile.initials,
      }}
      settingsPath="/app/settings"
    />
  )
}

export default function SeekerLayout() {
  return (
    <SeekerProvider>
      <SeekerShell />
    </SeekerProvider>
  )
}
