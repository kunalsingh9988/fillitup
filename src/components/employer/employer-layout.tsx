import { useState } from "react"
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"
import {
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  ChevronsUpDown,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Users,
  UsersRound,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { EmployerProvider, useEmployer } from "@/lib/employer-store"
import { useAuth } from "@/lib/auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeToggle } from "@/components/theme-toggle"
import { Seo } from "@/components/seo"

const nav = [
  { label: "Dashboard", to: "/employer", icon: LayoutDashboard, end: true },
  { label: "Company Profile", to: "/employer/company", icon: Building2 },
  { label: "Jobs", to: "/employer/jobs", icon: Briefcase },
  { label: "Candidates", to: "/employer/candidates", icon: Users },
  { label: "Analytics", to: "/employer/analytics", icon: BarChart3 },
  { label: "Team", to: "/employer/team", icon: UsersRound },
  { label: "Messages", to: "/employer/messages", icon: MessageSquare },
  { label: "Settings", to: "/employer/settings", icon: Settings },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { state } = useEmployer()
  const company = state.company
  const unreadMessages = state.conversations.reduce((n, c) => n + c.unread, 0)

  return (
    <div className="flex h-full flex-col">
      {/* company card */}
      <div className="p-4">
        <div className="rounded-xl border border-border bg-card/60 p-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/15 font-display text-sm font-bold text-primary">
              {company.initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {company.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {company.industry}
              </p>
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
      </div>

      {/* nav */}
      <nav className="flex-1 space-y-0.5 px-3" aria-label="Employer">
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )
            }
          >
            <item.icon className="size-4" />
            <span className="flex-1">{item.label}</span>
            {item.label === "Messages" && unreadMessages > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {unreadMessages}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* bottom links */}
      <div className="space-y-1 border-t border-border p-4 text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <Link to="/about" className="hover:text-foreground">About</Link>
          <Link to="/contact" className="hover:text-foreground">Help Center</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
        </div>
        <p className="pt-1 text-muted-foreground/70">Fill-it-up © 2026</p>
      </div>
    </div>
  )
}

function NotificationsPopover() {
  const { state, markAllRead, markRead } = useEmployer()
  const unread = state.notifications.filter(n => !n.read).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">Notifications</p>
            {unread > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {unread} unread
              </Badge>
            )}
          </div>
          {unread > 0 && (
            <button
              className="text-xs font-medium text-primary hover:underline"
              onClick={markAllRead}
            >
              Mark all read
            </button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          <ul className="divide-y divide-border">
            {state.notifications.map(n => (
              <li key={n.id}>
                <button
                  onClick={() => markRead(n.id)}
                  className={cn(
                    "block w-full px-4 py-3 text-left transition-colors hover:bg-secondary/60",
                    !n.read && "bg-primary/5"
                  )}
                >
                  <p className="text-sm leading-snug text-foreground">{n.text}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.ago}</p>
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

function UserMenu() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const name = user?.name ?? "Priya Sharma"
  const email = user?.email ?? "priya@techcorp.io"
  const initials = name
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <ChevronsUpDown className="hidden size-3.5 text-muted-foreground sm:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs font-normal text-muted-foreground">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/employer/settings")}>
          <Settings className="size-4" /> Account settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/")}>
          <Building2 className="size-4" /> Public site
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => {
            signOut()
            navigate("/login")
          }}
        >
          <LogOut className="size-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function Shell() {
  const [mobileNav, setMobileNav] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Employer Dashboard" />

      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-background/60 backdrop-blur-xl lg:block">
        <SidebarContent />
      </aside>

      {/* mobile drawer */}
      {mobileNav && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileNav(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-border bg-background shadow-xl">
            <div className="flex items-center justify-between p-4">
              <span className="text-sm font-semibold">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileNav(false)}>
                <X className="size-5" />
              </Button>
            </div>
            <SidebarContent onNavigate={() => setMobileNav(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileNav(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
          <div className="flex-1" />
          <NotificationsPopover />
          <ThemeToggle />
          <UserMenu />
        </header>
        <main className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function EmployerLayout() {
  return (
    <EmployerProvider>
      <Shell />
    </EmployerProvider>
  )
}
