import { Link } from "react-router-dom"
import { ArrowDownLeft, ArrowUpRight, Check, CreditCard, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { useSeeker } from "@/lib/seeker-store"
import { Seo } from "@/components/seo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const PLANS = [
  {
    name: "Free",
    price: "$0",
    current: false,
    features: ["3 job applications/mo", "Basic AI matching", "Community access"],
  },
  {
    name: "Pro",
    price: "$29",
    current: true,
    features: ["Unlimited applications", "AI resume enhance", "All AI Hub tools", "300 credits/mo", "Priority support"],
  },
  {
    name: "Pro+",
    price: "$59",
    current: false,
    features: ["Everything in Pro", "1 mentor session/mo", "600 credits/mo", "Featured profile"],
  },
]

export default function Billing() {
  const { state } = useSeeker()

  return (
    <div className="space-y-5">
      <Seo title="Plans & Credits" />
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Plans & Credits</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your subscription and AI credits
        </p>
      </div>

      {/* credits */}
      <Card className="flex flex-wrap items-center justify-between gap-4 border-primary/20 bg-primary/5 p-5">
        <div className="flex items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Sparkles className="size-6" />
          </span>
          <div>
            <p className="font-mono text-2xl font-bold">{state.credits}</p>
            <p className="text-xs text-muted-foreground">credits available</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => toast.success("Credits purchased (demo)")}>
          Buy credits
        </Button>
      </Card>

      {/* plans */}
      <div className="grid gap-4 sm:grid-cols-3">
        {PLANS.map(p => (
          <Card key={p.name} className={cn("p-5", p.current && "border-primary/40 bg-primary/5")}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold">{p.name}</h2>
              {p.current && <Badge className="bg-primary/15 text-primary hover:bg-primary/15">Current</Badge>}
            </div>
            <p className="mt-1 font-mono text-2xl font-bold">
              {p.price}<span className="text-xs font-normal text-muted-foreground">/mo</span>
            </p>
            <ul className="mt-3 space-y-1.5">
              {p.features.map(f => (
                <li key={f} className="flex gap-2 text-xs text-muted-foreground">
                  <Check className="size-3.5 shrink-0 text-success" /> {f}
                </li>
              ))}
            </ul>
            <Button
              className="mt-4 w-full"
              variant={p.current ? "outline" : "default"}
              disabled={p.current}
              onClick={() => toast.success("Plan change is a demo — no charge made")}
            >
              {p.current ? "Current plan" : `Upgrade to ${p.name}`}
            </Button>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* credit activity */}
        <Card className="p-5">
          <h2 className="mb-3 font-display text-base font-semibold">Credit activity</h2>
          <ul className="space-y-2.5">
            {state.creditTxns.map(t => (
              <li key={t.id} className="flex items-center gap-3 text-sm">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full",
                    t.kind === "earn" ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground"
                  )}
                >
                  {t.kind === "earn" ? <ArrowDownLeft className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
                </span>
                <span className="flex-1 truncate">{t.label}</span>
                <span className="text-xs text-muted-foreground">{t.date}</span>
                <span className={cn("font-mono text-xs", t.amount > 0 ? "text-success" : "text-muted-foreground")}>
                  {t.amount > 0 ? `+${t.amount}` : t.amount}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {/* invoices */}
        <Card className="p-5">
          <h2 className="mb-3 font-display text-base font-semibold">Invoices & payments</h2>
          <ul className="divide-y divide-border">
            {state.invoices.map(i => (
              <li key={i.id} className="flex items-center gap-3 py-3">
                <CreditCard className="size-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{i.plan}</p>
                  <p className="text-xs text-muted-foreground">{i.date}</p>
                </div>
                <span className="font-mono text-sm">{i.amount}</span>
                <Badge className="bg-success/15 text-[10px] text-success hover:bg-success/15">
                  {i.status}
                </Badge>
              </li>
            ))}
          </ul>
          <Button variant="ghost" size="sm" className="mt-3" asChild>
            <Link to="/pricing">Compare all plans</Link>
          </Button>
        </Card>
      </div>
    </div>
  )
}
