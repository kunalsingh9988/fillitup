import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-display text-lg font-bold leading-none",
        className
      )}
      aria-hidden="true"
    >
      F
    </span>
  )
}

export function Logo({ className, to = "/" }: { className?: string; to?: string }) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-80",
        className
      )}
      aria-label="Fill-it-up home"
    >
      <LogoMark />
      <span>
        Fill-it-up
        <span className="text-primary">.</span>
      </span>
    </Link>
  )
}
