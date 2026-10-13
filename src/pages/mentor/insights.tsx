import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { insightsData } from "@/lib/mentor-data"
import { useMentor } from "@/lib/mentor-store"
import { Seo } from "@/components/seo"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const COLORS = ["#2479FF", "#4A3AFF", "#22B864", "#F5A524"]
const WEEK_LABELS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"]

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`

export default function MentorInsights() {
  const { state } = useMentor()
  const trend = insightsData.weeklyViews.map((v, i) => ({ week: WEEK_LABELS[i], views: v }))

  return (
    <div className="space-y-5">
      <Seo title="Insights" />
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Insights</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          How mentees discover and convert on your profile.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Profile views", value: insightsData.profileViews.toLocaleString(), sub: "Lifetime" },
          { label: "Plan visits", value: insightsData.planVisits.toLocaleString(), sub: "Lifetime" },
          { label: "Conversion", value: `${insightsData.conversion}%`, sub: "Views → subscribers" },
          { label: "Repeat mentees", value: `${insightsData.repeatMentees}%`, sub: "Renew >1 month" },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <p className="font-mono text-2xl font-semibold">{s.value}</p>
            <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
            <p className="text-[10px] text-muted-foreground/70">{s.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 font-display text-base font-semibold">Profile views (12 weeks)</h2>
          <div className="h-56">
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="miViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2479FF" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2479FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="views" stroke="#2479FF" fill="url(#miViews)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 font-display text-base font-semibold">Traffic sources</h2>
          <div className="flex items-center gap-6">
            <div className="h-44 w-44 shrink-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={insightsData.sources} dataKey="pct" nameKey="label" innerRadius={45} outerRadius={70} paddingAngle={3}>
                    {insightsData.sources.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 space-y-2 text-sm">
              {insightsData.sources.map((s, i) => (
                <li key={s.label} className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="flex-1 text-muted-foreground">{s.label}</span>
                  <span className="font-mono text-xs">{s.pct}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="mb-3 font-display text-base font-semibold">Plan performance</h2>
        <div className="space-y-4">
          {insightsData.planPerformance.map(p => {
            const maxViews = Math.max(...insightsData.planPerformance.map(x => x.views))
            const live = state.plans.find(x => x.name === p.plan)
            return (
              <div key={p.plan}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {p.plan}
                    {live && <span className="ml-2 text-xs text-muted-foreground">({live.menteeCount} active)</span>}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {p.views} views · {p.subs} subs · {inr(p.revenue)} total
                  </span>
                </div>
                <Progress value={(p.views / maxViews) * 100} className="h-2" />
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
