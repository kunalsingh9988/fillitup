import { supabase } from "./supabase/client"

/* Typed client for the `ai` edge function.
   Every kind is validated server-side; these wrappers just shape the call. */

async function call<T>(kind: string, input: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke("ai", {
    body: { kind, input },
  })
  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)
  return data as T
}

export interface MatchScore {
  score: number
  aiSummary: string
  skillsMatched: [number, number]
  fitPoints: string[]
  gaps: string[]
  salaryContext: string
  resumeTips: string[]
  prepPoints: string[]
  growth: string
  teamSize: string
  reportsTo: string
}

export interface ResumeAnalysis {
  score: number
  summary: string
  strengths: string[]
  improvements: string[]
  enhancedBullets: string[]
  skillsFound: string[]
  missingSkills: string[]
}

export interface SalaryEstimate {
  p25: number
  median: number
  p75: number
  estimate: number
  factors: { label: string; impact: "+" | "-"; detail: string }[]
  benchmarks: { company: string; range: string }[]
}

export interface CareerPath {
  currentRole: string
  nextRole: string
  nextTimeline: string
  milestones: { role: string; yearsFromNow: number; salaryBand: string; requirements: string[] }[]
  learningPlan: { skill: string; why: string; resource: string }[]
}

export interface Compatibility {
  overall: number
  culture: number
  workStyle: number
  values: number
  growth: number
  teamFit: number
  explanations: Record<string, string>
}

export interface QuizQuestion {
  q: string
  options: string[]
  answer: number
}

export const ai = {
  matchScore: (jobId: string) => call<MatchScore>("match-score", { jobId }),
  analyzeResume: (resumeText: string, targetRole?: string) =>
    call<ResumeAnalysis>("resume-analyze", { resumeText, targetRole }),
  interviewQuestions: (category: string, topic: string) =>
    call<{ questions: { q: string; hint: string }[] }>("interview-prep", {
      mode: "questions", category, topic,
    }),
  scoreAnswer: (question: string, answer: string) =>
    call<{ score: number; feedback: string[]; strongPoints: string[]; improvements: string[] }>(
      "interview-prep", { mode: "score", question, answer }
    ),
  salaryOracle: (role: string, location: string, years: number, skills: string[]) =>
    call<SalaryEstimate>("salary-oracle", { role, location, years, skills }),
  careerPath: () => call<CareerPath>("career-path", {}),
  compatibility: (company: string) => call<Compatibility>("compatibility", { company }),
  skillQuiz: (skill: string) => call<{ questions: QuizQuestion[] }>("skill-quiz", { skill }),
}
