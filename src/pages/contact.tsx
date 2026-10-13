import { useState } from "react"
import { Clock, Mail, MapPin, Send } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Container, Section } from "@/components/container"
import { Seo } from "@/components/seo"
import { NewsletterSection } from "@/components/marketing/newsletter"

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  subject: z.string().min(1, "Pick a subject"),
  message: z.string().min(10, "Tell us a bit more (10+ characters)"),
})

type Field = keyof z.infer<typeof schema>

const contactInfo = [
  { icon: Mail, label: "hello@fillitup.com", sub: "We respond within 24 hours" },
  { icon: MapPin, label: "San Francisco, CA", sub: "548 Market St, Suite 36000" },
  { icon: Clock, label: "Mon – Fri, 9am – 6pm PST", sub: "Weekend support via email" },
]

export default function ContactPage() {
  const [values, setValues] = useState({ name: "", email: "", subject: "", message: "" })
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [sent, setSent] = useState(false)

  const set = (f: Field, v: string) => setValues((s) => ({ ...s, [f]: v }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = schema.safeParse(values)
    if (!parsed.success) {
      const next: Partial<Record<Field, string>> = {}
      for (const issue of parsed.error.issues) {
        const f = issue.path[0] as Field
        if (!next[f]) next[f] = issue.message
      }
      setErrors(next)
      return
    }
    setErrors({})
    setSent(true)
    toast.success("Message sent", { description: "We respond within 24 hours." })
  }

  return (
    <>
      <Seo title="Contact" description="Have questions? We'd love to hear from you." />

      <div className="hero-glow dot-grid">
        <Container className="pb-14 pt-20 text-center sm:pt-28">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">Get in touch</h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Have questions? We'd love to hear from you.
          </p>
        </Container>
      </div>

      <Section className="pt-2">
        <Container className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <Card className="p-7 sm:p-9">
            {sent ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
                  <Send className="size-6" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Message sent</h2>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Thanks for reaching out — our team will get back to you within 24 hours.
                </p>
                <Button variant="outline" className="mt-3" onClick={() => { setSent(false); setValues({ name: "", email: "", subject: "", message: "" }) }}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="grid gap-5" noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={values.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} autoComplete="name" />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={values.email} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errors.email} autoComplete="email" />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={values.subject} onValueChange={(v) => set("subject", v)}>
                    <SelectTrigger id="subject" aria-invalid={!!errors.subject}>
                      <SelectValue placeholder="Choose a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General question</SelectItem>
                      <SelectItem value="seeker">Job seeker support</SelectItem>
                      <SelectItem value="employer">Employer / hiring</SelectItem>
                      <SelectItem value="mentor">Becoming a mentor</SelectItem>
                      <SelectItem value="press">Press & partnerships</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" rows={6} value={values.message} onChange={(e) => set("message", e.target.value)} aria-invalid={!!errors.message} />
                  {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                </div>
                <Button type="submit" size="lg" className="w-fit px-7">
                  <Send className="size-4" />
                  Send Message
                </Button>
              </form>
            )}
          </Card>

          <div className="flex flex-col gap-4">
            {contactInfo.map((c) => (
              <Card key={c.label} className="flex items-center gap-4 p-5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <c.icon className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{c.label}</p>
                  <p className="text-xs text-muted-foreground">{c.sub}</p>
                </div>
              </Card>
            ))}
            <Card className="border-primary/30 bg-primary/5 p-5">
              <p className="text-sm font-semibold text-foreground">Hiring?</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Employer plans are credits-based — start free, scale when you're ready.
              </p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => (window.location.href = "/pricing")}>
                See employer pricing
              </Button>
            </Card>
          </div>
        </Container>
      </Section>

      <NewsletterSection />
    </>
  )
}
