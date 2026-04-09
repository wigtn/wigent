# 02. 커밋 타임라인 — 3시간의 개발 기록

## 전체 타임라인

총 26개 커밋, 2026-03-28 12:59 ~ 15:55 (약 3시간) + 후속 작업 2건.

---

## Phase 0: 기획 (12:59 ~ 13:37) — 38분

### PRD v1.0 (12:59)
```
8e30143 docs: Agent Arena PRD v1.1
작성자: swson
```
- 최초 PRD 작성. "Agent Arena"라는 이름으로 시작
- PM 고정 에이전트 + 에이전트 퇴장/교체 메커니즘 설계
- 멀티에이전트 토론 플랫폼의 핵심 컨셉 확정

### PRD 보완 (13:23)
```
0999439 피알디
작성자: hskim
```
- PRD에 100줄 추가/19줄 수정. 팀원이 요구사항 보강

### PRD v2.0 — 핵심 피봇 (13:37)
```
3cefae9 docs: PRD v2.0 - Slack 채팅 UI + 랜딩페이지 Full Page Swap
작성자: hwcho
```
- **첫 번째 전환점**: 채팅 UI를 **Slack 스타일**로 변경 결정
- **두 번째 전환점**: 토론 완료 후 결과 카드 대신 **랜딩페이지로 Full Page Swap**
- GPT-4o 호출 안정성 정책 추가 (timeout/retry/fallback)
- `docs/todo_plan/PLAN_agent-arena-v2.md` 작성 — 3명 병렬 작업 계획

> 이 피봇이 프로젝트의 정체성을 결정했다. "채팅이 웹페이지로 바뀐다"는 데모 임팩트가 해커톤 심사의 핵심 무기가 됐다.

---

## Phase 1: 병렬 개발 — 동시 착수 (13:43 ~ 13:49) — 6분

### P1: 프로젝트 초기화 + 타입 계약 확정 (13:43)
```
d23da9c feat: Next.js 16 프로젝트 초기화 + types.ts 공유 타입 확정
작성자: hwcho
```
- Next.js 16.2.1 + React 19 + TypeScript + Tailwind v4 + Framer Motion
- **`src/lib/types.ts`**: Agent, ChatItem, SSEEvent, DebateState 등 전체 공유 타입 281줄
- PRESETS 데이터, PM_AGENT 상수 포함
- 이 타입 파일이 3명의 병렬 작업을 가능하게 한 **계약서(contract)**

### P1: 백엔드 코어 (13:48)
```
7eb101b feat(backend): orchestrator + prompts + SSE API 엔드포인트
작성자: hwcho
```
- `prompts.ts`: 6개 시스템 프롬프트
- `orchestrator.ts`: AsyncGenerator 기반 토론 엔진 (GPT-4o, timeout 30s, retry 1회, 최근 6메시지 컨텍스트)
- `route.ts`: POST /api/debate SSE 스트리밍

### P2: Slack Chat UI (13:49)
```
5f9af56 feat: P2 Slack Chat UI 컴포넌트 전체 구현
작성자: swson
```
- ChatLayout, Sidebar, ChannelHeader, ChatArea, ChatMessage, SystemMessage, TypingIndicator, DisabledInput, PageTransition
- globals.css Slack 다크 테마 CSS 변수
- **10개 컴포넌트를 한 번에 커밋** — Claude Code로 일괄 생성

### P3: Input/Output + Hook (13:49)
```
0f794de feat: P3 컴포넌트 + Hook 구현
작성자: hskim
```
- `useDebate.ts`: useReducer 기반 상태관리, SSE ReadableStream 파싱, 13개 이벤트 핸들링 (441줄)
- TopicInput, PresetButtons, LandingPageView

> **주목할 점**: P1, P2, P3가 거의 동시에(1분 차이) 커밋됐다. types.ts라는 공유 계약 덕분에 충돌 없이 병렬 작업이 가능했다.

---

## Phase 2: 통합 (13:51 ~ 13:54) — 3분

### 브랜치 머지 (13:51)
```
1585af5 Merge remote-tracking branch 'origin/feat/p2-slack-chat-ui'
4f7215e Merge remote-tracking branch 'origin/p3'
작성자: hwcho
```
- P2, P3 브랜치를 main으로 순차 머지
- **충돌 없이 머지 완료** — 타입 계약의 효과

### P1+P2+P3 통합 (13:54)
```
f3f45be feat: P1+P2+P3 통합 - useDebate Hook, TopicInput, LandingPageView 연결
작성자: hwcho
```
- page.tsx에서 데모 데이터 제거, 실제 useDebate Hook 연결
- idle → debating → landing 상태 전환 연결
- **192줄 → 49줄 + 새 코드**: 데모 목업을 실제 로직으로 교체

> 기획부터 동작하는 프로토타입까지 **55분**. 3명 병렬 + Claude Code의 위력.

---

## Phase 3: 기능 고도화 (14:09 ~ 15:13) — 약 1시간

### 디자이너 에이전트 추가 (14:09)
```
41caa2b feat: 디자이너 에이전트 추가 (고정, Round 1 후 합류)
작성자: hwcho
```
- DESIGNER_AGENT 상수 추가 (isFixed: true, 퇴장 불가)
- Round 1 이후 자동 합류 — 에이전트 스포닝 패턴 시연
- "유저가 3초 안에 이해 못 하면 실패"라는 페르소나

### 디자인 개선 (14:28)
```
959c0b3 design modification
작성자: hskim
```
- HistoryList 컴포넌트 추가 (localStorage 히스토리)
- LandingPageView 강화
- useHistory 훅 추가

### 세 번째 전환점 — 라운드 폐지, 자유토론 30턴 (14:48)
```
b3fd295 feat: 자유토론 30턴 + 에이전트 교체 + 랜딩페이지 고퀄리티 개선
작성자: swson
```
- **라운드 시스템(R1/R2/R3) 폐지 → 자유 토론 30턴**으로 전환
- 초반(0~2턴)/중반(3~14턴)/후반(15~24턴) 자동 전환
- 에이전트 교체를 **확정적 턴**(12턴, 22턴)에 발생시킴
- 퇴장한 에이전트 Unknown 버그 수정 (retiredAgents 전달)
- 랜딩페이지 프롬프트 대폭 강화 (10개 섹션, 글래스모피즘, 애니메이션)
- GPT 거부 대응: 영어 프롬프트 + fallback 감지
- 랜딩페이지 타임아웃 180초, max_tokens 16000

> 이 커밋이 가장 큰 아키텍처 변경이었다. 라운드 → 자유토론 전환은 "더 자연스러운 토론 흐름"을 만들기 위한 결정이었고, 에이전트 교체 타이밍을 확정적으로 바꾼 것은 "데모 안정성"을 위한 엔지니어링 판단이었다.

### 코드 추출 기능 (14:55)
```
ff4bc8a feat: Next.js 코드 추출 기능 (zip 다운로드)
작성자: hwcho
```
- POST /api/export: HTML → Next.js 프로젝트 zip 생성
- archiver로 서버사이드 zip 생성
- 생성된 랜딩페이지를 Next.js 프로젝트로 추출하는 기능

### 결과 반려/만족 기능 (14:56 ~ 15:07)
```
2efa887 feat: 결과 반려/만족 기능 추가
12e9ba1 feat: 코드 추출 모달 UI 추가
d5f3d3b feat: 결과 반려 시 기존 대화 이어서 추가 토론
작성자: swson, hwcho
```
- 반려 시 기존 대화를 유지하고 **8턴 추가 토론** 진행
- `/api/debate/continue` 엔드포인트 추가
- PM이 "결과가 반려됐다"며 토론 재개 — Human-in-the-Loop 패턴
- 코드 추출 모달 (폴더 트리 + 5단계 사용법)

### 9개 디자인 템플릿 — 네 번째 전환점 (15:06)
```
5773cd8 feat: 9개 디자인 템플릿 기반 랜딩페이지 즉시 생성
작성자: hskim
```
- Glassmorphism, Neobrutalism, Editorial, Minimalism, Dark Neon, Bento Grid, Organic Shapes, Corporate, Gradient Mesh
- 아이디어 키워드 매칭으로 최적 템플릿 자동 선택
- **FINAL_RESULT 수신 시 즉시 렌더링** (GPT-4o HTML 생성 대기 불필요)
- LANDING_PAGE_CHUNK/READY는 이미 렌더링된 경우 무시

> GPT-4o로 랜딩페이지 HTML을 생성하면 **30~60초 대기**가 발생했다. 템플릿 기반 즉시 렌더링은 이 UX 문제를 해결한 실용적 결정이었다. 동시에 GPT 생성 결과도 백그라운드에서 받아 대체할 수 있는 이중 경로를 유지했다.

### 토론 수렴 강제 (15:13)
```
94478bf fix: 토론 마무리 단계 강제 수렴 프롬프트 추가
작성자: swson
```
- 25턴 이후 "마무리" 단계: 새 아이디어 금지, 결론 강제
- "정리하면~", "결론적으로~" 시작 유도
- 토론이 발산만 하고 수렴하지 않는 문제 해결

---

## Phase 4: 마감 폴리시 (15:16 ~ 15:55) — 39분

### UI 폴리시 (15:16 ~ 15:22)
```
f47a6b7 반응형 수정 채팅간격 로딩화면
41f61d8 레이턴시 및 이름추가
```
- 반응형 레이아웃 조정
- 로딩 트랜지션 화면 추가
- 채팅 영역에 레이턴시 표시

### 리브랜딩 — Agent Arena → Wegent → Wigent (15:23 ~ 15:25)
```
e9bbd46 feat: Agent Arena → Wegent 리브랜딩 + 랜딩페이지 품질 강화
7ada34e fix: Wegent → Wigent 이름 수정
작성자: swson
```
- 전체 코드에서 이름 일괄 변경
- 랜딩페이지 프롬프트 강화: 이모지 금지 (SVG/CSS 아이콘), 상세 설명 요구

### 랜딩페이지 프롬프트 v3 (15:32)
```
cc8869f feat: 랜딩페이지 프롬프트 v3 - 내용 풍부화 + SVG 아이콘 강제
작성자: swson
```
- 모든 아이콘을 실제 SVG path로 강제
- Hero subtitle 2문단 4문장 이상
- 11개 섹션 각각 상세 콘텐츠 가이드라인
- 카드 stagger 애니메이션 100ms 간격

### 최종 마감 (15:44 ~ 15:55)
```
690f5f1 landing page fix
8a694d9 린트수정
작성자: hskim
```
- 랜딩 페이지 스타일 최종 수정
- ESLint 수정, 린트 클린업

---

## 후속 작업 (4/3 ~ 4/4)

```
81654f3 chore: add WIGTN Crew SEO/GEO metadata
554619c fix: update project status in README footer
```
- README, CITATION.cff, package.json에 WIGTN Crew 메타데이터 추가
- 해커톤 이후 프로젝트 정리 작업

---

## 타임라인 요약

```
12:59 ─── PRD v1.0 작성
13:23 ─── PRD 보완
13:37 ─── PRD v2.0 (Slack UI + Full Page Swap 피봇) ★ 전환점 1
13:43 ─── Next.js 초기화 + types.ts 계약 확정
13:48 ─┬─ P1: 백엔드 코어 (orchestrator, prompts, SSE)
13:49 ─┼─ P2: Slack Chat UI (10개 컴포넌트)
13:49 ─┴─ P3: useDebate Hook + Input/Output
13:51 ─── 머지 (충돌 없음)
13:54 ─── P1+P2+P3 통합 완료 ──── 동작하는 프로토타입 완성 (55분)
14:09 ─── 디자이너 에이전트 추가
14:28 ─── 히스토리 기능
14:48 ─── 라운드 → 자유토론 30턴 전환 ★ 전환점 2
14:55 ─── 코드 추출 (zip)
14:56 ─── 결과 반려/만족
15:02 ─── 코드 추출 모달
15:06 ─── 9개 디자인 템플릿 즉시 렌더링 ★ 전환점 3
15:07 ─── 반려 후 추가 토론
15:13 ─── 토론 수렴 강제 프롬프트
15:22 ─── 레이턴시 표시
15:23 ─── 리브랜딩 (Wigent)
15:32 ─── 랜딩페이지 프롬프트 v3
15:55 ─── 린트 수정, 마감
```

> 3시간 동안 26개 커밋. PRD → 프로토타입 55분, 이후 2시간은 기능 추가와 품질 개선에 투자했다.
