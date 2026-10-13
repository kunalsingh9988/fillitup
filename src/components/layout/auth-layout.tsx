import { Outlet } from "react-router-dom"
import { BadgeCheck, TrendingUp, Video } from "lucide-react"

import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

/**
 * Split-screen auth shell — marketing panel left (from the
 * figma "Login and signup" section), auth card right.
 */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* left panel */}
      <div className="relative hidden w-[46%] overflow-hidden lg:block">
        <img
          src="/assets/login-bg.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        />
        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <Logo />

          <div className="max-w-md">
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white xl:text-[2.75rem]">
              Your AI-powered career platform
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/70">
              Smart matching, resume optimization, and interview prep — all in one workflow.
            </p>
          </div>

          {/* floating product cards */}
          <div className="relative space-y-4">
            <Card className="glass w-64 border-white/10 bg-white/5 p-4 text-white backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/20 text-primary">
                  <Video className="size-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Interview Prep</p>
                  <p className="text-[11px] text-white/60">AI mock sessions</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full w-3/5 rounded-full bg-primary" />
                </div>
                <span className="font-mono text-[11px] text-white/70">3 of 5 completed</span>
              </div>
            </Card>

            <Card className="glass ml-auto w-64 border-white/10 bg-white/5 p-4 text-white backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-success/20 text-success">
                  <TrendingUp className="size-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Salary Insights</p>
                  <p className="font-mono text-sm text-white/80">$145k – $185k</p>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-white/60">Top 15% for your profile</p>
            </Card>

            <div className="flex items-center gap-2">
              <Badge className="border-white/10 bg-white/10 text-white">React</Badge>
              <Badge className="border-white/10 bg-white/10 text-white">TypeScript</Badge>
              <Badge className="border-white/10 bg-white/10 text-white">Node.js</Badge>
              <Badge className="border-success/30 bg-success/15 text-success">
                <BadgeCheck className="size-3" /> 94% Match
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* right panel */}
      <div className="relative flex flex-1 flex-col">
        <div className="flex items-center justify-between p-5 sm:p-8">
          <Logo className="lg:hidden" />
          <span className="hidden lg:block" />
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-14 sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
