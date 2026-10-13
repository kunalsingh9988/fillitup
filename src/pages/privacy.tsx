import { Container, Section } from "@/components/container"
import { Seo } from "@/components/seo"
import { Card } from "@/components/ui/card"

const sections = [
  {
    title: "Information We Collect",
    body: [
      "Account information — name, email address, phone number, and password when you register.",
      "Profile data — work history, skills, education, and preferences parsed from resumes you upload.",
      "Usage data — pages viewed, searches, applications, and feature interactions to improve matching.",
      "Device & log data — IP address, browser type, and timestamps for security and abuse prevention.",
    ],
  },
  {
    title: "How We Use Your Information",
    body: [
      "Power AI job matching — your parsed profile is cross-referenced against live roles to compute match scores.",
      "Deliver product features — resume feedback, salary benchmarks, interview prep, and mentor bookings.",
      "Communicate with you — job alerts, application updates, newsletters (opt-out any time).",
      "Keep the platform safe — fraud detection, abuse prevention, and security monitoring.",
    ],
  },
  {
    title: "Resume Data & Privacy",
    body: [
      "Resumes contain sensitive career information. Files are stored in private, access-controlled storage.",
      "Your resume is only shared with employers when you explicitly apply to a role.",
      "Signed, expiring URLs are used for any file access — nothing is publicly addressable.",
      "You can delete any resume at any time; deletion removes the file and its parsed representation.",
    ],
  },
  {
    title: "AI Processing",
    body: [
      "AI features run on structured data — every match score ships with human-readable reasons.",
      "We do not use protected attributes (age, gender, ethnicity, religion, disability status) in matching or ranking.",
      "Every AI operation is logged with an input hash and output for auditability.",
      "You may request a copy of the AI-derived data we hold about you.",
    ],
  },
  {
    title: "Sharing & Disclosure",
    body: [
      "Employers see your profile only after you apply or enable profile visibility.",
      "Mentors see only what you share when booking a session.",
      "We never sell personal data. Aggregated, de-identified insights may power market benchmarks.",
      "Service providers (hosting, email delivery, AI inference) process data under strict contracts.",
    ],
  },
  {
    title: "Your Rights & Controls",
    body: [
      "Access, correct, or export your data from Settings at any time.",
      "Delete your account — this removes your profile, resumes, and application history.",
      "Control visibility — public profile can be toggled off; passive-mode alerts can be paused.",
      "Cookie preferences can be managed in your browser or via our cookie settings.",
    ],
  },
  {
    title: "Data Retention & Security",
    body: [
      "We retain account data while your account is active; deleted data is purged within 30 days.",
      "Encryption in transit (TLS) and at rest. Row-level security isolates every user's data.",
      "In the event of a breach affecting your data, we will notify you within 72 hours.",
    ],
  },
  {
    title: "Contact",
    body: [
      "Privacy questions or requests: privacy@fillitup.com.",
      "Data Protection inquiries for GDPR/CCPA requests are answered within 30 days.",
    ],
  },
]

export default function PrivacyPage() {
  return (
    <>
      <Seo title="Privacy Policy" description="How Fill-it-up collects, uses, and protects your data." />
      <div className="hero-glow dot-grid">
        <Container className="pb-12 pt-20 text-center sm:pt-28">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">Privacy Policy</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: March 1, 2026</p>
        </Container>
      </div>
      <Section className="pt-4">
        <Container className="max-w-3xl">
          <Card className="divide-y divide-border p-0">
            {sections.map((s) => (
              <div key={s.title} className="p-6 sm:p-7">
                <h2 className="text-base font-semibold text-foreground">{s.title}</h2>
                <ul className="mt-3 space-y-2">
                  {s.body.map((p) => (
                    <li key={p.slice(0, 40)} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/60" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Card>
        </Container>
      </Section>
    </>
  )
}
