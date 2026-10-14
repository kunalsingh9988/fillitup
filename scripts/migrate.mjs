// Runs SQL files in supabase/migrations against the project database.
// Usage: node scripts/migrate.mjs
import { readFileSync, readdirSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import postgres from "postgres"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

// minimal .env loader (no dotenv dep)
for (const line of readFileSync(join(root, ".env"), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
}

const url = process.env.SUPABASE_DB_URL
if (!url) {
  console.error("SUPABASE_DB_URL missing in .env")
  process.exit(1)
}

const sql = postgres(url, { ssl: "require", prepare: false })

const files = readdirSync(join(root, "supabase/migrations"))
  .filter(f => f.endsWith(".sql"))
  .sort()

await sql`create table if not exists public._migrations (
  name text primary key,
  applied_at timestamptz not null default now()
)`

const done = new Set(
  (await sql`select name from public._migrations`).map(r => r.name)
)

for (const f of files) {
  if (done.has(f)) {
    console.log(`skip  ${f} (already applied)`)
    continue
  }
  const body = readFileSync(join(root, "supabase/migrations", f), "utf8")
  console.log(`apply ${f} ...`)
  try {
    await sql.unsafe(body)
    await sql`insert into public._migrations (name) values (${f})`
    console.log(`  ok`)
  } catch (e) {
    console.error(`  FAILED: ${e.message}`)
    await sql.end()
    process.exit(1)
  }
}

await sql.end()
console.log("migrations complete")
