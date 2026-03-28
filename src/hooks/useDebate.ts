"use client";

import { useReducer, useCallback, useRef } from "react";
import type {
  DebateState,
  SSEEventType,
  Agent,
  AgentMessage,
  SystemMessage,
  ChatItem,
  DebateRound,
  DebateResult,
} from "@/lib/types";
import { renderLandingPage } from "@/lib/landing-templates";

// ── Initial State ──

const initialState: DebateState = {
  status: "idle",
  topic: "",
  channelName: "",
  agents: [],
  retiredAgents: [],
  rounds: [],
  chatItems: [],
  currentRound: 0,
  activeAgentId: null,
  streamingText: "",
  result: null,
  landingPageHtml: null,
  error: null,
};

// ── Actions ──

type Action =
  | { type: "START_DEBATE"; topic: string }
  | {
      type: "AGENTS_CREATED";
      agents: Agent[];
      channelName: string;
    }
  | { type: "ROUND_START"; round: number; title: string }
  | { type: "AGENT_SPEAK_START"; agentId: string }
  | { type: "AGENT_SPEAK_CHUNK"; agentId: string; chunk: string }
  | { type: "AGENT_SPEAK_DONE"; agentId: string; fullMessage: string }
  | { type: "AGENT_RETIRE"; agentId: string; exitMessage: string }
  | { type: "SPAWN_TRIGGER"; reason: string }
  | { type: "AGENT_SPAWNED"; agent: Agent }
  | { type: "FINAL_RESULT"; result: DebateResult }
  | { type: "LANDING_PAGE_CHUNK"; chunk: string }
  | { type: "LANDING_PAGE_READY"; html: string }
  | { type: "DEBATE_END" }
  | { type: "ERROR"; message: string }
  | { type: "REJECT" }
  | { type: "RESET" };

// ── Helpers ──

let msgCounter = 0;
function nextId(prefix: string) {
  return `${prefix}-${++msgCounter}`;
}

function systemMsg(
  msgType: SystemMessage["type"],
  content: string,
  agentId?: string,
): ChatItem {
  return {
    kind: "system",
    data: {
      id: nextId("sys"),
      type: msgType,
      content,
      timestamp: Date.now(),
      agentId,
    },
  };
}

function agentMsg(msg: AgentMessage): ChatItem {
  return { kind: "message", data: msg };
}

// ── Reducer ──

function reducer(state: DebateState, action: Action): DebateState {
  switch (action.type) {
    case "START_DEBATE":
      return { ...initialState, status: "creating", topic: action.topic };

    case "AGENTS_CREATED": {
      const items: ChatItem[] = action.agents.map((a) =>
        systemMsg("agent_join", `${a.name}님이 채널에 참여했습니다`, a.id),
      );
      return {
        ...state,
        status: "debating",
        channelName: action.channelName,
        agents: action.agents,
        chatItems: [...state.chatItems, ...items],
      };
    }

    case "ROUND_START": {
      const round: DebateRound = {
        number: action.round,
        title: action.title,
        status: "active",
      };
      const rounds = state.rounds.map((r) =>
        r.status === "active" ? { ...r, status: "done" as const } : r,
      );
      return {
        ...state,
        rounds: [...rounds, round],
        currentRound: action.round,
        chatItems: [
          ...state.chatItems,
          systemMsg(
            "round_divider",
            `Round ${action.round}: ${action.title}`,
          ),
        ],
      };
    }

    case "AGENT_SPEAK_START":
      return {
        ...state,
        activeAgentId: action.agentId,
        streamingText: "",
      };

    case "AGENT_SPEAK_CHUNK":
      return {
        ...state,
        streamingText: state.streamingText + action.chunk,
      };

    case "AGENT_SPEAK_DONE": {
      const msg: AgentMessage = {
        id: nextId("msg"),
        agentId: action.agentId,
        content: action.fullMessage,
        round: state.currentRound,
        timestamp: Date.now(),
      };
      return {
        ...state,
        activeAgentId: null,
        streamingText: "",
        chatItems: [...state.chatItems, agentMsg(msg)],
      };
    }

    case "AGENT_RETIRE": {
      const agent = state.agents.find((a) => a.id === action.agentId);
      if (!agent) return state;

      const exitMsg: AgentMessage = {
        id: nextId("msg"),
        agentId: action.agentId,
        content: action.exitMessage,
        round: state.currentRound,
        timestamp: Date.now(),
        isExitMessage: true,
      };
      const retired = { ...agent, status: "offline" as const };

      return {
        ...state,
        status: "retiring",
        agents: state.agents.filter((a) => a.id !== action.agentId),
        retiredAgents: [...state.retiredAgents, retired],
        chatItems: [
          ...state.chatItems,
          agentMsg(exitMsg),
          systemMsg(
            "agent_leave",
            `${agent.name}님이 채널을 나갔습니다`,
            agent.id,
          ),
        ],
      };
    }

    case "SPAWN_TRIGGER":
      return { ...state, status: "spawning" };

    case "AGENT_SPAWNED":
      return {
        ...state,
        status: "debating",
        agents: [...state.agents, action.agent],
        chatItems: [
          ...state.chatItems,
          systemMsg(
            "agent_join",
            `${action.agent.name}님이 채널에 참여했습니다`,
            action.agent.id,
          ),
        ],
      };

    case "FINAL_RESULT": {
      // 템플릿 기반 즉시 렌더링 — GPT-4o HTML 생성 불필요
      const html = renderLandingPage(action.result.idea);
      return {
        ...state,
        status: "landing",
        result: action.result,
        landingPageHtml: html,
        chatItems: [
          ...state.chatItems,
          systemMsg("debate_complete", "토론이 완료되었습니다"),
        ],
      };
    }

    case "LANDING_PAGE_CHUNK":
      // 템플릿으로 이미 렌더링된 경우 무시
      if (state.status === "landing") return state;
      return {
        ...state,
        landingPageHtml: (state.landingPageHtml ?? "") + action.chunk,
      };

    case "LANDING_PAGE_READY":
      // 템플릿으로 이미 렌더링된 경우 무시
      if (state.status === "landing") return state;
      return {
        ...state,
        status: "landing",
        landingPageHtml: action.html,
      };

    case "DEBATE_END":
      return state.status === "landing"
        ? state
        : { ...state, status: "landing" };

    case "ERROR":
      return { ...state, status: "error", error: action.message };

    case "REJECT": {
      const rejectMsg = systemMsg("round_divider", "결과 반려 — 추가 토론 시작");
      return {
        ...state,
        status: "debating",
        result: null,
        landingPageHtml: null,
        activeAgentId: null,
        streamingText: "",
        error: null,
        chatItems: [...state.chatItems, rejectMsg],
      };
    }

    case "RESET":
      msgCounter = 0;
      return initialState;

    default:
      return state;
  }
}

// ── SSE Parser ──

function parseSSELines(raw: string): { event: string; data: string }[] {
  const events: { event: string; data: string }[] = [];
  const blocks = raw.split("\n\n");

  for (const block of blocks) {
    if (!block.trim()) continue;

    let event = "";
    let data = "";

    for (const line of block.split("\n")) {
      if (line.startsWith("event: ")) {
        event = line.slice(7).trim();
      } else if (line.startsWith("data: ")) {
        data = line.slice(6);
      }
    }

    if (event && data) {
      events.push({ event, data });
    }
  }

  return events;
}

// ── Hook ──

export interface UseDebateReturn {
  state: DebateState;
  startDebate: (topic: string) => void;
  reject: () => void;
  reset: () => void;
}

export function useDebate(): UseDebateReturn {
  const [state, dispatch] = useReducer(reducer, initialState);
  const abortRef = useRef<AbortController | null>(null);

  const startDebate = useCallback(async (topic: string) => {
    // Abort any existing connection
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    dispatch({ type: "START_DEBATE", topic });

    try {
      const response = await fetch("/api/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
        signal: controller.signal,
      });

      if (!response.ok) {
        dispatch({
          type: "ERROR",
          message: `서버 오류 (${response.status})`,
        });
        return;
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE blocks (separated by double newline)
        const lastDoubleNewline = buffer.lastIndexOf("\n\n");
        if (lastDoubleNewline === -1) continue;

        const complete = buffer.slice(0, lastDoubleNewline + 2);
        buffer = buffer.slice(lastDoubleNewline + 2);

        const events = parseSSELines(complete);

        for (const { event, data } of events) {
          try {
            handleSSEEvent(event as SSEEventType, JSON.parse(data), dispatch);
          } catch {
            // JSON parse failure — skip malformed event
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        const events = parseSSELines(buffer);
        for (const { event, data } of events) {
          try {
            handleSSEEvent(event as SSEEventType, JSON.parse(data), dispatch);
          } catch {
            // skip
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      dispatch({
        type: "ERROR",
        message:
          err instanceof Error
            ? err.message
            : "연결이 끊어졌습니다. 새 토론을 시작해주세요",
      });
    }
  }, []);

  const reject = useCallback(async () => {
    const { topic, agents, retiredAgents, chatItems } = state;
    if (!topic) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // 기존 대화 상태에서 메시지만 추출
    const existingMessages = chatItems
      .filter((item): item is { kind: "message"; data: AgentMessage } => item.kind === "message")
      .map((item) => item.data);

    const allAgents = [...agents, ...retiredAgents];

    // 상태를 debating으로 전환 (랜딩페이지/결과 제거)
    dispatch({ type: "REJECT" });

    try {
      const response = await fetch("/api/debate/continue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, agents: allAgents, messages: existingMessages }),
        signal: controller.signal,
      });

      if (!response.ok) {
        dispatch({ type: "ERROR", message: `서버 오류 (${response.status})` });
        return;
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lastDoubleNewline = buffer.lastIndexOf("\n\n");
        if (lastDoubleNewline === -1) continue;

        const complete = buffer.slice(0, lastDoubleNewline + 2);
        buffer = buffer.slice(lastDoubleNewline + 2);

        const events = parseSSELines(complete);
        for (const { event, data } of events) {
          try {
            handleSSEEvent(event as SSEEventType, JSON.parse(data), dispatch);
          } catch { /* skip */ }
        }
      }

      if (buffer.trim()) {
        const events = parseSSELines(buffer);
        for (const { event, data } of events) {
          try {
            handleSSEEvent(event as SSEEventType, JSON.parse(data), dispatch);
          } catch { /* skip */ }
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      dispatch({
        type: "ERROR",
        message: err instanceof Error ? err.message : "연결이 끊어졌습니다.",
      });
    }
  }, [state]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    dispatch({ type: "RESET" });
  }, []);

  return { state, startDebate, reject, reset };
}

// ── Event Dispatcher ──

function handleSSEEvent(
  event: SSEEventType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  dispatch: React.Dispatch<Action>,
) {
  switch (event) {
    case "agents_created":
      dispatch({
        type: "AGENTS_CREATED",
        agents: data.agents,
        channelName: data.channelName,
      });
      break;
    case "round_start":
      dispatch({
        type: "ROUND_START",
        round: data.round,
        title: data.title,
      });
      break;
    case "agent_speak_start":
      dispatch({ type: "AGENT_SPEAK_START", agentId: data.agentId });
      break;
    case "agent_speak_chunk":
      dispatch({
        type: "AGENT_SPEAK_CHUNK",
        agentId: data.agentId,
        chunk: data.chunk,
      });
      break;
    case "agent_speak_done":
      dispatch({
        type: "AGENT_SPEAK_DONE",
        agentId: data.agentId,
        fullMessage: data.fullMessage,
      });
      break;
    case "agent_retire":
      dispatch({
        type: "AGENT_RETIRE",
        agentId: data.agentId,
        exitMessage: data.exitMessage,
      });
      break;
    case "spawn_trigger":
      dispatch({ type: "SPAWN_TRIGGER", reason: data.reason });
      break;
    case "agent_spawned":
      dispatch({ type: "AGENT_SPAWNED", agent: data.agent });
      break;
    case "final_result":
      dispatch({ type: "FINAL_RESULT", result: data.result });
      break;
    case "landing_page_chunk":
      dispatch({ type: "LANDING_PAGE_CHUNK", chunk: data.chunk });
      break;
    case "landing_page_ready":
      dispatch({ type: "LANDING_PAGE_READY", html: data.html });
      break;
    case "debate_end":
      dispatch({ type: "DEBATE_END" });
      break;
    case "error":
      dispatch({ type: "ERROR", message: data.message });
      break;
  }
}
