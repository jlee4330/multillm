// Simple ping endpoint to verify Vercel serverless functions are deployed
// Responds with 200 and a small JSON payload.
export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.status(200).json({ ok: true, now: new Date().toISOString() })
}
