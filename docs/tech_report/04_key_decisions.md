# 04. 핵심 기술 결정 — 전환점과 피봇

프로젝트 진행 중 4번의 주요 전환점이 있었다. 각각이 왜 일어났고, 어떤 트레이드오프가 있었는지 정리한다.

---

## 전환점 1: Slack UI + Full Page Swap (13:37)

### Before
- 일반적인 채팅 UI + 결과 카드 표시

### After
- **Slack 스타일 다크테마 채팅 UI** (사이드바, 채널, 아바타, 시스템 메시지)
- 토론 완료 후 **채팅 화면이 사라지고 랜딩페이지로 대체**

### 왜 바꿨나
- 해커톤 1차 심사가 "AI가 URL 방문 → 프론트엔드 분석". Slack UI는 친숙하면서도 세련된 UI로 AI 심사에 유리
- "채팅이 웹페이지로 변한다"는 데모 임팩트가 3차 사람 심사에서 강력한 인상을 줌
- Slack 스타일은 에이전트의 참여/퇴장/타이핑을 시각적으로 보여주기에 최적

### 트레이드오프
- Slack UI 구현량 증가 (10개 컴포넌트)
- 하지만 Claude Code로 한 번에 생성 가능 → 실제 비용 미미

---

## 전환점 2: 라운드제 → 자유토론 30턴 (14:48)

### Before
- 3라운드 구조: R1 브레인스토밍 → R2 토론/반박 → R3 수렴
- GPT-4o 10회 호출 (라운드당 3~4회)

### After
- 라운드 없이 **30턴 자유 토론**
- 자동 페이즈 전환: 초반(0~2) → 중반(3~14) → 후반(15~24) → 마무리(25~29)
- 에이전트 교체를 **확정적 턴**(12, 22)에 배치

### 왜 바꿨나
1. **자연스러움**: 라운드 구분이 인위적. 실제 회의는 자연스럽게 흘러감
2. **데모 안정성**: 라운드 전환 로직이 복잡했고 엣지 케이스 다수. 자유 토론 + 확정적 교체로 예측 가능한 진행
3. **토론 깊이**: 10회 호출로는 깊이가 부족. 30턴으로 늘려 충분한 논쟁 시간 확보
4. **프롬프트 단순화**: 라운드별 프롬프트 대신 turnCount 기반 단일 프롬프트

### 트레이드오프
- GPT-4o 호출 횟수 증가 (10 → 30+) → 비용 증가
- 토론 시간 증가 (2~3분 → 5~8분)
- 하지만 토론 품질과 데모 안정성이 압도적으로 개선됨

---

## 전환점 3: GPT 생성 → 템플릿 즉시 렌더링 (15:06)

### Before
- 토론 완료 → GPT-4o가 HTML 생성 (30~60초 대기) → 렌더링

### After
- FINAL_RESULT 수신 즉시 **키워드 매칭 → 9개 템플릿 중 선택 → 즉시 렌더링**
- GPT-4o HTML 생성은 백그라운드에서 계속 (이미 렌더링된 경우 무시)

### 왜 바꿨나
1. **UX 병목**: 토론 5~8분 + 랜딩페이지 생성 30~60초 = 너무 긴 대기
2. **GPT 거부 문제**: GPT-4o가 랜딩페이지 HTML 생성을 거부하거나 저품질로 반환하는 경우 발생
3. **데모 안정성**: 해커톤 시연에서 "로딩 중..." 화면은 치명적
4. **품질 일관성**: 템플릿은 항상 고품질, GPT 생성은 품질 편차가 큼

### 트레이드오프
- 템플릿 기반이므로 **아이디어별 맞춤 디자인은 제한적**
- 9개 템플릿으로 다양성 확보했지만, GPT 생성의 유연성은 포기
- 이중 경로 유지로 코드 복잡성 약간 증가

### 구현 상세
```typescript
// useDebate.ts — FINAL_RESULT 액션
case "FINAL_RESULT": {
  // 템플릿 기반 즉시 렌더링
  const html = renderLandingPage(action.result.idea);
  return { ...state, status: "landing", landingPageHtml: html };
}

case "LANDING_PAGE_CHUNK":
  // 이미 렌더링된 경우 무시
  if (state.status === "landing") return state;
  return { ...state, landingPageHtml: (state.landingPageHtml ?? "") + action.chunk };
```

---

## 전환점 4: 토론 수렴 강제 (15:13)

### 문제
- 30턴 자유토론에서 에이전트들이 **마지막까지 새 아이디어를 던짐**
- 결론 없이 발산만 하다가 끝나는 경우 발생
- 요약 프롬프트가 수렴되지 않은 토론을 정리하기 어려움

### 해결
```typescript
// 25턴 이후 프롬프트에 강제 수렴 지시 추가
turnCount >= 25
  ? "마무리 — 토론이 곧 끝난다. 반드시 최종 결론을 내려라. 
     더 이상 새로운 아이디어 금지. '정리하면~', '결론적으로~' 로 시작해라."
  : ...
```

### 효과
- 마지막 5턴에서 에이전트들이 자연스럽게 합의점 도출
- 요약 품질 향상 → 최종 결과 품질 향상

---

## 기타 주요 결정들

### types.ts를 먼저 확정한 것
- 3명 병렬 개발의 **필수 전제**
- Agent, ChatItem, SSEEvent 등 모든 인터페이스를 281줄로 정의
- "계약 우선 개발" — 구현체보다 인터페이스를 먼저 합의

### SSE over WebSocket
- 서버 → 클라이언트 단방향 스트리밍만 필요
- WebSocket은 양방향이므로 오버엔지니어링
- Next.js API Route에서 SSE가 자연스러움
- ReadableStream + TextEncoder로 구현 간결

### useReducer over useState
- 13종 SSE 이벤트를 처리해야 하므로 단순 useState로는 관리 불가
- Action 타입을 명시적으로 정의하여 타입 안전성 확보
- 상태 전환 로직이 한 곳에 집중 → 디버깅 용이

### AsyncGenerator 패턴
- 오케스트레이터가 SSE 이벤트를 `yield`로 반환
- API Route는 이를 `for await...of`로 소비하여 SSE로 변환
- 토론 로직과 전송 로직의 깔끔한 분리

```typescript
// orchestrator.ts
export async function* runDebate(topic, signal): AsyncGenerator<SSEEvent> {
  yield { type: "agents_created", data: { agents, channelName } };
  // ...
  for await (const ev of streamSpeak(openai, prompt, speaker.id, signal)) {
    yield ev;
  }
}

// route.ts
for await (const sseEvent of runDebate(topic, signal)) {
  send(sseEvent.type, sseEvent.data);
}
```

### 에이전트 페르소나 설계
- PM: "그래서 누가 돈 내고 쓰는데?" — 현실주의 앵커
- 디자이너: "유저가 3초 안에 이해 못 하면 실패" — UX 관점
- Agent 2: PM과 정반대 사고방식 — 긴장감 유발
- 성격을 구체적으로 설정할수록 토론이 재미있어짐
- "시장 중심 사고" 같은 뻔한 설명 금지 → 실제 말투/습관으로 기술

### 에이전트 간 랜덤 딜레이
```typescript
const MIN_DELAY = 800;
const MAX_DELAY = 2500;
function randomDelay(): Promise<void> {
  const ms = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
  return new Promise(resolve => setTimeout(resolve, ms));
}
```
- 에이전트가 즉시 연속 발언하면 비현실적
- 0.8~2.5초 랜덤 딜레이로 "사람이 생각하는 시간" 시뮬레이션
- 작은 디테일이지만 데모 몰입감에 큰 기여

### Fallback HTML
- GPT-4o가 랜딩페이지 생성을 거부하거나 HTML이 아닌 텍스트를 반환하는 경우
- 최소한의 정보(제목, 한 줄 설명, 타겟)를 표시하는 fallback HTML 준비
- `<!DOCTYPE` 또는 `<html` 태그 포함 여부로 유효성 판단
