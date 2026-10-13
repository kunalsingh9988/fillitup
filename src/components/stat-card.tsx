import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

interface StatCardProps {
  label: string
  value: string
  sublabel?: string
  icon?: LucideIcon
  className?: string
}

export function StatCard({ label, value, sublabel, icon: Icon, className }: StatCardProps) {
  return (
    <Card className={cn("flex flex-col items-center gap-1 p-5 text-center", className)}>
      {Icon && <Icon className="mb-1 size-5 text-primary" />}
      <span className="font-mono text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </span>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {sublabel && <span className="text-[11px] text-muted-foreground/70">{sublabel}</span>}
    </Card>
  )
}
