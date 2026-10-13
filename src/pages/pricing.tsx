import { Fragment, useState } from "react"
import { Check, Minus, Sparkles } from "lucide-react"

import {
  comparisonTable,
  creditCosts,
  creditPacks,
  faqs,
  mentorServices,
  seekerTiers,
} from "@/lib/data"
import { cn, formatINR } from "@/lib/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Container, Section } from "@/components/container"
import { Seo } from "@/components/seo"
import { SectionHeading } from "@/components/marketing/section-heading"
import { CtaSection } from "@/components/marketing/cta-section"
import { NewsletterSection } from "@/components/marketing/newsletter"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

function CellValue({ v }: { v: string | boolean }) {
  if (v === true) return <Check className="size-4 text-success" aria-label="Included" />
  if (v === false) return <Minus className="size-4 text-muted-foreground/50" aria-label="Not included" />
  return <span className="text-[13px] text-foreground/90">{v}</span>
}

export default function PricingPage() {
  const [yearly, setYearly] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <Seo title="Pricing" description="Start free. Upgrade to Pro for ₹299/month. Pay only for the AI you actually use." />

      {/* hero */}
      <div className="hero-glow dot-grid">
        <Container className="flex flex-col items-center pb-14 pt-20 text-center sm:pt-28">
          <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Land your role. Control your spend.
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Start free. Upgrade to Pro for ₹299/month. Pay only for the AI you actually use — and set your own credit limits.
          </p>
          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
            <button
              onClick={() => setYearly(false)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-colors cursor-pointer",
                !yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              aria-pressed={!yearly}
            >
              Pay Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn(
                "flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors cursor-pointer",
                yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              aria-pressed={yearly}
            >
              Pay Yearly
              <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", yearly ? "bg-white/20" : "bg-success/15 text-success")}>
                Save 25%
              </span>
            </button>
          </div>
        </Container>
      </div>

      {/* tiers */}
      <Section className="pt-0">
        <Container>
          <div className="grid gap-5 md:grid-cols-3">
            {seekerTiers.map((tier) => {
              const monthly = yearly ? Math.round(tier.monthly * 0.75) : tier.monthly
              return (
                <Card
                  key={tier.name}
                  className={cn(
                    "relative flex flex-col p-7",
                    tier.popular && "border-primary/60 shadow-[0_0_40px_-8px_var(--glow)]"
                  )}
                >
                  {tier.popular && (
                    <Badge variant="solid" className="absolute -top-3 left-6 px-3">
                      Popular
                    </Badge>
                  )}
                  <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                  <p className="mt-1 min-h-10 text-sm text-muted-foreground">{tier.description}</p>
                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span className="font-mono text-4xl font-bold tracking-tight text-foreground">
                      {formatINR(monthly)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {tier.monthly === 0 ? "forever" : "/month"}
                    </span>
                  </div>
                  {yearly && tier.monthly > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Billed {formatINR(monthly * 12)}/year
                    </p>
                  )}
                  <ul className="mt-6 flex flex-col gap-2.5">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[13px] text-foreground/90">
                        <Check className="mt-0.5 size-4 shrink-0 text-success" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-7 w-full"
                    variant={tier.popular ? "default" : "outline"}
                    onClick={() => navigate("/signup")}
                  >
                    {tier.cta}
                  </Button>
                </Card>
              )
            })}
          </div>
        </Container>
      </Section>

      {/* comparison table */}
      <Section className="bg-card/40">
        <Container>
          <SectionHeading
            title="Compare plans"
            description="Every feature, every tier — no fine print."
            className="mb-10"
          />
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[40%]">Feature</TableHead>
                  <TableHead className="text-center">Free<span className="block font-mono text-[11px] font-normal normal-case">₹0</span></TableHead>
                  <TableHead className="text-center">Pro<span className="block font-mono text-[11px] font-normal normal-case">₹299/month</span></TableHead>
                  <TableHead className="text-center">Elite<span className="block font-mono text-[11px] font-normal normal-case">₹799/month</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonTable.map((group) => (
                  <Fragment key={group.group}>
                    <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                      <TableCell colSpan={4} className="py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {group.group}
                      </TableCell>
                    </TableRow>
                    {group.rows.map((row) => (
                      <TableRow key={row.feature}>
                        <TableCell className="text-[13px] text-foreground/90">{row.feature}</TableCell>
                        <TableCell className="text-center"><CellValue v={row.free} /></TableCell>
                        <TableCell className="text-center"><CellValue v={row.pro} /></TableCell>
                        <TableCell className="text-center"><CellValue v={row.elite} /></TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </Card>
        </Container>
      </Section>

      {/* mentorship services */}
      <Section>
        <Container>
          <SectionHeading
            title="Get expert help when you need it."
            description="Book career experts, resume reviewers, and interview mentors directly from Fill-it-up."
            className="mb-10"
          />
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="p-6">
              <h3 className="mb-4 text-base font-semibold text-foreground">Mentorship Services</h3>
              <ul className="divide-y divide-border">
                {mentorServices.map((s) => (
                  <li key={s.name} className="flex items-center justify-between py-3">
                    <span className="text-sm text-foreground/90">{s.name}</span>
                    <span className="font-mono text-[13px] text-muted-foreground">{s.price}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="mt-5" onClick={() => navigate("/signup")}>
                Browse Mentors
              </Button>
            </Card>
            <Card className="p-6">
              <h3 className="mb-4 text-base font-semibold text-foreground">Plan Benefits</h3>
              <ul className="space-y-3.5">
                {[
                  ["Browse Mentor Profiles", "All Plans"],
                  ["Session Discount", "Pro: 10% · Elite: 20%"],
                  ["Priority Booking", "Elite Only"],
                  ["Exclusive Mentor Access", "Elite Only"],
                ].map(([k, v]) => (
                  <li key={k} className="flex items-center justify-between text-sm">
                    <span className="text-foreground/90">{k}</span>
                    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{v}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 rounded-lg bg-secondary/60 p-4 text-xs leading-relaxed text-muted-foreground">
                Pro and Elite members get automatic discounts at checkout on every mentor session.
              </p>
            </Card>
          </div>
        </Container>
      </Section>

      {/* credits */}
      <Section className="bg-card/40">
        <Container>
          <SectionHeading
            title="How AI Credits Work"
            description="AI credits are used when candidates access premium AI-powered intelligence features such as resume parsing, job matching, interview feedback, and salary insights."
            className="mb-10"
          />
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="p-6">
              <ul className="divide-y divide-border">
                {creditCosts.map((c) => (
                  <li key={c.action} className="flex items-center justify-between py-3.5">
                    <span className="text-sm text-foreground/90">{c.action}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-xl font-bold text-primary">{c.credits}</span>
                      <span className="text-xs text-muted-foreground">{c.credits === 1 ? "Credit" : "Credits"}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
            <div>
              <h3 className="mb-2 text-xl font-bold text-foreground">Need more AI credits?</h3>
              <p className="mb-5 text-sm text-muted-foreground">Top up any time — credits never expire.</p>
              <div className="grid grid-cols-2 gap-4">
                {creditPacks.map((p) => (
                  <Card key={p.credits} className={cn("relative flex flex-col items-center gap-1 p-5 text-center", p.best && "border-primary/60")}>
                    {p.best && (
                      <Badge variant="solid" className="absolute -top-2.5 right-4 px-2 text-[10px]">
                        Best value
                      </Badge>
                    )}
                    <span className="font-mono text-2xl font-bold text-foreground">{p.credits.toLocaleString("en-IN")}</span>
                    <span className="text-[11px] text-muted-foreground">Credits</span>
                    <span className="mt-1 font-mono text-base text-foreground/90">{formatINR(p.price)}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 w-full"
                      onClick={() => toast.info("Sign in to buy credits", { description: "Credit top-ups are available inside the app." })}
                    >
                      Buy credits
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* employer teaser */}
      <Section>
        <Container>
          <Card className="flex flex-col items-start gap-4 overflow-hidden p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">For employers & mentors</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">Hiring or mentoring? Separate plans built for you.</h3>
              <p className="mt-1.5 max-w-lg text-sm text-muted-foreground">
                Employer plans are credits-based — pay for AI screening and job posts as you go. Mentor plans unlock the marketplace, bookings, and payouts.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/signup?role=employer")}>Employer plans</Button>
              <Button variant="secondary" onClick={() => navigate("/signup?role=mentor")}>Mentor plans</Button>
            </div>
          </Card>
        </Container>
      </Section>

      {/* faq */}
      <Section className="pt-0">
        <Container className="max-w-3xl">
          <SectionHeading title="Frequently asked questions" className="mb-8" />
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`q-${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Container>
      </Section>

      <CtaSection />
      <NewsletterSection />
    </>
  )
}
