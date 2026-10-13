import { useEffect } from "react"

interface SeoProps {
  title: string
  description?: string
}

const SITE = "Fill-it-up"

export function Seo({ title, description }: SeoProps) {
  useEffect(() => {
    document.title = title === SITE ? `${SITE} — AI-Powered Job Matching` : `${title} — ${SITE}`
    if (description) {
      let el = document.querySelector('meta[name="description"]')
      if (!el) {
        el = document.createElement("meta")
        el.setAttribute("name", "description")
        document.head.appendChild(el)
      }
      el.setAttribute("content", description)
    }
  }, [title, description])

  return null
}
