import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY

function getClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null
  return createClient(SUPABASE_URL, SUPABASE_KEY)
}

export default async function handler(req, res) {
  console.log('/api/submit handler invoked', { method: req.method })
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' })

  const supabase = getClient()
  if (!supabase) return res.status(500).json({ ok: false, error: 'Missing SUPABASE_URL / SUPABASE_KEY' })

  const payload = req.body || {}

  try {
    const { data, error } = await supabase
      .from('submissions')
      .insert([{ payload, receivedAt: new Date().toISOString() }])
      .select('id')
      .single()

    if (error) {
      console.error('Supabase insert error', error)
      return res.status(500).json({ ok: false, error: error.message || String(error) })
    }

    return res.json({ ok: true, id: data.id })
  } catch (err) {
    console.error('Unexpected error in /api/submit', err)
    return res.status(500).json({ ok: false, error: String(err) })
  }
}
