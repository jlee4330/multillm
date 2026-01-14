const statusEl = document.getElementById('status');
const listEl = document.getElementById('list');
const filterInput = document.getElementById('filterInput');
const refreshBtn = document.getElementById('refreshBtn');
const exportBtn = document.getElementById('exportBtn');

// If the admin page is served from the Vite dev server (5173),
// requests should target the backend at port 4000. Otherwise use same-origin.
const API_BASE = (location.port === '5173') ? 'http://localhost:4000' : ''

async function fetchSubmissions() {
  try {
    const res = await fetch(`${API_BASE}/api/submissions`);
    if (!res.ok) throw new Error(res.statusText || 'Fetch failed');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error(err);
    statusEl.textContent = '서버에서 데이터를 가져오는 중 오류가 발생했습니다.';
    return [];
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
