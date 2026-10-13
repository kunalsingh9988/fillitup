import { Outlet, useLocation } from "react-router-dom"
import { useEffect } from "react"

import { Footer } from "./footer"
import { TopNav } from "./top-nav"

export function PublicLayout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNav />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
