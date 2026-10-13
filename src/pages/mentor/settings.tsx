import { toast } from "sonner"

import { useMentor } from "@/lib/mentor-store"
import type { MentorSettings } from "@/lib/mentor-types"
import { Seo } from "@/components/seo"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

type NotifKey = keyof MentorSettings["notifications"]

export default function MentorSettingsPage() {
  const { state, updateSettings, resetDemo } = useMentor()
  const s = state.settings
  const p = state.profile

  const notif = (key: NotifKey, label: string, desc: string) => (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch
        checked={s.notifications[key]}
        onCheckedChange={v => updateSettings({ notifications: { ...s.notifications, [key]: v } })}
      />
    </div>
  )

  return (
    <div className="space-y-5">
      <Seo title="Settings" />
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Account, visibility, payouts, and notifications.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* account */}
        <Card className="space-y-4 p-5">
          <h2 className="font-display text-base font-semibold">Account</h2>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={p.email} readOnly className="opacity-70" />
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <div className="flex gap-2">
              <Input type="password" value="••••••••••" readOnly className="opacity-70" />
              <Button variant="outline" onClick={() => toast.success("Password reset email sent (mocked)")}>
                Change
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Two-factor authentication</p>
              <p className="text-xs text-muted-foreground">Extra security at sign-in</p>
            </div>
            <Switch checked={s.twoFactor} onCheckedChange={v => updateSettings({ twoFactor: v })} />
          </div>
        </Card>

        {/* visibility */}
        <Card className="space-y-4 p-5">
          <h2 className="font-display text-base font-semibold">Visibility</h2>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Accepting new mentees</p>
              <p className="text-xs text-muted-foreground">Shows the "Subscribe" buttons on your profile</p>
            </div>
            <Switch checked={s.acceptMentees} onCheckedChange={v => updateSettings({ acceptMentees: v })} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Public profile</p>
              <p className="text-xs text-muted-foreground">Visible in mentor search results</p>
            </div>
            <Switch checked={s.profileVisibility} onCheckedChange={v => updateSettings({ profileVisibility: v })} />
          </div>
        </Card>

        {/* calendar + payouts */}
        <Card className="space-y-4 p-5">
          <h2 className="font-display text-base font-semibold">Calendar & payouts</h2>
          <div className="space-y-1.5">
            <Label>Google Calendar</Label>
            <div className="flex gap-2">
              <Input
                value={s.calendarConnected}
                onChange={e => updateSettings({ calendarConnected: e.target.value })}
                placeholder="Not connected"
              />
              <Button
                variant="outline"
                onClick={() =>
                  s.calendarConnected
                    ? updateSettings({ calendarConnected: "" })
                    : updateSettings({ calendarConnected: "calendar.google.com/sarah-chen" })
                }
              >
                {s.calendarConnected ? "Disconnect" : "Connect"}
              </Button>
            </div>
            {s.calendarConnected && (
              <p className="text-xs text-success">Connected — sessions sync automatically.</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>UPI / bank for payouts</Label>
            <Input placeholder="sarah@okaxis" onChange={() => {}} onBlur={() => toast.success("Payout details saved")} />
          </div>
        </Card>

        {/* notifications */}
        <Card className="p-5">
          <h2 className="font-display text-base font-semibold">Notifications</h2>
          <div className="divide-y divide-border/60">
            {notif("messages", "Messages", "New mentee messages")}
            {notif("sessionReminders", "Session reminders", "24h and 1h before each session")}
            {notif("payoutAlerts", "Payout alerts", "When payouts are processed")}
            {notif("productUpdates", "Product updates", "New Fill-it-up features")}
          </div>
        </Card>
      </div>

      {/* danger */}
      <Card className="border-destructive/40 p-5">
        <h2 className="font-display text-base font-semibold text-destructive">Danger zone</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Sign out everywhere or reset this demo workspace to its seed state.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => toast.success("Signed out of all sessions (mocked)")}>
            Sign out everywhere
          </Button>
          <Button
            variant="outline"
            className="border-destructive/50 text-destructive hover:bg-destructive/10"
            onClick={() => { resetDemo(); toast.success("Demo data reset") }}
          >
            Reset demo data
          </Button>
        </div>
      </Card>
    </div>
  )
}
