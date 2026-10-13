import { Link } from "react-router-dom"
import { ArrowLeft, Construction, LogOut } from "lucide-react"

import { useAuth } from "@/lib/auth"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Seo } from "@/components/seo"

const roleLabel: Record<string, string> = {
  seeker: "Job Seeker",
  employer: "Employer",
  mentor: "Mentor",
}

export default function AppPlaceholder() {
  const { user, signOut } = useAuth()

  return (
    <div className="dot-grid flex min-h-screen flex-col bg-background">
      <Seo title="Dashboard" />
      <header className="flex h-16 items-center justify-between border-b border-border px-5 sm:px-8">
        <Logo />
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOut className="size-4" />
          Sign out
        </Button>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <Card className="hero-glow w-full max-w-lg p-10 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Construction className="size-7" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-foreground">
            {user ? `Welcome, ${user.name}` : "Welcome"}
          </h1>
          {user && (
            <Badge variant="default" className="mt-3">
              Signed in as {roleLabel[user.role] ?? user.role}
            </Badge>
          )}
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Your dashboard is under construction — it ships in the next build phase.
            Auth, role selection, and routing are live.
          </p>
          <div className="mt-7 flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft className="size-4" />
                Back to site
              </Link>
            </Button>
            <Button asChild>
              <Link to="/pricing">View plans</Link>
            </Button>
          </div>
        </Card>
      </main>
    </div>
  )
}
