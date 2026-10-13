import { Container, Section } from "@/components/container"
import { Seo } from "@/components/seo"
import { Card } from "@/components/ui/card"

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By creating an account or using Fill-it-up, you agree to these Terms of Service and our Privacy Policy. If you do not agree, do not use the platform. You must be at least 18 years old and capable of forming a binding contract.",
  },
  {
    title: "2. The Service",
    body: "Fill-it-up is an AI-powered job matching and career intelligence platform. We provide job matching, resume analysis, interview preparation, salary benchmarks, a mentor marketplace, and employer hiring tools. AI-generated content — including match scores, resume suggestions, and salary estimates — is informational and does not guarantee employment outcomes.",
  },
  {
    title: "3. Accounts & Roles",
    body: "You choose a role at signup: Job Seeker, Employer, or Mentor. You are responsible for the accuracy of your information, the security of your credentials, and all activity under your account. One account per person; companies may have multiple seats under one organization.",
  },
  {
    title: "4. Credits, Plans & Billing",
    body: "Certain features consume AI credits. Credits are allocated monthly per plan or purchased as top-ups; purchased credits never expire. Subscriptions renew automatically until cancelled. Prices are listed in INR and inclusive of applicable taxes unless stated otherwise. Refunds are handled per our refund policy for unused subscriptions.",
  },
  {
    title: "5. Acceptable Use",
    body: "You agree not to: scrape or bulk-extract job or candidate data; misrepresent your identity, credentials, or company; use the platform to discriminate against protected classes; probe or circumvent security controls; or upload malicious content. Employers must use AI screening results as decision support — not as the sole basis for adverse hiring decisions.",
  },
  {
    title: "6. Content & Your Data",
    body: "You retain ownership of your resumes, profile data, and content. You grant Fill-it-up a limited license to process that content to operate the service (parsing, matching, display to parties you authorize). Employers own their job postings; you grant us license to distribute them to matched candidates.",
  },
  {
    title: "7. Mentor Marketplace",
    body: "Mentors are independent contractors, not employees. Fill-it-up facilitates booking, payment processing, and reviews. Sessions are delivered by the mentor; disputes between mentor and mentee should first be raised through our resolution flow. Payouts follow the mentor payout schedule after session completion.",
  },
  {
    title: "8. Intellectual Property",
    body: "The Fill-it-up platform, brand, algorithms, and design are our property. Match explanations, generated cover letters, and analysis outputs generated for you may be used freely for your job search but not resold or republished as a competing service.",
  },
  {
    title: "9. Disclaimers & Liability",
    body: "The service is provided 'as is.' We do not warrant that matching will result in interviews or offers. To the maximum extent permitted by law, Fill-it-up is not liable for indirect, incidental, or consequential damages, or for decisions made by employers or candidates using the platform.",
  },
  {
    title: "10. Termination",
    body: "You may close your account at any time from Settings. We may suspend accounts that violate these terms. On termination, your data is handled per the Privacy Policy — deletable on request.",
  },
  {
    title: "11. Changes",
    body: "We may update these terms; material changes will be announced by email or in-app notice at least 14 days before taking effect. Continued use after the effective date constitutes acceptance.",
  },
  {
    title: "12. Contact",
    body: "Questions about these terms: legal@fillitup.com — Fill-it-up, 548 Market St, Suite 36000, San Francisco, CA.",
  },
]

export default function TermsPage() {
  return (
    <>
      <Seo title="Terms of Service" description="The terms governing your use of Fill-it-up." />
      <div className="hero-glow dot-grid">
        <Container className="pb-12 pt-20 text-center sm:pt-28">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">Terms of Service</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: March 1, 2026</p>
        </Container>
      </div>
      <Section className="pt-4">
        <Container className="max-w-3xl">
          <Card className="divide-y divide-border p-0">
            {sections.map((s) => (
              <div key={s.title} className="p-6 sm:p-7">
                <h2 className="text-base font-semibold text-foreground">{s.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </Card>
        </Container>
      </Section>
    </>
  )
}
