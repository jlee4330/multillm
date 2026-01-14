#!/usr/bin/env node
/*
  Simple migration script: reads server/submissions.json and inserts rows into
  the Supabase `submissions` table. Run locally with environment variables:

  export SUPABASE_URL="https://<project>.supabase.co"
  export SUPABASE_KEY="<service_role_key>"
  node db/migrate_submissions_to_supabase.js

  Warning: use a Service Role Key for server-side inserts. Do NOT commit keys.
*/

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const dbPath = path.join(process.cwd(), 'server', 'submissions.json')
if (!fs.existsSync(dbPath)) {
  console.error('No server/submissions.json file found at', dbPath)
  process.exit(1)
}

const raw = fs.readFileSync(dbPath, 'utf8')
let entries
try {
  entries = JSON.parse(raw)
} catch (err) {
  console.error('Failed to parse submissions.json', err)
  process.exit(1)
}

async function run() {
  if (!Array.isArray(entries) || entries.length === 0) {
    console.log('No entries to migrate.')
    return
  }

  // Prepare rows for insert: columns { receivedAt, payload }
  const rows = entries.map(e => ({ receivedAt: e.receivedAt || new Date().toISOString(), payload: e.payload || {} }))

  console.log(`Uploading ${rows.length} rows to Supabase...`)
  const chunkSize = 100
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize)
    const { data, error } = await supabase.from('submissions').insert(chunk)
    if (error) {
      console.error('Insert error:', error)
      process.exit(1)
    }
    console.log(`Inserted ${chunk.length} rows`)
  }

  console.log('Migration complete.')
}

run().catch(err => { console.error(err); process.exit(1) })
