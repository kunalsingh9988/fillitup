import { Link } from "react-router-dom"
import {
  ArrowRight,
  Bell,
  Crosshair,
  FileSearch,
  Map,
  MousePointerClick,
  ScanSearch,
  TrendingUp,
  Upload,
  UserCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Container, Section } from "@/components/container"
import { Seo } from "@/components/seo"
import { SectionHeading } from "@/components/marketing/section-heading"
import { MatchScoreRing } from "@/components/match-score-ring"
import { CtaSection } from "@/components/marketing/cta-section"
import { NewsletterSection } from "@/components/marketing/newsletter"

const steps = [
  {
    n: "01",
    icon: Upload,
    title: "Upload or describe",
    body: "Drop your resume or tell us what you're looking for in plain language. Our parser extracts skills, experience, seniority, and preferences into a structured profile — no forms, no re-typing.",
    points: ["PDF & DOCX up to 10MB", "Natural-language role descriptions", "Editable parsed profile"],
  },
  {
    n: "02",
    icon: ScanSearch,
    title: "AI matches in seconds",
    body: "We cross-reference 40+ signals — skills, level, domain, comp expectations, work style — against thousands of live roles and score every one for fit.",
    points: ["40+ matching signals", "Match score on every job", "Human-readable reasons, always"],
  },
  {
    n: "03",
    icon: UserCheck,
    title: "Review & apply",
    body: "Get a curated shortlist ranked by fit. Review the 'why you match' breakdown, then apply with one click — a tailored cover letter is generated from your profile.",
    points: ["Curated shortlist, not a firehose", "One-click apply", "Auto-tailored cover letters"],
  },
]

const capabilities = [
  { icon: Crosshair, title: "Precision Matching", body: "40+ signals cross-referenced against thousands of live roles in real time." },
  { icon: Bell, title: "Smart Alerts", body: "Passive mode pings you only when something exceptional matches your criteria." },
  { icon: MousePointerClick, title: "One-Click Apply", body: "Apply with a tailored cover letter auto-generated from your profile." },
  { icon: TrendingUp, title: "Salary Intelligence", body: "Real comp data from 10K+ offers so you negotiate from strength." },
  { icon: FileSearch, title: "Interview Prep", body: "Role-specific mock interviews with scored answers and improvement notes." },
  { icon: Map, title: "Career Path Mapping", body: "See where your skills can take you — and what to learn next." },
]

const audiences = [
  {
    label: "For Job Seekers",
    title: "Stop applying into the void.",
    body: "Every match shows you the score and the reasons. Know where you stand before you spend a minute applying.",
    cta: "Create free account",
    to: "/signup",
  },
  {
    label: "For Employers",
    title: "Shortlists you can defend.",
    body: "AI screening ranks applicants on skills and fit — with auditable explanations and a fairness-first design that ignores protected attributes.",
    cta: "Post a role",
    to: "/signup?role=employer",
  },
  {
    label: "For Mentors",
    title: "Turn expertise into income.",
    body: "Join the marketplace for resume reviews, mock interviews, and career coaching. Set your rate, set your hours.",
    cta: "Become a mentor",
    to: "/signup?role=mentor",
  },
]

export default function HowItWorksPage() {
  return (
    <>
      <Seo title="How It Works" description="Upload your resume, get AI-matched to roles in seconds, review and apply. Three steps — that's it." />

      <div className="hero-glow dot-grid">
        <Container className="flex flex-col items-center pb-16 pt-20 text-center sm:pt-28">
          <Badge variant="default" className="mb-5">How it works</Badge>
          <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Three steps. That's it.
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            From resume to offer with an engine that explains itself at every step.
          </p>
        </Container>
      </div>

      {/* steps detail */}
      <Section className="pt-4">
        <Container className="flex flex-col gap-6">
          {steps.map((s, i) => (
            <Card key={s.n} className="grid gap-6 p-7 sm:p-9 md:grid-cols-[auto_1fr_auto] md:items-center">
              <div className="flex items-center gap-4">
                <span className="font-mono text-5xl font-bold text-primary/25">{s.n}</span>
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="size-6" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{s.title}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {s.points.map((p) => (
                    <Badge key={p} variant="secondary">{p}</Badge>
                  ))}
                </div>
              </div>
              {i === 1 && <MatchScoreRing score={94} size={72} className="hidden md:block" />}
            </Card>
          ))}
        </Container>
      </Section>

      {/* capabilities */}
      <Section className="bg-card/40">
        <Container>
          <SectionHeading title="Everything else under the hood" className="mb-12" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((c) => (
              <Card key={c.title} className="flex flex-col gap-3 p-6">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <c.icon className="size-5" />
                </div>
                <h3 className="text-[15px] font-semibold text-foreground">{c.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* audiences */}
      <Section>
        <Container>
          <div className="grid gap-5 lg:grid-cols-3">
            {audiences.map((a) => (
              <Card key={a.label} className="flex flex-col p-7">
                <Badge variant="outline" className="w-fit">{a.label}</Badge>
                <h3 className="mt-4 text-lg font-bold text-foreground">{a.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{a.body}</p>
                <Button asChild variant="outline" className="mt-6 w-fit">
                  <Link to={a.to}>
                    {a.cta}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <CtaSection />
      <NewsletterSection />
    </>
  )
}
