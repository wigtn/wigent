import OpenAI from "openai";
import type { Agent, AgentMessage, FinalIdea, SSEEvent } from "./types";
import { PM_AGENT, DESIGNER_AGENT } from "./types";
import {
  createAgentPrompt,
  freeDebatePrompt,
  rejectDebatePrompt,
  retireSpawnPrompt,
  summarizeDebatePrompt,
  finalResultPrompt,
  landingPagePrompt,
} from "./prompts";

const SPEAK_TIMEOUT = 30_000;
const LANDING_TIMEOUT = 180_000;
const MAX_RETRIES = 1;
const MAX_TURNS = 30;

// 에이전트 간 랜덤 딜레이 (ms)
const MIN_DELAY = 800;
const MAX_DELAY = 2500;

function randomDelay(): Promise<void> {
  const ms = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 에이전트 교체 발생 턴 (확정적)
const RETIRE_AT_TURN = 12;
const RETIRE_AGAIN_AT_TURN = 22;

// ── Logger ──
const LOG_PREFIX = "[Arena]";

function log(label: string, data?: unknown) {
  const ts = new Date().toLocaleTimeString("ko-KR", { hour12: false });
  if (data !== undefined) {
    console.log(
      `${LOG_PREFIX} ${ts} | ${label}`,
      typeof data === "string" ? data : JSON.stringify(data, null, 2),
    );
  } else {
    console.log(`${LOG_PREFIX} ${ts} | ${label}`);
  }
}

function createOpenAI(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

async function callJSON<T>(
  openai: OpenAI,
  systemPrompt: string,
  signal?: AbortSignal,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), SPEAK_TIMEOUT);
      const merged = signal
        ? AbortSignal.any([signal, controller.signal])
        : controller.signal;

      const response = await openai.chat.completions.create(
        {
          model: "gpt-4o",
          messages: [{ role: "user", content: systemPrompt }],
          response_format: { type: "json_object" },
          temperature: 0.9,
        },
        { signal: merged },
      );

      clearTimeout(timeout);
      const text = response.choices[0]?.message?.content ?? "{}";
      return JSON.parse(text) as T;
    } catch (err) {
      lastError = err;
      if (signal?.aborted) throw err;
    }
  }
  throw lastError;
}

async function* streamSpeak(
  openai: OpenAI,
  systemPrompt: string,
  agentId: string,
  signal?: AbortSignal,
): AsyncGenerator<SSEEvent> {
  yield { type: "agent_speak_start", data: { agentId, round: 0 } };

  let fullMessage = "";
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), SPEAK_TIMEOUT);
      const merged = signal
        ? AbortSignal.any([signal, controller.signal])
        : controller.signal;

      const stream = await openai.chat.completions.create(
        {
          model: "gpt-4o",
          messages: [{ role: "user", content: systemPrompt }],
          stream: true,
          temperature: 0.9,
        },
        { signal: merged },
      );

      clearTimeout(timeout);

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
          fullMessage += delta;
          yield { type: "agent_speak_chunk", data: { agentId, chunk: delta } };
        }
      }

      log(`💬 [${agentId}] 발언 완료`, fullMessage);
      yield { type: "agent_speak_done", data: { agentId, fullMessage } };
      return;
    } catch (err) {
      lastError = err;
      if (signal?.aborted) throw err;
      fullMessage = "";
    }
  }
  throw lastError;
}

// ── 다음 발언자 결정 (단순 로테이션 + 변형) ──

function pickNextSpeaker(
  agents: Agent[],
  messages: AgentMessage[],
  turnCount: number,
): string {
  const online = agents.filter((a) => a.status === "online");
  if (online.length === 0) return agents[0].id;

  // 마지막 발언자 제외하고 선택
  const lastSpeakerId = messages.length > 0 ? messages[messages.length - 1].agentId : null;
  const candidates = online.filter((a) => a.id !== lastSpeakerId);
  if (candidates.length === 0) return online[0].id;

  // 발언 횟수가 적은 에이전트 우선
  const speakCounts = new Map<string, number>();
  for (const a of online) speakCounts.set(a.id, 0);
  for (const m of messages) {
    const cur = speakCounts.get(m.agentId);
    if (cur !== undefined) speakCounts.set(m.agentId, cur + 1);
  }

  candidates.sort((a, b) => (speakCounts.get(a.id) ?? 0) - (speakCounts.get(b.id) ?? 0));
  return candidates[0].id;
}

// ── 에이전트 교체 실행 ──

async function* doRetireSpawn(
  openai: OpenAI,
  topic: string,
  pmAgent: Agent,
  targetAgent: Agent,
  allAgents: Agent[],
  allMessages: AgentMessage[],
  signal?: AbortSignal,
): AsyncGenerator<SSEEvent> {
  log("🔄 퇴장/스포닝 진행", targetAgent.name);

  const retireSpawn = await callJSON<{
    retire: { agentId: string; exitMessage: string };
    spawn: {
      reason: string;
      agent: {
        name: string;
        role: string;
        personality: string;
        color: string;
        emoji: string;
      };
    };
  }>(
    openai,
    retireSpawnPrompt(topic, pmAgent, targetAgent, allMessages, allAgents),
    signal,
  );

  // 퇴장
  targetAgent.status = "offline";
  yield {
    type: "agent_retire",
    data: {
      agentId: targetAgent.id,
      exitMessage: retireSpawn.retire.exitMessage,
    },
  };
  log("👋 퇴장", {
    agent: targetAgent.name,
    exitMessage: retireSpawn.retire.exitMessage,
  });

  yield { type: "spawn_trigger", data: { reason: retireSpawn.spawn.reason } };

  // 스포닝
  const newAgent: Agent = {
    id: genId(),
    name: retireSpawn.spawn.agent.name,
    role: retireSpawn.spawn.agent.role,
    personality: retireSpawn.spawn.agent.personality,
    color: retireSpawn.spawn.agent.color,
    emoji: retireSpawn.spawn.agent.emoji,
    status: "online",
  };
  allAgents.push(newAgent);
  yield { type: "agent_spawned", data: { agent: newAgent } };
  log("✨ 새 에이전트", {
    name: newAgent.name,
    role: newAgent.role,
    reason: retireSpawn.spawn.reason,
  });
}

const FALLBACK_HTML = (idea: FinalIdea) => `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${idea.title}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0a;color:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;text-align:center}
h1{font-size:3rem;background:linear-gradient(135deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:1rem}
p{font-size:1.25rem;color:#a0a0a0;max-width:600px;margin-bottom:2rem}
.badge{display:inline-block;padding:0.5rem 1.5rem;border:1px solid #333;border-radius:999px;font-size:0.875rem;color:#ccc}
</style>
</head>
<body>
<h1>${idea.title}</h1>
<p>${idea.oneLiner}</p>
<span class="badge">${idea.target}</span>
</body>
</html>`;

export async function* runDebate(
  topic: string,
  signal?: AbortSignal,
): AsyncGenerator<SSEEvent> {
  const openai = createOpenAI();
  const allMessages: AgentMessage[] = [];
  const allAgents: Agent[] = [];

  // ── Step 1: Create Agents ──
  log("🚀 토론 시작", { topic });
  const creation = await callJSON<{
    agent: {
      name: string;
      role: string;
      personality: string;
      color: string;
      emoji: string;
    };
    channelName: string;
  }>(openai, createAgentPrompt(topic), signal);

  const pmAgent: Agent = { id: genId(), ...PM_AGENT };
  const agent2: Agent = {
    id: genId(),
    name: creation.agent.name,
    role: creation.agent.role,
    personality: creation.agent.personality,
    color: creation.agent.color,
    emoji: creation.agent.emoji,
    status: "online",
  };

  allAgents.push(pmAgent, agent2);

  log("🤖 에이전트 생성", {
    pm: pmAgent.name,
    agent2: `${agent2.name} (${agent2.role})`,
    channel: creation.channelName,
  });

  yield {
    type: "agents_created",
    data: { agents: [pmAgent, agent2], channelName: creation.channelName },
  };

  // ── Step 2: Free Debate Loop ──
  let turnCount = 0;
  let retireCount = 0;
  // 디자이너는 턴 3에서 합류
  let designerJoined = false;

  while (turnCount < MAX_TURNS) {
    // ── 디자이너 합류 (턴 3) ──
    if (turnCount === 3 && !designerJoined) {
      const designerAgent: Agent = { id: genId(), ...DESIGNER_AGENT };
      allAgents.push(designerAgent);
      designerJoined = true;
      log("🎨 디자이너 합류", designerAgent.name);
      yield { type: "agent_spawned", data: { agent: designerAgent } };
    }

    // ── 에이전트 교체 (턴 12, 22) ──
    if (
      (turnCount === RETIRE_AT_TURN || turnCount === RETIRE_AGAIN_AT_TURN) &&
      retireCount < 2
    ) {
      // 교체 대상: isFixed가 아닌 온라인 에이전트 중 가장 오래된 에이전트
      const target = allAgents.find(
        (a) => a.status === "online" && !a.isFixed,
      );
      if (target) {
        for await (const ev of doRetireSpawn(
          openai,
          topic,
          pmAgent,
          target,
          allAgents,
          allMessages,
          signal,
        )) {
          yield ev;
        }
        retireCount++;
      }
    }

    // ── 에이전트 간 랜덤 딜레이 (현실감) ──
    if (turnCount > 0) {
      await randomDelay();
      if (signal?.aborted) break;
    }

    // ── 다음 발언자 선택 ──
    const speakerId = pickNextSpeaker(allAgents, allMessages, turnCount);
    const speaker = allAgents.find((a) => a.id === speakerId);
    if (!speaker || speaker.status !== "online") {
      turnCount++;
      continue;
    }

    log(`🎤 턴 ${turnCount + 1}/${MAX_TURNS}: ${speaker.name} 발언`);

    const prompt = freeDebatePrompt(
      speaker,
      topic,
      allMessages,
      allAgents,
      turnCount,
    );

    for await (const ev of streamSpeak(openai, prompt, speaker.id, signal)) {
      yield ev;
      if (ev.type === "agent_speak_done") {
        allMessages.push({
          id: genId(),
          agentId: speaker.id,
          content: ev.data.fullMessage,
          round: 0,
          timestamp: Date.now(),
        });
      }
    }

    turnCount++;
  }

  // ── Step 3: Summarize ──
  log("📝 토론 요약 중...");
  const summary = await callJSON<{ summary: string }>(
    openai,
    summarizeDebatePrompt(topic, allAgents, allMessages),
    signal,
  );
  log("📝 토론 요약 완료", summary.summary);

  // ── Step 4: Final Result ──
  log("📊 최종 결과 생성 중...");
  const finalResult = await callJSON<{
    idea: FinalIdea;
  }>(
    openai,
    finalResultPrompt(topic, allAgents, allMessages, summary.summary),
    signal,
  );

  log("📊 최종 아이디어", finalResult.idea);
  yield { type: "final_result", data: { result: { idea: finalResult.idea } } };

  // ── Step 5: Landing Page ──
  log("🌐 랜딩페이지 생성 중...");
  let landingHtml = "";
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), LANDING_TIMEOUT);
    const merged = signal
      ? AbortSignal.any([signal, controller.signal])
      : controller.signal;

    const stream = await openai.chat.completions.create(
      {
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: landingPagePrompt(finalResult.idea, summary.summary),
          },
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 16000,
      },
      { signal: merged },
    );

    clearTimeout(timeout);

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        landingHtml += delta;
        yield { type: "landing_page_chunk", data: { chunk: delta } };
      }
    }
  } catch {
    landingHtml = FALLBACK_HTML(finalResult.idea);
  }

  // Strip markdown code fences if GPT wrapped the HTML
  landingHtml = landingHtml
    .replace(/^```html\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();

  // GPT가 거부한 경우 fallback 사용
  if (!landingHtml.includes("<!DOCTYPE") && !landingHtml.includes("<html")) {
    log("⚠️ 랜딩페이지 생성 거부됨, fallback 사용");
    landingHtml = FALLBACK_HTML(finalResult.idea);
  }

  log("🌐 랜딩페이지 HTML 완성", `${landingHtml.length}자`);
  log("🌐 랜딩페이지 코드:\n", landingHtml);
  yield { type: "landing_page_ready", data: { html: landingHtml } };

  // ── Step 6: Done ──
  log("✅ 토론 완료", {
    totalTurns: turnCount,
    totalAgents: allAgents.length,
    totalMessages: allMessages.length,
  });
  yield {
    type: "debate_end",
    data: {
      totalRounds: turnCount,
      totalAgents: allAgents.length,
      totalMessages: allMessages.length,
    },
  };
}

// ── Continue Debate (반려 후 이어서 토론) ──

const CONTINUE_TURNS = 8;

export async function* continueDebate(
  topic: string,
  existingAgents: Agent[],
  existingMessages: AgentMessage[],
  signal?: AbortSignal,
): AsyncGenerator<SSEEvent> {
  const openai = createOpenAI();
  const allAgents = existingAgents.map((a) => ({ ...a }));
  const allMessages = [...existingMessages];

  log("🔁 반려 — 추가 토론 시작", {
    topic,
    agents: allAgents.filter((a) => a.status === "online").map((a) => a.name),
    existingMessages: allMessages.length,
  });

  // PM 에이전트가 반려 사실을 언급하며 토론 재개
  const pmAgent = allAgents.find((a) => a.isFixed && a.role === "프로덕트 매니저");
  if (pmAgent) {
    const rejectPrompt = rejectDebatePrompt(pmAgent, topic, allMessages, allAgents);
    for await (const ev of streamSpeak(openai, rejectPrompt, pmAgent.id, signal)) {
      yield ev;
      if (ev.type === "agent_speak_done") {
        allMessages.push({
          id: genId(),
          agentId: pmAgent.id,
          content: ev.data.fullMessage,
          round: 0,
          timestamp: Date.now(),
        });
      }
    }
  }

  // 추가 자유 토론
  for (let i = 1; i < CONTINUE_TURNS; i++) {
    // 에이전트 간 랜덤 딜레이 (현실감)
    await randomDelay();
    if (signal?.aborted) break;

    const speakerId = pickNextSpeaker(allAgents, allMessages, allMessages.length + i);
    const speaker = allAgents.find((a) => a.id === speakerId);
    if (!speaker || speaker.status !== "online") continue;

    log(`🎤 추가 턴 ${i + 1}/${CONTINUE_TURNS}: ${speaker.name} 발언`);

    // 후반 토론 (수렴 단계)
    const prompt = freeDebatePrompt(speaker, topic, allMessages, allAgents, 25 + i);

    for await (const ev of streamSpeak(openai, prompt, speaker.id, signal)) {
      yield ev;
      if (ev.type === "agent_speak_done") {
        allMessages.push({
          id: genId(),
          agentId: speaker.id,
          content: ev.data.fullMessage,
          round: 0,
          timestamp: Date.now(),
        });
      }
    }
  }

  // 요약 → 결과 → 랜딩페이지 (기존과 동일)
  log("📝 토론 요약 중...");
  const summary = await callJSON<{ summary: string }>(
    openai,
    summarizeDebatePrompt(topic, allAgents, allMessages),
    signal,
  );
  log("📝 토론 요약 완료", summary.summary);

  log("📊 최종 결과 생성 중...");
  const finalResult = await callJSON<{ idea: FinalIdea }>(
    openai,
    finalResultPrompt(topic, allAgents, allMessages, summary.summary),
    signal,
  );
  log("📊 최종 아이디어", finalResult.idea);
  yield { type: "final_result", data: { result: { idea: finalResult.idea } } };

  log("🌐 랜딩페이지 생성 중...");
  let landingHtml = "";
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), LANDING_TIMEOUT);
    const merged = signal
      ? AbortSignal.any([signal, controller.signal])
      : controller.signal;

    const stream = await openai.chat.completions.create(
      {
        model: "gpt-4o",
        messages: [
          { role: "user", content: landingPagePrompt(finalResult.idea, summary.summary) },
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 16000,
      },
      { signal: merged },
    );
    clearTimeout(timeout);

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        landingHtml += delta;
        yield { type: "landing_page_chunk", data: { chunk: delta } };
      }
    }
  } catch {
    landingHtml = FALLBACK_HTML(finalResult.idea);
  }

  landingHtml = landingHtml.replace(/^```html\s*/i, "").replace(/```\s*$/, "").trim();
  if (!landingHtml.includes("<!DOCTYPE") && !landingHtml.includes("<html")) {
    log("⚠️ 랜딩페이지 생성 거부됨, fallback 사용");
    landingHtml = FALLBACK_HTML(finalResult.idea);
  }

  log("🌐 랜딩페이지 HTML 완성", `${landingHtml.length}자`);
  yield { type: "landing_page_ready", data: { html: landingHtml } };

  log("✅ 추가 토론 완료");
  yield {
    type: "debate_end",
    data: {
      totalRounds: CONTINUE_TURNS,
      totalAgents: allAgents.length,
      totalMessages: allMessages.length,
    },
  };
}
