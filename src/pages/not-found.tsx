import { Link } from "react-router-dom"

import { Seo } from "@/components/seo"
import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <>
      <Seo title="Page not found" />
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="font-mono text-6xl font-bold text-muted-foreground/40">404</p>
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="mt-2">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </>
  )
}
