import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY

function getClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null
  return createClient(SUPABASE_URL, SUPABASE_KEY)
}

export default async function handler(req, res) {
  console.log('/api/submissions handler invoked', { method: req.method })
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' })

  const supabase = getClient()
  if (!supabase) return res.status(500).json({ ok: false, error: 'Missing SUPABASE_URL / SUPABASE_KEY' })

  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('id, receivedAt, payload')
      .order('id', { ascending: true })

    if (error) {
      console.error('Supabase select error', error)
      return res.status(500).json({ ok: false, error: error.message || String(error) })
    }

    return res.json(data || [])
  } catch (err) {
    console.error('Unexpected error in /api/submissions', err)
    return res.status(500).json({ ok: false, error: String(err) })
  }
}
