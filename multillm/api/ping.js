// Simple ping endpoint to verify Vercel serverless functions are deployed
// Responds with 200 and a small JSON payload.
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.statusCode = 200
  res.end(JSON.stringify({ ok: true, now: new Date().toISOString() }))
}
