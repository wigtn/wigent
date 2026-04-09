# 03. 아키텍처 — 시스템 설계와 기술 스택

## 기술 스택

| 영역 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | Next.js 16 (App Router) | 풀스택을 하나의 프로젝트에서, SSE API Route 지원 |
| 언어 | TypeScript (strict) | 3명 병렬 작업 시 타입이 곧 계약 |
| UI | Tailwind CSS v4 + Framer Motion | 빠른 스타일링 + 페이지 전환 애니메이션 |
| AI | OpenAI GPT-4o | 에이전트 대화, JSON 구조화 응답, HTML 생성 |
| 상태관리 | React useReducer | SSE 이벤트 13종을 깔끔하게 처리 |
| 실시간 통신 | SSE (Server-Sent Events) | 단방향 스트리밍에 최적, WebSocket보다 단순 |
| 코드 추출 | Archiver (ZIP) | 서버사이드 zip 생성 |

## 전체 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (React 19)                     │
│                                                          │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │TopicInput│→ │ useDebate    │→ │ ChatLayout         │ │
│  │Presets   │  │ (useReducer) │  │ (Slack Chat UI)    │ │
│  └──────────┘  │              │  └────────────────────┘ │
│                │ SSE Parser   │                          │
│                │ 13 event     │  ┌────────────────────┐ │
│                │ handlers     │→ │ LandingPageView    │ │
│                └──────┬───────┘  │ (iframe sandbox)   │ │
│                       │          └────────────────────┘ │
└───────────────────────┼─────────────────────────────────┘
                        │ SSE Stream
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js API Routes (Node.js)                │
│                                                          │
│  POST /api/debate         POST /api/debate/continue      │
│       │                         │                        │
│       ▼                         ▼                        │
│  ┌──────────────────────────────────────────┐           │
│  │         orchestrator.ts                    │           │
│  │  runDebate() / continueDebate()           │           │
│  │  AsyncGenerator<SSEEvent>                 │           │
│  │                                            │           │
│  │  Step 1: Create Agents (GPT-4o JSON)      │           │
│  │  Step 2: Free Debate 30 turns (streaming) │           │
│  │  Step 3: Summarize (GPT-4o JSON)          │           │
│  │  Step 4: Final Result (GPT-4o JSON)       │           │
│  │  Step 5: Landing Page (GPT-4o streaming)  │           │
│  └──────────────┬───────────────────────────┘           │
│                 │                                        │
│                 ▼                                        │
│  ┌──────────────────────┐                               │
│  │    prompts.ts         │                               │
│  │  7 prompt functions   │                               │
│  └──────────────────────┘                               │
│                                                          │
│  POST /api/export (ZIP 다운로드)                          │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼ HTTP
              ┌───────────────┐
              │  OpenAI API   │
              │  GPT-4o       │
              └───────────────┘
```

## 오케스트레이터 상세

`orchestrator.ts`는 AsyncGenerator 패턴으로 구현됐다. 각 단계에서 SSEEvent를 yield하면, API Route가 이를 SSE 형식으로 클라이언트에 스트리밍한다.

### 토론 흐름

```
runDebate(topic) → AsyncGenerator<SSEEvent>

1. callJSON → agents_created (PM + 전문가 에이전트)
2. 30턴 루프:
   ├── 턴 3: 디자이너 에이전트 자동 합류 → agent_spawned
   ├── 턴 12: 비고정 에이전트 교체 → agent_retire + agent_spawned
   ├── 턴 22: 비고정 에이전트 교체 → agent_retire + agent_spawned
   └── 매 턴: pickNextSpeaker → streamSpeak → agent_speak_start/chunk/done
3. callJSON → summary (토론 요약)
4. callJSON → final_result (최종 아이디어)
5. streamSpeak → landing_page_chunk/ready (HTML 생성)
6. debate_end
```

### GPT-4o 호출 패턴

| 용도 | 방식 | 타임아웃 | 온도 |
|------|------|----------|------|
| 에이전트 생성 | JSON mode | 30초 | 0.9 |
| 에이전트 발언 | Streaming | 30초 | 0.9 |
| 교체 결정 | JSON mode | 30초 | 0.9 |
| 토론 요약 | JSON mode | 30초 | 0.9 |
| 최종 결과 | JSON mode | 30초 | 0.9 |
| 랜딩페이지 | Streaming | 180초 | 0.7 |

모든 호출에 `MAX_RETRIES = 1` + AbortController 기반 타임아웃 적용.

### 발언자 선택 알고리즘

```typescript
pickNextSpeaker(agents, messages, turnCount)
1. 온라인 에이전트만 필터
2. 마지막 발언자 제외 (연속 발언 방지)
3. 발언 횟수가 적은 에이전트 우선 (균등 분배)
```

## 프론트엔드 상태 머신

`useDebate` 훅은 useReducer로 13종 SSE 이벤트를 처리한다.

```
idle → creating → debating ⇄ retiring → spawning → debating
                     │
                     ├→ generating_landing → landing
                     │                         │
                     └← REJECT (반려) ←────────┘
                     
landing → idle (새 토론)
error → idle (새 토론)
```

### SSE 이벤트 (13종)

| 이벤트 | 페이로드 | 용도 |
|--------|----------|------|
| agents_created | agents[], channelName | 초기 에이전트 목록 |
| round_start | round, title | 라운드 시작 (현재 미사용) |
| agent_speak_start | agentId | 발언 시작 (타이핑 인디케이터) |
| agent_speak_chunk | agentId, chunk | 실시간 스트리밍 텍스트 |
| agent_speak_done | agentId, fullMessage | 발언 완료 |
| agent_retire | agentId, exitMessage | 에이전트 퇴장 |
| spawn_trigger | reason | 교체 이유 |
| agent_spawned | agent | 새 에이전트 합류 |
| final_result | result | 최종 아이디어 (FinalIdea) |
| landing_page_chunk | chunk | 랜딩페이지 HTML 스트리밍 |
| landing_page_ready | html | 랜딩페이지 완성 |
| debate_end | totalRounds, totalAgents, totalMessages | 토론 종료 |
| error | message | 에러 |

## 컴포넌트 구조

```
page.tsx (메인 페이지)
├── TopicInput — 주제 입력 textarea
├── PresetButtons — 프리셋 3개
├── HistoryList — localStorage 히스토리
├── ChatLayout — Slack 전체 레이아웃
│   ├── Sidebar — 채널, 에이전트 상태
│   ├── ChannelHeader — 채널 헤더
│   ├── ChatArea — 메시지 목록
│   │   ├── ChatMessage — 개별 메시지 (아바타, 이름, 시간)
│   │   ├── SystemMessage — 시스템 메시지 (참여/퇴장/라운드)
│   │   └── TypingIndicator — 타이핑 애니메이션
│   └── DisabledInput — 비활성 입력창
├── LandingPageView — iframe sandbox 렌더링
│   ├── 결과 반려/만족 버튼
│   ├── 코드 추출 모달
│   └── 새 토론 시작 버튼
└── PageTransition — Framer Motion 전환
```

## 랜딩페이지 생성 — 이중 경로

랜딩페이지 생성에는 두 가지 경로가 공존한다:

### 경로 1: 템플릿 즉시 렌더링 (Primary)
```
FINAL_RESULT 수신 → renderLandingPage(idea) → 즉시 표시
```
- `landing-templates.ts`에 9개 디자인 템플릿 보유
- 아이디어 키워드 매칭으로 최적 템플릿 자동 선택
- **대기 시간 0초** — UX 최적화의 핵심

### 경로 2: GPT-4o HTML 생성 (Background)
```
GPT-4o streaming → landing_page_chunk → landing_page_ready
```
- 이미 템플릿으로 렌더링된 경우 무시
- 템플릿이 실패할 경우의 fallback

### 9개 템플릿

| # | 이름 | 특징 |
|---|------|------|
| 1 | Glassmorphism | 블러 배경 + 유리 카드 |
| 2 | Neobrutalism | 굵은 테두리 + 오프셋 그림자 |
| 3 | Editorial | 세리프 폰트 + 매거진 레이아웃 |
| 4 | Minimalism | 극단적 여백 + 모노톤 |
| 5 | Dark Neon | 네온 글로우 + 그리드 |
| 6 | Bento Grid | 벤토 박스 카드 레이아웃 |
| 7 | Organic Shapes | 블롭 + 곡선 |
| 8 | Corporate | 클린 + 프로페셔널 |
| 9 | Gradient Mesh | 메시 그라데이션 배경 |

## 에이전트 디자인 패턴 (7+)

| 패턴 | 구현 위치 |
|------|----------|
| **Orchestrator** | `orchestrator.ts` — 토론 흐름 제어 |
| **Specialist Agent** | `createAgentPrompt` — 주제별 전문가 자동 생성 |
| **Persistent Agent** | PM_AGENT, DESIGNER_AGENT — isFixed: true |
| **Agent Spawning** | `doRetireSpawn` — 턴 12, 22에 새 에이전트 |
| **Agent Retirement** | `agent_retire` 이벤트 — 자연스러운 퇴장 인사 |
| **Multi-turn Debate** | 30턴 자유 토론 (초반/중반/후반/마무리) |
| **Result Synthesis** | `finalResultPrompt` — 투자자 피칭 수준 결과물 |
| **Human-in-the-Loop** | 결과 반려 → 추가 토론 8턴 |
