import express from 'express'
import cors from 'cors'
import fsExtra from 'fs-extra'
const { writeJson, readJson, pathExists } = fsExtra
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

// Serve static admin UI from the project's public folder
app.use(express.static(path.join(__dirname, '..', 'public')))

const DB_FILE = path.join(__dirname, 'submissions.json')

// Ensure DB file exists
async function ensureDB() {
  const exists = await pathExists(DB_FILE)
  if (!exists) {
    await writeJson(DB_FILE, [])
  }
}

app.post('/api/submit', async (req, res) => {
  try {
    await ensureDB()
    const submissions = await readJson(DB_FILE)
    const item = {
      id: Date.now(),
      receivedAt: new Date().toISOString(),
      payload: req.body
    }
    submissions.push(item)
    await writeJson(DB_FILE, submissions, { spaces: 2 })
    res.json({ ok: true, id: item.id })
  } catch (err) {
    console.error('Failed to save submission', err)
    res.status(500).json({ ok: false, error: String(err) })
  }
})

app.get('/api/submissions', async (req, res) => {
  try {
    await ensureDB()
    const submissions = await readJson(DB_FILE)
    // Return the raw submissions array for the admin UI
    res.json(submissions)
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) })
  }
})

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
