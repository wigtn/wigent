import OpenAI from "openai";
import type { Agent, AgentMessage, FinalIdea, SSEEvent } from "./types";
import { PM_AGENT } from "./types";
import {
  createAgentPrompt,
  pmSpeakPrompt,
  agentSpeakPrompt,
  retireSpawnPrompt,
  finalResultPrompt,
  landingPagePrompt,
} from "./prompts";

const CALL_TIMEOUT = 30_000;
const MAX_RETRIES = 1;

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
      const timeout = setTimeout(() => controller.abort(), CALL_TIMEOUT);

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
  round: number,
  signal?: AbortSignal,
): AsyncGenerator<SSEEvent> {
  yield { type: "agent_speak_start", data: { agentId, round } };

  let fullMessage = "";
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), CALL_TIMEOUT);

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
  const creation = await callJSON<{
    agent: {
      name: string;
      role: string;
      personality: string;
      color: string;
      emoji: string;
    };
    channelName: string;
    roundPlan: { round1: string; round2: string; round3: string };
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

  yield {
    type: "agents_created",
    data: { agents: [pmAgent, agent2], channelName: creation.channelName },
  };

  const rounds = [
    { number: 1, title: "브레인스토밍" },
    { number: 2, title: "토론/반박" },
    { number: 3, title: "최종 수렴" },
  ];

  // ── Step 2: Round 1 ──
  yield { type: "round_start", data: { round: 1, title: rounds[0].title } };

  for await (const ev of streamSpeak(
    openai,
    pmSpeakPrompt(topic, rounds[0], allMessages, allAgents),
    pmAgent.id,
    1,
    signal,
  )) {
    yield ev;
    if (ev.type === "agent_speak_done") {
      allMessages.push({
        id: genId(),
        agentId: pmAgent.id,
        content: ev.data.fullMessage,
        round: 1,
        timestamp: Date.now(),
      });
    }
  }

  for await (const ev of streamSpeak(
    openai,
    agentSpeakPrompt(agent2, topic, rounds[0], allMessages, allAgents),
    agent2.id,
    1,
    signal,
  )) {
    yield ev;
    if (ev.type === "agent_speak_done") {
      allMessages.push({
        id: genId(),
        agentId: agent2.id,
        content: ev.data.fullMessage,
        round: 1,
        timestamp: Date.now(),
      });
    }
  }

  // ── Step 3: Round 2 ──
  yield { type: "round_start", data: { round: 2, title: rounds[1].title } };

  for await (const ev of streamSpeak(
    openai,
    pmSpeakPrompt(topic, rounds[1], allMessages, allAgents),
    pmAgent.id,
    2,
    signal,
  )) {
    yield ev;
    if (ev.type === "agent_speak_done") {
      allMessages.push({
        id: genId(),
        agentId: pmAgent.id,
        content: ev.data.fullMessage,
        round: 2,
        timestamp: Date.now(),
      });
    }
  }

  for await (const ev of streamSpeak(
    openai,
    agentSpeakPrompt(agent2, topic, rounds[1], allMessages, allAgents),
    agent2.id,
    2,
    signal,
  )) {
    yield ev;
    if (ev.type === "agent_speak_done") {
      allMessages.push({
        id: genId(),
        agentId: agent2.id,
        content: ev.data.fullMessage,
        round: 2,
        timestamp: Date.now(),
      });
    }
  }

  // ── Step 4: Retire + Spawn ──
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
    retireSpawnPrompt(topic, pmAgent, agent2, allMessages, allAgents),
    signal,
  );

  yield {
    type: "agent_retire",
    data: {
      agentId: agent2.id,
      exitMessage: retireSpawn.retire.exitMessage,
    },
  };

  yield { type: "spawn_trigger", data: { reason: retireSpawn.spawn.reason } };

  const agent3: Agent = {
    id: genId(),
    name: retireSpawn.spawn.agent.name,
    role: retireSpawn.spawn.agent.role,
    personality: retireSpawn.spawn.agent.personality,
    color: retireSpawn.spawn.agent.color,
    emoji: retireSpawn.spawn.agent.emoji,
    status: "online",
  };

  allAgents.push(agent3);
  yield { type: "agent_spawned", data: { agent: agent3 } };

  // ── Step 5: Round 3 ──
  yield { type: "round_start", data: { round: 3, title: rounds[2].title } };

  for await (const ev of streamSpeak(
    openai,
    pmSpeakPrompt(topic, rounds[2], allMessages, allAgents),
    pmAgent.id,
    3,
    signal,
  )) {
    yield ev;
    if (ev.type === "agent_speak_done") {
      allMessages.push({
        id: genId(),
        agentId: pmAgent.id,
        content: ev.data.fullMessage,
        round: 3,
        timestamp: Date.now(),
      });
    }
  }

  for await (const ev of streamSpeak(
    openai,
    agentSpeakPrompt(agent3, topic, rounds[2], allMessages, allAgents),
    agent3.id,
    3,
    signal,
  )) {
    yield ev;
    if (ev.type === "agent_speak_done") {
      allMessages.push({
        id: genId(),
        agentId: agent3.id,
        content: ev.data.fullMessage,
        round: 3,
        timestamp: Date.now(),
      });
    }
  }

  // ── Step 6: Final Result ──
  const finalResult = await callJSON<{
    idea: FinalIdea;
  }>(openai, finalResultPrompt(topic, allAgents, allMessages), signal);

  yield { type: "final_result", data: { result: { idea: finalResult.idea } } };

  // ── Step 7: Landing Page ──
  let landingHtml = "";
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CALL_TIMEOUT);
    const merged = signal
      ? AbortSignal.any([signal, controller.signal])
      : controller.signal;

    const stream = await openai.chat.completions.create(
      {
        model: "gpt-4o",
        messages: [
          { role: "user", content: landingPagePrompt(finalResult.idea) },
        ],
        stream: true,
        temperature: 0.7,
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

  yield { type: "landing_page_ready", data: { html: landingHtml } };

  // ── Step 8: Done ──
  yield {
    type: "debate_end",
    data: {
      totalRounds: 3,
      totalAgents: allAgents.length,
      totalMessages: allMessages.length,
    },
  };
}
