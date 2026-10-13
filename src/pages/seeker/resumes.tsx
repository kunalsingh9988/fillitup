import { useRef, useState } from "react"
import { FileText, Pencil, Sparkles, Star, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"

import { useSeeker } from "@/lib/seeker-store"
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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

export default function Resumes() {
  const { state, addResume, setPrimaryResume, removeResume, enhanceResume, setStepDone } = useSeeker()
  const fileRef = useRef<HTMLInputElement>(null)
  const [enhanceFor, setEnhanceFor] = useState<{ id: string; name: string } | null>(null)
  const [company, setCompany] = useState("")

  const upload = (name: string, sizeKB: number) => {
    addResume({ name, updated: "just now", size: `${sizeKB} KB`, primary: state.resumes.length === 0, score: 55 })
    setStepDone("sc2", true)
    toast.success("Resume uploaded", { description: "AI is analyzing it now — score appears shortly." })
  }

  return (
    <div className="space-y-5">
      <Seo title="Resumes" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Resumes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage versions, set a primary, and enhance with AI per application
          </p>
        </div>
        <Button onClick={() => fileRef.current?.click()}>
          <Upload className="size-4" /> Upload resume
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={e => {
            const f = e.target.files?.[0]
            if (f) upload(f.name, Math.max(40, Math.round(f.size / 1024)))
            e.target.value = ""
          }}
        />
      </div>

      <div className="space-y-3">
        {state.resumes.map(r => (
          <Card key={r.id} className="flex flex-wrap items-center gap-4 p-4">
            <span className="flex size-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <FileText className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">{r.name}</p>
                {r.primary && (
                  <Badge className="bg-primary/15 text-[10px] text-primary hover:bg-primary/15">
                    Primary
                  </Badge>
                )}
                {r.enhancedFor && (
                  <Badge variant="secondary" className="text-[10px]">
                    Enhanced for {r.enhancedFor}
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Updated {r.updated} · {r.size}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">AI score</span>
                <Progress value={r.score} className="h-1.5 w-32" />
                <span className="font-mono text-xs text-primary">{r.score}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEnhanceFor({ id: r.id, name: r.name })}
              >
                <Sparkles className="size-4" /> Enhance
              </Button>
              {!r.primary && (
                <Button size="sm" variant="ghost" onClick={() => { setPrimaryResume(r.id); toast.success("Set as primary") }}>
                  <Star className="size-4" /> Set primary
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                aria-label="Delete resume"
                onClick={() => { removeResume(r.id); toast.success("Resume deleted") }}
              >
                <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-dashed p-6 text-center">
        <Pencil className="mx-auto size-6 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium">Tailor per application</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Enhancing costs 50 credits and adapts keywords + summary to the target job description.
        </p>
      </Card>

      <Dialog open={!!enhanceFor} onOpenChange={o => !o && setEnhanceFor(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Enhance with AI</DialogTitle>
            <DialogDescription>
              Tailor {enhanceFor?.name} for a specific company. −50 credits.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Target company</Label>
            <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Stripe" />
          </div>
          <Button
            className="w-full"
            disabled={!company.trim() || state.credits < 50}
            onClick={() => {
              if (!enhanceFor) return
              if (state.credits < 50) {
                toast.error("Not enough credits")
                return
              }
              enhanceResume(enhanceFor.id, company.trim())
              setEnhanceFor(null)
              setCompany("")
              toast.success("Resume enhanced", { description: "−50 credits · AI score improved" })
            }}
          >
            <Sparkles className="size-4" /> Enhance ({state.credits} credits available)
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
