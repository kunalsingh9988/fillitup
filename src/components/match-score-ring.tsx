import { cn } from "@/lib/utils"

interface MatchScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  className?: string
  showLabel?: boolean
}

function scoreColor(score: number) {
  if (score >= 85) return "var(--success)"
  if (score >= 70) return "var(--primary)"
  if (score >= 50) return "var(--warning)"
  return "var(--muted-foreground)"
}

export function MatchScoreRing({
  score,
  size = 56,
  strokeWidth = 5,
  className,
  showLabel = true,
}: MatchScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, score))
  const r = (size - strokeWidth) / 2
  const c = 2 * Math.PI * r
  const offset = c - (clamped / 100) * c
  const color = scoreColor(clamped)

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Match score ${clamped} out of 100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      {showLabel && (
        <span
          className="absolute font-mono font-semibold text-foreground"
          style={{ fontSize: size * 0.28 }}
        >
          {clamped}
        </span>
      )}
    </div>
  )
}
