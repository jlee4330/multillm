import { useState } from 'react'
import './App.css'

function App() {
  const [name, setName] = useState('')
  const [modelUsed, setModelUsed] = useState('')
  const [whyModel, setWhyModel] = useState('')
  const [purpose, setPurpose] = useState('')
  const [satisfaction, setSatisfaction] = useState(5)
  const [satisfactionReason, setSatisfactionReason] = useState('')
  const [promptUsed, setPromptUsed] = useState('')
  const [emotion, setEmotion] = useState('')
  const [customEmotion, setCustomEmotion] = useState('')
  const [emotionReason, setEmotionReason] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submittedId, setSubmittedId] = useState(null)
  const [error, setError] = useState('')

  const emotionOptions = [
    { key: '행복', emoji: '😊' },
    { key: '평온', emoji: '😌' },
    { key: '슬픔', emoji: '😢' },
    { key: '화남', emoji: '😠' },
    { key: '기타', emoji: '🤔' }
  ]

  const validate = () => {
    const next = {}
    if (!name.trim()) next.name = '이름을 입력하세요.'
    if (!modelUsed.trim()) next.modelUsed = '사용한 모델을 입력하세요.'
    if (!purpose.trim()) next.purpose = '사용 목적을 입력하세요.'
    if (!satisfactionReason.trim()) next.satisfactionReason = '만족도 이유를 입력하세요.'
    if (!emotion) next.emotion = '감정을 선택하세요.'
    return next
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const v = validate()
    setErrors(v)
    if (Object.keys(v).length) return
    const payload = {
      name,
      modelUsed,
      whyModel,
      purpose,
      promptUsed,
      satisfaction,
      satisfactionReason,
      emotion: emotion === '기타' ? customEmotion || '기타' : emotion,
      emotionReason,
    }

    // Determine API base:
    // 1) If VITE_API_BASE is set, always use it (e.g., deployed API while developing locally).
    // 2) Otherwise, use localhost:4000 when running on localhost (dev server),
    // 3) Else use same-origin (deployed serverless).
    const API_BASE = import.meta.env.VITE_API_BASE
      || ((location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://localhost:4000' : '')

    setSubmitting(true)
    fetch(`${API_BASE}/api/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async (r) => {
        // If server returned non-2xx, read text and throw so .catch handles it
        if (!r.ok) {
          const txt = await r.text().catch(() => '')
          throw new Error(txt || `HTTP ${r.status}`)
        }
        return r.json()
      })
      .then((data) => {
        setSubmitting(false)
        if (data && data.ok) {
          setSubmittedId(data.id)
          setSuccess(true)
          alert('제출되었습니다.')
          window.location.reload()
        } else {
          setError('서버에 저장하지 못했습니다.')
        }
      })
      .catch((err) => {
        console.error(err)
        setSubmitting(false)
        setError(err.message || '네트워크 오류가 발생했습니다.')
      })
  }

  return (
    <div className="survey-root">
      <div className="survey-container">
        <div className="survey-inner">
          <div className="page-hero">
            <span className="pill">MLLM Survey</span>
                   <h1>방금 사용한 MLLM 경험을 공유해주세요</h1>
                   <p>모델 선택 이유, 만족도, 감정을 간단히 남겨주세요. 연구 용도로만 사용되며, 1분 정도 소요됩니다.</p>
          </div>
          <form className="form" onSubmit={handleSubmit}>
          <section className="section">
            <div className="field">
              <label htmlFor="name">참여자 아이디</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="아이디를 입력하세요"
              />
              {errors.name && <p className="error">{errors.name}</p>}
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">사용한 모델</h2>
            <div className="field">
              <label htmlFor="model">사용한 MLLM</label>
              <input
                id="model"
                type="text"
                value={modelUsed}
                onChange={(e) => setModelUsed(e.target.value)}
                placeholder="예: Gemini3"
              />
              {errors.modelUsed && <p className="error">{errors.modelUsed}</p>}
            </div>

            <div className="field">
              <label htmlFor="why">해당 MLLM을 선택한 이유</label>
              <textarea
                id="why"
                value={whyModel}
                onChange={(e) => setWhyModel(e.target.value)}
                placeholder="선택 기준(정확도/속도/비용/구체적 기능 지원/가격 등)과 비교 모델을 함께 적어주세요"
              />
            </div>
          </section>

        <section className="section">
          <h2 className="section-title">모델 사용 목적</h2>
          <div className="field">
            <label htmlFor="purpose">MLLM 사용 목적</label>
            <textarea
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="예: 업무(기획/보고서/코드 리뷰), 상담/응대(고객 상담 스크립트, HR/코칭), 학습/연구(논문 요약, 아이디어 검증) 등"
            />
            {errors.purpose && <p className="error">{errors.purpose}</p>}
          </div>

          <div className="field">
            <label htmlFor="promptUsed">입력한 프롬프트 (선택)</label>
            <textarea
              id="promptUsed"
              value={promptUsed}
              onChange={(e) => setPromptUsed(e.target.value)}
              placeholder='예: "20자 요약" 또는 사용한 대표 프롬프트를 적어주세요'
            />
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">모델 만족도</h2>
          <div className="field">
            <div className="inline">
              <label htmlFor="satisfaction">만족도 (0-10)</label>
              <span className="badge">{satisfaction}</span>
            </div>
            <input
              id="satisfaction"
              className="range"
              type="range"
              min="0"
              max="10"
              value={satisfaction}
              onChange={(e) => setSatisfaction(Number(e.target.value))}
            />
            <div className="ticks">
              {[0, 2, 4, 6, 8, 10].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
          <div className="field">
            <label htmlFor="satisfactionReason">만족/불만족 이유</label>
            <textarea
              id="satisfactionReason"
              value={satisfactionReason}
              onChange={(e) => setSatisfactionReason(e.target.value)}
              placeholder="좋았던 점/아쉬운 점을 간단히 적어주세요"
            />
            {errors.satisfactionReason && (
              <p className="error">{errors.satisfactionReason}</p>
            )}
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">현재 감정</h2>
          <div className="emotion-group">
            {emotionOptions.map((opt) => (
              <button
                type="button"
                key={opt.key}
                className={`emotion-btn ${emotion === opt.key ? 'active' : ''}`}
                onClick={() => setEmotion(opt.key)}
                aria-pressed={emotion === opt.key}
              >
                <span className="emoji" aria-hidden>
                  {opt.emoji}
                </span>
                {opt.key}
              </button>
            ))}
          </div>
          {emotion === '기타' && (
            <div className="field custom-field">
              <label htmlFor="customEmotion">기타 감정 입력</label>
              <input
                id="customEmotion"
                type="text"
                value={customEmotion}
                onChange={(e) => setCustomEmotion(e.target.value)}
                placeholder="예: 불안, 기대 등"
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="emotionReason">감정의 이유</label>
            <textarea
              id="emotionReason"
              value={emotionReason}
              onChange={(e) => setEmotionReason(e.target.value)}
              placeholder="왜 그런 감정을 느꼈는지 적어주세요"
            />
          </div>

          {errors.emotion && <p className="error">{errors.emotion}</p>}
        </section>

        {/* 미리보기 섹션 제거됨 (사용자 요청) */}

            <div className="actions">
              <button type="submit" disabled={submitting}>{submitting ? '저장중...' : '제출'}</button>
              {success && <p className="success">제출되었습니다 </p>}
              {error && <p className="error">{error}</p>}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default App
