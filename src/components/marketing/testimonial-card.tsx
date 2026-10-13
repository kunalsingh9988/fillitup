import type { Testimonial } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"

export function TestimonialCard({ t, className }: { t: Testimonial; className?: string }) {
  return (
    <Card className={cn("flex h-full flex-col justify-between gap-5 p-6", className)}>
      <p className="text-sm leading-relaxed text-foreground/90">"{t.quote}"</p>
      <div className="flex items-center gap-3">
        <Avatar className="size-9">
          <AvatarFallback className="bg-primary/15 text-primary">
            {t.initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-foreground">{t.name}</p>
          <p className="text-xs text-muted-foreground">{t.transition}</p>
        </div>
      </div>
    </Card>
  )
}
