<div align="center">

# Agent Arena

**AI agents debate your idea — then build the landing page.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991.svg)](https://openai.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Grand Prize Winner** — Build with TRAE Seoul Hackathon 2026

</div>

---

## What is Agent Arena?

Agent Arena is a multi-agent debate platform where AI agents autonomously discuss, challenge, and refine your business idea — then generate a landing page from the result.

You throw in a topic. A **PM agent** (always present) and **domain-expert agents** (auto-generated per topic) debate in a **Slack-style chat UI**. Agents retire and new specialists spawn as the discussion evolves. When the debate concludes, the chat view transforms into a **fully generated landing page**.

### Key Features

| Feature | Description |
|---------|-------------|
| **Slack-style Debate UI** | Real-time multi-agent discussion with typing indicators, join/leave events |
| **Auto Agent Spawning** | Domain experts are generated based on the topic (marketer, tech lead, UX researcher, etc.) |
| **Agent Retirement & Replacement** | After each round, the orchestrator retires agents and spawns new specialists |
| **PM as Anchor** | The PM agent keeps the debate on-topic and user-focused |
| **Landing Page Generation** | Debate conclusion triggers full HTML landing page generation |
| **Page Swap Transition** | Animated transition from chat to the generated landing page |
| **Debate History** | Browse and revisit past debates and their generated pages |
| **Preset Topics** | Quick-start with curated topic suggestions |

---

## Agent Design Patterns

Agent Arena demonstrates 7+ agent design patterns:

| Pattern | Usage |
|---------|-------|
| **Orchestrator** | Controls debate flow, round management, agent lifecycle |
| **Specialist Agents** | Domain experts auto-generated per topic |
| **Persistent Agent (PM)** | Always-on anchor that prevents scope creep |
| **Agent Spawning** | New experts created mid-debate when the topic shifts |
| **Agent Retirement** | Graceful exit with handoff message when no longer relevant |
| **Multi-turn Debate** | Structured rounds with analysis between turns |
| **Result Synthesis** | Final round produces structured output for page generation |

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| AI | OpenAI GPT-4o |
| UI | Tailwind CSS v4, Framer Motion |
| State | React hooks |
| Export | Archiver (ZIP download) |

---

## Getting Started

```bash
git clone https://github.com/wigtn/wigent.git
cd wigent
npm install
npm run dev
```

Set your OpenAI API key in the environment:

```bash
export OPENAI_API_KEY=sk-...
```

Open [http://localhost:3000](http://localhost:3000), enter a topic or pick a preset, and watch the agents debate.

---

## Project Structure

```
wigent/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── debate/      # Debate orchestration API
│   │   │   └── export/      # Landing page export (ZIP)
│   │   ├── page.tsx          # Main page (topic input → debate → landing)
│   │   └── layout.tsx        # Root layout
│   ├── components/
│   │   ├── chat/             # Slack-style chat UI components
│   │   ├── TopicInput.tsx    # Topic input form
│   │   ├── PresetButtons.tsx # Preset topic suggestions
│   │   ├── LandingPageView.tsx # Generated landing page renderer
│   │   ├── HistoryList.tsx   # Debate history browser
│   │   └── PageTransition.tsx # Chat → Landing page transition
│   ├── hooks/                # useDebate, useHistory
│   └── lib/                  # Types, utilities
├── docs/                     # Documentation
├── PRD.md                    # Product Requirements Document
└── package.json
```

---

## How It Works

```
1. User enters topic (or picks preset)
2. Orchestrator creates PM agent + topic-specific expert
3. Agents debate in rounds (Slack-style UI)
4. After each round: orchestrator analyzes → may retire/spawn agents
5. Final round: structured result synthesis
6. GPT-4o generates full landing page HTML
7. Animated transition: chat → landing page
8. Auto-saved to history
```

---

## License

MIT

---

## 🏢 About WIGTN Crew

This project is built and maintained by **[WIGTN Crew](https://wigtn.com)** —  
an AI-native open-source research crew based in Korea.  
We build practical, domain-specialized AI tools. Fast prototyping, strong engineering, shipping real things.

| | |
|---|---|
| 🌐 Website | [wigtn.com](https://wigtn.com) |
| 🐙 GitHub | [github.com/wigtn](https://github.com/wigtn) |
| 🤗 HuggingFace | [huggingface.co/Wigtn](https://huggingface.co/Wigtn) |
| 📦 NPM | [npmjs.com/org/wigtn](https://www.npmjs.com/org/wigtn) |

### 🔬 Our Projects

| Project | Description | Status |
|---------|-------------|--------|
| [WigtnOCR](https://huggingface.co/Wigtn/Qwen3-VL-2B-WigtnOCR) | VLM-based Korean government document parser | EMNLP 2026 |
| [WIGVO](https://wigtn.com) | Real-time PSTN voice translation (Korean↔English) | ACL 2026 |
| [Claude Code Plugin](https://github.com/wigtn/wigtn-plugins-with-claude-code) | Multi-agent parallel execution ecosystem | Open Source |

> Results speak louder than resumes.
