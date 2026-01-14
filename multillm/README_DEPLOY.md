# 배포 가이드 (Vercel + Supabase)

간단히: 이 프로젝트는 프런트엔드(React, Vite)와 서버리스 API(`api/submit.js`, `api/submissions.js`)로 구성되어 있습니다. 로컬 파일 저장(`server/submissions.json`)은 서버리스 환경에 적합하지 않으므로 Supabase(Postgres)를 사용하도록 API를 구현했습니다.

핵심 파일
- `api/submit.js`, `api/submissions.js` — Vercel 서버리스 핸들러 (Supabase 사용)
- `db/create_submissions.sql` — Supabase에서 실행할 테이블 생성 SQL
- `vercel.json` — Vercel 빌드/라우팅 설정

사전 준비
1. Supabase 프로젝트 생성: https://supabase.com
2. SQL 실행: Supabase 대시보드 → SQL Editor에서 `db/create_submissions.sql` 실행하여 `submissions` 테이블 생성

환경변수
Vercel 프로젝트 설정 또는 로컬 테스트에서 아래 환경변수를 설정하세요.
- `SUPABASE_URL` : 예) `https://<your-project>.supabase.co`
- `SUPABASE_KEY` : **Service Role Key 권장(서버 전용)** — Vercel 환경변수로 저장하세요.

로컬 테스트 (예시)
```bash
# macOS / Linux (일시적 세션)
export SUPABASE_URL="https://cmmilcmoozhnbgmyooug.supabase.co"
export SUPABASE_KEY="<your_service_role_key_here>"

# 프런트 개발 서버
npm install
npm run dev

# 또는 서버리스 환경 로컬 에뮬레이션 (vercel CLI 권장)
npm i -g vercel
vercel login
vercel dev
```

Vercel에 배포하기
1. 레포를 GitHub에 푸시하고 Vercel에 연결하거나 로컬에서 CLI로 배포합니다.

CLI 배포 예시:
```bash
npm run build
vercel --prod
```

2. Vercel Dashboard → 프로젝트 → Settings → Environment Variables에 `SUPABASE_URL`/`SUPABASE_KEY`를 추가(Preview + Production 권장).

관리자 페이지 노출
- `public/admin.html`은 정적 파일이므로 배포 후 `https://<your-deploy>/admin.html`로 접근할 수 있어야 합니다.
- `vercel.json`의 `routes`가 모든 요청을 `/index.html`로 리다이렉트할 경우 `/admin.html`이 덮어써질 수 있으므로, 필요하면 `vercel.json`에 아래 라우트를 추가하세요:

```json
{
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/admin.html", "dest": "/admin.html" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

검증
- 배포 후 다음 경로들을 확인하세요:
  - `GET /api/submissions` → 제출 목록 반환 (JSON)
  - `POST /api/submit` → 제출 저장 (JSON { ok: true, id })
  - `/admin.html` → 관리자 UI (CSV 내보내기 등)

보안 권장사항
- Service Role Key는 서버 전용으로만 사용하세요. 클라이언트 코드(브라우저)에 노출하지 마십시오.
- 로그/키를 레포지토리에 커밋하지 마세요.

마이그레이션(선택)
- 기존 `server/submissions.json`에 있는 데이터를 Supabase로 마이그레이션하려면 간단한 스크립트를 작성해 `payload` 필드를 넣어주면 됩니다. 필요하시면 스크립트 예시를 생성해 드리겠습니다.

문제가 발생하면 다음 정보를 주세요:
- Vercel 배포 URL
- 콘솔 또는 네트워크 에러 로그
- Supabase 테이블 상태 (SQL 에디터 결과)

***
+파일 위치: [db/create_submissions.sql](db/create_submissions.sql)
