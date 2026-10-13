import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { useSeeker } from "@/lib/seeker-store"
import type { SeekerSettings } from "@/lib/seeker-types"
import { Seo } from "@/components/seo"
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

const NOTIFS: { key: keyof SeekerSettings["notifications"]; label: string; desc: string }[] = [
  { key: "jobMatches", label: "New job matches", desc: "AI matches above 85% fit" },
  { key: "applicationUpdates", label: "Application updates", desc: "Views, stage changes, replies" },
  { key: "messages", label: "Messages", desc: "Recruiter and mentor messages" },
  { key: "weeklyDigest", label: "Weekly digest", desc: "Progress summary every Monday" },
  { key: "productUpdates", label: "Product updates", desc: "New features and tips" },
]

export default function SeekerSettings() {
  const { state, updateSettings, resetDemo } = useSeeker()
  const s = state.settings
  const [deleteOpen, setDeleteOpen] = useState(false)

  const setNotif = (key: keyof SeekerSettings["notifications"], v: boolean) =>
    updateSettings({ notifications: { ...s.notifications, [key]: v } })

  return (
    <div className="space-y-5">
      <Seo title="Preferences" />
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Preferences</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visibility, job search, security, and notification settings
        </p>
      </div>

      {/* profile link */}
      <Card className="flex items-center justify-between gap-4 p-5">
        <div>
          <h2 className="font-display text-base font-semibold">Profile & Billing</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Edit your public profile or manage your plan and credits.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild><Link to="/app/profile">Profile</Link></Button>
          <Button variant="outline" size="sm" asChild><Link to="/app/billing">Billing</Link></Button>
        </div>
      </Card>

      {/* job search prefs */}
      <Card className="p-5">
        <h2 className="mb-2 font-display text-base font-semibold">Job Search</h2>
        <Row title="Profile visibility" sub="Let employers discover your profile">
          <Switch checked={s.profileVisibility} onCheckedChange={v => updateSettings({ profileVisibility: v })} />
        </Row>
        <Row title="Open to work" sub="Show recruiters you're actively looking">
          <Switch checked={s.openToWork} onCheckedChange={v => updateSettings({ openToWork: v })} />
        </Row>
        <Row title="Job alerts" sub="Instant alerts for high-match postings">
          <Switch checked={s.jobAlerts} onCheckedChange={v => updateSettings({ jobAlerts: v })} />
        </Row>
        <Row title="AI auto-apply" sub="Let AI submit applications to 95%+ matches">
          <Switch checked={s.aiAutoApply} onCheckedChange={v => updateSettings({ aiAutoApply: v })} />
        </Row>
      </Card>

      {/* security */}
      <Card className="p-5">
        <h2 className="mb-2 font-display text-base font-semibold">Security</h2>
        <Row title="Two-factor authentication" sub="Add an extra layer of security">
          <Switch checked={s.twoFactor} onCheckedChange={v => updateSettings({ twoFactor: v })} />
        </Row>
        <Row title="Password">
          <Button variant="outline" size="sm" onClick={() => toast.success("Reset link sent to your email")}>
            Change
          </Button>
        </Row>
      </Card>

      {/* notifications */}
      <Card className="p-5">
        <h2 className="mb-2 font-display text-base font-semibold">Notifications</h2>
        {NOTIFS.map(n => (
          <Row key={n.key} title={n.label} sub={n.desc}>
            <Switch checked={s.notifications[n.key]} onCheckedChange={v => setNotif(n.key, v)} />
          </Row>
        ))}
      </Card>

      {/* danger */}
      <Card className="border-destructive/40 p-5">
        <h2 className="font-display text-base font-semibold text-destructive">Danger Zone</h2>
        <div className="mt-2 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all application data.
          </p>
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            Delete Account
          </Button>
        </div>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete account?</DialogTitle>
            <DialogDescription>
              This permanently removes your profile, applications, and credits. This action can't be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                resetDemo()
                setDeleteOpen(false)
                toast.success("Demo data reset", { description: "Demo mode — your workspace was reseeded." })
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
