// Daily keep-alive: one trivial DB read so the free-tier Supabase
// project never hits its 7-day inactivity auto-pause.
export default async function handler(_req: any, res: any) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    res.status(500).json({ ok: false, error: "Supabase env not configured" });
    return;
  }

  const r = await fetch(`${url}/rest/v1/jobs?select=id&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });

  res.status(r.ok ? 200 : 502).json({ ok: r.ok, status: r.status });
}
