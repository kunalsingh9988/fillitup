import { Link } from "react-router-dom"
import { ArrowLeft, SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Seo } from "@/components/seo"

export default function NotFoundPage() {
  return (
    <div className="dot-grid flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <Seo title="Page not found" />
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <SearchX className="size-8" />
      </div>
      <h1 className="mt-6 font-mono text-5xl font-bold text-foreground">404</h1>
      <p className="mt-2 text-lg font-medium text-foreground">This page doesn't exist</p>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        The link may be broken, or the page may have moved. Let's get you back on track.
      </p>
      <Button asChild className="mt-7">
        <Link to="/">
          <ArrowLeft className="size-4" />
          Back to home
        </Link>
      </Button>
    </div>
  )
}
