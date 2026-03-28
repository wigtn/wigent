# Task Plan: Agent Arena v2

> **Generated from**: PRD.md
> **Created**: 2026-03-28
> **Status**: pending

## Execution Config

| Option | Value | Description |
|--------|-------|-------------|
| `auto_commit` | true | 완료 시 자동 커밋 |
| `commit_per_phase` | false | Phase별 중간 커밋 여부 |
| `quality_gate` | true | /auto-commit 품질 검사 |

## Phases

### Phase 1: Backend Core (P1)
- [ ] Next.js 16 프로젝트 초기화 (TypeScript, Tailwind v4, Framer Motion)
- [ ] `src/lib/types.ts` — 공유 타입 정의 (Agent, ChatItem, SSEEvent 등)
- [ ] `src/lib/prompts.ts` — 시스템 프롬프트 (에이전트 생성, PM, Agent2, 퇴장/스포닝, 결과, 랜딩페이지)
- [ ] `src/lib/orchestrator.ts` — 토론 오케스트레이터 (AsyncGenerator, GPT-4o 10회 호출)
- [ ] `src/app/api/debate/route.ts` — SSE 스트리밍 API 엔드포인트

### Phase 2: Slack Chat UI (P2)
- [ ] `src/app/layout.tsx` + `globals.css` — 레이아웃 및 다크 테마 기본 스타일
- [ ] `src/app/page.tsx` — 메인 페이지 (상태별 화면 전환)
- [ ] `src/components/chat/ChatLayout.tsx` — Slack 전체 레이아웃 (사이드바 + 채팅)
- [ ] `src/components/chat/Sidebar.tsx` — 좌측 사이드바 (채널, 에이전트 목록, 온/오프라인)
- [ ] `src/components/chat/ChannelHeader.tsx` — 채널 상단 헤더
- [ ] `src/components/chat/ChatArea.tsx` — 메인 채팅 영역 (메시지 목록 + 자동 스크롤)
- [ ] `src/components/chat/ChatMessage.tsx` — 개별 메시지 (아바타 + 이름 + 타임스탬프 + 내용)
- [ ] `src/components/chat/SystemMessage.tsx` — 시스템 메시지 (참여/퇴장/라운드 divider)
- [ ] `src/components/chat/TypingIndicator.tsx` — 타이핑 중 애니메이션
- [ ] `src/components/chat/DisabledInput.tsx` — 비활성 입력 영역
- [ ] `src/components/PageTransition.tsx` — 채팅 → 랜딩페이지 전환 애니메이션 (Framer Motion)

### Phase 3: Input/Output & Integration (P3)
- [ ] `src/components/TopicInput.tsx` — 주제 입력 화면
- [ ] `src/components/PresetButtons.tsx` — 프리셋 버튼 3종
- [ ] `src/components/LandingPageView.tsx` — 랜딩페이지 렌더링 (sandbox iframe + 새 토론 버튼)
- [ ] `src/hooks/useDebate.ts` — SSE 연결 + DebateState 관리 Hook
- [ ] 전체 플로우 통합 테스트 (입력 → 채팅 → 랜딩페이지)

### Phase 4: 마무리
- [ ] 반응형 레이아웃 조정 (모바일/태블릿)
- [ ] 애니메이션 미세 조정
- [ ] 에러 핸들링 확인
- [ ] 배포

## Progress

| Metric | Value |
|--------|-------|
| Total Tasks | 0/22 |
| Current Phase | - |
| Status | pending |

## Execution Log

| Timestamp | Phase | Task | Status |
|-----------|-------|------|--------|
| - | - | - | - |
