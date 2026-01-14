const statusEl = document.getElementById('status');
const listEl = document.getElementById('list');
const filterInput = document.getElementById('filterInput');
const refreshBtn = document.getElementById('refreshBtn');
const exportBtn = document.getElementById('exportBtn');

// If the admin page is served on localhost and not on the backend port (4000),
// point requests to the backend at http://localhost:4000. Otherwise use same-origin.
const API_BASE = (location.hostname === 'localhost' && location.port && location.port !== '4000') ? 'http://localhost:4000' : ''

// Fallback Supabase info (publishable key) — provided for immediate admin read access.
// Note: publishable/anon keys are safe for read-only client usage; do NOT use service_role key here.
const SUPABASE_URL = 'https://cmmilcmoozhnbgmyooug.supabase.co'
const SUPABASE_KEY = 'sb_publishable_lOqiyJNJB3YD0EBJLHME2w_Lfyeigp8'

async function fetchFromApi() {
  const url = `${API_BASE}/api/submissions` || '/api/submissions'
  const res = await fetch(url, { headers: { 'Accept': 'application/json' }, cache: 'no-store' })
  if (!res.ok) throw new Error(`API fetch failed: ${res.status}`)
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

async function fetchFromSupabase() {
  const url = `${SUPABASE_URL}/rest/v1/submissions?select=id,receivedAt,payload`;
  const supRes = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: 'application/json'
    },
    cache: 'no-store'
  });
  if (!supRes.ok) {
    throw new Error(`Supabase fetch failed: ${supRes.status} ${await supRes.text().catch(()=> '')}`)
  }
  const data = await supRes.json();
  return Array.isArray(data) ? data : [];
}

async function fetchSubmissions() {
  try {
    // Prefer same-origin API (serverless), fallback to Supabase REST if unavailable
    return await fetchFromApi()
  } catch (apiErr) {
    console.warn('API fetch failed, falling back to Supabase REST', apiErr)
    try {
      return await fetchFromSupabase()
    } catch (supErr) {
      console.error('Supabase fetch failed', supErr)
      statusEl.textContent = '서버에서 데이터를 가져오는 중 오류가 발생했습니다.';
      return [];
    }
  }
}

function renderList(items) {
  listEl.innerHTML = '';
  if (!items.length) {
    listEl.innerHTML = '<div class="empty">저장된 제출이 없습니다.</div>';
    return;
  }

  const fragment = document.createDocumentFragment();
  items.forEach(it => {
    const card = document.createElement('article');
    card.className = 'card';

    const header = document.createElement('div');
    header.className = 'card-header';
    header.innerHTML = `<strong>ID:</strong> ${it.id} <span class="time">${new Date(it.receivedAt).toLocaleString()}</span>`;

    const body = document.createElement('pre');
    body.className = 'card-body';
    body.textContent = JSON.stringify(it.payload, null, 2);

    card.appendChild(header);
    card.appendChild(body);
    fragment.appendChild(card);
  });

  listEl.appendChild(fragment);
}

async function refresh() {
  statusEl.textContent = '로딩…';
  const all = await fetchSubmissions();
  const filter = filterInput.value.trim();
  const items = filter ? all.filter(it => String(it.id).includes(filter)) : all;
  renderList(items.slice().reverse());
  statusEl.textContent = `총 ${items.length}건 (마지막 업데이트: ${new Date().toLocaleTimeString()})`;
}

filterInput.addEventListener('input', () => {
  // local filtering, don't refetch each keystroke
  refresh();
});

refreshBtn.addEventListener('click', refresh);

function toCSV(items) {
  const cols = ['id','receivedAt','name','modelUsed','whyModel','purpose','satisfaction','satisfactionReason','emotion','emotionReason']
  const escape = (v) => {
    if (v === null || v === undefined) return ''
    const s = String(v)
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }
  const rows = [cols.join(',')]
  items.forEach(it => {
    const p = it.payload || {}
    const values = cols.map(c => {
      if (c === 'id') return escape(it.id)
      if (c === 'receivedAt') return escape(it.receivedAt)
      return escape(p[c])
    })
    rows.push(values.join(','))
  })
  return rows.join('\n')
}

exportBtn.addEventListener('click', async () => {
  statusEl.textContent = 'CSV 생성 중…'
  const all = await fetchSubmissions()
  const items = all.slice().reverse()
  if (!items.length) {
    statusEl.textContent = '내보낼 제출이 없습니다.'
    return
  }
  const csv = toCSV(items)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `submissions_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  statusEl.textContent = `CSV 생성 완료 — ${items.length}건` 
})

// initial + polling
refresh();
setInterval(refresh, 3000);
