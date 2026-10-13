import { useState } from "react"
import { Check, Copy, Gift, Users } from "lucide-react"
import { toast } from "sonner"

import { useSeeker } from "@/lib/seeker-store"
import { Seo } from "@/components/seo"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function ReferEarn() {
  const { state } = useSeeker()
  const [copied, setCopied] = useState(false)
  const link = "https://fillitup.app/r/alex-j"
  const earned = state.creditTxns.filter(t => t.kind === "earn").reduce((a, t) => a + t.amount, 0)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success("Link copied")
    } catch {
      toast.error("Copy failed", { description: link })
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Seo title="Refer & Earn" />
      <Card className="flex flex-col items-center gap-4 border-primary/20 bg-primary/5 p-8 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Gift className="size-8" />
        </span>
        <h1 className="font-display text-2xl font-bold">Share Fill-it-up</h1>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-primary">500 credits</span> per paid referral
        </p>
        <div className="flex w-full max-w-md gap-2">
          <Input value={link} readOnly className="font-mono text-xs" />
          <Button onClick={copy} variant="outline">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5 text-center">
          <p className="font-mono text-3xl font-bold text-primary">1</p>
          <p className="mt-1 text-xs text-muted-foreground">Referrals joined</p>
        </Card>
        <Card className="p-5 text-center">
          <p className="font-mono text-3xl font-bold text-success">{earned}</p>
          <p className="mt-1 text-xs text-muted-foreground">Credits earned</p>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold">
          <Users className="size-4 text-primary" /> How it works
        </h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Share your link — friends sign up free.</li>
          <li>When they upgrade to any paid plan, you get 500 credits.</li>
          <li>Credits power AI enhance, prep sessions, and verifications.</li>
        </ol>
      </Card>
    </div>
  )
}
