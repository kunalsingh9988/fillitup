import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Section } from "@/components/container"

export function CtaSection() {
  return (
    <Section className="relative overflow-hidden py-20">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-full dark:opacity-100 opacity-0"
        aria-hidden="true"
      >
        <img
          src="/assets/blue-glow-wide.png"
          alt=""
          className="mx-auto h-full w-full max-w-5xl object-cover object-top opacity-60"
          loading="lazy"
        />
      </div>
      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6 px-5 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Ready to find work that actually fits?
        </h2>
        <p className="text-base text-muted-foreground">
          Join 40,000+ professionals who stopped guessing and started matching.
        </p>
        <Button asChild size="lg" className="px-8">
          <Link to="/signup">
            Get started free
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </Section>
  )
}
