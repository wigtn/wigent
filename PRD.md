# Agent Arena PRD

> **Version**: 2.0
> **Created**: 2026-03-27
> **Updated**: 2026-03-28
> **Status**: Draft
> **Hackathon**: Build with TRAE @Seoul (2026-03-28)
> **Coding Time**: 3.5 hours (12:30~16:00)
> **Team**: 3 members (각자 Claude Code로 병렬 개발 → merge)
> **Scale Grade**: Hobby

---

## 1. Overview

### 1.1 Problem Statement

사업 아이디어를 구체화할 때, 혼자 생각하면 편향되고 팀 토론은 시간이 오래 걸린다. 기존 AI 도구는 단일 응답만 제공하여 다양한 관점의 충돌과 수렴 과정이 없다.

### 1.2 Solution

사용자가 주제를 던지면, **PM 에이전트(고정)**와 **주제별 전문가 에이전트(자동 생성)**가 **Slack 스타일 채팅 UI**에서 실시간으로 토론·반박하고, 토론 중 기존 에이전트가 **퇴장**하며 새 **전문가 에이전트가 자동 탄생**하여 합류한다. 토론이 끝나면 **아이디어 기반의 랜딩페이지가 자동 생성**되어 채팅 화면 자체를 대체한다.

### 1.3 Goals

- 주제 입력 → 에이전트 자동 생성 → Slack 스타일 실시간 토론 → 에이전트 퇴장/스포닝 → 랜딩페이지로 전환
- 토론 과정이 Slack처럼 친숙하고 몰입감 있는 것
- 토론 종료 → 웹페이지 갈아끼기(Full Page Swap)의 임팩트
- 에이전트 디자인 패턴 7개 이상 활용

### 1.4 Non-Goals (Out of Scope)

- 사용자가 토론에 직접 참여하는 기능 (v2)
- 에이전트 커스터마이징 (v2)
- 로그인/저장 기능
- 랜딩페이지 편집 기능

### 1.5 Scope

| 포함 | 제외 |
|------|------|
| 주제 입력 및 프리셋 | 사용자 채팅 참여 |
| Slack 스타일 채팅 토론 | 멀티 채널/워크스페이스 |
| 에이전트 자동 생성/퇴장/스포닝 | 에이전트 커스터마이징 |
| 토론 완료 후 랜딩페이지 자동 생성 & 페이지 전환 | 랜딩페이지 코드 다운로드 |
| 새 토론 시작 | 이전 토론 히스토리 |

### 1.6 Key Differentiators

| vs | 차별점 |
|----|--------|
| ChatGPT | 단일 응답 vs **Slack 채팅에서 다관점 토론 시각화** |
| 기존 브레인스토밍 도구 | 수동 vs **AI 자율 토론 → 결과물이 실제 웹페이지** |
| Multi-agent 데모 | 터미널 텍스트 vs **Slack UI 토론 → 랜딩페이지 자동 생성** |

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
- Slack 스타일 채팅 UI (친숙하면서 세련된 UX)
- 컴포넌트 분리 철저 (파일당 단일 책임)
- 접근성 (aria-label, semantic HTML)
- 반응형 (모바일~데스크탑)
- 로딩 상태, 트랜지션, 마이크로 애니메이션
- 페이지 전환 애니메이션 (채팅 → 랜딩페이지)
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

마케팅 전략가: "팬덤 비즈니스는 제 전문이 아닙니다.
                  전문가에게 맡기겠습니다. 행운을 빕니다!"
→ Slack 스타일 퇴장 메시지 ("마케팅 전략가 박서연님이 채널을 나갔습니다")

팬덤 이코노미 전문가 등장!
→ Slack 스타일 합류 메시지 ("팬덤 이코노미 전문가 이도현님이 채널에 참여했습니다")

Round 3: PM + 팬덤 전문가 (2명으로 수렴)
```

---

## 4. User Flow

```
┌─ STEP 1: 입력 ─────────────────────────────────┐
│                                                  │
│  사용자가 주제 입력 또는 프리셋 선택             │
│  "외국인 타겟 한국문화 아이템 아이디어"          │
│  (Slack 워크스페이스 랜딩 느낌)                  │
│                                                  │
└──────────────────┬───────────────────────────────┘
                   ▼
┌─ STEP 2: Slack 채팅 진입 ─────────────────────┐
│                                                  │
│  주제가 채널명이 됨: #한국문화-아이템-토론       │
│  좌측 사이드바에 채널 표시                       │
│  오케스트레이터가 주제 분석                      │
│  → PM 에이전트 (고정) + Agent 2 자동 생성       │
│  → "PM 에이전트님이 채널에 참여했습니다"         │
│  → "마케팅 전략가 박서연님이 채널에 참여했습니다"│
│                                                  │
└──────────────────┬───────────────────────────────┘
                   ▼
┌─ STEP 3: Round 1 - 브레인스토밍 ───────────────┐
│                                                  │
│  채팅 메시지로 PM 발언 (실시간 스트리밍)         │
│  → 아바타 + 이름 + 타임스탬프 + 메시지           │
│  Agent 2 발언 (PM의 발언 참조, 대립)             │
│  라운드 구분선: "── Round 1: 브레인스토밍 ──"    │
│                                                  │
└──────────────────┬───────────────────────────────┘
                   ▼
┌─ STEP 4: Round 2 - 토론/반박 ──────────────────┐
│                                                  │
│  라운드 구분선 표시                              │
│  PM 반박 (Slack 메시지 형태)                     │
│  Agent 2 반박                                    │
│  → 아이디어가 좁혀지기 시작                      │
│                                                  │
└──────────────────┬───────────────────────────────┘
                   ▼
┌─ STEP 5: 에이전트 퇴장 + 스포닝 ───────────────┐
│                                                  │
│  오케스트레이터: 토론 분석                       │
│  → "마케팅 전략가 박서연님이 채널을 나갔습니다"  │
│  → "팬덤 전문가 이도현님이 채널에 참여했습니다"  │
│  (Slack의 시스템 메시지 스타일)                  │
│                                                  │
└──────────────────┬───────────────────────────────┘
                   ▼
┌─ STEP 6: Round 3 - 최종 수렴 ──────────────────┐
│                                                  │
│  PM + 새 전문가 에이전트가 최종 의견             │
│  → 합의점 도출                                   │
│  → 마지막 메시지 후 잠시 pause                   │
│                                                  │
└──────────────────┬───────────────────────────────┘
                   ▼
┌─ STEP 7: 랜딩페이지 전환 (Full Page Swap) ─────┐
│                                                  │
│  채팅 화면에 시스템 메시지:                      │
│  "토론이 완료되었습니다. 랜딩페이지를 생성 중..."│
│  → 로딩 애니메이션 (프로그레스 바 또는 스피너)   │
│  → GPT-4o가 FinalIdea 기반으로 HTML 생성         │
│  → 전체 페이지가 fade-out → 랜딩페이지 fade-in   │
│  → 채팅 UI 완전히 사라지고 랜딩페이지만 표시     │
│  → 하단 플로팅 버튼: [새 토론 시작]              │
│                                                  │
└─────────────────────────────────────────────────┘
```

**핵심 전환 흐름:**

```
채팅(Slack UI)에서 토론 → 토론 종료
                              ↓
                    "랜딩페이지 생성 중..." 표시
                              ↓
                    GPT-4o가 HTML 코드 생성
                              ↓
                    전체 페이지 Swap 애니메이션
                    (채팅 fade-out → 랜딩페이지 fade-in)
                              ↓
                    랜딩페이지가 전체 화면 차지
                    + [새 토론 시작] 플로팅 버튼
```

---

## 5. UI/UX Design

### 5.1 Slack 스타일 채팅 UI

전체 레이아웃은 Slack의 핵심 구조를 따른다:

```
┌──────────────────────────────────────────────────────────┐
│  Agent Arena                                    [Theme]  │
├────────────┬─────────────────────────────────────────────┤
│            │  # 한국문화-아이템-토론                      │
│  CHANNELS  │  ─────────────────────────────────────────  │
│            │                                             │
│  # 현재토론 │  ┌─────────────────────────────────────┐   │
│            │  │ 🤖 PM 에이전트님이 참여했습니다       │   │
│            │  │ 📊 마케팅 전략가 박서연님이 참여      │   │
│  ────────  │  └─────────────────────────────────────┘   │
│            │                                             │
│  AGENTS    │  ── Round 1: 브레인스토밍 ──               │
│            │                                             │
│  🤖 PM     │  ┌──┬──────────────────────────────────┐   │
│  📊 박서연  │  │🤖│ PM 에이전트          12:31 PM    │   │
│            │  │  │ 외국인 타겟이라면 우선 어떤 문화   │   │
│            │  │  │ 요소가 실제로 구매로 이어지는지    │   │
│            │  │  │ 봐야 해요. K-pop 굿즈? 전통공예?  │   │
│            │  └──┴──────────────────────────────────┘   │
│            │                                             │
│            │  ┌──┬──────────────────────────────────┐   │
│            │  │📊│ 마케팅 전략가 박서연    12:31 PM  │   │
│            │  │  │ 시장 데이터를 보면 K-beauty가      │   │
│            │  │  │ 여전히 성장세예요. 문화 체험형     │   │
│            │  │  │ 구독 박스는 어떨까요?              │   │
│            │  └──┴──────────────────────────────────┘   │
│            │                                             │
│            │  ── Round 2: 토론/반박 ──                   │
│            │  ...                                        │
│            │                                             │
│            │  ─────────────────────────────────────────  │
│            │  🔒 이 채널은 AI 에이전트 전용입니다        │
└────────────┴─────────────────────────────────────────────┘
```

### 5.2 채팅 UI 세부 스펙

**메시지 컴포넌트:**
- 아바타: 에이전트 이모지 (원형 배경 + 에이전트 color)
- 이름: 굵은 글씨 + 역할 뱃지 (예: `PM 에이전트` `PM`)
- 타임스탬프: 우측 상단, 연한 회색
- 메시지 본문: 일반 텍스트, 좌측 정렬
- 스트리밍 중: 타이핑 인디케이터 (세 개 점 애니메이션) → 텍스트 실시간 표시

**시스템 메시지:**
- 채널 참여/퇴장: 중앙 정렬, 연한 텍스트, 아이콘 포함
- 라운드 구분선: `── Round N: 제목 ──` 형태의 divider

**사이드바:**
- 상단: 워크스페이스명 "Agent Arena"
- CHANNELS 섹션: 현재 토론 채널 (활성 상태 표시)
- AGENTS 섹션: 현재 참여 중인 에이전트 목록 (온라인 상태 표시)
  - 퇴장한 에이전트: 오프라인(회색) 표시
  - 새 에이전트 합류: 온라인(초록) 표시 + 하이라이트

**하단 입력 영역:**
- 비활성화 상태: "이 채널은 AI 에이전트 전용입니다" 표시
- 잠금 아이콘으로 읽기 전용 강조

### 5.3 페이지 전환 애니메이션

토론 완료 → 랜딩페이지 전환 시:

1. 채팅에 시스템 메시지: "토론이 완료되었습니다"
2. 1초 pause
3. 화면 중앙에 "아이디어를 웹페이지로 만들고 있어요..." + 프로그레스 바
4. GPT-4o가 HTML 생성 완료
5. **전환 애니메이션**:
   - 채팅 UI가 위로 슬라이드 + fade-out (500ms)
   - 랜딩페이지가 아래에서 슬라이드 + fade-in (500ms)
   - 또는: 채팅이 축소(scale down) → 랜딩페이지가 확대(scale up)
6. 랜딩페이지가 전체 뷰포트 차지
7. 우측 하단 플로팅 버튼: "새 토론 시작" (클릭 시 초기 화면으로)

### 5.4 디자인 토큰

```
Theme: Dark

Background:
  --bg-primary: #1a1d21     (Slack dark theme 메인 배경)
  --bg-sidebar: #19171d     (사이드바)
  --bg-chat: #1a1d21        (채팅 영역)
  --bg-message-hover: #222529 (메시지 hover)
  --bg-input: #222529       (입력 영역)

Text:
  --text-primary: #d1d2d3   (주요 텍스트)
  --text-secondary: #ababad (보조 텍스트)
  --text-muted: #696b6f     (타임스탬프 등)
  --text-highlight: #ffffff (강조)

Agent Colors:
  --agent-pm: #3B82F6       (PM - 파란색)
  --agent-2: #F97316        (Agent 2 - 주황색 계열, 동적)
  --agent-3: #A855F7        (Agent 3 - 보라색 계열, 동적)

Borders:
  --border-subtle: #35373b  (구분선)
  --border-active: #1264a3  (활성 채널)

Status:
  --status-online: #2bac76  (온라인)
  --status-offline: #616061 (오프라인/퇴장)
```

### 5.5 반응형 디자인

| Breakpoint | Layout |
|------------|--------|
| Desktop (≥ 1024px) | 사이드바(240px) + 채팅 영역 |
| Tablet (768-1023px) | 사이드바 접힘(아이콘만) + 채팅 영역 |
| Mobile (< 768px) | 사이드바 숨김 + 채팅 전체 화면 |

---

## 6. Agentic Design Patterns (7/7)

| Pattern | Implementation | 표시 방법 |
|---------|---------------|----------|
| **Multi-Agent** | PM + Agent 2 + 스포닝 에이전트 동시 활동 | 사이드바 AGENTS 섹션 |
| **Inter-Agent Communication** | 에이전트가 서로의 발언을 참조·반박 | 채팅 메시지에서 인용 표시 |
| **Planning** | 오케스트레이터가 라운드 구성, 수렴 타이밍 결정 | 라운드 divider |
| **Routing** | 주제에 따라 Agent 2 역할 배정 + 퇴장/스포닝 결정 | 채널 참여/퇴장 시스템 메시지 |
| **Reasoning** | 각 에이전트가 논리적으로 주장·반박 | 메시지 내 논리 전개 |
| **Reflection** | 오케스트레이터가 토론 분석 → 에이전트 퇴장/교체 판단 | "전문가 필요 감지" 시스템 메시지 |
| **Tool Use** | 오케스트레이터가 에이전트 생성/퇴장 도구 + **랜딩페이지 생성** | 스포닝/퇴장 + 페이지 전환 |

---

## 7. Technical Architecture

### 7.1 Tech Stack

| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 16 | App Router, API Routes |
| React | 19 | UI |
| TypeScript | 5+ | 타입 안전성 |
| Tailwind CSS | 4 | 스타일링 |
| Framer Motion | 12+ | 페이지 전환 + UI 애니메이션 |
| OpenAI | GPT-4o | 에이전트 LLM |
| SSE | - | 실시간 스트리밍 |

### 7.2 Project Structure

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
│   │   ├── chat/
│   │   │   ├── ChatLayout.tsx         [P2] — Slack 전체 레이아웃 (사이드바 + 채팅)
│   │   │   ├── Sidebar.tsx            [P2] — 좌측 사이드바 (채널, 에이전트 목록)
│   │   │   ├── ChatArea.tsx           [P2] — 메인 채팅 영역
│   │   │   ├── ChatMessage.tsx        [P2] — 개별 메시지 (아바타 + 이름 + 내용)
│   │   │   ├── SystemMessage.tsx      [P2] — 시스템 메시지 (참여/퇴장/라운드)
│   │   │   ├── TypingIndicator.tsx    [P2] — 타이핑 중 애니메이션
│   │   │   ├── ChannelHeader.tsx      [P2] — 채널 상단 헤더
│   │   │   └── DisabledInput.tsx      [P2] — 비활성 입력 영역
│   │   ├── TopicInput.tsx             [P3] — 주제 입력 화면
│   │   ├── PresetButtons.tsx          [P3] — 프리셋 버튼
│   │   ├── LandingPageView.tsx        [P3] — 생성된 랜딩페이지 렌더링
│   │   └── PageTransition.tsx         [P2] — 채팅↔랜딩페이지 전환 애니메이션
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
└── tailwind.config.ts
```

### 7.3 Shared Types (`src/lib/types.ts`)

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
  status: 'online' | 'offline';  // Slack 온라인 상태
}

// ── Messages ──
export interface AgentMessage {
  id: string;
  agentId: string;
  content: string;
  round: number;
  timestamp: number;
  isExitMessage?: boolean;
}

// ── System Messages (Slack 스타일) ──
export type SystemMessageType =
  | 'agent_join'       // "~님이 채널에 참여했습니다"
  | 'agent_leave'      // "~님이 채널을 나갔습니다"
  | 'round_divider'    // "── Round N: 제목 ──"
  | 'debate_complete'  // "토론이 완료되었습니다"
  | 'generating';      // "랜딩페이지를 생성 중..."

export interface SystemMessage {
  id: string;
  type: SystemMessageType;
  content: string;
  timestamp: number;
  agentId?: string;    // agent_join, agent_leave 시
}

// ── Chat Message Union ──
export type ChatItem =
  | { kind: 'message'; data: AgentMessage }
  | { kind: 'system'; data: SystemMessage };

// ── Rounds ──
export interface DebateRound {
  number: number;
  title: string;
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

export interface DebateResult {
  idea: FinalIdea;
}

// ── Debate State (Frontend) ──
export type DebateStatus =
  | 'idle'               // 주제 입력 대기
  | 'creating'           // 에이전트 생성 중
  | 'debating'           // 토론 진행 중 (Slack 채팅)
  | 'retiring'           // 에이전트 퇴장 중
  | 'spawning'           // 새 에이전트 스포닝 중
  | 'generating_landing' // 랜딩페이지 생성 중
  | 'landing'            // 랜딩페이지 표시 중
  | 'error';

export interface DebateState {
  status: DebateStatus;
  topic: string;
  channelName: string;           // Slack 채널명 (예: "#한국문화-아이템-토론")
  agents: Agent[];
  retiredAgents: Agent[];
  rounds: DebateRound[];
  chatItems: ChatItem[];         // 채팅 메시지 + 시스템 메시지 통합
  currentRound: number;
  activeAgentId: string | null;
  streamingText: string;
  result: DebateResult | null;
  landingPageHtml: string | null;
  error: string | null;
}

// ── State Transitions (useReducer 패턴 권장) ──
// idle → creating (토론 시작)
// creating → debating (agents_created 수신)
// debating → retiring (agent_retire 수신)
// retiring → spawning (spawn_trigger 수신)
// spawning → debating (agent_spawned 수신)
// debating → generating_landing (final_result 수신)
// generating_landing → landing (landing_page_ready 수신)
// * → error (error 이벤트 또는 SSE 연결 끊김)
// landing → idle ("새 토론 시작" 클릭)
// error → idle ("새 토론 시작" 클릭)

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
  | 'landing_page_chunk'    // 랜딩페이지 HTML 스트리밍
  | 'landing_page_ready'
  | 'debate_end'
  | 'error';

// Event Payloads
export interface AgentsCreatedEvent {
  agents: Agent[];
  channelName: string;
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

export interface LandingPageChunkEvent {
  chunk: string;
}

export interface LandingPageReadyEvent {
  html: string;
}

export interface DebateEndEvent {
  totalRounds: number;
  totalAgents: number;
  totalMessages: number;
}
```

### 7.4 API Specification

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
1.  agents_created    → { agents: Agent[], channelName: string }
2.  round_start       → { round: 1, title: "브레인스토밍" }
3.  agent_speak_start → { agentId, round }
4.  agent_speak_chunk → { agentId, chunk } (반복, 스트리밍)
5.  agent_speak_done  → { agentId, fullMessage }
6.  (Agent 2도 3-5 반복)
7.  round_start       → { round: 2, title: "토론/반박" }
8.  (PM, Agent 2 발언 반복)
9.  agent_retire      → { agentId, exitMessage }
10. spawn_trigger     → { reason: "..." }
11. agent_spawned     → { agent: Agent }
12. round_start       → { round: 3, title: "최종 수렴" }
13. (PM + 새 에이전트 발언)
14. final_result      → { result: DebateResult }
15. landing_page_chunk → { chunk } (HTML 스트리밍, 반복)
16. landing_page_ready → { html } (완성된 HTML)
17. debate_end        → { totalRounds, totalAgents, totalMessages }
```

**Error Event:**
```
event: error
data: { "message": "OpenAI API 호출 실패" }
```

**Error Responses:**

| Status | Code | Message | Description |
|--------|------|---------|-------------|
| 400 | INVALID_INPUT | Topic is required | 주제 미입력 |
| 500 | LLM_ERROR | OpenAI API call failed | GPT-4o 호출 실패 |
| 500 | STREAM_ERROR | SSE stream interrupted | 스트리밍 중단 |

### 7.5 Orchestrator Logic (`src/lib/orchestrator.ts`)

```
async function* runDebate(topic: string): AsyncGenerator<SSEEvent>

내부 흐름:
1. analyzeTopicAndCreateAgents(topic)
   → GPT-4o 1회: 주제 분석 + PM(고정) + Agent 2 역할/성격 결정
   → yield agents_created (channelName 포함)

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
   → yield agent_retire (Agent 2 퇴장)
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
   → yield landing_page_chunk (스트리밍)
   → yield landing_page_ready (완성)

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

**GPT-4o 호출 안정성 정책:**
- 개별 호출 timeout: 30초
- 실패 시 retry: 1회
- `previousMessages`는 **최근 6개 메시지로 제한** (토큰 폭발 방지)
- JSON 응답 요청 시 `response_format: { type: "json_object" }` 사용
- 랜딩페이지 생성 실패 시: FinalIdea 데이터를 **하드코딩 fallback 템플릿**에 삽입하여 표시
- 서버 측 `AbortController` 사용: 클라이언트 SSE 연결 종료 시 진행 중인 GPT-4o 호출 즉시 중단

**SSE 연결 안정성:**
- 프론트엔드 `EventSource.onerror` 핸들링 필수
- 연결 끊김 시 "연결이 끊어졌습니다. 새 토론을 시작해주세요" 에러 UI 표시
- 재연결/복구는 Out of Scope (Hobby 등급)

### 7.6 System Prompts (`src/lib/prompts.ts`)

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

다음 JSON 형식으로 응답:
{
  "agent": {
    "name": "이름 (한글, 직함 포함)",
    "role": "전문 분야",
    "personality": "토론 스타일 (데이터 중심/감성적/실용적 등)",
    "color": "hex color (빨강/주황/보라 계열)",
    "emoji": "대표 이모지 1개"
  },
  "channelName": "주제를 2-3단어 한글로 요약한 채널명 (예: 한국문화-아이템-토론)",
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
- channelName은 Slack 채널명 스타일 (하이픈 구분, 한글 가능)
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
  }
}
```

#### 오케스트레이터: 랜딩페이지 생성

```
아래 아이디어를 기반으로 멋진 랜딩페이지 HTML을 생성하세요.
이 HTML은 실제 웹페이지로 보여지므로 완성도 높게 만드세요.

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
- 모던 디자인 (그라디언트, 글래스모피즘, subtle 애니메이션)
- 섹션: Hero (제목 + 한줄 설명 + CTA) → Features (차별점) → Target → Revenue → CTA
- 반응형 (모바일 대응)
- 한국어
- <html>, <head>, <body> 태그 포함한 완전한 HTML
- CSS 애니메이션 사용 가능 (scroll fade-in 등)
- JavaScript 최소한 (스크롤 애니메이션 정도만)
- 응답은 HTML 코드만 (마크다운 코드블록 없이 순수 HTML)
```

---

## 8. User Stories

### 8.1 Primary User

As a **사업 기획자/창업 준비생**, I want to **주제를 입력하면 AI 에이전트들이 Slack처럼 토론하고 결과를 랜딩페이지로 보여주는 것** so that **아이디어를 빠르게 검증하고 시각적으로 확인할 수 있다**.

### 8.2 Acceptance Criteria (Gherkin)

```gherkin
Scenario: 주제 입력 후 Slack 채팅 토론 시작
  Given 사용자가 메인 화면에 있다
  When "외국인 타겟 한국문화 아이템" 주제를 입력한다
  Then Slack 스타일 채팅 UI로 전환된다
  And 채널명이 "#한국문화-아이템-토론"으로 표시된다
  And PM 에이전트와 전문가 에이전트가 채널에 참여한다
  And 토론이 실시간 스트리밍으로 진행된다

Scenario: 에이전트 퇴장 및 새 에이전트 합류
  Given Round 2 토론이 진행 중이다
  When 오케스트레이터가 에이전트 교체를 결정한다
  Then 기존 에이전트의 퇴장 시스템 메시지가 표시된다
  And 사이드바에서 해당 에이전트가 오프라인으로 변경된다
  And 새 에이전트의 합류 시스템 메시지가 표시된다
  And 사이드바에 새 에이전트가 온라인으로 추가된다

Scenario: 토론 완료 후 랜딩페이지 전환
  Given Round 3 토론이 완료되었다
  When 최종 아이디어가 도출된다
  Then 채팅에 "토론이 완료되었습니다" 시스템 메시지가 표시된다
  And "랜딩페이지를 생성 중..." 로딩이 표시된다
  And 전환 애니메이션과 함께 채팅 UI가 사라진다
  And 생성된 랜딩페이지가 전체 화면에 표시된다
  And "새 토론 시작" 플로팅 버튼이 표시된다
```

---

## 9. Functional Requirements

| ID | Requirement | Priority | Dependencies |
|----|------------|----------|--------------|
| FR-001 | 주제 입력 및 프리셋 선택 | P0 (Must) | - |
| FR-002 | SSE 기반 실시간 토론 스트리밍 | P0 (Must) | - |
| FR-003 | Slack 스타일 채팅 메시지 렌더링 | P0 (Must) | FR-002 |
| FR-004 | 에이전트 참여/퇴장 시스템 메시지 | P1 (Should) | FR-003 |
| FR-005 | 사이드바 에이전트 온/오프라인 상태 | P1 (Should) | FR-003 |
| FR-006 | 라운드 divider 표시 | P1 (Should) | FR-003 |
| FR-007 | 타이핑 인디케이터 애니메이션 | P1 (Should) | FR-003 |
| FR-008 | 토론 완료 후 랜딩페이지 HTML 생성 | P0 (Must) | FR-002 |
| FR-009 | Full Page Swap 기본 전환 (조건부 렌더링) | P0 (Must) | FR-008 |
| FR-009a | 전환 애니메이션 (Framer Motion fade/slide) | P1 (Should) | FR-009 |
| FR-010 | "새 토론 시작" 플로팅 버튼 | P0 (Must) | FR-009 |
| FR-011 | 채널명 자동 생성 (주제 기반) | P2 (Could) | FR-001 |
| FR-012 | 반응형 레이아웃 (모바일 대응) | P1 (Should) | FR-003 |
| FR-013 | Topic 입력 검증 (5~200자, trim, 빈 문자열 체크) | P1 (Should) | FR-001 |
| FR-014 | SSE 연결 끊김 에러 UI | P1 (Should) | FR-002 |

---

## 10. Non-Functional Requirements

### 10.0 Scale Grade

**Hobby** — 해커톤 프로젝트, 3명 개발, 사용자 수백 명 이하.

### 10.1 Performance SLA

| 지표 | 목표값 |
|------|--------|
| 첫 에이전트 메시지 표시 | < 5초 (SSE 스트리밍 시작) |
| 전체 토론 완료 | 45~65초 |
| 랜딩페이지 생성 | < 15초 |
| 페이지 전환 애니메이션 | < 1초 |

### 10.2 Availability

**95% uptime** — Hobby 등급, 허용 다운타임 월 36시간.

### 10.3 Security

- Authentication: None (해커톤 데모)
- OpenAI API Key: 서버 환경변수로만 관리
- 사용자 입력(topic): XSS 방지를 위한 sanitize 필수
- 생성된 랜딩페이지 HTML: `srcdoc` + `sandbox="allow-scripts"` (allow-same-origin 제외)로 렌더링 (DOM 격리, parent 접근 차단)

---

## 11. Implementation Phases

### Phase 1: MVP Core (P1 - Backend)
- [ ] `types.ts` — 공유 타입 정의
- [ ] `prompts.ts` — 시스템 프롬프트
- [ ] `orchestrator.ts` — 토론 오케스트레이터 + 랜딩페이지 생성
- [ ] `route.ts` — SSE API 엔드포인트
**Deliverable**: 토론 API가 동작하고 랜딩페이지 HTML이 생성됨

### Phase 2: Chat UI (P2 - Frontend Core)
- [ ] `ChatLayout.tsx` — Slack 전체 레이아웃
- [ ] `Sidebar.tsx` — 사이드바 (채널, 에이전트 목록)
- [ ] `ChatArea.tsx` — 채팅 영역
- [ ] `ChatMessage.tsx` — 메시지 컴포넌트
- [ ] `SystemMessage.tsx` — 시스템 메시지
- [ ] `TypingIndicator.tsx` — 타이핑 애니메이션
- [ ] `ChannelHeader.tsx` — 채널 헤더
- [ ] `DisabledInput.tsx` — 비활성 입력
- [ ] `PageTransition.tsx` — 페이지 전환 애니메이션
- [ ] `layout.tsx`, `page.tsx`, `globals.css`
**Deliverable**: Slack 스타일 채팅 UI + 페이지 전환 동작

### Phase 3: Input/Output (P3 - Frontend IO)
- [ ] `TopicInput.tsx` — 주제 입력 화면
- [ ] `PresetButtons.tsx` — 프리셋 버튼
- [ ] `LandingPageView.tsx` — 랜딩페이지 렌더링 (sandbox iframe)
- [ ] `useDebate.ts` — SSE 연결 + 상태 관리 Hook
**Deliverable**: 전체 플로우 (입력 → 채팅 → 랜딩페이지) 완성

---

## 12. Team Assignment (Parallel Development)

| 담당 | 역할 | 작업 파일 |
|------|------|----------|
| **P1 (Backend)** | 타입, 오케스트레이터, API | `types.ts`, `orchestrator.ts`, `prompts.ts`, `route.ts` |
| **P2 (Frontend Core)** | Slack 채팅 UI, 애니메이션 | `ChatLayout`, `Sidebar`, `ChatArea`, `ChatMessage`, `SystemMessage`, `TypingIndicator`, `ChannelHeader`, `DisabledInput`, `PageTransition`, `layout.tsx`, `page.tsx` |
| **P3 (Frontend IO)** | 입력, 결과, Hook | `TopicInput`, `PresetButtons`, `LandingPageView`, `useDebate.ts` |

**Integration Sequence:**
```
P1: types.ts 완성 → P2, P3에 공유
        ↓
P2: 채팅 UI 모킹 개발 (더미 데이터)
P3: 입력 UI + useDebate Hook 개발 (더미 SSE)
        ↓
P1: API 완성 → P3가 useDebate에 실제 API 연결
        ↓
P2 + P3 merge → 전체 플로우 테스트
        ↓
최종 조정 (애니메이션, 스타일링) → 배포
```

---

## 13. Preset Demo Scenarios

| 프리셋 | 주제 | 예상 토론 방향 |
|--------|------|---------------|
| 한국문화 수출 | 외국인 타겟 한국문화 아이템 사업 | PM vs 마케터 → 팬덤 전문가 합류 |
| 1인 SaaS | 혼자 만드는 B2B SaaS 아이디어 | PM vs 테크리드 → 세일즈 전문가 합류 |
| Z세대 소셜 | Z세대를 위한 새로운 소셜 플랫폼 | PM vs UX리서처 → 커뮤니티 전문가 합류 |

---

## 14. Risk & Mitigation

| 리스크 | 심각도 | 대응 |
|--------|--------|------|
| OpenAI API 느림 | 높음 | SSE 스트리밍으로 체감 속도 개선, 타이핑 인디케이터 |
| 토론 주제 벗어남 | 중간 | PM 시스템 프롬프트 + 오케스트레이터 체크 |
| 랜딩페이지 HTML 품질 불균일 | 중간 | 상세한 프롬프트 + fallback 템플릿 |
| 생성된 HTML에 악성 스크립트 | 높음 | sandbox iframe으로 DOM 격리 |
| 페이지 전환 시 깜빡임 | 중간 | Framer Motion + HTML 프리로드 |
| 3.5시간 내 미완성 | 높음 | P0만 집중, P1/P2 순서로 빌드 |
| Git merge 충돌 | 중간 | 파일 단위 역할 분리, 타입 파일 먼저 확정 |

---

## 15. MVP Definition

| 구분 | 항목 |
|------|------|
| **Must Have (P0)** | 주제 입력 → 에이전트 생성 → 2라운드 이상 토론 → 랜딩페이지 생성 + 페이지 전환 + 프리셋 1개 |
| **Should Have (P1)** | 에이전트 퇴장/스포닝, 3라운드, 사이드바 에이전트 상태, 타이핑 인디케이터, 반응형, 프리셋 3개 |
| **Nice to Have (P2)** | 전환 고급 애니메이션, 채널명 자동 생성, 랜딩페이지 스크롤 애니메이션 |

---

## 16. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| 1차 AI 심사 통과 | 10팀 내 선별 | 프론트엔드 코드 품질 |
| 토론 완료율 | 90% | 에러 없이 랜딩페이지까지 도달 |
| 전체 플로우 시간 | < 90초 | 입력 → 랜딩페이지 표시 |
| 데모 임팩트 | "채팅 → 웹페이지 전환" wow factor | 3차 사람 심사 |
