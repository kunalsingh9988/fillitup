import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { cn } from "@/lib/utils"
import { useMentor } from "@/lib/mentor-store"
import { monthlyRevenue } from "@/lib/mentor-data"
import { Seo } from "@/components/seo"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`

export default function MentorEarnings() {
  const { state } = useMentor()
  const month = monthlyRevenue[monthlyRevenue.length - 1].amount
  const prev = monthlyRevenue[monthlyRevenue.length - 2].amount
  const growth = Math.round(((month - prev) / prev) * 100)
  const lifetime = monthlyRevenue.reduce((a, m) => a + m.amount, 0) + 184000
  const next = state.payouts.find(p => p.status === "pending")

  return (
    <div className="space-y-5">
      <Seo title="Earnings" />
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Earnings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Subscription revenue and payout history.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "This month", value: inr(month), sub: `${growth > 0 ? "+" : ""}${growth}% vs ${monthlyRevenue[monthlyRevenue.length - 2].month}` },
          { label: "Lifetime", value: inr(lifetime), sub: "Since Jan 2025" },
          { label: "Active mentees", value: String(state.mentees.length), sub: "Subscribed" },
          { label: "Next payout", value: next ? inr(next.amount) : "₹56,000", sub: next ? next.date : "Apr 15, 2026" },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <p className="font-mono text-2xl font-semibold">{s.value}</p>
            <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
            <p className="text-[10px] text-muted-foreground/70">{s.sub}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h2 className="mb-3 font-display text-base font-semibold">Revenue trend</h2>
        <div className="h-56">
          <ResponsiveContainer>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `₹${Math.round(v / 1000)}k`}
              />
              <Tooltip
                formatter={v => inr(Number(v))}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="amount" fill="#2479FF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 font-display text-base font-semibold">Payout history</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="pb-3 font-medium">Subscription</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {state.payouts.map(p => (
                <tr key={p.id} className="border-b border-border/60 last:border-0">
                  <td className="py-3 font-medium">{p.label}</td>
                  <td className="py-3 text-muted-foreground">{p.date}</td>
                  <td className="py-3">
                    <Badge
                      className={cn(
                        "text-[10px]",
                        p.status === "paid"
                          ? "bg-success/15 text-success hover:bg-success/15"
                          : "bg-warning/15 text-warning hover:bg-warning/15"
                      )}
                    >
                      {p.status === "paid" ? "Paid" : "Pending"}
                    </Badge>
                  </td>
                  <td className="py-3 text-right font-mono">{inr(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
