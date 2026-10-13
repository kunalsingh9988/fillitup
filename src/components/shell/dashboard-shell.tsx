import { useState, type ReactNode } from "react"
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"
import {
  Bell,
  Building2,
  ChevronsUpDown,
  LogOut,
  Menu,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
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

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
  badge?: number
}

export interface ShellNotification {
  id: string
  text: string
  ago: string
  read: boolean
}

export interface ShellUser {
  name: string
  email: string
  initials: string
}

interface DashboardShellProps {
  seoTitle: string
  /** Identity card rendered at the top of the sidebar */
  identity: ReactNode
  nav: NavItem[]
  notifications: ShellNotification[]
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  user: ShellUser
  settingsPath: string
  footerNote?: string
  footerLinks?: { label: string; to: string }[]
}

function NotificationsPopover({
  notifications,
  onMarkRead,
  onMarkAllRead,
}: Pick<DashboardShellProps, "notifications" | "onMarkRead" | "onMarkAllRead">) {
  const unread = notifications.filter(n => !n.read).length

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
              onClick={onMarkAllRead}
            >
              Mark all read
            </button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          <ul className="divide-y divide-border">
            {notifications.map(n => (
              <li key={n.id}>
                <button
                  onClick={() => onMarkRead(n.id)}
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

function UserMenu({ user, settingsPath }: { user: ShellUser; settingsPath: string }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <ChevronsUpDown className="hidden size-3.5 text-muted-foreground sm:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs font-normal text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(settingsPath)}>
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

export function DashboardShell({
  seoTitle,
  identity,
  nav,
  notifications,
  onMarkRead,
  onMarkAllRead,
  user,
  settingsPath,
  footerNote = "Fill-it-up © 2026",
  footerLinks = [
    { label: "About", to: "/about" },
    { label: "Help Center", to: "/contact" },
    { label: "Privacy", to: "/privacy" },
    { label: "Terms", to: "/terms" },
  ],
}: DashboardShellProps) {
  const [mobileNav, setMobileNav] = useState(false)

  const sidebar = (onNavigate?: () => void) => (
    <div className="flex h-full flex-col">
      <div className="p-4">{identity}</div>
      <nav className="flex-1 space-y-0.5 px-3" aria-label={seoTitle}>
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
            {item.badge != null && item.badge > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-1 border-t border-border p-4 text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {footerLinks.map(l => (
            <Link key={l.to} to={l.to} className="hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </div>
        <p className="pt-1 text-muted-foreground/70">{footerNote}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Seo title={seoTitle} />

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-background/60 backdrop-blur-xl lg:block">
        {sidebar()}
      </aside>

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
            {sidebar(() => setMobileNav(false))}
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
          <NotificationsPopover
            notifications={notifications}
            onMarkRead={onMarkRead}
            onMarkAllRead={onMarkAllRead}
          />
          <ThemeToggle />
          <UserMenu user={user} settingsPath={settingsPath} />
        </header>
        <main className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
