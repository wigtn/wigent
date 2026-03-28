"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DebateState } from "@/lib/types";
import ChatLayout from "@/components/chat/ChatLayout";
import PageTransition from "@/components/PageTransition";

// Demo state for development — will be replaced by useDebate hook (P3)
const DEMO_STATE: DebateState = {
  status: "debating",
  topic: "외국인 타겟 한국문화 아이템 사업 아이디어",
  channelName: "한국문화-아이템-토론",
  agents: [
    {
      id: "pm-1",
      name: "PM 에이전트",
      role: "프로덕트 매니저",
      personality: "현실적, 날카로움",
      color: "#3B82F6",
      emoji: "📋",
      isFixed: true,
      status: "online",
    },
    {
      id: "agent-2",
      name: "마케팅 전략가 박서연",
      role: "마케팅 전문가",
      personality: "시장 중심 사고",
      color: "#F59E0B",
      emoji: "📊",
      status: "online",
    },
  ],
  retiredAgents: [],
  rounds: [
    { number: 1, title: "브레인스토밍", status: "done" },
    { number: 2, title: "토론/반박", status: "active" },
  ],
  chatItems: [
    {
      kind: "system",
      data: {
        id: "sys-1",
        type: "agent_join",
        content: "PM 에이전트님이 채널에 참여했습니다",
        timestamp: Date.now() - 60000,
        agentId: "pm-1",
      },
    },
    {
      kind: "system",
      data: {
        id: "sys-2",
        type: "agent_join",
        content: "마케팅 전략가 박서연님이 채널에 참여했습니다",
        timestamp: Date.now() - 59000,
        agentId: "agent-2",
      },
    },
    {
      kind: "system",
      data: {
        id: "sys-round-1",
        type: "round_divider",
        content: "Round 1: 브레인스토밍",
        timestamp: Date.now() - 58000,
      },
    },
    {
      kind: "message",
      data: {
        id: "msg-1",
        agentId: "pm-1",
        content:
          "좋습니다, 한국문화 아이템 사업을 시작해볼까요. 먼저 핵심 질문부터 — 타겟 외국인이 '돈을 내고 살 만한' 한국문화 아이템이 뭘까요? K-pop 굿즈는 이미 레드오션이고, 차별화 포인트가 필요합니다.",
        round: 1,
        timestamp: Date.now() - 50000,
      },
    },
    {
      kind: "message",
      data: {
        id: "msg-2",
        agentId: "agent-2",
        content:
          "시장 데이터를 보면, 한국 전통 공예품의 해외 수요가 매년 23% 성장하고 있어요. 특히 MZ세대 외국인들은 '경험형 소비'를 선호합니다. 한국 도자기 DIY 키트, 한복 패브릭 소품처럼 '직접 만드는' 한국문화 아이템이 블루오션입니다.",
        round: 1,
        timestamp: Date.now() - 40000,
      },
    },
    {
      kind: "system",
      data: {
        id: "sys-round-2",
        type: "round_divider",
        content: "Round 2: 토론/반박",
        timestamp: Date.now() - 35000,
      },
    },
    {
      kind: "message",
      data: {
        id: "msg-3",
        agentId: "pm-1",
        content:
          "잠깐, DIY 키트는 좋은데 물류 비용이 문제예요. 도자기는 깨지기 쉽고, 해외 배송비가 상품 가격을 넘을 수 있어요. 사용자 관점에서 — '배송비 포함 $30 이하'로 가능한 아이템이어야 합니다.",
        round: 2,
        timestamp: Date.now() - 25000,
      },
    },
    {
      kind: "message",
      data: {
        id: "msg-4",
        agentId: "agent-2",
        content:
          "좋은 지적이에요! 그러면 물리적 제품 대신 '디지털 + 소형 패키지' 조합은 어떨까요? 한국 전통 문양 스티커팩 + AR 체험 앱 — 스티커를 스캔하면 한국 문화 스토리가 AR로 나오는 거죠. 배송비 $5 이하, 마진 70% 이상 가능합니다.",
        round: 2,
        timestamp: Date.now() - 15000,
      },
    },
  ],
  currentRound: 2,
  activeAgentId: null,
  streamingText: "",
  result: null,
  landingPageHtml: null,
  error: null,
};

export default function Home() {
  // TODO: Replace with useDebate hook from P3
  const [state] = useState<DebateState>(DEMO_STATE);

  const isChat =
    state.status === "debating" ||
    state.status === "creating" ||
    state.status === "retiring" ||
    state.status === "spawning" ||
    state.status === "generating_landing";

  const isLanding = state.status === "landing";

  return (
    <main className="h-full">
      <AnimatePresence mode="wait">
        {isChat && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <ChatLayout state={state} />
          </motion.div>
        )}

        {isLanding && state.landingPageHtml && (
          <PageTransition show={true}>
            <div
              className="h-full"
              dangerouslySetInnerHTML={{ __html: state.landingPageHtml }}
            />
          </PageTransition>
        )}

        {state.status === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center h-full"
          >
            <p className="text-[var(--text-muted)] text-lg">
              주제를 입력하면 토론이 시작됩니다
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
