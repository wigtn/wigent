"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDebate } from "@/hooks/useDebate";
import { useHistory } from "@/hooks/useHistory";
import ChatLayout from "@/components/chat/ChatLayout";
import { TopicInput } from "@/components/TopicInput";
import { PresetButtons } from "@/components/PresetButtons";
import { LandingPageView } from "@/components/LandingPageView";
import { HistoryList } from "@/components/HistoryList";
import type { DebateState, HistoryEntry } from "@/lib/types";

export default function Home() {
  const { state, startDebate, reset } = useDebate();
  const { entries, save, remove } = useHistory();
  const [showChat, setShowChat] = useState(false);
  const [historyItem, setHistoryItem] = useState<HistoryEntry | null>(null);
  const savedRef = useRef(false);

  // Auto-save to history when debate completes
  useEffect(() => {
    if (
      state.status === "landing" &&
      state.landingPageHtml &&
      !savedRef.current
    ) {
      savedRef.current = true;
      save({
        topic: state.topic,
        result: state.result,
        landingPageHtml: state.landingPageHtml,
        chatItems: state.chatItems,
        agents: state.agents,
        retiredAgents: state.retiredAgents,
        channelName: state.channelName,
      });
    }
    if (state.status === "idle") {
      savedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  const handleNewDebate = useCallback(() => {
    setHistoryItem(null);
    setShowChat(false);
    reset();
  }, [reset]);

  const handleViewChat = useCallback(() => {
    setShowChat(true);
  }, []);

  const handleBackToLanding = useCallback(() => {
    setShowChat(false);
  }, []);

  const handleHistorySelect = useCallback((entry: HistoryEntry) => {
    setHistoryItem(entry);
    setShowChat(false);
  }, []);

  const handleHistoryBack = useCallback(() => {
    setHistoryItem(null);
    setShowChat(false);
  }, []);

  // ── View state ──

  type ViewState = "idle" | "chat" | "landing" | "chat-replay" | "error";

  let currentView: ViewState;
  if (showChat && (historyItem || state.status === "landing")) {
    currentView = "chat-replay";
  } else if (historyItem) {
    currentView = "landing";
  } else if (state.status === "idle") {
    currentView = "idle";
  } else if (state.status === "error") {
    currentView = "error";
  } else if (state.status === "landing") {
    currentView = "landing";
  } else {
    currentView = "chat";
  }

  // Chat replay state (reconstructed from history or current)
  const chatReplayState: DebateState | null =
    currentView === "chat-replay"
      ? historyItem
        ? {
            status: "landing",
            topic: historyItem.topic,
            channelName: historyItem.channelName,
            agents: historyItem.agents,
            retiredAgents: historyItem.retiredAgents,
            rounds: [],
            chatItems: historyItem.chatItems,
            currentRound: 0,
            activeAgentId: null,
            streamingText: "",
            result: historyItem.result,
            landingPageHtml: historyItem.landingPageHtml,
            error: null,
          }
        : state
      : null;

  const landingHtml = historyItem?.landingPageHtml ?? state.landingPageHtml;

  return (
    <main className="h-full">
      <AnimatePresence mode="wait">
        {/* ── Idle Screen ── */}
        {currentView === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="h-full overflow-y-auto"
          >
            <div className="relative flex flex-col items-center justify-center min-h-full px-4 py-12">
              {/* Background glow */}
              <div className="glow-orb" />

              <div className="relative z-10 flex flex-col items-center w-full">
                <div className="text-5xl sm:text-6xl mb-4 select-none">
                  ⚔️
                </div>
                <h1 className="text-5xl sm:text-6xl font-extrabold gradient-text mb-3 tracking-tight text-center">
                  Agent Arena
                </h1>
                <p className="text-[var(--text-muted)] mb-10 text-center text-base sm:text-lg max-w-md leading-relaxed">
                  AI 에이전트들이 토론하고,
                  <br />
                  아이디어를 웹페이지로 만들어 드립니다
                </p>
                <TopicInput onSubmit={startDebate} isDisabled={false} />
                <PresetButtons onSelect={startDebate} isDisabled={false} />
                <HistoryList
                  entries={entries}
                  onSelect={handleHistorySelect}
                  onDelete={remove}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Live Chat ── */}
        {currentView === "chat" && (
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

        {/* ── Landing Page (live or history) ── */}
        {currentView === "landing" && landingHtml && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="h-full"
          >
            <LandingPageView
              html={landingHtml}
              title={historyItem?.result?.idea?.title ?? state.result?.idea?.title}
              onNewDebate={handleNewDebate}
              onViewChat={handleViewChat}
              onBack={historyItem ? handleHistoryBack : undefined}
            />
          </motion.div>
        )}

        {/* ── Chat Replay ── */}
        {currentView === "chat-replay" && chatReplayState && (
          <motion.div
            key="chat-replay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full relative"
          >
            <ChatLayout state={chatReplayState} />
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
              <button
                onClick={handleBackToLanding}
                className="flex items-center gap-2 rounded-full bg-[#2c2d30] border border-[#383a3e] px-5 py-3 text-sm font-medium text-[#d1d2d3] shadow-lg transition-all hover:bg-[#35373b] hover:scale-105"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="shrink-0"
                >
                  <path
                    d="M10 12L6 8l4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                랜딩페이지로 돌아가기
              </button>
              <button
                onClick={handleNewDebate}
                className="flex items-center gap-2 rounded-full bg-[#1264a3] px-5 py-3 text-sm font-medium text-white shadow-lg transition-all hover:bg-[#1574b8] hover:scale-105"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="shrink-0"
                >
                  <path
                    d="M8 1v14M1 8h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                새 토론 시작
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Error ── */}
        {currentView === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center h-full px-4 gap-4"
          >
            <p className="text-red-400 text-lg">{state.error}</p>
            <button
              onClick={handleNewDebate}
              className="rounded-lg bg-[#1264a3] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#1574b8] transition-colors"
            >
              새 토론 시작
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
