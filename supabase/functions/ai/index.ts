// Fill-it-up AI edge function — routes all Gemini-powered features.
// POST /functions/v1/ai  { kind, input }  (Authorization: Bearer <user jwt>)
// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2"

// newest-first; each is tried in turn on 404 (not enabled for this key)
// or 429/5xx (rate limit / saturation). Free-tier models throttle often.
const MODELS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
]
const GEMINI_URL = (m: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  })

async function gemini(prompt: string, key: string): Promise<string> {
  let lastErr = "all models failed"
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(`${GEMINI_URL(model)}?key=${key}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(20_000),   // never let one model stall the fn
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.4, responseMimeType: "application/json" },
          }),
        })
        if (!res.ok) {
          lastErr = `${model} ${res.status}`
          if (res.status === 404 || res.status >= 500) break // try next model
          if (res.status === 429 && attempt === 0) {
            await new Promise(r => setTimeout(r, 800))
            continue // one retry on rate limit
          }
          break
        }
        const data = await res.json()
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
        if (text) return text
        lastErr = `${model} empty`
        break
      } catch (e) {
        lastErr = `${model} ${e}`
        break
      }
    }
  }
  throw new Error(`Gemini ${lastErr}`)
}

async function geminiJson<T>(prompt: string, key: string, fallback: T): Promise<T> {
  try {
    const text = await gemini(prompt, key)
    return JSON.parse(text.replace(/```json|```/g, "").trim()) as T
  } catch {
    return fallback
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  if (req.method !== "POST") return json({ error: "POST only" }, 405)

  const authHeader = req.headers.get("Authorization")
  if (!authHeader) return json({ error: "Missing Authorization header" }, 401)

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  )
  const service = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return json({ error: "Unauthorized" }, 401)

  const { kind, input } = await req.json().catch(() => ({}))
  const key = Deno.env.get("GEMINI_API_KEY")
  if (!key) return json({ error: "GEMINI_API_KEY not configured" }, 500)

  switch (kind) {
    /* ---- match score: job ↔ seeker profile ---- */
    case "match-score": {
      const { jobId } = input ?? {}
      if (!jobId) return json({ error: "jobId required" }, 400)

      const [{ data: job }, { data: sp }, { data: profile }] = await Promise.all([
        service.from("jobs").select("*, companies(name)").eq("id", jobId).single(),
        service.from("seeker_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        service.from("profiles").select("full_name").eq("id", user.id).single(),
      ])
      if (!job) return json({ error: "Job not found" }, 404)

      const out = await geminiJson(
        `You are an AI job-matching engine. Score this candidate against this job.

CANDIDATE
Name: ${profile?.full_name}
Title: ${sp?.title ?? ""}
Skills: ${(sp?.skills ?? []).join(", ")}
About: ${(sp?.about ?? "").slice(0, 600)}

JOB
Title: ${job.title} at ${job.companies?.name}
Requirements: ${(job.requirements ?? []).join("; ")}
Skills: ${(job.skills ?? []).join(", ")}
Description: ${(job.description ?? "").slice(0, 800)}

Return ONLY JSON:
{"score":<0-100>,"aiSummary":"<2 sentences>","skillsMatched":[<n_matched>,<n_listed>],"fitPoints":["<point>",...3],"gaps":["<gap>",...2],"salaryContext":"<1 sentence>","resumeTips":["<tip>",...3],"prepPoints":["<point>",...3],"growth":"<1 sentence>","teamSize":"<estimate>","reportsTo":"<role>"}`,
        key,
        { score: 50, aiSummary: "", skillsMatched: [0, (job.skills ?? []).length], fitPoints: [], gaps: [], salaryContext: "", resumeTips: [], prepPoints: [], growth: "", teamSize: "", reportsTo: "" }
      )

      const { aiSummary, skillsMatched, fitPoints, gaps, salaryContext, resumeTips, prepPoints, growth, teamSize, reportsTo } = out as any
      const score = Math.max(0, Math.min(100, Math.round((out as any).score ?? 50)))
      await service.from("match_scores").upsert(
        { seeker_id: user.id, job_id: jobId, score,
          breakdown: { aiSummary, skillsMatched, fitPoints, gaps, salaryContext, resumeTips, prepPoints, growth, teamSize, reportsTo },
          computed_at: new Date().toISOString() },
        { onConflict: "seeker_id,job_id" }
      )
      return json({ score, ...((out as any) ?? {}) })
    }

    /* ---- resume analysis / enhancement ---- */
    case "resume-analyze": {
      const { resumeText, targetRole } = input ?? {}
      if (!resumeText) return json({ error: "resumeText required" }, 400)
      const out = await geminiJson(
        `Analyze this resume${targetRole ? ` for a ${targetRole} role` : ""}. Return ONLY JSON:
{"score":<0-100>,"summary":"<2 sentences>","strengths":["..."],"improvements":["..."],"enhancedBullets":["<rewritten bullet>",...5],"skillsFound":["..."],"missingSkills":["..."]}

RESUME:
${String(resumeText).slice(0, 12000)}`,
        key,
        { score: 60, summary: "", strengths: [], improvements: [], enhancedBullets: [], skillsFound: [], missingSkills: [] }
      )
      await service.from("ai_results").insert({ user_id: user.id, kind: "resume-analyze", input, output: out })
      return json(out)
    }

    /* ---- interview prep ---- */
    case "interview-prep": {
      const { mode, category, topic, question, answer } = input ?? {}
      if (mode === "questions") {
        const out = await geminiJson(
          `Generate 5 ${category ?? "behavioral"} interview questions for a ${topic ?? "software engineer"} role. Return ONLY JSON: {"questions":[{"q":"...","hint":"..."}]}`,
          key, { questions: [] }
        )
        await service.from("ai_results").insert({ user_id: user.id, kind: "interview-questions", input, output: out })
        return json(out)
      }
      const out = await geminiJson(
        `Score this interview answer 0-100. Question: "${question}" Answer: "${answer}". Return ONLY JSON: {"score":<n>,"feedback":["<point>",...3],"strongPoints":["..."],"improvements":["..."]}`,
        key, { score: 50, feedback: [], strongPoints: [], improvements: [] }
      )
      return json(out)
    }

    /* ---- salary oracle ---- */
    case "salary-oracle": {
      const { role, location, years, skills } = input ?? {}
      const out = await geminiJson(
        `Estimate market salary for ${role} in ${location ?? "India"}, ${years ?? 0} years exp, skills: ${(skills ?? []).join(", ")}. Currency INR.
Return ONLY JSON:
{"p25":<annual>,"median":<annual>,"p75":<annual>,"estimate":<annual>,"factors":[{"label":"...","impact":"+"|"-","detail":"..."}],"benchmarks":[{"company":"...","range":"..."}]}`,
        key, { p25: 0, median: 0, p75: 0, estimate: 0, factors: [], benchmarks: [] }
      )
      await service.from("ai_results").insert({ user_id: user.id, kind: "salary-oracle", input, output: out })
      return json(out)
    }

    /* ---- career path ---- */
    case "career-path": {
      const { data: sp } = await service.from("seeker_profiles").select("*").eq("user_id", user.id).maybeSingle()
      const out = await geminiJson(
        `Build a career path for a ${sp?.title ?? "professional"} with skills: ${(sp?.skills ?? []).join(", ")}. Return ONLY JSON:
{"currentRole":"...","nextRole":"...","nextTimeline":"...","milestones":[{"role":"...","yearsFromNow":<n>,"salaryBand":"...","requirements":["..."]}],"learningPlan":[{"skill":"...","why":"...","resource":"..."}]}`,
        key, { currentRole: "", nextRole: "", nextTimeline: "", milestones: [], learningPlan: [] }
      )
      await service.from("ai_results").insert({ user_id: user.id, kind: "career-path", input, output: out })
      return json(out)
    }

    /* ---- compatibility index ---- */
    case "compatibility": {
      const { company } = input ?? {}
      const { data: sp } = await service.from("seeker_profiles").select("*").eq("user_id", user.id).maybeSingle()
      const out = await geminiJson(
        `Rate fit between this candidate and ${company} (0-100 each): culture, workStyle, values, growth, teamFit. Candidate: ${sp?.title}, skills ${(sp?.skills ?? []).join(", ")}, about: ${(sp?.about ?? "").slice(0, 400)}.
Return ONLY JSON: {"overall":<n>,"culture":<n>,"workStyle":<n>,"values":<n>,"growth":<n>,"teamFit":<n>,"explanations":{"culture":"...","workStyle":"...","values":"...","growth":"...","teamFit":"..."}}`,
        key, { overall: 0, culture: 0, workStyle: 0, values: 0, growth: 0, teamFit: 0, explanations: {} }
      )
      await service.from("ai_results").insert({ user_id: user.id, kind: "compatibility", input, output: out })
      return json(out)
    }

    /* ---- skill verification quiz ---- */
    case "skill-quiz": {
      const { skill } = input ?? {}
      const out = await geminiJson(
        `Write 8 multiple-choice questions testing ${skill} proficiency (mixed difficulty). Return ONLY JSON: {"questions":[{"q":"...","options":["a","b","c","d"],"answer":<0-3>}]}`,
        key, { questions: [] }
      )
      return json(out)
    }

    default:
      return json({ error: `Unknown kind: ${kind}` }, 400)
  }
})
