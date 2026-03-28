// ── Agent ──

export interface Agent {
  id: string;
  name: string;
  role: string;
  personality: string;
  color: string; // hex color
  emoji: string; // 1 emoji character
  isFixed?: boolean; // PM은 true
  status: "online" | "offline";
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
  | "agent_join" // "~님이 채널에 참여했습니다"
  | "agent_leave" // "~님이 채널을 나갔습니다"
  | "round_divider" // "── Round N: 제목 ──"
  | "debate_complete" // "토론이 완료되었습니다"
  | "generating"; // "랜딩페이지를 생성 중..."

export interface SystemMessage {
  id: string;
  type: SystemMessageType;
  content: string;
  timestamp: number;
  agentId?: string; // agent_join, agent_leave 시
}

// ── Chat Message Union ──

export type ChatItem =
  | { kind: "message"; data: AgentMessage }
  | { kind: "system"; data: SystemMessage };

// ── Rounds ──

export interface DebateRound {
  number: number;
  title: string; // e.g. "브레인스토밍", "토론/반박", "최종 수렴"
  status: "pending" | "active" | "done";
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

// State Transitions (useReducer 패턴 권장):
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

export type DebateStatus =
  | "idle" // 주제 입력 대기
  | "creating" // 에이전트 생성 중
  | "debating" // 토론 진행 중 (Slack 채팅)
  | "retiring" // 에이전트 퇴장 중
  | "spawning" // 새 에이전트 스포닝 중
  | "generating_landing" // 랜딩페이지 생성 중
  | "landing" // 랜딩페이지 표시 중
  | "error";

export interface DebateState {
  status: DebateStatus;
  topic: string;
  channelName: string; // Slack 채널명 (예: "#한국문화-아이템-토론")
  agents: Agent[];
  retiredAgents: Agent[];
  rounds: DebateRound[];
  chatItems: ChatItem[];
  currentRound: number;
  activeAgentId: string | null;
  streamingText: string;
  result: DebateResult | null;
  landingPageHtml: string | null;
  error: string | null;
}

// ── SSE Events (API → Client) ──

export type SSEEventType =
  | "agents_created"
  | "round_start"
  | "agent_speak_start"
  | "agent_speak_chunk"
  | "agent_speak_done"
  | "agent_retire"
  | "spawn_trigger"
  | "agent_spawned"
  | "final_result"
  | "landing_page_chunk"
  | "landing_page_ready"
  | "debate_end"
  | "error";

// ── SSE Event Payloads ──

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

export interface SSEErrorEvent {
  message: string;
}

// ── SSE Event Union ──

export type SSEEvent =
  | { type: "agents_created"; data: AgentsCreatedEvent }
  | { type: "round_start"; data: RoundStartEvent }
  | { type: "agent_speak_start"; data: AgentSpeakStartEvent }
  | { type: "agent_speak_chunk"; data: AgentSpeakChunkEvent }
  | { type: "agent_speak_done"; data: AgentSpeakDoneEvent }
  | { type: "agent_retire"; data: AgentRetireEvent }
  | { type: "spawn_trigger"; data: SpawnTriggerEvent }
  | { type: "agent_spawned"; data: AgentSpawnedEvent }
  | { type: "final_result"; data: FinalResultEvent }
  | { type: "landing_page_chunk"; data: LandingPageChunkEvent }
  | { type: "landing_page_ready"; data: LandingPageReadyEvent }
  | { type: "debate_end"; data: DebateEndEvent }
  | { type: "error"; data: SSEErrorEvent };

// ── Preset ──

export interface Preset {
  id: string;
  label: string;
  topic: string;
  icon: string;
}

export const PRESETS: Preset[] = [
  {
    id: "korean-culture",
    label: "한국문화 수출",
    topic: "외국인 타겟 한국문화 아이템 사업 아이디어",
    icon: "🇰🇷",
  },
  {
    id: "solo-saas",
    label: "1인 SaaS",
    topic: "혼자 만드는 B2B SaaS 아이디어",
    icon: "💻",
  },
  {
    id: "gen-z-social",
    label: "Z세대 소셜",
    topic: "Z세대를 위한 새로운 소셜 플랫폼 아이디어",
    icon: "📱",
  },
];

// ── API Request ──

export interface DebateRequest {
  topic: string; // 5~200자
}

// ── PM Agent (고정) ──

export const PM_AGENT: Omit<Agent, "id"> = {
  name: "PM 에이전트",
  role: "프로덕트 매니저",
  personality:
    "현실적, 날카로움. 항상 사용자 관점에서 평가. 스코프 커지면 잘라냄.",
  color: "#3B82F6",
  emoji: "📋",
  isFixed: true,
  status: "online",
};

export const DESIGNER_AGENT: Omit<Agent, "id"> = {
  name: "디자이너 에이전트",
  role: "프로덕트 디자이너",
  personality:
    "시각적 사고, 사용자 경험 중심. 아이디어를 구체적인 화면과 인터랙션으로 풀어냄. 브랜딩과 첫인상에 집착.",
  color: "#EC4899",
  emoji: "🎨",
  isFixed: true,
  status: "online",
};
