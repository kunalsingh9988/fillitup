import { useState } from "react"
import { CheckCircle2, Send } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Section } from "@/components/container"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    if (!valid) {
      setError("Enter a valid email address")
      return
    }
    setError(null)
    setDone(true)
    toast.success("You're on the list", {
      description: "Weekly curated jobs, salary insights, and career tips.",
    })
  }

  return (
    <Section className="py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 rounded-2xl border border-border bg-card px-6 py-12 text-center sm:px-12">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Stay ahead of the market
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Weekly curated jobs, salary insights, and career tips.
        </p>
        {done ? (
          <div className="flex items-center gap-2 text-sm font-medium text-success">
            <CheckCircle2 className="size-4" />
            Subscribed — check your inbox soon.
          </div>
        ) : (
          <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row" noValidate>
            <div className="flex-1">
              <Input
                type="email"
                inputMode="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
                aria-invalid={!!error}
                className="h-11"
              />
              {error && <p className="mt-1.5 text-left text-xs text-destructive">{error}</p>}
            </div>
            <Button type="submit" className="h-11 px-5">
              <Send className="size-4" />
              Subscribe
            </Button>
          </form>
        )}
      </div>
    </Section>
  )
}
