import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Bell,
  Crosshair,
  FileSearch,
  Map,
  Paperclip,
  Search,
  TrendingUp,
  MousePointerClick,
} from "lucide-react"
import { toast } from "sonner"

import { faqs, trendingJobs, testimonials } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Container, Section } from "@/components/container"
import { Seo } from "@/components/seo"
import { JobCard } from "@/components/marketing/job-card"
import { TestimonialCard } from "@/components/marketing/testimonial-card"
import { SectionHeading } from "@/components/marketing/section-heading"
import { CtaSection } from "@/components/marketing/cta-section"
import { NewsletterSection } from "@/components/marketing/newsletter"

const stats = [
  { value: "40K+", label: "Active roles" },
  { value: "93%", label: "Match accuracy" },
  { value: "2.4", label: "Days avg. to interview", suffix: " days" },
]

const steps = [
  {
    n: "01",
    title: "Upload or describe",
    body: "Drop your resume or tell us what you're looking for in plain language.",
  },
  {
    n: "02",
    title: "AI matches in seconds",
    body: "We parse your background and cross-reference thousands of live roles instantly.",
  },
  {
    n: "03",
    title: "Review & apply",
    body: "Get a curated shortlist ranked by fit. Apply with one click — we handle the rest.",
  },
]

const features = [
  {
    icon: FileSearch,
    title: "AI Resume Parsing",
    body: "Upload once. We extract skills, experience, and preferences — zero forms. Our AI reads between the lines, identifying transferable skills and career progression patterns.",
  },
  {
    icon: Crosshair,
    title: "Precision Matching",
    body: "40+ signals cross-referenced against thousands of live roles in real time. Every match ships with a score and the reasons behind it.",
  },
  {
    icon: MousePointerClick,
    title: "One-Click Apply",
    body: "Apply with a tailored cover letter auto-generated from your profile. Your data stays yours — always.",
  },
  {
    icon: TrendingUp,
    title: "Salary Intelligence",
    body: "Real comp data from 10K+ offers. Know your worth before the conversation ever starts.",
  },
  {
    icon: Map,
    title: "Career Trajectory",
    body: "See where your skills can take you with AI-powered career path mapping and skill-gap analysis.",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    body: "Passive mode — we only ping you when something exceptional matches. Set your criteria once and let our engine monitor thousands of new postings daily.",
  },
]

function HeroSearch() {
  const navigate = useNavigate()
  const [q, setQ] = useState("")

  return (
    <form
      className="mx-auto flex w-full max-w-2xl flex-col gap-3 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault()
        navigate("/signup")
      }}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g. Senior product designer, remote, at a Series B+ startup..."
          aria-label="Describe your ideal role"
          className="h-13 rounded-xl pl-11 pr-12 text-[15px] glass"
        />
        <button
          type="button"
          onClick={() =>
            toast.info("Resume upload starts after signup", {
              description: "Create a free account to upload your resume.",
            })
          }
          aria-label="Attach resume"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Paperclip className="size-4" />
        </button>
      </div>
      <Button type="submit" size="lg" className="h-13 rounded-xl px-7">
        Search jobs
      </Button>
    </form>
  )
}

export default function LandingPage() {
  return (
    <>
      <Seo title="Fill-it-up" description="AI-powered job matching that connects top talent with the right opportunities. Upload your resume and let our algorithms do the rest." />

      {/* hero */}
      <div className="hero-glow dot-grid relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 hidden dark:block" aria-hidden="true">
          <img src="/assets/blue-glow-top.jpg" alt="" className="mx-auto w-full max-w-5xl object-cover" />
        </div>
        <Container className="relative flex flex-col items-center pb-20 pt-24 text-center sm:pt-32">
          <Badge variant="default" className="animate-fade-up mb-6 px-3.5 py-1.5 text-xs">
            <span className="size-1.5 rounded-full bg-primary" />
            AI-Powered Job Matching
          </Badge>
          <h1 className="animate-fade-up max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-6xl [animation-delay:80ms]">
            Find work that actually fits you
          </h1>
          <p className="animate-fade-up mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg [animation-delay:160ms]">
            Upload your resume or describe your ideal role — AI does the rest.
          </p>
          <div className="animate-fade-up mt-9 w-full [animation-delay:240ms]">
            <HeroSearch />
          </div>
          <div className="animate-fade-up mt-12 grid w-full max-w-lg grid-cols-3 gap-3 [animation-delay:320ms]">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1">
                <span className="font-mono text-2xl font-semibold text-foreground sm:text-3xl">
                  {s.value}
                </span>
                <span className="text-[11px] text-muted-foreground sm:text-xs">{s.label}</span>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* trending opportunities */}
      <Section className="pt-8">
        <Container>
          <SectionHeading
            title="Trending opportunities"
            description="Live roles ranked by fit, freshness, and signal quality — updated hourly."
            className="mb-10"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trendingJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link to="/signup">Browse all jobs</Link>
            </Button>
          </div>
        </Container>
      </Section>

      {/* three steps */}
      <Section className="bg-card/40">
        <Container>
          <SectionHeading title="Three steps. That's it." className="mb-12" />
          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <Card key={s.n} className="relative overflow-hidden p-6">
                <span className="font-mono text-4xl font-bold text-primary/25">{s.n}</span>
                <h3 className="mt-3 text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* features */}
      <Section>
        <Container>
          <SectionHeading
            title="Built different"
            description="Not another job board. An intelligence layer that reads both sides of the market."
            className="mb-12"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="group flex flex-col gap-3 p-6 transition-colors hover:border-primary/40">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <f.icon className="size-5" />
                </div>
                <h3 className="text-[15px] font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* testimonials */}
      <Section className="bg-card/40">
        <Container>
          <SectionHeading title="Hear it from them" className="mb-12" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <TestimonialCard key={t.name} t={t} />
            ))}
          </div>
        </Container>
      </Section>

      {/* faq */}
      <Section>
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
