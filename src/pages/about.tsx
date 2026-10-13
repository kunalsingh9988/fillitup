import { Eye, Lock, Medal, ShieldCheck, HeartHandshake } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Container, Section } from "@/components/container"
import { Seo } from "@/components/seo"
import { SectionHeading } from "@/components/marketing/section-heading"
import { CtaSection } from "@/components/marketing/cta-section"
import { NewsletterSection } from "@/components/marketing/newsletter"

const problems = [
  {
    title: "The Candidate Problem",
    points: [
      "Struggle to identify opportunities that truly fit their skills and goals",
      "Apply blindly and rarely receive meaningful feedback",
    ],
  },
  {
    title: "The Employer Problem",
    points: [
      "Drowning in application volume with no clear signal of fit",
      "Costly mis-hires from incomplete, subjective evaluation",
    ],
  },
]

const layers = [
  { name: "Hiring Intelligence", body: "Helping employers identify the right candidates faster." },
  { name: "Career Intelligence", body: "Helping professionals understand their strengths, opportunities, and growth paths." },
  { name: "Resume Intelligence", body: "Transforming static resumes into structured, actionable insights." },
  { name: "Market Intelligence", body: "Salary benchmarks, hiring trends, and workforce insights." },
  { name: "Interview Intelligence", body: "Data-driven evaluation and feedback throughout the interview process." },
]

const values = [
  { icon: Eye, name: "Transparency", body: "We believe trust starts with clarity. Every recommendation, score, and insight should be understandable and explainable." },
  { icon: Medal, name: "Results Through Merit", body: "Talent should be recognized through skills, achievements, and potential — not just keywords, credentials, or connections." },
  { icon: Lock, name: "User Privacy", body: "Your data belongs to you. We are committed to protecting privacy, maintaining transparency, and giving users full control." },
  { icon: ShieldCheck, name: "Skill-First Hiring", body: "We believe skills are the strongest predictor of success. Our platform helps organizations hire for capability, not assumptions." },
  { icon: HeartHandshake, name: "Technology for Good", body: "Artificial intelligence should empower people, reduce bias, and create better opportunities for employers and professionals alike." },
]

const sideStats = [
  { value: "5", label: "Intelligence Layers" },
  { value: "20+", label: "Platform Capabilities" },
  { value: "1", label: "Unified OS for Hiring" },
]

export default function AboutPage() {
  return (
    <>
      <Seo title="About Us" description="Fill-it-up is building the intelligence layer for the future of hiring — skill-first, transparent, and data-driven." />

      <div className="hero-glow dot-grid">
        <Container className="flex flex-col items-center pb-16 pt-20 text-center sm:pt-28">
          <Badge variant="default" className="mb-5">About Us</Badge>
          <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Building the Intelligence Layer for the Future of Hiring
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Fill-it-up is an AI-powered Hiring and Career Intelligence Platform designed to help organizations make better hiring decisions — and professionals make better career moves.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {sideStats.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1 px-4">
                <span className="font-mono text-3xl font-bold text-primary">{s.value}</span>
                <span className="text-[11px] text-muted-foreground sm:text-xs">{s.label}</span>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* why we started */}
      <Section>
        <Container>
          <Badge variant="outline" className="mb-4">Why We Started</Badge>
          <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            We believe there's a better way. <span className="text-muted-foreground">Hiring is broken.</span>
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Millions of professionals apply for jobs without receiving meaningful feedback. Employers spend countless hours reviewing resumes and conducting interviews with limited signal. Despite advances in technology, hiring remains one of the most inefficient and subjective processes in the world.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {problems.map((p) => (
              <Card key={p.title} className="p-6">
                <h3 className="text-base font-semibold text-foreground">{p.title}</h3>
                <ul className="mt-3 space-y-2">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex gap-2.5 text-sm text-muted-foreground">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-destructive" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
          <Card className="mt-5 border-primary/30 bg-primary/5 p-6">
            <p className="text-sm leading-relaxed text-foreground/90 sm:text-base">
              <span className="font-semibold text-primary">Fill-it-up was created to bridge this gap</span> — combining AI, hiring intelligence, career intelligence, and data-driven decisions to connect both sides with greater confidence, speed, and transparency.
            </p>
          </Card>
        </Container>
      </Section>

      {/* what we are building */}
      <Section className="bg-card/40">
        <Container>
          <Badge variant="outline" className="mb-4">What We Are Building</Badge>
          <h2 className="mb-10 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            One platform. Both sides of the hiring table.
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            <Card className="p-7">
              <h3 className="text-lg font-bold text-foreground">For Professionals</h3>
              <p className="mb-5 text-sm text-muted-foreground">Discover, prepare for, and accelerate your career.</p>
              <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {["AI-Powered Job Matching", "Resume Intelligence", "Career Readiness Scoring", "Interview Preparation", "Skill Gap Analysis", "Career Growth Insights"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-foreground/90">
                    <span className="size-1.5 rounded-full bg-primary" />{f}
                  </li>
                ))}
                <li className="text-[13px] text-muted-foreground">+ 4 more capabilities</li>
              </ul>
            </Card>
            <Card className="p-7">
              <h3 className="text-lg font-bold text-foreground">For Employers</h3>
              <p className="mb-5 text-sm text-muted-foreground">Hire smarter with end-to-end intelligence.</p>
              <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {["Applicant Tracking System (ATS)", "AI Candidate Ranking", "Interview Intelligence", "Hiring Analytics", "Talent Pool Search", "Workforce Intelligence"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-foreground/90">
                    <span className="size-1.5 rounded-full bg-primary" />{f}
                  </li>
                ))}
                <li className="text-[13px] text-muted-foreground">+ 4 more capabilities</li>
              </ul>
            </Card>
          </div>
        </Container>
      </Section>

      {/* technology */}
      <Section>
        <Container>
          <Badge variant="outline" className="mb-4">Our Technology</Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">A proprietary intelligence framework</h2>
          <p className="mb-10 mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Five intelligence layers working as one — creating a smarter, more transparent hiring ecosystem.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {layers.map((l, i) => (
              <Card key={l.name} className="flex flex-col gap-2 p-6">
                <span className="font-mono text-xs text-primary">L{i + 1}</span>
                <h3 className="text-[15px] font-semibold text-foreground">{l.name}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{l.body}</p>
              </Card>
            ))}
            <Card className="flex flex-col items-center justify-center gap-2 border-dashed p-6 text-center">
              <span className="font-mono text-3xl font-bold text-primary">+24%</span>
              <p className="text-sm text-muted-foreground">better placement outcomes vs. keyword matching</p>
            </Card>
          </div>
        </Container>
      </Section>

      {/* mission & vision */}
      <Section className="bg-card/40">
        <Container>
          <div className="grid gap-5 md:grid-cols-2">
            <Card className="p-7">
              <Badge variant="default" className="mb-4 w-fit">Our Mission</Badge>
              <blockquote className="text-xl font-semibold leading-snug text-foreground">
                "To make hiring skill-first, transparent, and data-driven."
              </blockquote>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Talent should be evaluated on capability, potential, and impact — not credentials or resume keywords. We empower organizations and professionals with intelligence they can act on.
              </p>
            </Card>
            <Card className="p-7">
              <Badge variant="indigo" className="mb-4 w-fit">Our Vision</Badge>
              <blockquote className="text-xl font-semibold leading-snug text-foreground">
                "To become the world's most trusted intelligence platform for hiring, career growth, and workforce decisions."
              </blockquote>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Every professional discovering meaningful opportunities. Every organization building exceptional teams through intelligent, data-driven hiring.
              </p>
            </Card>
          </div>
        </Container>
      </Section>

      {/* values */}
      <Section>
        <Container>
          <SectionHeading eyebrow="Our Core Values" title="The principles behind every line of code." className="mb-4" />
          <p className="mx-auto mb-12 max-w-md text-center font-display text-2xl font-bold tracking-[0.4em] text-primary">
            TRUST
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v) => (
              <Card key={v.name} className="flex flex-col gap-3 p-6">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <v.icon className="size-5" />
                </div>
                <h3 className="text-[15px] font-semibold text-foreground">{v.name}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{v.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* future */}
      <Section className="bg-card/40">
        <Container className="max-w-3xl text-center">
          <Badge variant="outline" className="mb-5">The Future of Fill-it-up</Badge>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            Today, we are building technology that helps professionals navigate their careers and helps employers hire with confidence.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Tomorrow — the operating system for careers, hiring, and workforce intelligence, connecting talent, opportunity, and insight on a global scale.
          </p>
          <Separator className="my-10" />
          <div className="space-y-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
            <p>The future of hiring is <span className="text-primary">intelligent</span>.</p>
            <p>The future of careers is <span className="text-primary">data-driven</span>.</p>
            <p>The future is <span className="text-gradient">Fill-it-up</span>.</p>
          </div>
        </Container>
      </Section>

      <CtaSection />
      <NewsletterSection />
    </>
  )
}
