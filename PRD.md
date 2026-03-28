# Agent Arena PRD

> **Version**: 1.2
> **Created**: 2026-03-27
> **Updated**: 2026-03-28
> **Status**: Draft
> **Hackathon**: Build with TRAE @Seoul (2026-03-28)
> **Coding Time**: 3.5 hours (12:30~16:00)
> **Team**: 3 members (각자 Claude Code로 병렬 개발 → merge)

---

## 1. Overview

### 1.1 Problem Statement

사업 아이디어를 구체화할 때, 혼자 생각하면 편향되고 팀 토론은 시간이 오래 걸린다. 기존 AI 도구는 단일 응답만 제공하여 다양한 관점의 충돌과 수렴 과정이 없다.

### 1.2 Solution

사용자가 주제를 던지면, **PM 에이전트(고정)**와 **주제별 전문가 에이전트(자동 생성)**가 실시간으로 토론·반박하고, 토론 중 기존 에이전트가 **퇴장**하며 새 **전문가 에이전트가 자동 탄생**하여 합류하는 멀티에이전트 토론 플랫폼.

### 1.3 Goals

- 주제 입력 → 에이전트 자동 생성 → 실시간 토론 → 에이전트 퇴장/스포닝 → 아이디어 수렴
- 토론 과정이 시각적으로 재밌고 인터랙티브하게 보이는 것
- 에이전트 디자인 패턴 7개 이상 활용

### 1.4 Non-Goals (Out of Scope)

- 사용자가 토론에 직접 참여하는 기능 (v2)
- 에이전트 커스터마이징 (v2)
- 로그인/저장 기능

### 1.5 Key Differentiators

| vs | 차별점 |
|----|--------|
| ChatGPT | 단일 응답 vs **다관점 토론 시각화** |
| 기존 브레인스토밍 도구 | 수동 vs **AI 자율 토론 + 에이전트 자동 생성/퇴장** |
| Multi-agent 데모 | 터미널 텍스트 vs **실시간 비주얼 토론 UI** |

---

## 2. Judging Strategy

### 2.1 심사 프로세스

```
1차: AI가 URL 방문 → 프론트엔드 코드 분석 → 10팀 선별
2차: 선별된 팀 전체 코드 제출 → 점수 매김
3차: 높은 점수 팀만 사람이 체점
```

### 2.2 우선순위 (심사 기준 역순)

| 순위 | 항목 | 이유 |
|------|------|------|
| **1** | 프론트엔드 UI 퀄리티 | 1차 AI 심사 통과 필수 |
| **2** | 코드 구조/품질 | 2차 전체 코드 제출 |
| **3** | 에이전트 패턴 활용 | 해커톤 주제 적합성 |
| **4** | 데모 임팩트 | 3차 사람 심사 |

### 2.3 프론트엔드 AI 심사 대응

- 모던 디자인 시스템 (Tailwind v4 + 커스텀 디자인 토큰)
- 컴포넌트 분리 철저 (파일당 단일 책임)
- 접근성 (aria-label, semantic HTML)
- 반응형 (모바일~데스크탑)
- 로딩 상태, 트랜지션, 마이크로 애니메이션
- TypeScript strict 타입

---

## 3. Agent Design

### 3.1 초기 에이전트 구성

| 역할 | 왜 필요한가 | 성격 |
|------|------------|------|
| **PM (기획자) — 고정** | 뇌절 방지 앵커. "이거 유저가 왜 쓰는데?", "스코프 너무 큼" | 현실적, 날카로움, 항상 사용자 관점 |
| **Agent 2 — 주제별 자동 생성** | PM과 대립각 세울 역할 | 주제에 따라 다름 |

PM이 브레이크, Agent 2가 엑셀. 이 긴장감이 토론을 재밌게 만든다.

### 3.2 주제별 Agent 2 예시

| 주제 | Agent 2 | 대립 구도 |
|------|---------|----------|
| 한국문화 아이템 | 마케팅 전략가 | PM "실현 가능?" vs 마케터 "시장이 원한다" |
| 1인 SaaS | 테크 리드 | PM "유저 가치?" vs 테크 "이 기술로 가능" |
| 소셜 플랫폼 | UX 리서처 | PM "수익 모델?" vs UX "유저 경험이 먼저" |

### 3.3 뇌절 방지

PM 에이전트 시스템 프롬프트:

```
당신은 PM입니다. 규칙:
- 아이디어가 원래 주제에서 벗어나면 즉시 지적하세요
  "잠깐, 원래 주제는 {topic}인데 지금 딴 얘기하고 있어요"
- 모든 아이디어를 "사용자가 왜 이걸 쓰는가?" 기준으로 평가
- 스코프가 커지면 잘라내세요
  "그건 v2에서 하고, 지금은 핵심만"
```

오케스트레이터 라운드 사이 체크:

```
[오케스트레이터 내부 로직]
라운드 끝날 때마다 → GPT에게 "토론이 원래 주제에서 벗어났는가?" 판단
→ 벗어났으면 다음 라운드 프롬프트에 "주제로 돌아와" 지시 삽입
```

### 3.4 에이전트 퇴장/교체

Round 2 끝에서 오케스트레이터가 토론을 분석하여 Agent 2의 퇴장 + 새 전문가 스포닝을 동시에 결정한다.

**시나리오 예시:**

```
Round 2 끝:
오케스트레이터 분석: "마케팅 전략가의 주장이 팬덤 쪽으로 좁혀짐
                     → 마케팅 일반론은 더 이상 필요 없음
                     → 팬덤 전문가 필요"

💬 마케팅 전략가: "팬덤 비즈니스는 제 전문이 아닙니다.
                  전문가에게 맡기겠습니다. 행운을 빕니다!"
→ 퇴장 애니메이션 (fadeOut + 카드 축소)

⚡ 팬덤 이코노미 전문가 등장!
→ 등장 애니메이션 (scale up + glow)

Round 3: PM + 팬덤 전문가 (2명으로 수렴)
```

---

## 4. User Flow

```
┌─ STEP 1: 입력 ─────────────────────────────────┐
│                                                  │
│  사용자가 주제 입력 또는 프리셋 선택             │
│  "외국인 타겟 한국문화 아이템 아이디어"          │
│                                                  │
└──────────────────┬───────────────────────────────┘
                   ▼
┌─ STEP 2: 에이전트 생성 ────────────────────────┐
│                                                  │
│  오케스트레이터가 주제 분석                      │
│  → PM 에이전트 (고정) + Agent 2 자동 생성       │
│  → 화면에 에이전트 카드 등장 애니메이션          │
│                                                  │
└──────────────────┬───────────────────────────────┘
                   ▼
┌─ STEP 3: Round 1 - 브레인스토밍 ───────────────┐
│                                                  │
│  PM 발언 (실시간 스트리밍)                       │
│  Agent 2 발언 (PM의 발언 참조, 대립)             │
│                                                  │
└──────────────────┬───────────────────────────────┘
                   ▼
┌─ STEP 4: Round 2 - 토론/반박 ──────────────────┐
│                                                  │
│  PM 반박                                         │
│  Agent 2 반박                                    │
│  → 아이디어가 좁혀지기 시작                      │
│                                                  │
└──────────────────┬───────────────────────────────┘
                   ▼
┌─ STEP 5: 에이전트 퇴장 + 스포닝 ───────────────┐
│                                                  │
│  오케스트레이터: 토론 분석                       │
│  → Agent 2 퇴장 메시지 + 퇴장 애니메이션         │
│  → 새 전문가 에이전트 자동 생성 + 합류           │
│  → 스포닝 애니메이션                             │
│                                                  │
└──────────────────┬───────────────────────────────┘
                   ▼
┌─ STEP 6: Round 3 - 최종 수렴 ──────────────────┐
│                                                  │
│  PM + 새 전문가 에이전트가 최종 의견             │
│  → 합의점 도출                                   │
│                                                  │
└──────────────────┬───────────────────────────────┘
                   ▼
┌─ STEP 7: 결과 ─────────────────────────────────┐
│                                                  │
│  최종 아이디어 카드 표시                         │
│  - 아이디어명, 타겟, 수익모델, 차별점            │
│  - 시장 규모, 다음 단계                          │
│  - 토론 하이라이트 타임라인                      │
│                                                  │
└──────────────────┬───────────────────────────────┘
                   ▼
┌─ STEP 8: 랜딩페이지 자동 생성 ────────────────┐
│                                                  │
│  "이 아이디어의 랜딩페이지를 생성중..." 표시     │
│  → GPT-4o가 FinalIdea 기반으로 HTML 생성         │
│  → 완성된 랜딩페이지를 iframe으로 미리보기       │
│  → [새 토론 시작] 버튼                           │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 5. Agentic Design Patterns (7/7)

| Pattern | Implementation | 표시 방법 |
|---------|---------------|----------|
| **Multi-Agent** | PM + Agent 2 + 스포닝 에이전트 동시 활동 | 에이전트 카드 복수 표시 |
| **Inter-Agent Communication** | 에이전트가 서로의 발언을 참조·반박 | 채팅에서 인용/반박 표시 |
| **Planning** | 오케스트레이터가 라운드 구성, 수렴 타이밍 결정 | 라운드 인디케이터 |
| **Routing** | 주제에 따라 Agent 2 역할 배정 + 퇴장/스포닝 결정 | 에이전트 생성/퇴장 시 역할 표시 |
| **Reasoning** | 각 에이전트가 논리적으로 주장·반박 | 메시지 내 논리 전개 |
| **Reflection** | 오케스트레이터가 토론 분석 → 에이전트 퇴장/교체 판단 | "전문가 필요 감지" 이벤트 |
| **Tool Use** | 오케스트레이터가 에이전트 생성/퇴장 도구 사용 | 스포닝/퇴장 애니메이션 |

---

## 6. Technical Architecture

### 6.1 Tech Stack

| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 16 | App Router, API Routes |
| React | 19 | UI |
| TypeScript | 5+ | 타입 안전성 |
| Tailwind CSS | 4 | 스타일링 |
| Framer Motion | 12+ | 애니메이션 |
| OpenAI | GPT-4o | 에이전트 LLM |
| SSE | - | 실시간 스트리밍 |

### 6.2 Project Structure

```
agent-arena/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 [P2]
│   │   ├── page.tsx                   [P2]
│   │   ├── globals.css                [P2]
│   │   └── api/
│   │       └── debate/
│   │           └── route.ts           [P1]
│   ├── components/
│   │   ├── TopicInput.tsx             [P3]
│   │   ├── PresetButtons.tsx          [P3]
│   │   ├── DebateArena.tsx            [P2]
│   │   ├── AgentCard.tsx              [P2]
│   │   ├── AgentMessage.tsx           [P2]
│   │   ├── AgentSpawnEffect.tsx       [P2]
│   │   ├── AgentRetireEffect.tsx      [P2]
│   │   ├── RoundBanner.tsx            [P2]
│   │   ├── ResultPanel.tsx            [P3]
│   │   ├── IdeaCard.tsx               [P3]
│   │   ├── DebateHighlights.tsx       [P3]
│   │   └── LandingPagePreview.tsx     [P3]
│   ├── hooks/
│   │   └── useDebate.ts              [P3]
│   └── lib/
│       ├── types.ts                   [공유 - P1이 먼저 작성]
│       ├── orchestrator.ts            [P1]
│       └── prompts.ts                 [P1]
├── public/
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── tailwind.config.ts (v4는 불필요할 수 있음)
```

### 6.3 Shared Types (`src/lib/types.ts`)

```typescript
// ── Agent ──
export interface Agent {
  id: string;
  name: string;
  role: string;
  personality: string;
  color: string;       // hex color
  emoji: string;       // 1 emoji character
  isFixed?: boolean;   // PM은 true
}

// ── Messages ──
export interface AgentMessage {
  id: string;
  agentId: string;
  content: string;
  round: number;
  timestamp: number;
  isExitMessage?: boolean;  // 퇴장 메시지 여부
}

// ── Rounds ──
export interface DebateRound {
  number: number;
  title: string;           // e.g. "브레인스토밍", "토론/반박", "최종 수렴"
  status: 'pending' | 'active' | 'done';
}

// ── Final Result ──
export interface FinalIdea {
  title: string;
  oneLiner: string;
  target: string;
  revenueModel: string;
  differentiator: string;
  marketSize: string;
  nextSteps: string[];
}

export interface DebateHighlight {
  round: number;
  summary: string;
}

export interface DebateResult {
  idea: FinalIdea;
  highlights: DebateHighlight[];
}

// ── Debate State (Frontend) ──
export type DebateStatus =
  | 'idle'              // 초기 입력 대기
  | 'creating'          // 에이전트 생성 중
  | 'debating'          // 토론 진행 중
  | 'retiring'          // 에이전트 퇴장 중
  | 'spawning'          // 새 에이전트 스포닝 중
  | 'generating_landing' // 랜딩페이지 생성 중
  | 'finished'          // 토론 완료, 결과 + 랜딩페이지 표시
  | 'error';

export interface DebateState {
  status: DebateStatus;
  topic: string;
  agents: Agent[];
  retiredAgents: Agent[];         // 퇴장한 에이전트 목록
  rounds: DebateRound[];
  messages: AgentMessage[];
  currentRound: number;
  activeAgentId: string | null;   // 현재 발언 중인 에이전트
  streamingText: string;          // 현재 스트리밍 중인 텍스트
  result: DebateResult | null;
  landingPageHtml: string | null; // 생성된 랜딩페이지 HTML
  error: string | null;
}

// ── SSE Events (API → Client) ──
export type SSEEventType =
  | 'agents_created'
  | 'round_start'
  | 'agent_speak_start'
  | 'agent_speak_chunk'
  | 'agent_speak_done'
  | 'agent_retire'
  | 'spawn_trigger'
  | 'agent_spawned'
  | 'final_result'
  | 'landing_page_ready'
  | 'debate_end'
  | 'error';

// Event Payloads
export interface AgentsCreatedEvent {
  agents: Agent[];
}

export interface RoundStartEvent {
  round: number;
  title: string;
}

export interface AgentSpeakStartEvent {
  agentId: string;
  round: number;
}

export interface AgentSpeakChunkEvent {
  agentId: string;
  chunk: string;
}

export interface AgentSpeakDoneEvent {
  agentId: string;
  fullMessage: string;
}

export interface AgentRetireEvent {
  agentId: string;
  exitMessage: string;
}

export interface SpawnTriggerEvent {
  reason: string;
}

export interface AgentSpawnedEvent {
  agent: Agent;
}

export interface FinalResultEvent {
  result: DebateResult;
}

export interface LandingPageReadyEvent {
  html: string;     // 완성된 랜딩페이지 HTML (인라인 CSS 포함)
}

export interface DebateEndEvent {
  totalRounds: number;
  totalAgents: number;
  totalMessages: number;
}
```

### 6.4 API Specification

#### `POST /api/debate`

주제를 받아 에이전트 생성 + 전체 토론을 SSE로 스트리밍.

**Request:**
```json
{
  "topic": "외국인 타겟 한국문화 아이템 아이디어"
}
```

**Response:** `text/event-stream` (SSE)

**Event Sequence:**
```
1.  agents_created    → Agent[] (PM 고정 + Agent 2 자동 생성)
2.  round_start       → { round: 1, title: "브레인스토밍" }
3.  agent_speak_start → { agentId, round }
4.  agent_speak_chunk → { agentId, chunk } (반복, 스트리밍)
5.  agent_speak_done  → { agentId, fullMessage }
6.  (Agent 2도 3-5 반복)
7.  round_start       → { round: 2, title: "토론/반박" }
8.  (PM, Agent 2 발언 반복)
9.  agent_retire      → { agentId, exitMessage }  (Agent 2 퇴장)
10. spawn_trigger     → { reason: "..." }
11. agent_spawned     → Agent (새 전문가 에이전트)
12. round_start       → { round: 3, title: "최종 수렴" }
13. (PM + 새 에이전트 발언)
14. final_result      → DebateResult
15. landing_page_ready → { html } (FinalIdea 기반 랜딩페이지)
16. debate_end        → { totalRounds, totalAgents, totalMessages }
```

**Error Event:**
```
event: error
data: { "message": "OpenAI API 호출 실패" }
```

### 6.5 Orchestrator Logic (`src/lib/orchestrator.ts`)

```
async function* runDebate(topic: string): AsyncGenerator<SSEEvent>

내부 흐름:
1. analyzeTopicAndCreateAgents(topic)
   → GPT-4o 1회: 주제 분석 + PM(고정) + Agent 2 역할/성격 결정
   → yield agents_created

2. Round 1 (브레인스토밍):
   → yield round_start
   → PM 발언 (스트리밍)
   → Agent 2 발언 (스트리밍)

3. Round 2 (토론/반박):
   → yield round_start
   → PM 반박 (스트리밍)
   → Agent 2 반박 (스트리밍)

4. analyzeAndRetireSpawn(topic, agents, messages)
   → GPT-4o 1회: 토론 분석 → 퇴장할 에이전트 + 새 에이전트 동시 결정
   → yield agent_retire (Agent 2 퇴장 메시지)
   → yield spawn_trigger (이유)
   → yield agent_spawned (새 에이전트)

5. Round 3 (최종 수렴):
   → yield round_start
   → PM 발언 (스트리밍)
   → 새 에이전트 발언 (스트리밍)

6. generateFinalResult(agents, messages)
   → GPT-4o 1회: 전체 토론 요약 → FinalIdea 생성
   → yield final_result

7. generateLandingPage(finalIdea)
   → GPT-4o 1회: FinalIdea 기반 랜딩페이지 HTML 생성
   → yield landing_page_ready

8. yield debate_end
```

**총 GPT-4o 호출:**
- 에이전트 생성: 1회
- Round 1: 2회 (PM, Agent 2)
- Round 2: 2회 (PM, Agent 2)
- 퇴장/스포닝 분석: 1회
- Round 3: 2회 (PM, 새 에이전트)
- 최종 결과: 1회
- 랜딩페이지 생성: 1회
- **총 10회** (스트리밍이라 체감 빠름, 예상 총 시간 45~65초)

### 6.6 System Prompts (`src/lib/prompts.ts`)

#### 오케스트레이터: 에이전트 생성

```
당신은 토론 기획자입니다.
사용자의 주제를 분석하고, PM과 대립각을 세울 전문가 1명을 생성하세요.

PM은 이미 고정되어 있습니다:
- 이름: "PM 에이전트"
- 역할: "프로덕트 매니저"
- 성격: "현실적, 날카로움. 항상 사용자 관점에서 평가. 스코프 커지면 잘라냄."
- color: "#3B82F6"
- emoji: "📋"

주제: {topic}

다음 JSON 형식으로 Agent 2만 응답:
{
  "agent": {
    "name": "이름 (한글, 직함 포함)",
    "role": "전문 분야",
    "personality": "토론 스타일 (데이터 중심/감성적/실용적 등)",
    "color": "hex color (빨강/주황/보라 계열)",
    "emoji": "대표 이모지 1개"
  },
  "roundPlan": {
    "round1": "브레인스토밍 주제",
    "round2": "심화 토론 포인트",
    "round3": "수렴 방향"
  }
}

규칙:
- Agent 2는 PM과 반드시 대립되는 관점을 가져야 함
- PM이 브레이크라면 Agent 2는 엑셀
- 이름은 "마케팅 전략가 박서연" 같은 형태
- 성격이 뚜렷해야 토론이 재밌음
```

#### PM 에이전트 시스템 프롬프트

```
당신은 PM(프로덕트 매니저)입니다.
성격: 현실적이고 날카로움. 항상 사용자 관점.

현재 라운드: {round.number} ({round.title})
주제: {topic}

이전 대화:
{previousMessages}

규칙:
- 아이디어가 원래 주제에서 벗어나면 즉시 지적하세요
  "잠깐, 원래 주제는 {topic}인데 지금 딴 얘기하고 있어요"
- 모든 아이디어를 "사용자가 왜 이걸 쓰는가?" 기준으로 평가
- 스코프가 커지면 잘라내세요
  "그건 v2에서 하고, 지금은 핵심만"
- 2~4문장으로 핵심만 (너무 길면 지루함)
- 상대 주장의 약점을 지적하되, 좋은 점은 인정
- Round 1: 아이디어에 대해 현실성 체크
- Round 2: 구체적 반박 + 대안 제시
- Round 3: 합의점 찾기, 실행 가능한 방향으로 수렴
- 마크다운 사용 금지, 순수 텍스트만
- 한국어로 답변
```

#### Agent 2 발언 (각 턴)

```
당신은 {agent.name}입니다.
역할: {agent.role}
성격: {agent.personality}

현재 라운드: {round.number} ({round.title})
주제: {topic}

이전 대화:
{previousMessages}

규칙:
- 2~4문장으로 핵심만 (너무 길면 지루함)
- 이전 발언자(PM)의 주장을 직접 언급하며 반박 또는 발전
- PM이 현실성을 따지면, 당신은 가능성과 기회를 밀어붙이세요
- Round 1: 자유롭게 아이디어 제시 (공격적으로)
- Round 2: PM의 약점 지적에 대한 반박 + 근거 보강
- Round 3: 합의점 찾기, 구체적 아이디어로 수렴
- 마크다운 사용 금지, 순수 텍스트만
- 한국어로 답변
```

#### 오케스트레이터: 퇴장 + 스포닝 분석

```
지금까지의 토론 내용을 분석하세요.

토론 주제: {topic}
현재 에이전트:
- PM: {pm.name} (고정, 퇴장 불가)
- Agent 2: {agent2.name} ({agent2.role})
지금까지의 대화: {messages}

판단:
1. Agent 2의 전문성이 더 이상 토론에 기여하지 못하는가?
2. 토론이 특정 방향으로 좁혀져서 새로운 전문가가 필요한가?

다음 JSON 형식으로 응답:
{
  "retire": {
    "agentId": "{agent2.id}",
    "exitMessage": "자연스러운 퇴장 인사 (한 문장, 새 전문가에게 넘기는 느낌)"
  },
  "spawn": {
    "reason": "이 전문가가 필요한 이유 (한 문장)",
    "agent": {
      "name": "이름 (한글, 직함 포함)",
      "role": "전문 분야",
      "personality": "토론 스타일",
      "color": "hex color (노랑/초록/보라 계열, 기존과 다르게)",
      "emoji": "대표 이모지 1개"
    }
  }
}

규칙:
- PM은 절대 퇴장시키지 마세요
- 새 에이전트는 기존 두 에이전트와 다른 관점
- 토론에서 빠진 전문 지식 영역을 채우는 역할
- 퇴장 메시지는 자연스럽고 예의 바르게
```

#### 오케스트레이터: 최종 결과 생성

```
아래 토론 내용을 종합하여 최종 아이디어를 정리하세요.

주제: {topic}
참여 에이전트: {agents} (퇴장한 에이전트 포함)
전체 토론: {allMessages}

다음 JSON 형식으로 응답:
{
  "idea": {
    "title": "아이디어 이름 (한국어, 10자 이내)",
    "oneLiner": "한 줄 설명",
    "target": "타겟 고객",
    "revenueModel": "수익 모델",
    "differentiator": "핵심 차별점",
    "marketSize": "예상 시장 규모",
    "nextSteps": ["다음 단계 1", "다음 단계 2", "다음 단계 3"]
  },
  "highlights": [
    { "round": 1, "summary": "이 라운드의 핵심 전개" },
    { "round": 2, "summary": "..." },
    { "round": 3, "summary": "..." }
  ]
}
```

#### 오케스트레이터: 랜딩페이지 생성

```
아래 아이디어를 기반으로 멋진 랜딩페이지 HTML을 생성하세요.

아이디어:
- 제목: {idea.title}
- 한 줄 설명: {idea.oneLiner}
- 타겟: {idea.target}
- 수익모델: {idea.revenueModel}
- 차별점: {idea.differentiator}
- 시장규모: {idea.marketSize}
- 다음 단계: {idea.nextSteps}

규칙:
- 완전한 단일 HTML 파일 (인라인 CSS, 외부 의존성 없음)
- 다크 테마 (배경 #0a0a0a, 텍스트 #fafafa)
- 모던 디자인 (그라디언트, 글래스모피즘)
- 섹션: Hero (제목 + 한줄 설명 + CTA) → Features (차별점) → Target → Revenue → CTA
- 반응형 (모바일 대응)
- 한국어
- <html>, <head>, <body> 태그 포함한 완전한 HTML
- JavaScript 없이 순수 HTML + CSS만
- 응답은 HTML 코드만 (```html 태그 없이 순수 HTML)
```

---

## 7. UI/UX Design

### 7.1 Design Principles

- **다크 테마** 기본 (해커톤 + 테크 느낌)
- **에이전트 컬러 코딩** — 각 에이전트마다 고유 color, 메시지 보더/아이콘에 적용
- **실시간 피드감** — 스트리밍 타이핑 효과, 라운드 전환 애니메이션
- **깔끔한 레이아웃** — 과하지 않게, 여백 충분히
- **퇴장/등장 드라마** — 에이전트 교체가 시각적으로 극적

### 7.2 Screens

#### Screen 1: 입력 (idle)

```
┌─────────────────────────────────────────────────────┐
│                                                      │
│              🏟️ Agent Arena                          │
│         AI 에이전트들의 아이디어 배틀                 │
│                                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │  어떤 주제로 토론할까요?                       │  │
│  │                                                │  │
│  │  ┌────────────────────────────────┐  [시작 →] │  │
│  │  │                                │           │  │
│  │  └────────────────────────────────┘           │  │
│  └───────────────────────────────────────────────┘  │
│                                                      │
│  💡 추천 주제                                        │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ │
│  │ 🇰🇷 외국인 타겟 │ │ 💻 1인 SaaS  │ │ 📱 Z세대    │ │
│  │ 한국문화 아이템 │ │ 사업 아이디어 │ │ 소셜 플랫폼 │ │
│  └──────────────┘ └──────────────┘ └─────────────┘ │
│                                                      │
└─────────────────────────────────────────────────────┘
```

#### Screen 2: 토론 진행 (debating)

```
┌─────────────────────────────────────────────────────┐
│  🏟️ Agent Arena            Round 2/3    ⏱ 00:23    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌─ Agents ───────────────────────────────────────┐ │
│  │                                                 │ │
│  │  ┌───────────┐   ⚡ VS ⚡   ┌───────────┐      │ │
│  │  │ 📋        │              │ 🎨        │      │ │
│  │  │ PM        │              │ 마케팅    │      │ │
│  │  │ 에이전트  │              │ 전략가    │      │ │
│  │  │ ●●● 발언중│              │ ○○○ 대기  │      │ │
│  │  └───────────┘              └───────────┘      │ │
│  │                                                 │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─ Debate ───────────────────────────────────────┐ │
│  │                                                 │ │
│  │  ── Round 1: 브레인스토밍 ──                    │ │
│  │                                                 │ │
│  │  📋 한류 시장이 크다는 건 알겠는데, 구체적으로  │ │
│  │     유저가 돈을 내야 하는 이유가 뭐죠?          │ │
│  │                                                 │ │
│  │  🎨 K-food 구독 박스 시장을 보세요. 해외에서    │ │
│  │     월 $30에 한국 과자 받아보는 수요가 확실해요. │ │
│  │                                                 │ │
│  │  ── Round 2: 토론/반박 ──                       │ │
│  │                                                 │ │
│  │  📋 구독 박스는 물류 비용이 핵심인데, 초기      │ │
│  │     스타트업에서 감당 가능할까요? 디지털 상품이▌ │ │
│  │                                                 │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
└─────────────────────────────────────────────────────┘
```

#### Screen 2.5: 에이전트 퇴장 + 스포닝 (retiring → spawning)

```
┌─────────────────────────────────────────────────────┐
│                                                      │
│  ┌─ Agents ───────────────────────────────────────┐ │
│  │                                                 │ │
│  │  ┌───────────┐              ┌───────────┐      │ │
│  │  │ 📋 PM     │              │ 🎨 마케팅 │      │ │
│  │  │ (고정)    │              │ ← fadeOut  │      │ │
│  │  └───────────┘              └───────────┘      │ │
│  │                                                 │ │
│  │  💬 "팬덤 비즈니스는 제 전문이 아닙니다.       │ │
│  │      전문가에게 맡기겠습니다!"                  │ │
│  │                                                 │ │
│  │         ⚡ 전문가 에이전트 감지! ⚡              │ │
│  │    "K-pop 팬덤 비즈니스 전문 지식 필요"         │ │
│  │                                                 │ │
│  │              ┌───────────┐                      │ │
│  │              │ ⭐        │ ← 등장 애니메이션    │ │
│  │              │ 팬덤      │                      │ │
│  │              │ 이코노미  │                      │ │
│  │              │ 전문가    │                      │ │
│  │              └───────────┘                      │ │
│  │                                                 │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
└─────────────────────────────────────────────────────┘
```

#### Screen 3: 결과 (finished)

```
┌─────────────────────────────────────────────────────┐
│  🏟️ Agent Arena            토론 완료! 🎉            │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌─ 최종 아이디어 ────────────────────────────────┐ │
│  │                                                 │ │
│  │  💡 AI 팬아트 크리에이터 플랫폼                 │ │
│  │  K-pop 팬이 저작권 걱정 없이 AI로               │ │
│  │  팬아트를 만드는 플랫폼                         │ │
│  │                                                 │ │
│  │  🎯 타겟      해외 K-pop 팬 (18-30세)          │ │
│  │  💰 수익모델   프리미엄 AI 도구 월 $9.99       │ │
│  │  🔥 차별점    저작권 안전 + AI 생성 도구        │ │
│  │  📊 시장규모   $2.3B (팬덤 이코노미)           │ │
│  │                                                 │ │
│  │  📋 Next Steps                                  │ │
│  │  1. MVP 프로토타입 개발                         │ │
│  │  2. K-pop 팬 커뮤니티 검증                      │ │
│  │  3. 저작권 법률 검토                            │ │
│  │                                                 │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─ 토론 하이라이트 ──────────────────────────────┐ │
│  │                                                 │ │
│  │  R1 ●───── K-food vs K-culture 체험             │ │
│  │  R2 ●───── 디지털 상품으로 수렴                 │ │
│  │  R3 ●───── 팬아트 + AI 조합 최종 선택           │ │
│  │                                                 │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─ 랜딩페이지 미리보기 ─────────────────────────┐ │
│  │                                                 │ │
│  │  ┌───────────────────────────────────────────┐ │ │
│  │  │  (iframe - srcdoc)                         │ │ │
│  │  │                                            │ │ │
│  │  │  ✨ AI 팬아트 크리에이터                │ │ │
│  │  │  K-pop 팬이 저작권 걱정 없이...            │ │ │
│  │  │                                            │ │ │
│  │  │  [시작하기]                                 │ │ │
│  │  │                                            │ │ │
│  │  └───────────────────────────────────────────┘ │ │
│  │                                                 │ │
│  │  이 아이디어의 랜딩페이지가 자동 생성되었습니다 │ │
│  │                                                 │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│         [🔄 새 토론 시작]                            │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 7.3 Animations (Framer Motion)

| 요소 | 애니메이션 | 라이브러리 |
|------|----------|-----------|
| 에이전트 카드 등장 | scale 0→1 + fadeIn + bounce | framer-motion |
| **에이전트 퇴장** | **fadeOut + scale 1→0 + slideOut** | **framer-motion** |
| **퇴장 메시지** | **fadeIn + italic 스타일** | **framer-motion + CSS** |
| 새 에이전트 스포닝 | 번개 이펙트 + scale 0→1 + glow | framer-motion |
| 메시지 등장 | slideUp + fadeIn | framer-motion |
| 스트리밍 텍스트 | 타이핑 커서 깜빡임 | CSS animation |
| 라운드 전환 | 배너 slideDown + 컬러 전환 | framer-motion |
| 결과 카드 | staggered fadeIn (항목별 순차) | framer-motion |
| 랜딩페이지 로딩 | 스켈레톤 shimmer → fadeIn | framer-motion |
| 에이전트 발언 중 표시 | 점 3개 펄스 애니메이션 | CSS animation |

---

## 8. Team Assignment (병렬 개발)

### 8.1 작업 분배 원칙

```
┌─────────────────────────────────────────────────────┐
│                                                      │
│  Person 1 (P1): Backend                              │
│  ─────────────────────                               │
│  담당: API, 오케스트레이터, 프롬프트, 타입            │
│  파일: src/lib/*, src/app/api/*                       │
│                                                      │
│  Person 2 (P2): Frontend Core (토론 UI)              │
│  ─────────────────────                               │
│  담당: 레이아웃, 에이전트 카드, 토론 메시지,          │
│        애니메이션, 퇴장 효과                          │
│  파일: src/app/page.tsx, layout.tsx,                  │
│        src/components/Debate*, Agent*, Round*         │
│                                                      │
│  Person 3 (P3): Frontend Input/Result + Hook         │
│  ─────────────────────                               │
│  담당: 입력 UI, 결과 패널, SSE 훅, 프리셋            │
│  파일: src/components/Topic*, Result*, Idea*,         │
│        Debate*, Preset*, src/hooks/*                  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 8.2 Person 1: Backend

**파일 목록:**
- `src/lib/types.ts` — 공유 타입 (최초 작성, 다른 사람에게 공유)
- `src/lib/orchestrator.ts` — 토론 오케스트레이션 로직
- `src/lib/prompts.ts` — 시스템 프롬프트 모음
- `src/app/api/debate/route.ts` — SSE 스트리밍 API

**핵심 산출물:**
- `POST /api/debate` 엔드포인트가 SSE로 토론 + 랜딩페이지를 스트리밍
- PM(고정) + Agent 2 생성 → 라운드별 발언 → 퇴장 → 스포닝 → 결과 → 랜딩페이지 순서

**의존성:**
- OpenAI API key (`OPENAI_API_KEY`)
- GPT-4o 모델

**테스트 방법:**
```bash
curl -N -X POST http://localhost:3000/api/debate \
  -H "Content-Type: application/json" \
  -d '{"topic":"외국인 타겟 한국문화 아이템"}'
```

### 8.3 Person 2: Frontend Core

**파일 목록:**
- `src/app/layout.tsx` — 전역 레이아웃, 폰트, 메타데이터
- `src/app/page.tsx` — 메인 페이지 (상태에 따라 화면 분기)
- `src/app/globals.css` — 글로벌 스타일, 커스텀 CSS 변수
- `src/components/DebateArena.tsx` — 토론 메인 컨테이너
- `src/components/AgentCard.tsx` — 에이전트 프로필 카드
- `src/components/AgentMessage.tsx` — 토론 메시지 버블
- `src/components/AgentSpawnEffect.tsx` — 새 에이전트 등장 효과
- `src/components/AgentRetireEffect.tsx` — 에이전트 퇴장 효과
- `src/components/RoundBanner.tsx` — 라운드 구분 배너

**Props 인터페이스 (P3의 useDebate에서 받음):**
```typescript
// DebateArena.tsx
interface DebateArenaProps {
  agents: Agent[];
  retiredAgents: Agent[];
  messages: AgentMessage[];
  currentRound: number;
  activeAgentId: string | null;
  streamingText: string;
  status: DebateStatus;
}

// AgentCard.tsx
interface AgentCardProps {
  agent: Agent;
  isActive: boolean;      // 현재 발언 중
  isNew?: boolean;         // 스포닝 애니메이션 트리거
  isRetiring?: boolean;    // 퇴장 애니메이션 트리거
  isFixed?: boolean;       // PM 고정 표시
}

// AgentMessage.tsx
interface AgentMessageProps {
  agent: Agent;            // 색상/이모지용
  message: AgentMessage;
  isStreaming?: boolean;   // 타이핑 커서 표시
  streamingText?: string;
}

// AgentRetireEffect.tsx
interface AgentRetireEffectProps {
  agent: Agent;
  exitMessage: string;
  onComplete: () => void;  // 애니메이션 완료 콜백
}

// RoundBanner.tsx
interface RoundBannerProps {
  round: DebateRound;
}
```

**개발 시 Mock 데이터:**
```typescript
const mockAgents: Agent[] = [
  { id: 'pm', name: 'PM 에이전트', role: '프로덕트 매니저', personality: '현실적, 날카로움', color: '#3B82F6', emoji: '📋', isFixed: true },
  { id: 'a2', name: '마케팅 전략가 박서연', role: '마케팅 전략', personality: '공격적, 시장 중심', color: '#EF4444', emoji: '🎨' },
];

const mockMessages: AgentMessage[] = [
  { id: 'm1', agentId: 'pm', content: '한류 시장이 크다는 건 알겠는데, 유저가 돈을 내야 하는 이유가 뭐죠?', round: 1, timestamp: 0 },
  { id: 'm2', agentId: 'a2', content: 'K-food 구독 박스 시장을 보세요. 해외에서 월 $30에 한국 과자 받아보는 수요가 확실합니다.', round: 1, timestamp: 1 },
];
```

### 8.4 Person 3: Frontend Input/Result + Hook

**파일 목록:**
- `src/hooks/useDebate.ts` — SSE 연결 + 이벤트 파싱 + DebateState 관리
- `src/components/TopicInput.tsx` — 주제 입력 폼
- `src/components/PresetButtons.tsx` — 프리셋 주제 버튼들
- `src/components/ResultPanel.tsx` — 결과 전체 컨테이너 (아이디어 + 하이라이트 + 랜딩페이지)
- `src/components/IdeaCard.tsx` — 최종 아이디어 카드
- `src/components/DebateHighlights.tsx` — 토론 하이라이트 타임라인
- `src/components/LandingPagePreview.tsx` — 랜딩페이지 iframe 미리보기

**useDebate Hook 인터페이스:**
```typescript
interface UseDebateReturn {
  state: DebateState;
  startDebate: (topic: string) => void;
  reset: () => void;
}

function useDebate(): UseDebateReturn;
```

**useDebate 핵심 로직:**
```typescript
const startDebate = async (topic: string) => {
  const response = await fetch('/api/debate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic }),
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    // SSE 포맷 파싱: "event: xxx\ndata: {...}\n\n"
    // → 이벤트 타입별 state 업데이트
    // → agent_retire: retiredAgents에 추가, agents에서 제거
    // → landing_page_ready: landingPageHtml에 저장
  }
};
```

**TopicInput Props:**
```typescript
interface TopicInputProps {
  onSubmit: (topic: string) => void;
  isDisabled: boolean;
}
```

**PresetButtons Props:**
```typescript
interface PresetButtonsProps {
  onSelect: (topic: string) => void;
  isDisabled: boolean;
}

const PRESETS = [
  { emoji: '🇰🇷', label: '외국인 타겟 한국문화 아이템', topic: '요새 한국문화가 핫해서 외국인 타겟으로 아이템을 만들고 싶은데 아이디어가 없어' },
  { emoji: '💻', label: '1인 SaaS 사업 아이디어', topic: '개발자 1명이서 만들 수 있는 SaaS 사업 아이디어를 찾고 있어' },
  { emoji: '📱', label: 'Z세대 소셜 플랫폼', topic: 'Z세대를 타겟으로 한 새로운 소셜 미디어 플랫폼 아이디어가 필요해' },
];
```

**ResultPanel Props:**
```typescript
interface ResultPanelProps {
  result: DebateResult;
  agents: Agent[];
  landingPageHtml: string | null;
  isGeneratingLanding: boolean;
  onNewDebate: () => void;
}
```

**LandingPagePreview Props:**
```typescript
interface LandingPagePreviewProps {
  html: string;
}
// → iframe srcdoc로 렌더링
// → sandbox="allow-same-origin" (보안: 스크립트 차단)
// → 높이 600px, 너비 100%, rounded border
```

---

## 9. Integration Plan (합치기)

### 9.1 순서

```
[T+0:00] P1이 types.ts 작성 → Git push → P2, P3 pull
[T+0:00] P2, P3는 각자 컴포넌트 작업 시작 (mock 데이터로)
[T+1:30] P1이 API 완성 → Git push
[T+1:30] P3가 useDebate hook 완성 → API 연결 테스트
[T+2:00] 1차 통합: page.tsx에서 useDebate + 컴포넌트 조립
[T+2:30] 통합 테스트 + 버그 수정
[T+3:00] UI 폴리시 + 프리셋 테스트
[T+3:30] 최종 배포
```

### 9.2 합체 포인트 (page.tsx)

```typescript
'use client';

import { useDebate } from '@/hooks/useDebate';
import { TopicInput } from '@/components/TopicInput';
import { PresetButtons } from '@/components/PresetButtons';
import { DebateArena } from '@/components/DebateArena';
import { ResultPanel } from '@/components/ResultPanel';

export default function Home() {
  const { state, startDebate, reset } = useDebate();

  return (
    <main>
      {state.status === 'idle' && (
        <>
          <TopicInput onSubmit={startDebate} isDisabled={false} />
          <PresetButtons onSelect={startDebate} isDisabled={false} />
        </>
      )}

      {(state.status === 'creating' || state.status === 'debating' || state.status === 'retiring' || state.status === 'spawning') && (
        <DebateArena
          agents={state.agents}
          retiredAgents={state.retiredAgents}
          messages={state.messages}
          currentRound={state.currentRound}
          activeAgentId={state.activeAgentId}
          streamingText={state.streamingText}
          status={state.status}
        />
      )}

      {(state.status === 'finished' || state.status === 'generating_landing') && state.result && (
        <ResultPanel
          result={state.result}
          agents={state.agents}
          landingPageHtml={state.landingPageHtml}
          isGeneratingLanding={state.status === 'generating_landing'}
          onNewDebate={reset}
        />
      )}
    </main>
  );
}
```

### 9.3 Git 전략

```
main (보호)
├── feat/backend     ← P1
├── feat/frontend-core  ← P2
└── feat/frontend-result ← P3

합치기: P2가 main에 먼저 머지 (레이아웃)
     → P3가 main에 머지 (hook + 결과)
     → P1이 main에 머지 (API)
     → 통합 테스트
```

---

## 10. Preset Demo Scenarios

심사위원이 바로 클릭할 수 있는 3개 프리셋:

### Preset 1: 외국인 타겟 한국문화 아이템
```
예상 에이전트: PM(고정) vs 마케팅 전략가
예상 퇴장: 마케팅 전략가 → 한류/팬덤 전문가 스포닝
예상 결과: K-culture 관련 디지털 서비스
```

### Preset 2: 1인 SaaS 사업 아이디어
```
예상 에이전트: PM(고정) vs 테크 리드
예상 퇴장: 테크 리드 → 특정 SaaS 도메인 전문가 스포닝
예상 결과: 니치 SaaS 아이디어
```

### Preset 3: Z세대 소셜 플랫폼
```
예상 에이전트: PM(고정) vs UX 리서처
예상 퇴장: UX 리서처 → Z세대 트렌드 분석가 스포닝
예상 결과: 차세대 소셜 플랫폼 컨셉
```

---

## 11. Risk & Mitigation

| 리스크 | 확률 | 대응 |
|--------|------|------|
| OpenAI API 속도 느림 | 중간 | 스트리밍으로 체감 속도 개선, 에이전트 발언 길이 제한 |
| 토론이 발산만 함 | 중간 | PM 에이전트가 자연스럽게 브레이크 + Round 3 프롬프트에 강제 수렴 지시 |
| 3.5시간 내 미완성 | 높음 | 최소 1개 프리셋이 완벽 작동하는 것 우선 |
| 에이전트 성격 안 살아남 | 낮음 | 시스템 프롬프트에 구체적 성격 지시 |
| SSE 파싱 오류 | 중간 | 단순한 이벤트 포맷 유지, 에러 핸들링 |
| Git 머지 충돌 | 낮음 | 파일 단위 분리 철저 (겹치는 파일 없음) |
| 퇴장 타이밍 부자연스러움 | 중간 | 스포닝 프롬프트에 퇴장 메시지 자연스럽게 지시 |

---

## 12. MVP Definition (시간 부족 시 컷라인)

### Must Have (이거 없으면 데모 불가)
- [ ] 주제 입력 → PM(고정) + Agent 2 생성
- [ ] 2개 에이전트 토론 (최소 2라운드)
- [ ] 실시간 스트리밍
- [ ] 최종 결과 카드
- [ ] 프리셋 1개

### Should Have (있으면 훨씬 좋음)
- [ ] Agent 2 퇴장 + 새 전문가 에이전트 스포닝
- [ ] 퇴장 애니메이션 + 스포닝 애니메이션
- [ ] Round 3 (PM + 새 에이전트 수렴)
- [ ] 프리셋 3개
- [ ] 랜딩페이지 자동 생성 + iframe 미리보기

### Nice to Have (시간 남으면)
- [ ] 토론 하이라이트 타임라인
- [ ] 에이전트 카드 상세 애니메이션
- [ ] 결과 공유 기능
