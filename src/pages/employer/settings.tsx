import { useState } from "react"
import { Link } from "react-router-dom"
import { Building2, Plus } from "lucide-react"
import { toast } from "sonner"

import { useEmployer } from "@/lib/employer-store"
import type { EmployerSettings } from "@/lib/employer-types"
import { Seo } from "@/components/seo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"

function Row({
  title,
  sub,
  children,
}: {
  title: string
  sub?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3.5 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </div>
      {children}
    </div>
  )
}

const INTEGRATIONS = [
  {
    key: "calendar" as const,
    icon: "📅",
    name: "Google Calendar",
    desc: "Sync interview schedules",
  },
  {
    key: "slack" as const,
    icon: "💬",
    name: "Slack",
    desc: "Get hiring notifications in Slack",
  },
  {
    key: "ats" as const,
    icon: "📋",
    name: "ATS Import",
    desc: "Import candidates from external ATS",
  },
]

const NOTIF_LABELS: {
  key: keyof EmployerSettings["notifications"]
  label: string
  desc: string
}[] = [
  { key: "newApplicants", label: "New applicants", desc: "Get notified when candidates apply" },
  { key: "interviewReminders", label: "Interview reminders", desc: "Reminders before scheduled interviews" },
  { key: "weeklyReport", label: "Weekly hiring report", desc: "Summary of applicants and pipeline" },
  { key: "aiAlerts", label: "AI hiring alerts", desc: "High-match candidates and optimization tips" },
  { key: "productUpdates", label: "Product updates", desc: "New features and tips" },
]

export default function EmployerSettings() {
  const { state, updateSettings, resetDemo, setStepDone } = useEmployer()
  const s = state.settings
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [newCompany, setNewCompany] = useState("")
  const [companies, setCompanies] = useState([
    { name: state.company.name, industry: state.company.industry, active: true },
    { name: "Nimbus Labs", industry: "AI Infrastructure · Remote", active: false },
  ])
  const [sessions, setSessions] = useState([
    { id: "s1", device: "Chrome · macOS", where: "Bangalore, India", when: "Active now", current: true },
    { id: "s2", device: "Safari · iPhone", where: "Bangalore, India", when: "2 hours ago", current: false },
    { id: "s3", device: "Firefox · Windows", where: "Mumbai, India", when: "3 days ago", current: false },
  ])

  const setNotif = (key: keyof typeof s.notifications, v: boolean) =>
    updateSettings({ notifications: { ...s.notifications, [key]: v } })

  return (
    <div className="space-y-5">
      <Seo title="Settings" />

      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your company profile and preferences
        </p>
      </div>

      {/* company profile */}
      <Card className="flex items-center justify-between gap-4 p-5">
        <div>
          <h2 className="font-display text-base font-semibold">Company Profile</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage your company name, logo, about, tech stack, benefits, and more.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/employer/company">Edit Profile</Link>
        </Button>
      </Card>

      {/* companies switcher */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-base font-semibold">Companies</h2>
            <Badge variant="secondary">{companies.length}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" /> Add company
          </Button>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Switch between companies in your account or add a new one.
        </p>
        <ul className="mt-4 space-y-2">
          {companies.map((c, i) => (
            <li
              key={c.name}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/30 p-3.5"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary">
                  {c.name
                    .split(" ")
                    .map(w => w[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium">
                    {c.name}
                    {c.active && (
                      <Badge className="bg-success/15 text-success hover:bg-success/15">
                        Active
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{c.industry}</p>
                </div>
              </div>
              {!c.active && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCompanies(cs => cs.map((x, xi) => ({ ...x, active: xi === i })))
                    toast.success(`Switched to ${c.name}`)
                  }}
                >
                  Switch
                </Button>
              )}
            </li>
          ))}
        </ul>
      </Card>

      {/* account */}
      <Card className="p-5">
        <h2 className="mb-2 font-display text-base font-semibold">Account</h2>
        <Row title="Email">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">priya@techcorp.io</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Verification link sent to your new email")}
            >
              Change
            </Button>
          </div>
        </Row>
        <Row title="Password">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">••••••••</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Password reset link sent")}
            >
              Change
            </Button>
          </div>
        </Row>
      </Card>

      {/* security + hiring prefs */}
      <Card className="p-5">
        <h2 className="mb-2 font-display text-base font-semibold">Security</h2>
        <Row
          title="Two-factor authentication"
          sub="Add an extra layer of security to your account"
        >
          <Switch
            checked={s.twoFactor}
            onCheckedChange={v => {
              updateSettings({ twoFactor: v })
              toast.success(v ? "2FA enabled" : "2FA disabled")
            }}
          />
        </Row>
      </Card>

      <Card className="p-5">
        <h2 className="mb-2 font-display text-base font-semibold">Hiring Preferences</h2>
        <Row
          title="Blind Hiring Mode"
          sub="When enabled, candidate identities are hidden during initial review across all hiring screens"
        >
          <Switch
            checked={s.blindHiring}
            onCheckedChange={v => {
              updateSettings({ blindHiring: v })
              if (v) setStepDone("os5", true)
              toast.success(v ? "Blind hiring enabled" : "Blind hiring disabled", {
                description: v
                  ? "Candidate names and locations are now anonymized."
                  : undefined,
              })
            }}
          />
        </Row>
      </Card>

      {/* integrations */}
      <Card className="p-5">
        <h2 className="mb-2 font-display text-base font-semibold">
          Connected Integrations
        </h2>
        {INTEGRATIONS.map(int => (
          <Row key={int.key} title={int.name} sub={int.desc}>
            <div className="flex items-center gap-3">
              <span className="text-lg" aria-hidden>
                {int.icon}
              </span>
              <Button
                variant={s.integrations[int.key] ? "outline" : "default"}
                size="sm"
                onClick={() =>
                  updateSettings({
                    integrations: {
                      ...s.integrations,
                      [int.key]: !s.integrations[int.key],
                    },
                  })
                }
              >
                {s.integrations[int.key] ? "Connected" : "Connect"}
              </Button>
            </div>
          </Row>
        ))}
      </Card>

      {/* sessions */}
      <Card className="p-5">
        <h2 className="mb-2 font-display text-base font-semibold">Active Sessions</h2>
        {sessions.map(sess => (
          <Row
            key={sess.id}
            title={sess.device}
            sub={`${sess.where} · ${sess.when}`}
          >
            {sess.current ? (
              <Badge variant="secondary">This device</Badge>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  setSessions(ss => ss.filter(x => x.id !== sess.id))
                  toast.success("Session revoked")
                }}
              >
                Revoke
              </Button>
            )}
          </Row>
        ))}
      </Card>

      {/* notifications */}
      <Card className="p-5">
        <h2 className="mb-2 font-display text-base font-semibold">Notifications</h2>
        {NOTIF_LABELS.map(n => (
          <Row key={n.key} title={n.label} sub={n.desc}>
            <Switch
              checked={s.notifications[n.key]}
              onCheckedChange={v => setNotif(n.key, v)}
            />
          </Row>
        ))}
      </Card>

      {/* billing */}
      <Card className="p-5">
        <h2 className="mb-2 font-display text-base font-semibold">Billing & Plan</h2>
        <Row title="Current Plan" sub={state.company.plan + " · Billed monthly"}>
          <Button variant="outline" size="sm" asChild>
            <Link to="/pricing">Upgrade</Link>
          </Button>
        </Row>
        <div className="pt-4">
          <div className="flex items-center justify-between text-sm">
            <p className="font-medium">Job posting credits</p>
            <p className="font-mono text-sm">12 / 20</p>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">Remaining this month</p>
          <Progress value={60} className="mt-2 h-2" />
        </div>
      </Card>

      {/* danger zone */}
      <Card className="border-destructive/40 p-5">
        <h2 className="font-display text-base font-semibold text-destructive">
          Danger Zone
        </h2>
        <div className="mt-2 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Permanently delete your company account and all associated data.
          </p>
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            Delete Account
          </Button>
        </div>
      </Card>

      {/* add company dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add new company</DialogTitle>
            <DialogDescription>
              Create a separate hiring workspace under your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="nc">Company name</Label>
            <Input
              id="nc"
              value={newCompany}
              onChange={e => setNewCompany(e.target.value)}
              placeholder="e.g. Nimbus Labs"
            />
          </div>
          <Button
            className="w-full"
            disabled={!newCompany.trim()}
            onClick={() => {
              setCompanies(cs => [
                ...cs,
                { name: newCompany.trim(), industry: "—", active: false },
              ])
              setAddOpen(false)
              setNewCompany("")
              toast.success("Company workspace created")
            }}
          >
            <Building2 className="size-4" /> Create workspace
          </Button>
        </DialogContent>
      </Dialog>

      {/* delete confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete account?</DialogTitle>
            <DialogDescription>
              This permanently removes your company workspace, jobs, and candidate data.
              This action can't be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                resetDemo()
                setDeleteOpen(false)
                toast.success("Demo data reset", {
                  description: "This is a demo — your workspace was reseeded.",
                })
              }}
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
