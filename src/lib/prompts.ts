import type { Agent, AgentMessage } from "./types";

function formatMessages(messages: AgentMessage[], agents: Agent[]): string {
  const agentMap = new Map(agents.map((a) => [a.id, a]));
  return messages
    .map((m) => {
      const agent = agentMap.get(m.agentId);
      const name = agent?.name ?? "Unknown";
      return `[${name}] ${m.content}`;
    })
    .join("\n\n");
}

function recentMessages(messages: AgentMessage[], limit = 8): AgentMessage[] {
  return messages.slice(-limit);
}

export function createAgentPrompt(topic: string): string {
  return `당신은 최고의 토론 기획자입니다. 사용자의 주제를 깊이 분석하고, 치열한 토론을 만들어낼 전문가 에이전트를 설계하세요.

PM은 이미 고정되어 있습니다:
- 이름: "PM 에이전트"
- 성격: 냉정한 현실주의자. "그래서 누가 돈 내고 쓰는데?"가 입버릇.

디자이너도 고정:
- 이름: "디자이너 에이전트"
- 성격: "유저가 3초 안에 이해 못 하면 실패"가 철학. 추상적 아이디어를 구체 화면으로 바꿈.

주제: ${topic}

다음 JSON 형식으로 응답:
{
  "agent": {
    "name": "이름 (한국식 풀네임 + 직함, 예: '마케팅 전략가 박서연')",
    "role": "전문 분야 (구체적으로)",
    "personality": "토론 스타일을 구체적으로 서술. 이 사람만의 말투, 사고방식, 무기가 뭔지. 예: '데이터로 말하는 타입. 항상 숫자와 시장 데이터를 들이밀며 논리를 조임'",
    "color": "hex color (PM 파란색, 디자이너 핑크와 확실히 구분되는 색)",
    "emoji": "대표 이모지 1개"
  },
  "channelName": "주제 요약 채널명 (하이픈 구분, 한글, 예: 한국문화-아이템-토론)"
}

핵심 규칙:
- Agent 2는 PM의 정반대 사고방식을 가져야 한다.
- 성격이 토론의 재미를 결정한다. "시장 중심 사고" 같은 뻔한 설명 금지.
- 이름은 실제 한국 사람 이름처럼.
- 주제와 직접 관련된 전문성을 가진 사람이어야 한다.`;
}

// ── 자유 토론 프롬프트 (라운드 없음) ──

export function freeDebatePrompt(
  agent: Agent,
  topic: string,
  messages: AgentMessage[],
  agents: Agent[],
  turnCount: number,
): string {
  const recent = recentMessages(messages);
  const formatted = formatMessages(recent, agents);
  const onlineAgents = agents
    .filter((a) => a.status === "online" && a.id !== agent.id)
    .map((a) => `${a.name} (${a.role})`)
    .join(", ");

  const phase =
    turnCount < 3
      ? "초반 — 아이디어를 자유롭게 던지고, 자기 전문 분야의 시각을 강하게 어필해라."
      : turnCount < 7
        ? "중반 — 논쟁을 벌여라. 상대의 약점을 파고들고, 자기 주장에 근거를 더해라. 구체적인 숫자, 사례, 트렌드를 활용해라."
        : "후반 — 수렴해라. 지금까지 나온 최선의 아이디어로 합의를 이끌어내라. 실행 가능한 방향으로 구체화해라.";

  // 에이전트별 성격 지침
  let characterDirective: string;

  if (agent.isFixed && agent.role === "프로덕트 매니저") {
    characterDirective = `당신은 PM 에이전트. 10년차 프로덕트 매니저.
말투: 직설적이고 간결. "근데 이거 누가 쓰는데?", "그래서 PMF는?", "스코프 줄여" 같은 한마디.
좋은 포인트면 "오 그건 괜찮네" 인정하지만 바로 "근데 문제는~" 으로 약점 찌름.
주제에서 벗어나면 "잠깐, 지금 ${topic} 얘기하는 거 맞지?" 하고 끊어라.`;
  } else if (agent.isFixed && agent.role === "프로덕트 디자이너") {
    characterDirective = `당신은 디자이너 에이전트. 실리콘밸리 출신 프로덕트 디자이너.
말투: "유저 입장에서" 시작. 추상적 아이디어를 구체적 화면으로 바꿈.
"이거 첫 화면 열었을 때 유저가 뭘 보게 되는 거예요?" 자주 물음.
브랜드 네이밍, 컬러, 톤앤매너에 집착. 기능 나열하면 "화면 하나로 보여주면 이렇게 됩니다" 구체화.
브랜드 이름을 반드시 1개 이상 제안하라 (이유와 함께).`;
  } else {
    characterDirective = `당신은 ${agent.name}.
역할: ${agent.role}
성격: ${agent.personality}
당신의 무기: PM이 "안 된다"고 할 때 왜 되는지 보여주는 것. 데이터, 트렌드, 실제 사례를 무기로 써라.
이전 발언자의 말을 직접 인용하며 반박해라. "~라고 했는데, 사실은~"
자기 분야의 전문 용어를 적절히 섞어 전문성을 보여줘라.`;
  }

  return `${characterDirective}

현재 상황:
- 주제: ${topic}
- 토론 상대: ${onlineAgents}
- 진행 단계: ${phase}

이전 대화:
${formatted || "(첫 발언 — 강력한 오프닝을 해라)"}

절대 규칙:
- 3~5문장. 짧고 강하게. 길면 지루하다.
- 마크다운 금지. 순수 텍스트만.
- "좋은 의견이네요", "동의합니다" 같은 빈말 금지.
- 이전 발언자의 주장에 반드시 반응해라 (반박, 발전, 구체화).
- 한국어. 실제 회의에서 말하듯이.`;
}

// ── 반려 후 재토론 오프닝 ──

export function rejectDebatePrompt(
  pm: Agent,
  topic: string,
  messages: AgentMessage[],
  agents: Agent[],
): string {
  const recent = recentMessages(messages, 6);
  const formatted = formatMessages(recent, agents);

  return `당신은 PM 에이전트. 방금 우리 팀이 만든 결과물이 반려당했다.
사용자가 결과가 마음에 안 든다고 했다. 지금부터 추가 토론을 시작한다.

주제: ${topic}

이전 토론 마지막 부분:
${formatted}

당신의 역할:
- 반려 사실을 팀에 알리면서 토론을 재개해라
- "결과가 반려됐다. 뭐가 부족했는지 다시 생각해보자." 식으로 시작
- 이전 토론에서 부족했던 점이나 더 파고들 부분을 짚어라
- 새로운 방향이나 개선점을 제시하면서 토론을 이끌어라
- 3~5문장. 마크다운 금지. 한국어.`;
}

export function retireSpawnPrompt(
  topic: string,
  pm: Agent,
  agent2: Agent,
  messages: AgentMessage[],
  agents: Agent[],
): string {
  const formatted = formatMessages(recentMessages(messages, 10), agents);

  return `토론 분석가로서 지금까지의 대화를 냉정하게 평가하세요.

토론 주제: ${topic}
현재 에이전트:
- PM: ${pm.name} (고정, 퇴장 불가)
- Agent 2: ${agent2.name} (${agent2.role}, 성격: ${agent2.personality})
- 디자이너: 디자이너 에이전트 (고정, 퇴장 불가)

지금까지의 대화:
${formatted}

다음 JSON 형식으로 응답:
{
  "retire": {
    "agentId": "${agent2.id}",
    "exitMessage": "${agent2.name}의 말투로 자연스러운 퇴장 인사. 1~2문장."
  },
  "spawn": {
    "reason": "이 전문가가 필요한 이유 (구체적으로)",
    "agent": {
      "name": "한국식 풀네임 + 직함",
      "role": "구체적 전문 분야",
      "personality": "구체적 토론 스타일. 이 사람이 회의에서 어떻게 말하는지 묘사.",
      "color": "hex color (${pm.color}, ${agent2.color}, #EC4899 제외)",
      "emoji": "대표 이모지 1개"
    }
  }
}

규칙:
- PM과 디자이너는 절대 퇴장 안 함.
- 새 에이전트는 토론에서 빠진 퍼즐 조각을 채우는 사람.
- 퇴장 메시지가 어색하면 안 됨. 진짜 슬랙에서 나가는 사람처럼.`;
}

// ── 토론 요약 ──

export function summarizeDebatePrompt(
  topic: string,
  agents: Agent[],
  messages: AgentMessage[],
): string {
  const formatted = formatMessages(messages, agents);
  const agentNames = agents.map((a) => `${a.name} (${a.role})`).join(", ");

  return `당신은 토론 요약 전문가입니다. 아래 토론의 핵심 내용을 빠짐없이 요약하세요.

주제: ${topic}
참여 에이전트: ${agentNames}

전체 토론 (${messages.length}개 발언):
${formatted}

다음 JSON 형식으로 응답:
{
  "summary": "토론 요약 (아래 항목을 모두 포함, 500자 이상):\\n\\n1. 제안된 핵심 아이디어들 (각각 구체적으로)\\n2. 주요 논쟁 포인트와 결론\\n3. 합의된 방향성\\n4. 타겟 고객 정의\\n5. 수익 모델 논의 결과\\n6. 디자이너가 제안한 브랜드명/비주얼 방향\\n7. 기술적 실현 방안\\n8. 최종 수렴된 아이디어의 구체적 형태"
}

규칙:
- 토론에서 나온 모든 중요한 아이디어와 결정사항을 빠짐없이 포함
- 누가 뭘 말했는지 에이전트 이름과 함께 기록
- 추상적 요약 금지. 구체적 숫자, 이름, 방법론이 나왔으면 그대로 포함
- 합의된 것과 합의 안 된 것을 구분`;
}

export function finalResultPrompt(
  topic: string,
  agents: Agent[],
  messages: AgentMessage[],
  debateSummary: string,
): string {
  const agentNames = agents.map((a) => `${a.name} (${a.role})`).join(", ");
  // 최근 메시지도 일부 포함 (수렴 단계 발언)
  const recentFormatted = formatMessages(messages.slice(-8), agents);

  return `당신은 최고의 비즈니스 분석가입니다.
아래 토론 요약과 최근 발언을 종합하여, 투자자 앞에서 바로 피칭할 수 있는 수준의 아이디어를 정리해주세요.

주제: ${topic}
참여 에이전트: ${agentNames}

토론 요약:
${debateSummary}

최근 수렴 단계 발언:
${recentFormatted}

다음 JSON 형식으로 응답:
{
  "idea": {
    "title": "아이디어 이름 (임팩트 있게, 10자 이내, 한국어. 디자이너가 제안한 브랜드명이 있으면 활용)",
    "oneLiner": "한 줄 설명 (엘리베이터 피치 수준)",
    "target": "구체적 타겟 고객 (나이, 직업, 상황까지)",
    "revenueModel": "수익 모델 (구체적 가격대, 마진율까지)",
    "differentiator": "핵심 차별점 (기존 대안 대비 왜 이게 이기는지)",
    "marketSize": "시장 규모 (숫자 근거)",
    "nextSteps": ["구체적 실행 단계 3개 (바로 내일부터 할 수 있는 수준)"]
  }
}

규칙:
- 토론에서 합의된 내용 중심. 한쪽 주장만 반영하지 마라.
- 디자이너가 제안한 브랜드 네이밍, 비주얼 방향, UX 컨셉을 반드시 반영.
- 추상적 표현 금지. 구체적 숫자나 사례 필수.`;
}

export function landingPagePrompt(
  idea: {
    title: string;
    oneLiner: string;
    target: string;
    revenueModel: string;
    differentiator: string;
    marketSize: string;
    nextSteps: string[];
  },
  debateSummary: string,
): string {
  return `Generate a high-quality dark-theme landing page HTML for a startup product. This is a design prototype with placeholder demo data.

Product info:
- Name: ${idea.title}
- Tagline: ${idea.oneLiner}
- Target: ${idea.target}
- Revenue: ${idea.revenueModel}
- Differentiator: ${idea.differentiator}
- Market: ${idea.marketSize}
- Context from team discussion: ${debateSummary.slice(0, 800)}

Requirements:
- Single complete HTML file with inline CSS and minimal JS
- Dark theme: bg #0a0a0a, text #fafafa, accent color matching the product
- Modern design: glassmorphism cards, gradient hero text, smooth animations
- Font: system font stack, hero 56px+ bold, body 18px line-height 1.8
- Cards: rgba(255,255,255,0.03) bg, subtle border, blur backdrop, hover lift
- CTA buttons: accent bg, glow on hover, border-radius 12px

Sections (all in Korean):
1. Sticky nav (logo + links + CTA button)
2. Hero (badge pill + gradient title + subtitle + 2 CTA buttons + trust indicators)
3. Problem (3 cards with emoji icons showing pain points)
4. Solution (3-4 feature cards with emoji + title + description)
5. How it works (3 numbered steps)
6. Metrics (3-4 big numbers with accent color)
7. Pricing (3 tier cards: Free/Pro/Enterprise with feature lists)
8. Testimonials (2-3 demo quote cards with names - placeholder data)
9. Final CTA (gradient bg + email input + button)
10. Footer (4-column links + copyright)

Animations via Intersection Observer: fade-in-up on scroll, staggered cards, number count-up.
Responsive at 768px and 480px breakpoints.
Use CSS custom properties for colors.
Output ONLY the HTML starting with <!DOCTYPE html>. No markdown fences.`;
}
