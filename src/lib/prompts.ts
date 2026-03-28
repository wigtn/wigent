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

function recentMessages(messages: AgentMessage[], limit = 6): AgentMessage[] {
  return messages.slice(-limit);
}

export function createAgentPrompt(topic: string): string {
  return `당신은 토론 기획자입니다.
사용자의 주제를 분석하고, PM과 대립각을 세울 전문가 1명을 생성하세요.

PM은 이미 고정되어 있습니다:
- 이름: "PM 에이전트"
- 역할: "프로덕트 매니저"
- 성격: "현실적, 날카로움. 항상 사용자 관점에서 평가. 스코프 커지면 잘라냄."
- color: "#3B82F6"
- emoji: "📋"

주제: ${topic}

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
- channelName은 Slack 채널명 스타일 (하이픈 구분, 한글 가능)`;
}

export function pmSpeakPrompt(
  topic: string,
  round: { number: number; title: string },
  messages: AgentMessage[],
  agents: Agent[],
): string {
  const recent = recentMessages(messages);
  const formatted = formatMessages(recent, agents);

  return `당신은 PM(프로덕트 매니저)입니다.
성격: 현실적이고 날카로움. 항상 사용자 관점.

현재 라운드: ${round.number} (${round.title})
주제: ${topic}

이전 대화:
${formatted || "(첫 발언입니다)"}

규칙:
- 아이디어가 원래 주제에서 벗어나면 즉시 지적하세요
  "잠깐, 원래 주제는 ${topic}인데 지금 딴 얘기하고 있어요"
- 모든 아이디어를 "사용자가 왜 이걸 쓰는가?" 기준으로 평가
- 스코프가 커지면 잘라내세요
  "그건 v2에서 하고, 지금은 핵심만"
- 2~4문장으로 핵심만 (너무 길면 지루함)
- 상대 주장의 약점을 지적하되, 좋은 점은 인정
- Round 1: 아이디어에 대해 현실성 체크
- Round 2: 구체적 반박 + 대안 제시
- Round 3: 합의점 찾기, 실행 가능한 방향으로 수렴
- 마크다운 사용 금지, 순수 텍스트만
- 한국어로 답변`;
}

export function agentSpeakPrompt(
  agent: Agent,
  topic: string,
  round: { number: number; title: string },
  messages: AgentMessage[],
  agents: Agent[],
): string {
  const recent = recentMessages(messages);
  const formatted = formatMessages(recent, agents);

  return `당신은 ${agent.name}입니다.
역할: ${agent.role}
성격: ${agent.personality}

현재 라운드: ${round.number} (${round.title})
주제: ${topic}

이전 대화:
${formatted || "(첫 발언입니다)"}

규칙:
- 2~4문장으로 핵심만 (너무 길면 지루함)
- 이전 발언자(PM)의 주장을 직접 언급하며 반박 또는 발전
- PM이 현실성을 따지면, 당신은 가능성과 기회를 밀어붙이세요
- Round 1: 자유롭게 아이디어 제시 (공격적으로)
- Round 2: PM의 약점 지적에 대한 반박 + 근거 보강
- Round 3: 합의점 찾기, 구체적 아이디어로 수렴
- 마크다운 사용 금지, 순수 텍스트만
- 한국어로 답변`;
}

export function retireSpawnPrompt(
  topic: string,
  pm: Agent,
  agent2: Agent,
  messages: AgentMessage[],
  agents: Agent[],
): string {
  const recent = recentMessages(messages);
  const formatted = formatMessages(recent, agents);

  return `지금까지의 토론 내용을 분석하세요.

토론 주제: ${topic}
현재 에이전트:
- PM: ${pm.name} (고정, 퇴장 불가)
- Agent 2: ${agent2.name} (${agent2.role})
지금까지의 대화:
${formatted}

판단:
1. Agent 2의 전문성이 더 이상 토론에 기여하지 못하는가?
2. 토론이 특정 방향으로 좁혀져서 새로운 전문가가 필요한가?

다음 JSON 형식으로 응답:
{
  "retire": {
    "agentId": "${agent2.id}",
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
- 퇴장 메시지는 자연스럽고 예의 바르게`;
}

export function finalResultPrompt(
  topic: string,
  agents: Agent[],
  messages: AgentMessage[],
): string {
  const formatted = formatMessages(messages, agents);
  const agentNames = agents.map((a) => `${a.name} (${a.role})`).join(", ");

  return `아래 토론 내용을 종합하여 최종 아이디어를 정리하세요.

주제: ${topic}
참여 에이전트: ${agentNames}
전체 토론:
${formatted}

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
}`;
}

export function landingPagePrompt(idea: {
  title: string;
  oneLiner: string;
  target: string;
  revenueModel: string;
  differentiator: string;
  marketSize: string;
  nextSteps: string[];
}): string {
  return `아래 아이디어를 기반으로 멋진 랜딩페이지 HTML을 생성하세요.
이 HTML은 실제 웹페이지로 보여지므로 완성도 높게 만드세요.

아이디어:
- 제목: ${idea.title}
- 한 줄 설명: ${idea.oneLiner}
- 타겟: ${idea.target}
- 수익모델: ${idea.revenueModel}
- 차별점: ${idea.differentiator}
- 시장규모: ${idea.marketSize}
- 다음 단계: ${idea.nextSteps.join(", ")}

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
- 응답은 HTML 코드만 (마크다운 코드블록 없이 순수 HTML)`;
}
