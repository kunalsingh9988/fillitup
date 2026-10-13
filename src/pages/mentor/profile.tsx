import { useState } from "react"
import { IndianRupee, Plus, X } from "lucide-react"
import { toast } from "sonner"

import { useMentor } from "@/lib/mentor-store"
import { Seo } from "@/components/seo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const LANGS = ["English", "Hindi", "Mandarin", "Spanish", "French", "German"]

export default function MentorPublicProfile() {
  const { state, updateProfile } = useMentor()
  const p = state.profile
  const [skill, setSkill] = useState("")

  return (
    <div className="space-y-5">
      <Seo title="Public Profile" />
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Public profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          What mentees see when they browse mentors.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4 p-5">
          <h2 className="font-display text-base font-semibold">Identity</h2>
          <div className="flex items-center gap-4">
            <span className="flex size-16 items-center justify-center rounded-full bg-primary/15 font-display text-xl font-bold text-primary">
              {p.initials}
            </span>
            <Button variant="outline" size="sm" onClick={() => toast.success("Photo upload is mocked")}>
              Change photo
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mp-name">Display name</Label>
            <Input
              id="mp-name"
              value={p.name}
              onChange={e => updateProfile({ name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mp-headline">Headline</Label>
            <Input
              id="mp-headline"
              value={p.headline}
              onChange={e => updateProfile({ headline: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mp-bio">Bio</Label>
            <Textarea
              id="mp-bio"
              rows={5}
              value={p.bio}
              onChange={e => updateProfile({ bio: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mp-company">Company</Label>
            <Input
              id="mp-company"
              value={p.company}
              onChange={e => updateProfile({ company: e.target.value })}
            />
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-4 p-5">
            <h2 className="font-display text-base font-semibold">Expertise</h2>
            <div className="flex flex-wrap gap-1.5">
              {p.expertise.map(x => (
                <Badge key={x} variant="secondary" className="gap-1">
                  {x}
                  <button
                    onClick={() => updateProfile({ expertise: p.expertise.filter(e => e !== x) })}
                    aria-label={`Remove ${x}`}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={skill}
                onChange={e => setSkill(e.target.value)}
                placeholder="Add expertise"
                onKeyDown={e => {
                  if (e.key === "Enter" && skill.trim()) {
                    updateProfile({ expertise: [...p.expertise, skill.trim()] })
                    setSkill("")
                  }
                }}
              />
              <Button
                variant="outline"
                size="icon"
                disabled={!skill.trim()}
                onClick={() => { updateProfile({ expertise: [...p.expertise, skill.trim()] }); setSkill("") }}
                aria-label="Add expertise"
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <h2 className="font-display text-base font-semibold">Rates & preferences</h2>
            <div className="space-y-1.5">
              <Label htmlFor="mp-rate">Session rate (₹/hour)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="mp-rate"
                  type="number"
                  value={p.hourlyRate}
                  onChange={e => updateProfile({ hourlyRate: Number(e.target.value) || 0 })}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Languages</Label>
              <div className="flex flex-wrap gap-1.5">
                {LANGS.map(l => {
                  const on = p.languages.includes(l)
                  return (
                    <button
                      key={l}
                      onClick={() =>
                        updateProfile({
                          languages: on ? p.languages.filter(x => x !== l) : [...p.languages, l],
                        })
                      }
                      className={
                        on
                          ? "rounded-full border border-primary/50 bg-primary/10 px-3 py-1 text-xs text-primary"
                          : "rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                      }
                    >
                      {l}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mp-tz">Timezone</Label>
              <Input
                id="mp-tz"
                value={p.timezone}
                onChange={e => updateProfile({ timezone: e.target.value })}
              />
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <h2 className="font-display text-base font-semibold">Links</h2>
            <div className="space-y-1.5">
              <Label htmlFor="mp-li">LinkedIn</Label>
              <Input
                id="mp-li"
                value={p.linkedin}
                onChange={e => updateProfile({ linkedin: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mp-web">Website</Label>
              <Input
                id="mp-web"
                value={p.website}
                onChange={e => updateProfile({ website: e.target.value })}
              />
            </div>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => toast.success("Profile saved", { description: "Your public page is updated." })}>
          Save changes
        </Button>
      </div>
    </div>
  )
}
